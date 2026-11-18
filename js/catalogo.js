/* ORA — catálogo. Mesmo formato de produto e variante da Shopify: na migração, só a origem dos dados muda.
   Preços em centavos. */
/* imagens responsivas: ferramentas/imagens.py gera 400, 800 e até 1600 px e atualiza as medidas abaixo */
/* @medidas */window.ORA_IMG = {"caixa-slogan":[1280,960],"cartao-frente":[1536,1024],"cel-graos-tigelas":[1600,2134],"cel-graos-torrados":[1600,2149],"cel-maos-torrados":[1600,2397],"drip":[1600,2134],"kit-aberto":[1536,1024],"p-cafe-caneca":[1024,1024],"p-caixa":[960,960],"p-kit-completo":[1024,1024],"p-kit-vertical":[820,1024],"pacote-cereja":[900,1522],"pacote-natural":[900,1522],"pacote250-cereja":[900,1522],"pausa-janela":[1600,1066],"px-cerejas":[1600,816],"px-coado":[1600,1066],"px-coado-mesa":[1600,1068],"px-colheita":[1600,1066],"px-colheita-cesto":[1600,1066],"px-graos-torrados":[1600,1066],"px-maos-graos":[1600,1066],"px-natural-seco":[1600,1066],"px-prova":[1600,2397],"px-selecao":[1600,1066],"px-torra":[1600,1067],"px-xicara-coado":[1400,932],"rotulo-cereja":[1001,1572],"rotulo-natural":[814,1280],"sacola":[1024,1280]};/* @fim */
window.oraImg = (src, sizes) => {
  sizes = sizes || '(max-width: 760px) 150vw, 55vw';
  const m = /^assets\/img\/([\w-]+)\.webp$/.exec(src || '');
  const d = m && window.ORA_IMG[m[1]];
  if (!d) return `src="${src}"`;
  const b = 'assets/img/' + m[1];
  return `src="${src}" srcset="${b}-400.webp 400w, ${b}-800.webp 800w, ${d[0] > 1300 ? b + '-1200.webp 1200w, ' : ''}${src} ${d[0]}w" sizes="${sizes}" width="${d[0]}" height="${d[1]}" decoding="async"`;
};

