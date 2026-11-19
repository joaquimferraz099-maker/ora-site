/* ORA — comportamento comum: cabeçalho, menu, rodapé, sacola, rolagem e entradas. */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const B = document.body;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ARR = window.ORA_ARR;
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
  };

  /* véu de transição */
  const veil = document.createElement('div');
  veil.className = 'veil'; veil.innerHTML = oraGrain();
  B.append(veil);
  requestAnimationFrame(() => requestAnimationFrame(() => veil.classList.add('off')));
  addEventListener('pageshow', e => { if (e.persisted) veil.classList.replace('on', 'off'); });
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || reduce || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
    const u = new URL(a.href, location.href);
    if (u.origin !== location.origin || (u.pathname === location.pathname && u.search === location.search) || a.hasAttribute('data-bag-open')) return;
    e.preventDefault(); veil.classList.remove('off'); veil.classList.add('on');
    setTimeout(() => { location.href = a.href; }, 420);
  });

  /* cabeçalho */
  const here = location.pathname.split('/').pop() || 'index.html';
  const cur = h => here === h ? ' aria-current="page"' : '';
  const hdr = document.createElement('header');
  hdr.className = 'hdr' + (B.dataset.hdr === 'light' ? ' on-light' : '');
  hdr.innerHTML = `
    <nav class="l" aria-label="Principal">
      <button class="burger" aria-label="Abrir menu"><span></span><span></span></button>
      <a class="nl" href="index.html"${cur('index.html')}>Início</a>
      <a class="nl" href="loja.html"${cur('loja.html')}>Nossos cafés</a>
      <a class="nl" href="historia.html"${cur('historia.html')}>Nossa origem</a>
      <a class="nl" href="presentes.html"${cur('presentes.html')}>Presentes</a>
    </nav>
    <a href="index.html" class="logo" aria-label="ORA, início">${oraLogo()}</a>
    <nav class="r"><a class="nl bag-link" href="#sacola" data-bag-open>Sacola<span class="bag-count">0</span></a></nav>`;
  B.prepend(hdr);

  /* barra de anúncio: 5% off na primeira compra com o cupom BEMVINDO */
  let ann = $('.ann');
  if (!ann) {
    ann = document.createElement('div');
    ann.className = 'ann';
    ann.innerHTML = `<span><b>5% de desconto</b> na primeira compra<span class="ann-x"> · cupom</span><span class="ann-m">:</span> <b>BEMVINDO</b></span>`;
    B.prepend(ann);
  }
  const annH = () => document.documentElement.style.setProperty('--ann', ann.offsetHeight + 'px');
  requestAnimationFrame(annH); addEventListener('resize', annH);

  const mm = document.createElement('div');
  mm.className = 'mmenu';
  mm.innerHTML = [['index.html', 'Início'], ['loja.html', 'Nossos cafés'], ['historia.html', 'Nossa origem'], ['presentes.html', 'Presentes']]
    .map(([h, t], i) => `<a class="big" href="${h}"${cur(h)}><span style="transition-delay:${.06 * i + .25}s">${t}</span></a>`).join('') +
    `<div class="meta"><a href="loja.html#drip">Drip Coffee</a><a href="presentes.html#corporativo">Corporativo</a><a href="politicas.html">Políticas</a><a href="https://www.instagram.com/oracafeespecial" target="_blank" rel="noopener">Instagram</a></div><div class="mimg"><img ${oraImg('assets/img/px-selecao.webp')} alt="" loading="lazy"></div>`;
  B.append(mm);
  $('.burger').addEventListener('click', () => {
    const o = B.classList.toggle('menu-open');
    document.documentElement.style.overflow = o ? 'hidden' : ''; if (window.__lenis) o ? window.__lenis.stop() : window.__lenis.start();
    $('.burger').setAttribute('aria-label', o ? 'Fechar menu' : 'Abrir menu');
  });

  /* rodapé */
  const ftr = document.createElement('footer');
  ftr.className = 'ftr t-espresso';
  ftr.innerHTML = `
    <div class="cols">
      <div>
        <p class="display sm" style="max-width:15em">Café especial de Minas Gerais.</p>
      </div>
      <div><h2 class="fh">Loja</h2><ul><li><a href="produto.html?p=cafe-natural">Natural</a></li><li><a href="produto.html?p=cafe-cereja">Cereja Descascado</a></li><li><a href="loja.html#drip">Drip Coffee</a></li><li><a href="presentes.html">Presentes</a></li><li><a href="presentes.html#corporativo">Presentes corporativos</a></li></ul></div>
      <div><h2 class="fh">Atendimento</h2><ul><li><a href="politicas.html#entrega">Entrega e pagamento</a></li><li><a href="politicas.html#trocas">Trocas e devoluções</a></li><li><a href="politicas.html#assinatura">Assinatura e cupons</a></li><li><a href="politicas.html#privacidade">Privacidade</a></li></ul></div>
      <div><h2 class="fh">Contato</h2><ul><li><a href="https://www.instagram.com/oracafeespecial" target="_blank" rel="noopener">Instagram</a></li></ul></div>
    </div>
    <div class="giant">${oraLogo()}</div>
    <div class="base"><span>© 2026 ORA Café Especial</span>${(() => { const E = window.ORA_LOJA && ORA_LOJA.empresa; return E && E.cnpj ? `<span>${[E.razaoSocial, 'CNPJ ' + E.cnpj, E.endereco].filter(Boolean).join(' · ')}</span>` : ''; })()}</div>`;
  B.append(ftr);

  /* sacola */
  const C = window.ORA_CATALOGO;
  let bag = store.get('ora-bag3', []);
  const bagEl = document.createElement('aside');
  bagEl.className = 'bag'; bagEl.setAttribute('aria-label', 'Sacola');
  bagEl.innerHTML = `<div class="scrim" data-bag-close></div>
    <div class="panel" role="dialog" aria-modal="true" aria-labelledby="bagT">
      <div class="ph"><h3 id="bagT">Sacola</h3><button class="link" data-bag-close>Fechar</button></div>
      <div class="items"></div><div class="pf"></div>
    </div>`;
  B.append(bagEl);
  const toast = document.createElement('div');
  toast.className = 'toast'; toast.setAttribute('role', 'status'); B.append(toast);
  let tt;
  const showToast = (html, ms = 3600) => { toast.innerHTML = html; toast.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => toast.classList.remove('show'), ms); };
  const linha = i => {
    const p = oraProd(i.h);
    if (p.tipoLoja === 'cafe') return 'Moído · ' + (i.t || '500') + ' g' + (i.sub ? ' · assinatura mensal (-15%)' : '');
    if (p.tipoLoja === 'drip') return 'Saquinho vazio · ' + brl(p.preco) + ' a unidade';
    return 'Café ' + oraCafe(i.v).nome + ' · 500 g';
  };
  const precoItem = i => { const p = oraProd(i.h); let v = (i.t === '250' && p.p250) ? p.p250 : p.preco; if (i.sub) v = Math.round(v * .85); return v; };
  function renderBag() {
    bag = bag.filter(i => oraProd(i.h));
    $$('.bag-count').forEach(e => e.textContent = bag.reduce((a, i) => a + i.qty, 0));
    const items = $('.items', bagEl), pf = $('.pf', bagEl);
    if (!bag.length) {
      items.innerHTML = `<div class="empty"><p>Sua sacola está vazia.</p><a class="btn" href="loja.html">Conheça nossos cafés ${ARR}</a></div>`;
      pf.innerHTML = ''; return;
    }
    items.innerHTML = bag.map((i, k) => {
      const p = oraProd(i.h);
      return `<div class="item"><div class="th ${p.tile || ''}"><img ${oraImg(i.t === '250' && p.cafe && oraCafe(p.cafe).img250 ? oraCafe(p.cafe).img250 : p.thumb, '80px')} alt=""></div>
        <div><h5>${p.tipoLoja === 'cafe' ? 'Café ' + p.nome : p.nome}</h5><p>${linha(i)}</p>
          <div class="qty"><button aria-label="Diminuir" data-q="${k}" data-d="-1">−</button><span>${i.qty}</span><button aria-label="Aumentar" data-q="${k}" data-d="1">+</button></div>
          <button class="rm" data-rm="${k}">Remover</button></div>
        <div class="pr num">${brl(precoItem(i) * i.qty)}${i.sub ? '<small style="font-size:.6em;opacity:.7">/mês</small>' : ''}</div></div>`;
    }).join('');
    const tot = bag.reduce((a, i) => a + precoItem(i) * i.qty, 0);
    const L = window.ORA_LOJA, fg = L ? L.freteGratisTexto(tot) : '', cep = store.get('ora-cep', '');
    pf.innerHTML = `<div class="tot"><span class="eyebrow">Subtotal</span><b class="num">${brl(tot)}</b></div>
      <p class="pay">${L ? L.pagamentoTexto(tot) : 'Pix ou cartão de crédito'}</p>
      ${fg ? `<p class="fg">${fg}</p>` : ''}
      <form class="cepf" data-cepf novalidate><label for="bagCep">Entrega</label><input id="bagCep" inputmode="numeric" autocomplete="postal-code" maxlength="9" placeholder="Seu CEP" value="${cep}"><button type="submit" class="link">Calcular</button></form>
      <p class="cep-r" data-cepr aria-live="polite"></p>
      ${bag.some(i => i.sub) ? `<p class="note" style="margin-bottom:6px">Inclui a 1ª mensalidade da assinatura; as próximas, todo mês.</p>` : ''}<p class="note">Frete, cupom e pagamento na finalização da compra. <span class="nl-x">Um cupom por pedido: BEMVINDO (5% na primeira compra) ou ORAPORSCHE (10%).</span></p>
      <button class="btn solid" style="width:100%;justify-content:center" data-checkout>Finalizar compra ${ARR}</button>`;
  }
  /* CEP na sacola e na página de produto */
  document.addEventListener('submit', async e => {
    const f = e.target.closest('[data-cepf]'); if (!f) return; e.preventDefault();
    const out = f.nextElementSibling, v = f.querySelector('input').value;
    if (!window.ORA_LOJA) return;
    out.textContent = 'Consultando…';
    const r = await ORA_LOJA.cep(v);
    if (r.erro) { out.textContent = r.erro; return; }
    store.set('ora-cep', r.cep); document.querySelectorAll('[data-cepf] input').forEach(i => i.value = r.cep);
    out.textContent = `Entregamos em ${r.cidade}, ${r.uf}. O valor e o prazo aparecem na finalização da compra.`;
  });
  document.addEventListener('input', e => { const i = e.target.closest('[data-cepf] input'); if (!i) return; const d = i.value.replace(/\D/g, '').slice(0, 8); i.value = d.length > 5 ? d.slice(0, 5) + '-' + d.slice(5) : d; });
  const save = () => { store.set('ora-bag3', bag); renderBag(); };
  const openBag = () => { toast.classList.remove('show'); bagEl.classList.add('open'); lenis && lenis.stop(); };
  const closeBag = () => { bagEl.classList.remove('open'); lenis && lenis.start(); };
  bagEl.addEventListener('click', e => {
    const q = e.target.closest('[data-q]'), r = e.target.closest('[data-rm]');
    if (q) { const i = bag[+q.dataset.q]; i.qty = Math.max(1, Math.min(oraProd(i.h).max || 20, i.qty + +q.dataset.d)); save(); }
    if (r) { bag.splice(+r.dataset.rm, 1); save(); }
    const ck = e.target.closest('[data-checkout]');
    if (ck && !ck.disabled) {
      ck.disabled = true; ck.style.opacity = '.6';
      (window.ORA_LOJA ? ORA_LOJA.checkout(bag) : Promise.resolve({ previa: true })).then(r => {
        ck.disabled = false; ck.style.opacity = '';
        if (r.url) location.href = r.url;
        else if (r.previa) showToast('A loja está em preparação. Em breve você finaliza a compra por aqui.', 5200);
        else showToast(r.erro, 6000);
      });
    }
    if (e.target.closest('[data-bag-close]')) closeBag();
  });
  document.addEventListener('click', e => {
    if (e.target.closest('[data-bag-open]')) { e.preventDefault(); B.classList.remove('menu-open'); document.documentElement.style.overflow = ''; openBag(); }
    const q = e.target.closest('[data-quick]');
    if (q) { e.preventDefault(); ORA.add(q.dataset.quick); }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeBag(); B.classList.remove('menu-open'); document.documentElement.style.overflow = ''; } });
  window.ORA = {
    add(h, o = {}) {
      const p = oraProd(h), v = p.cafe || o.v || 'natural', qty = o.qty || 1, msg = o.msg || '', sub = !!o.sub, t = p.p250 ? (o.t || '500') : undefined;
      const ex = bag.find(i => i.h === h && i.v === v && i.msg === msg && !!i.sub === sub && (i.t || '500') === (t || '500'));
      ex ? ex.qty = Math.min(p.max || 20, ex.qty + qty) : bag.push({ h, v, qty, msg, sub, t });
      save();
      const nome = p.tipoLoja === 'cafe' ? 'Café ' + p.nome + (t ? ' · ' + t + ' g' : '') + (sub ? ' · assinatura mensal' : '') : p.tipoLoja === 'drip' ? (qty > 1 ? qty + ' × ' : '') + p.nome : p.nome + ' · ' + oraCafe(v).nome;
      showToast(`<span>${nome} na sacola.</span><a href="#sacola" data-bag-open>Ver sacola</a>`);
    },
    open: openBag, toast: showToast
  };
  renderBag();

  /* rolagem suave */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = window.__lenis = new Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href^="#"]:not([data-bag-open])');
      if (a && a.getAttribute('href').length > 1 && $(a.getAttribute('href'))) { e.preventDefault(); lenis.scrollTo(a.getAttribute('href'), { offset: -80 }); }
    });
    if (location.hash && $(location.hash)) setTimeout(() => lenis.scrollTo(location.hash, { offset: -80, immediate: true }), 60);
  }

  /* cabeçalho: sólido depois do topo, some ao descer e volta ao subir */
  let lastY = 0;
  let solidY = 10;
  const medeSolid = () => { solidY = B.dataset.hdr === 'light' ? 10 : Math.min(innerHeight * .75, Math.max(80, (document.querySelector('.hero .in,.hhero .in,.ghero .in') || { getBoundingClientRect: () => ({ top: innerHeight }) }).getBoundingClientRect().top + scrollY - 110)); };
  const solidAt = () => solidY;
  medeSolid(); addEventListener('load', medeSolid); addEventListener('resize', medeSolid);
  const onScroll = () => {
    const y = scrollY;
    hdr.classList.toggle('is-solid', y > solidAt());
    hdr.classList.toggle('is-hidden', y > 400 && y > lastY && !B.classList.contains('menu-open'));
    lastY = y;
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* vídeos tocam só quando visíveis */
  const vio = new IntersectionObserver(es => es.forEach(e => { const v = e.target; e.isIntersecting ? v.play().catch(() => {}) : v.pause(); }), { rootMargin: '100px' });
  $$('video:not([data-hover])').forEach(v => { v.muted = true; v.playsInline = true; v.loop = true; vio.observe(v); });

  /* entradas */
  const runReveals = () => {
    const els = $$('[data-fade]:not(.is-in),[data-open]:not(.is-in),[data-lines]:not(.is-in)');
    if (reduce || !('IntersectionObserver' in window)) return els.forEach(e => e.classList.add('is-in'));
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    els.forEach(e => io.observe(e));
  };
  window.ORA.reveals = runReveals;

  /* paralaxe leve */
  const par = $$('[data-par]');
  if (par.length && !reduce) {
    /* lê todas as posições primeiro e só depois escreve; roda só quando a página se move */
    let pend = false;
    const tick = () => {
      pend = false;
      const h = innerHeight, rs = par.map(el => el.parentElement.getBoundingClientRect());
      par.forEach((el, i) => {
        const r = rs[i];
        if (r.bottom < -200 || r.top > h + 200) return;
        const k = ((r.top + r.height / 2) - h / 2) / h;
        el.style.transform = `translate3d(0,${(-k * parseFloat(el.dataset.par) * 100).toFixed(2)}px,0)` + (el.dataset.scale ? ` scale(${el.dataset.scale})` : '');
      });
    };
    const req = () => { if (!pend) { pend = true; requestAnimationFrame(tick); } };
    addEventListener('scroll', req, { passive: true }); addEventListener('resize', req);
    if (lenis) lenis.on('scroll', req);
    req();
  }

  window.ORA_PAGE && window.ORA_PAGE();
  /* emendas: a cor de uma seção se dissolve na seguinte, em vez de um corte seco */
  const seams = () => {
    const blocos = $$('body > header:not(.hdr), body > section, body > main > section, body > main > header, body > main > div > section, .ftr').filter(el => el.offsetHeight > 0);
    blocos.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
    const cor = el => { const c = getComputedStyle(el).backgroundColor; return c && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent' ? c : null; };
    /* foto ou vídeo largo encostado na borda de cima (lado 't') ou de baixo (lado 'b') da seção */
    /* devolve o bloco de foto/vídeo largo encostado na borda; fundo absoluto (abertura) conta como a própria seção */
    const fotoNaBorda = (el, lado) => { const r = el.getBoundingClientRect(); const c = [...el.children].find(c => { if (c.matches('.seam-b, .seam-t') || !c.matches('img, video, picture, .bg') && !c.querySelector('img, video')) return false; const q = c.getBoundingClientRect(); return q.width > r.width * 0.45 && q.height > 120 && (lado === 't' ? q.top - r.top < 6 : r.bottom - q.bottom < 6); }); if (!c) return null; return getComputedStyle(c).position === 'absolute' || c.matches('img, picture, video') ? el : c; };
    const emenda = (onde, cls, fundo) => { if (onde.querySelector(':scope > .' + cls)) return; if (getComputedStyle(onde).position === 'static') onde.style.position = 'relative'; const d = document.createElement('div'); d.className = cls; d.setAttribute('aria-hidden', 'true'); d.style.background = fundo; onde.appendChild(d); };
    for (let i = 1; i < blocos.length; i++) {
      const a = blocos[i - 1], b = blocos[i], ca = cor(a), cb = cor(b);
      if (b.dataset.seam || Math.abs(a.getBoundingClientRect().bottom - b.getBoundingClientRect().top) > 2) continue;
      b.dataset.seam = '1';
      const fa = fotoNaBorda(a, 'b'), fb = fotoNaBorda(b, 't');
      if (fa && cb) emenda(fa, 'seam-b', 'linear-gradient(180deg, transparent, ' + cb + ')');
      if (fb && ca) emenda(fb, 'seam-t', 'linear-gradient(180deg, ' + ca + ', transparent)');
      if (!fa && !fb && ca && cb && ca !== cb) b.style.backgroundImage = 'linear-gradient(180deg, ' + ca + ' 0, ' + cb + ' clamp(120px, 16vw, 240px))';
    }
  };
  seams(); addEventListener('load', seams);
  runReveals();
})();

/* cards de foto: com mouse abre no hover (CSS); no toque, tocar abre e fecha */
document.addEventListener('click', e => {
  const b = e.target.closest('.fcard .fb'); if (!b) return;
  const touch = window.matchMedia('(hover: none)').matches;
  if (!touch && e.detail !== 0) return;
  const c = b.closest('.fcard'), on = c.dataset.aberto !== 'true';
  c.dataset.aberto = on; b.setAttribute('aria-expanded', on);
});
