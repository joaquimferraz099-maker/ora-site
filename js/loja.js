/* ORA: ligação com a loja Shopify.
   Enquanto os campos abaixo estiverem vazios, o site funciona em modo de prévia: a sacola funciona,
   mas "Finalizar compra" não leva ao pagamento. Quando a loja Shopify existir, basta preencher aqui.
   Frete, cartão, Pix, parcelamento e cupons são cobrados no checkout da Shopify, com o meio de
   pagamento escolhido (por exemplo Mercado Pago ou Pagar.me). O site não recebe dados de cartão. */
window.ORA_LOJA = {
  shopify: {
    dominio: '',        // ex.: 'ora-cafe.myshopify.com'
    token: '',          // token público da Storefront API (Configurações > Apps > Headless)
    versao: '2025-10'
  },
  /* ID de cada variante na Shopify (gid://shopify/ProductVariant/...). */
  variantes: {
    'cafe-natural|500': '',
    'cafe-cereja|250': '',
    'cafe-cereja|500': '',
    'drip-coffee': '',
    'cafe-caneca|natural': '', 'cafe-caneca|cereja': '',
    'cafe-jarra|natural': '', 'cafe-jarra|cereja': '',
    'kit-completo|natural': '', 'kit-completo|cereja': ''
  },
  planoAssinatura: '',  // ID do plano de venda do app de assinatura (gid://shopify/SellingPlan/...)
  /* Condições comerciais. Zero quer dizer "não mostrar". */
  pagamento: {
    parcelasSemJuros: 3,  // ex.: 3
    parcelaMinima: 0,     // em centavos, ex.: 3000
    descontoPix: 5        // em %, ex.: 5
  },
  freteGratisAcima: 0,    // em centavos, ex.: 25000
  empresa: { razaoSocial: '', cnpj: '', endereco: '' },
  /* Contador de visitas (Cloudflare Web Analytics, grátis e sem cookies): colar aqui o token do site.
     Vazio = desligado. */
  contadorVisitas: ''
};

(() => {
  const L = window.ORA_LOJA, brl = c => (c / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  L.ativa = () => !!(L.shopify.dominio && L.shopify.token);
  /* assinatura só aparece se a loja tiver plano de assinatura configurado (na prévia, aparece) */
  L.assinatura = () => !L.ativa() || !!L.planoAssinatura;
  window.oraAssina = L.assinatura;

  const api = async (query, variables) => {
    const r = await fetch(`https://${L.shopify.dominio}/api/${L.shopify.versao}/graphql.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': L.shopify.token },
      body: JSON.stringify({ query, variables })
    });
    return r.json();
  };

  /* acha sozinho o ID de cada variante na Shopify, pelo handle do produto e pelo nome da opção
     (Tamanho "250 g"/"500 g" nos cafés; Café "Natural"/"Cereja Descascado" nos kits).
     O que estiver preenchido à mão em L.variantes tem prioridade. */
  let mapa = null;
  L.mapaVariantes = () => mapa || (mapa = api(`{ products(first: 50) { nodes { handle variants(first: 20) { nodes { id availableForSale selectedOptions { name value } } } } } }`)
    .then(j => {
      const m = {};
      ((j.data && j.data.products.nodes) || []).forEach(pr => pr.variants.nodes.forEach(v => {
        const val = v.selectedOptions.map(o => o.value).join(' ').toLowerCase();
        const k = /250/.test(val) ? `${pr.handle}|250` : /500/.test(val) ? `${pr.handle}|500`
          : /cereja/.test(val) ? `${pr.handle}|cereja` : /natural/.test(val) ? `${pr.handle}|natural` : pr.handle;
        m[k] = v.id;
        if (pr.variants.nodes.length === 1) m[pr.handle + '|500'] = m[pr.handle + '|500'] || v.id;
      }));
      Object.keys(L.variantes).forEach(k => { if (L.variantes[k]) m[k] = L.variantes[k]; });
      return m;
    }).catch(() => { mapa = null; return Object.assign({}, L.variantes); }));

  /* "Pix ou cartão de crédito", mais parcelas e desconto quando configurados */
  L.pagamentoTexto = valor => {
    const P = L.pagamento, partes = [];
    if (P.parcelasSemJuros > 1 && valor) {
      const n = Math.max(1, Math.min(P.parcelasSemJuros, P.parcelaMinima ? Math.floor(valor / P.parcelaMinima) : P.parcelasSemJuros));
      if (n > 1) partes.push(`${n}x de ${brl(Math.ceil(valor / n))} sem juros`);
    }
    if (P.descontoPix > 0) partes.push(`${P.descontoPix}% de desconto no Pix`);
    return partes.length ? partes.join(' · ') : 'Pix ou cartão de crédito';
  };

  /* barra de frete grátis, quando configurado */
  L.freteGratisTexto = total => {
    if (!L.freteGratisAcima) return '';
    const f = L.freteGratisAcima - total;
    return f > 0 ? `Faltam ${brl(f)} para o frete grátis.` : 'Seu pedido tem frete grátis.';
  };

  /* CEP: confere o endereço no ViaCEP. Valor e prazo saem no checkout. */
  L.cep = async cep => {
    const d = String(cep).replace(/\D/g, '');
    if (d.length !== 8) return { erro: 'Digite os 8 números do CEP.' };
    try {
      const r = await fetch(`https://viacep.com.br/ws/${d}/json/`); const j = await r.json();
      if (j.erro) return { erro: 'CEP não encontrado.' };
      return { cidade: j.localidade, uf: j.uf, cep: d.replace(/(\d{5})(\d{3})/, '$1-$2') };
    } catch (e) { return { erro: 'Não foi possível consultar o CEP agora.' }; }
  };

  const chave = i => {
    const h = i.h, p = window.oraProd(h);
    if (p.tipoLoja === 'cafe') return `${h}|${i.t || '500'}`;
    if (p.tipoLoja === 'kit') return `${h}|${i.v}`;
    return h;
  };

  /* cria o carrinho na Shopify e devolve o endereço do checkout */
  L.checkout = async bag => {
    if (!L.ativa()) return { previa: true };
    const V = await L.mapaVariantes();
    const faltam = bag.filter(i => !V[chave(i)]);
    if (faltam.length) { console.warn('ORA: variantes sem ID na Shopify:', faltam.map(chave)); return { erro: 'Um dos produtos da sacola ainda não está disponível na loja.' }; }
    const lines = bag.map(i => {
      const l = { merchandiseId: V[chave(i)], quantity: i.qty, attributes: [] };
      if (i.sub && L.planoAssinatura) l.sellingPlanId = L.planoAssinatura;
      return l;
    });
    const query = `mutation($input: CartInput!) { cartCreate(input: $input) { cart { checkoutUrl } userErrors { message } } }`;
    try {
      const j = await api(query, { input: { lines, buyerIdentity: { countryCode: 'BR' } } }), c = j.data && j.data.cartCreate;
      if (!c || (c.userErrors && c.userErrors.length) || !c.cart) return { erro: (c && c.userErrors[0] && c.userErrors[0].message) || 'A loja não respondeu.' };
      return { url: c.cart.checkoutUrl };
    } catch (e) { return { erro: 'Não foi possível falar com a loja agora.' }; }
  };
})();