window.ORA_CATALOGO = {
  cafes: [
    {
      id: 'natural', nome: 'Natural', nomeCompleto: 'Café Natural', sub: 'Variedade Bourbon', lede: 'Doce e encorpado, com um final que permanece.', copo: 'Secar dentro da fruta dá ao grão mais corpo e deixa no fim do gole o doce de chocolate e caramelo.',
      processo: 'Natural', variedade: 'Bourbon', lote: 'V09706-00',
      notas: ['Chocolate', 'Caramelo', 'Doce'], acidez: 'Equilibrada', corpo: 'Aveludado', final: 'Persistente',
      frase: 'Chocolate e caramelo, doce, com acidez equilibrada, corpo aveludado e final persistente.',
      sobre: 'O fruto seca inteiro, com a casca e a polpa. O grão só é separado da fruta depois de seco.',
      img: 'assets/img/pacote-natural.webp', rotulo: 'assets/img/rotulo-natural.webp', cor: 'espresso'
    },
    {
      id: 'cereja', nome: 'Cereja Descascado', nomeCompleto: 'Café Cereja Descascado', sub: 'Variedades Catucaí, Mundo Novo e Catuaí', lede: 'Limpo e vivo, com acidez cítrica delicada e um final longo.', copo: 'Sem a casca, o grão seca mais limpo: a acidez cítrica aparece delicada, e o caramelo vem logo atrás.',
      processo: 'Cereja Descascado', variedade: 'Catucaí, Mundo Novo e Catuaí', lote: 'V09638-00',
      notas: ['Avelã', 'Caramelo', 'Cítrico'], acidez: 'Cítrica delicada', corpo: 'Aveludado', final: 'Longo e marcante',
      frase: 'Doce e caramelizado, com notas de avelã e acidez cítrica.',
      sobre: 'A casca é retirada logo depois da colheita e o grão seca com parte da mucilagem.',
      img: 'assets/img/pacote-cereja.webp', rotulo: 'assets/img/rotulo-cereja.webp', cor: 'mocha', img250: 'assets/img/pacote250-cereja.webp'
    }
  ],
  produtos: [
    { handle: 'cafe-natural', tipoLoja: 'cafe', cafe: 'natural', nome: 'Natural', tipo: 'Café especial · 500 g', preco: 8900,
      img: 'assets/img/pacote-natural.webp', tile: 'lbl', thumb: 'assets/img/pacote-natural.webp' },
    { handle: 'cafe-cereja', tipoLoja: 'cafe', cafe: 'cereja', nome: 'Cereja Descascado', tipo: 'Café especial · 500 g', preco: 8900, p250: 5900,
      img: 'assets/img/pacote-cereja.webp', tile: 'lbl alt', thumb: 'assets/img/pacote-cereja.webp' },
    { handle: 'drip-coffee', tipoLoja: 'drip', nome: 'Drip Coffee', tipo: 'Filtro individual · unidade', preco: 175,
      img: 'assets/img/drip.webp', tile: 'ph', thumb: 'assets/img/drip.webp', max: 100,
      resumo: 'Para levar o café ORA aonde não há coador: na viagem, no escritório, no quarto de hotel. Um pacote de 250 g rende cerca de 25 xícaras.' },
    { handle: 'cafe-caneca', tipoLoja: 'kit', nome: 'Café e caneca', tipo: 'Kit presente', preco: 12900,
      img: 'assets/img/p-kit-vertical.webp', img2: 'assets/img/p-cafe-caneca.webp', thumb: 'assets/img/p-kit-vertical.webp',
      resumo: 'Para quem toma o café a caminho do dia: um pacote ORA e a caneca térmica que acompanha.',
      contem: ['Café ORA 500 g, à sua escolha', 'Caneca térmica ORA', 'Caixa ORA e sacola kraft', 'Cartão ORA com a sua mensagem'] },
    { handle: 'cafe-jarra', tipoLoja: 'kit', nome: 'Café e jarra', tipo: 'Kit presente', preco: 16900,
      img: 'assets/img/caixa-slogan.webp', img2: 'assets/img/p-caixa.webp', thumb: 'assets/img/caixa-slogan.webp',
      resumo: 'Para a mesa do café da manhã: um pacote ORA e a jarra térmica que mantém o coado quente.',
      contem: ['Café ORA 500 g, à sua escolha', 'Jarra térmica ORA', 'Caixa ORA e sacola kraft', 'Cartão ORA com a sua mensagem'] },
    { handle: 'kit-completo', tipoLoja: 'kit', nome: 'Kit completo', tipo: 'Kit presente', preco: 24900, destaque: 'Mais completo',
      img: 'assets/img/p-kit-completo.webp', img2: 'assets/img/kit-aberto.webp', thumb: 'assets/img/p-kit-completo.webp',
      resumo: 'Para quem recebe em casa: café, caneca e jarra, tudo o que o ritual pede.',
      contem: ['Café ORA 500 g, à sua escolha', 'Caneca térmica ORA', 'Jarra térmica ORA', 'Caixa ORA e sacola kraft', 'Cartão ORA com a sua mensagem'] }
  ]
};

window.brl = c => (c / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
window.ORA_ARR = '<svg class="arr" viewBox="0 0 22 9" aria-hidden="true"><path d="M0 4.5h20M16.5.8l3.8 3.7-3.8 3.7" fill="none" stroke="currentColor"/></svg>';
window.oraCafe = id => ORA_CATALOGO.cafes.find(c => c.id === id);
window.oraProd = h => ORA_CATALOGO.produtos.find(p => p.handle === h);

/* cartão de kit, usado na loja, em presentes e nas páginas de produto */
window.oraKitCard = p => `
  <article class="kc" data-fade>
    <a class="kc-img media" href="produto.html?p=${p.handle}" aria-label="${p.nome}">
      ${p.destaque ? `<span class="kc-tag">${p.destaque}</span>` : ''}
      <img ${oraImg(p.img, '(max-width: 760px) 100vw, 45vw')} alt="${p.nome}" loading="lazy"><img class="b" ${oraImg(p.img2, '(max-width: 760px) 100vw, 45vw')} alt="" loading="lazy">
    </a>
    <div class="kc-b">
      <div><h3><a href="produto.html?p=${p.handle}">${p.nome}</a></h3><p>${p.resumo}</p></div>
      <span class="num">${brl(p.preco)}</span>
    </div>
    <a class="link kc-l" href="produto.html?p=${p.handle}">Conheça este kit</a>
  </article>`;
