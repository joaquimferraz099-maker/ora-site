window.ORA_PAGE = () => {
  const $ = s => document.querySelector(s);
  const C = ORA_CATALOGO, q = new URLSearchParams(location.search);
  const ARR = ORA_ARR;
  const TRUCK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M2 6h12v10H2zM14 10h4l3 3v3h-7"/><circle cx="6" cy="17.5" r="1.6"/><circle cx="17" cy="17.5" r="1.6"/></svg>';
  if (q.get('p') && !oraProd(q.get('p'))) { location.replace('loja.html'); return; }
  let p = oraProd(q.get('p')) || oraProd('cafe-natural');
  if (p.tipoLoja === 'drip') { location.replace('loja.html#drip'); return; }
  let st = { qty: 1, sub: false, t: '500', v: oraCafe(q.get('c')) ? q.get('c') : 'natural' };

  const media = (src, cls = '', cap = '', sizes) => {
    const isV = src.endsWith('.mp4');
    const el = isV ? `<video src="${src}" poster="${src.replace('.mp4', '.webp')}" autoplay muted loop playsinline></video>` : `<img ${oraImg(src, sizes)} alt="${cap || p.nome}">`;
    return `<div class="media ${cls}">${el}${cap ? `<span class="cap">${cap}</span>` : ''}</div>`;
  };
  const sw = (c, on) => `<button type="button" data-sw="${c.id}" aria-pressed="${on}"><i class="${c.cor === 'mocha' ? 'mocha' : ''}"><img ${oraImg(c.img, '64px')} alt=""></i><span><b>${c.nome}</b><small>${c.id === 'natural' ? 'Mais doce e encorpado' : 'Mais limpo e cítrico'}</small></span></button>`;

  function render() {
    const isCafe = p.tipoLoja === 'cafe';
    const c = oraCafe(isCafe ? p.cafe : st.v);
    document.title = (isCafe ? 'Café ' + p.nome : p.nome) + ' · ORA';

    /* galeria */
    const g = isCafe
      ? [media(c.img, 'w pack' + (c.cor === 'mocha' ? ' mocha' : ''), '', '(max-width: 760px) 45vw, 27vw'), media('assets/video/po.mp4', '', 'Moagem para coado'), ...(c.img250 && st.t !== '250' ? [media(c.img250, 'kraft', 'Kraft · 250 g')] : [media('assets/img/px-coado.webp', '', 'Pronto em minutos')]), media('assets/img/px-colheita-cesto.webp', 'w wide', 'A colheita')]
      : [media(p.img, 'w wide'), `<div class="media" style="background:${c.id === 'cereja' ? 'radial-gradient(120% 90% at 50% 30%,#d6c5ae 0%,#bfa98f 55%,#a48e75 100%)' : 'radial-gradient(120% 90% at 50% 30%,#8a6150 0%,#6a4636 55%,#4e3227 100%)'}"><img ${oraImg(c.img, '(max-width: 760px) 80vw, 27vw')} alt="Pacote do ${c.nomeCompleto}, 500 g" style="object-fit:contain;padding:10% 0 8%"><span class="cap" style="color:var(--butter)">Café ORA 500 g</span></div>`, media('assets/img/sacola.webp', '', 'Sacola kraft')];
    $('[data-gal]').innerHTML = g.join('');
    if (isCafe) $('[data-gal] .pack').innerHTML = `<img ${oraImg(st.t === '250' && c.img250 ? c.img250 : c.img, '(max-width: 760px) 45vw, 27vw')} alt="Pacote do ${c.nomeCompleto}, ${st.t} g">`;
    $('[data-galn]').textContent = `${g.length} imagens · deslize`;

    /* informações e compra */
    const precoBase = () => (st.t === '250' && p.p250) ? p.p250 : p.preco;
    const precoCompra = () => st.sub ? Math.round(precoBase() * .85) : precoBase();
    const total = () => brl(precoCompra() * st.qty);
    $('[data-info]').innerHTML = `
      <div class="crumbs"><a href="${isCafe ? 'loja.html' : 'presentes.html'}">${isCafe ? 'Nossos cafés' : 'Presentes'}</a><span>/</span><span>${p.nome}</span></div>
      <h1 class="display lg">${isCafe ? p.nome.replace(' Descascado', ' <em class="it">Descascado</em>') : p.nome}</h1>
      <span class="sub">${isCafe ? c.sub : p.tipo}</span>
      <div class="pr"><b class="num">${isCafe && st.sub ? brl(Math.round(precoBase() * .85)) + '<small style="font-size:.5em;opacity:.7">/mês</small>' : brl(precoBase())}</b><span>${isCafe ? st.t + ' g' + (st.sub ? ' · assinatura; avulso ' + brl(precoBase()) : '') : ''}</span></div>
      <p class="lede">${isCafe ? c.lede : p.resumo}</p>
      <div class="opt"><div class="lb"><span>${isCafe ? 'Café' : 'Café do kit'}</span><span>${isCafe ? 'Escolha o café' : (c.notas.join(', ').charAt(0) + c.notas.join(', ').slice(1).toLowerCase())}</span></div>
        <div class="sw">${C.cafes.map(x => sw(x, x.id === c.id)).join('')}</div></div>
      ${isCafe && p.p250 ? `
      <div class="opt"><div class="lb"><span>Tamanho</span><span>Moído para coado</span></div>
        <div class="sw">
          <button type="button" data-tam="250" aria-pressed="${st.t === '250'}"><span><b>250 g · ${brl(p.p250)}</b><small>Embalagem kraft, para conhecer</small></span></button>
          <button type="button" data-tam="500" aria-pressed="${st.t === '500'}"><span><b>500 g · ${brl(p.preco)}</b><small>O grama sai 25% mais barato</small></span></button>
        </div></div>` : ''}
      ${isCafe && !p.p250 ? `
      <div class="opt"><div class="lb"><span>Formato</span></div><div class="sw"><span class="fix"><span><b>Moído para coado · ${st.t} g</b><small>Para coador de papel ou de pano</small></span></span></div></div>
      ` : ''}
      ${isCafe ? `
      <div class="opt"><div class="lb"><span>Forma de compra</span></div>
        <div class="plans">
          <label><input type="radio" name="plan" value="0" ${st.sub ? '' : 'checked'}><span><b>Compra única</b><small>Um pacote, entregue uma vez.</small></span><span class="p num">${brl(precoBase())}</span></label>
          <label><input type="radio" name="plan" value="1" ${st.sub ? 'checked' : ''}><span><b>Assinatura mensal</b><small>Um pacote por mês, na mesma data, com 15% de desconto. Pause ou cancele quando quiser.</small></span><span class="p num">${brl(Math.round(precoBase() * .85))}<small style="display:inline;opacity:.75"> /mês</small></span></label>
        </div></div>` : ''}
      <div class="buy" data-buyrow>
        <div class="qty"><button aria-label="Diminuir" data-qd="-1">−</button><span data-qty>${st.qty}</span><button aria-label="Aumentar" data-qd="1">+</button></div>
        <button class="btn solid" data-buy><span>Adicionar</span><span class="num" data-total style="font-size:17px;letter-spacing:0">${total()}</span></button>
      </div>
      <p class="ship pay-l">${window.ORA_LOJA ? ORA_LOJA.pagamentoTexto(precoCompra()) : 'Pix ou cartão de crédito'}. Enviamos para todo o Brasil.</p>
      <form class="cepf" data-cepf novalidate><label for="pdCep">${TRUCK}Calcular entrega</label><input id="pdCep" inputmode="numeric" autocomplete="postal-code" maxlength="9" placeholder="Seu CEP" value="${(() => { try { return JSON.parse(localStorage.getItem('ora-cep')) || ''; } catch (e) { return ''; } })()}"><button type="submit" class="link">Calcular</button></form>
      <p class="cep-r" data-cepr aria-live="polite"></p>
      
      <div class="acc">
        <details><summary>Como preparar</summary><div class="a">A receita da ORA para o coado, passo a passo, está na página dos cafés. <a href="loja.html#preparo" style="text-decoration:underline">Ver como preparar</a>.</div></details>
        <details><summary>Conservação</summary><div class="a">Depois de aberto, feche bem o pacote e guarde longe da luz e do calor. O sabor fica melhor nas primeiras semanas.</div></details>
        <details><summary>Trocas</summary><div class="a">Trocas e devoluções seguem o Código de Defesa do Consumidor; veja as condições em <a href="politicas.html#trocas" style="text-decoration:underline">Políticas</a>.</div></details>
      </div>`;

    /* abaixo da dobra */
    const other = C.cafes.find(x => x.id !== c.id), op = C.produtos.find(x => x.cafe === other.id);
    const kits = C.produtos.filter(x => x.tipoLoja === 'kit' && x.handle !== p.handle);
    const PECA = {
      'cafe-caneca': { e: 'A peça do kit', t: 'A caneca<br><em class="it">térmica ORA.</em>', p: 'Parede dupla, tampa que fecha bem e o O da ORA gravado na frente. Segura o café quente na mesa do escritório ou no caminho, do primeiro ao último gole.', m: '<img decoding="async" width="1536" height="1024" src="assets/img/kit-aberto.webp" srcset="assets/img/kit-aberto-800.webp 800w, assets/img/kit-aberto.webp 1536w" sizes="(max-width: 760px) 100vw, 60vw" alt="Caneca térmica ORA dentro da caixa" loading="lazy" style="width:100%;height:100%;object-fit:cover;object-position:74% 78%">' },
      'cafe-jarra': { e: 'A peça do kit', t: 'A jarra<br><em class="it">térmica ORA.</em>', p: 'Feita para a mesa do café da manhã: coe direto nela, leve à mesa e sirva a família inteira com o café ainda quente, xícara depois de xícara.', m: '<video src="assets/video/chemex.mp4" poster="assets/video/chemex.webp" muted loop playsinline autoplay style="width:100%;height:100%;object-fit:cover"></video>' },
      'kit-completo': { e: 'As peças do kit', t: 'Caneca e jarra,<br><em class="it">para a casa toda.</em>', p: 'A jarra para coar e servir a mesa; a caneca para levar a sua xícara aonde o dia for. Juntas, com o café ORA, são o presente para quem gosta de receber.', m: '<img decoding="async" width="1536" height="1024" src="assets/img/kit-aberto.webp" srcset="assets/img/kit-aberto-800.webp 800w, assets/img/kit-aberto.webp 1536w" sizes="(max-width: 760px) 100vw, 60vw" alt="Caixa ORA aberta, com café e caneca térmica" loading="lazy" style="width:100%;height:100%;object-fit:cover;object-position:70% 70%">' }
    };
    const specRows = [['Origem', 'Fazendas de Minas Gerais'], ['Altitude', 'Acima de 1.500 m'], ['Colheita', 'Manual, de maio a setembro'], ['Secagem', c.id === 'natural' ? 'Ao sol, com a fruta inteira' : 'Ao sol, já sem a casca'],
      ...(isCafe ? [] : [['Notas', c.notas.join(', ').charAt(0) + c.notas.join(', ').slice(1).toLowerCase()]]), ...(isCafe ? [] : [['Acidez', c.acidez], ['Corpo', c.corpo], ['Final', c.final]])];
    $('[data-below]').innerHTML = `
      ${isCafe ? `<section class="cup t-espresso"><p class="eyebrow" data-fade>Na xícara</p>
        <p class="w" data-lines>${c.notas.map(n => `<span class="ln"><span>${n}</span></span>`).join('')}</p>
        <div class="row" data-fade><div><small>Acidez</small><b>${c.acidez}</b></div><div><small>Corpo</small><b>${c.corpo}</b></div><div><small>Final</small><b>${c.final}</b></div></div></section>` : ''}
      ${isCafe ? '' : `<section class="sec wrap t-espresso"><div class="inbox"><div class="r"><p class="eyebrow ln-l" data-fade>O kit</p><h2 class="display md" data-fade style="margin-top:20px">O que vem na caixa</h2><ol data-fade>${p.contem.map(x => `<li>${x}</li>`).join('')}</ol></div></div></section>`}
      ${isCafe ? `      <section class="sec wrap t-roast">
        <div class="spec">
          <div class="l"><p class="eyebrow ln-l" data-fade>${isCafe ? 'Ficha técnica' : 'Café ' + c.nome}</p><h2 class="display md" data-fade style="margin-top:20px">${isCafe ? 'Tudo sobre<br>este café' : 'O café que<br>vai no kit'}</h2>
            </div>
          <dl data-fade>${specRows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
        </div>
      </section>
      <section class="sec wrap t-espresso">
        <div class="proc">
          <div class="ph media" data-open><img ${oraImg(`assets/img/${c.id === 'natural' ? 'px-natural-seco' : 'px-cerejas'}.webp`, '(max-width: 760px) 130vw, 65vw')} alt="${c.id === 'natural' ? 'Cerejas de café secas, com a casca' : 'Cerejas de café maduras no pé, antes de perderem a casca'}" loading="lazy" style="width:100%;height:100%;object-fit:cover"></div>
          <div class="tx">
            <p class="eyebrow ln-l" data-fade>${c.processo === 'Natural' ? 'Processo natural' : 'Processo cereja descascado'}</p>
            <h2 class="display md" data-fade>${c.processo === 'Natural' ? 'Seca inteiro,<br><em class="it">com a fruta.</em>' : 'Seca sem<br><em class="it">a casca.</em>'}</h2>
            <p class="lede" data-fade>${c.copo}</p>
            <a class="link" href="loja.html#c-${other.id}" data-fade>Comparar com o ${other.nome} ${ARR}</a>
          </div>
        </div>
      </section>` : `<section class="sec wrap t-roast">
        <div class="proc">
          <div class="ph media" data-open>${PECA[p.handle].m}</div>
          <div class="tx">
            <p class="eyebrow ln-l" data-fade>${PECA[p.handle].e}</p>
            <h2 class="display md" data-fade>${PECA[p.handle].t}</h2>
            <p class="lede" data-fade>${PECA[p.handle].p}</p>
            <a class="link" href="produto.html?p=cafe-${c.id}" data-fade>Ver o café ${c.nome} ${ARR}</a>
          </div>
        </div>
      </section>`}
      ${isCafe ? `<section class="sec wrap t-roast more">
        <div class="other">
          <a class="pk media pack ${other.cor === 'mocha' ? 'mocha' : ''}" href="produto.html?p=${op.handle}" data-open><img ${oraImg(other.img, '(max-width: 760px) 40vw, 20vw')} alt="Café ${other.nome}"></a>
          <div class="tx"><p class="eyebrow ln-l" data-fade>O outro café da ORA</p><h3 class="display md" data-fade>${other.nome}</h3><span class="sub" data-fade style="font-family:var(--serif);font-style:italic;font-size:20px;opacity:.7">${other.sub}</span>
            <p class="lede" data-fade>${other.frase}</p>
            <div style="display:flex;gap:22px;align-items:center;flex-wrap:wrap" data-fade><button class="btn solid" data-quick="${op.handle}">Adicionar · ${brl(op.preco)}</button><a class="link" href="produto.html?p=${op.handle}">Conheça este café</a></div></div>
        </div>
      </section>` : ''}
      ${isCafe ? `<section class="sec wrap t-espresso more"><div class="gband"><div><h2 class="display md" data-fade>Para <em class="it">presentear</em></h2><p data-fade>Café com caneca ou jarra térmica, na caixa ORA, com sacola kraft. A partir de R$ 129,00.</p></div><a class="btn light" href="presentes.html" data-fade>Conheça os presentes <svg class="arr" viewBox="0 0 22 9"><path d="M0 4.5h20M16.5.8l3.8 3.7-3.8 3.7" fill="none" stroke="currentColor"/></svg></a></div></section>` : `<section class="sec wrap t-espresso more">
        <div class="hd"><h2 class="display md" data-fade>Outros presentes</h2><a class="link" href="presentes.html" data-fade>Conheça nossos presentes ${ARR}</a></div>
        <div class="kgrid${kits.length === 2 ? ' k2' : ''}">${kits.map(oraKitCard).join('')}</div>
      </section>`}`;

    /* barra fixa */
    $('[data-sbar]').innerHTML = `<div class="th ${isCafe ? (c.cor === 'mocha' ? 'mocha' : '') : 'ph'}"><img ${oraImg(isCafe ? c.img : p.thumb, '64px')} alt=""></div>
      <div class="n"><b>${p.nome}${isCafe && p.p250 ? ' · ' + st.t + ' g' : ''}</b><span>${isCafe ? 'Moído para coado' + (st.sub ? ' · assinatura' : '') : 'Café ' + c.nome}</span></div>
      <span class="num" data-total>${total()}${st.sub ? '<small style="font-size:.55em;opacity:.7">/mês</small>' : ''}</span><button class="btn solid" data-buy>Adicionar</button>`;
    ORA.reveals && ORA.reveals();
    document.querySelectorAll('[data-below] video,[data-gal] video').forEach(v => { v.muted = true; v.play().catch(() => {}); });
  }

  const base = () => (st.t === '250' && p.p250) ? p.p250 : p.preco;
  const upd = () => document.querySelectorAll('[data-total]').forEach(e => e.innerHTML = brl((st.sub ? Math.round(base() * .85) : base()) * st.qty) + (st.sub && e.closest('.sbar') ? '<small style="font-size:.55em;opacity:.7">/mês</small>' : ''));
  document.addEventListener('click', e => {
    const s = e.target.closest('[data-sw]');
    if (s) {
      if (p.tipoLoja === 'cafe') { p = C.produtos.find(x => x.cafe === s.dataset.sw); if (!p.p250) st.t = '500'; history.replaceState(null, '', '?p=' + p.handle); render(); }
      else { st.v = s.dataset.sw; history.replaceState(null, '', '?p=' + p.handle + '&c=' + st.v); render(); }
      return;
    }
    const tm = e.target.closest('[data-tam]');
    if (tm) { st.t = tm.dataset.tam; render(); return; }
    const d = e.target.closest('[data-qd]');
    if (d) { st.qty = Math.max(1, Math.min(20, st.qty + +d.dataset.qd)); document.querySelector('[data-qty]').textContent = st.qty; upd(); }
    if (e.target.closest('[data-buy]')) { ORA.add(p.handle, { v: st.v, qty: st.qty, sub: st.sub, t: st.t }); }
  });
  document.addEventListener('change', e => { if (e.target.name === 'plan') { st.sub = e.target.value === '1'; render(); } });

  render();
  const bar = document.querySelector('[data-sbar]');
  const io = new IntersectionObserver(([en]) => { const on = !en.isIntersecting && en.boundingClientRect.top < 0; bar.classList.toggle('on', on); bar.setAttribute('aria-hidden', !on); bar.inert = !on; });
  const watch = () => { io.disconnect(); io.observe(document.querySelector('[data-buyrow]')); };
  watch(); new MutationObserver(watch).observe(document.querySelector('[data-info]'), { childList: true });
};
