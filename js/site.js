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
      <a class="nl" href="loja.html"${cur('loja.html')}>Cafés</a>
      <a class="nl" href="presentes.html"${cur('presentes.html')}>Presentes</a>
      <a class="nl" href="historia.html"${cur('historia.html')}>Nossa história</a>
    </nav>
    <a href="index.html" class="logo" aria-label="ORA, início">${oraLogo()}</a>
    <nav class="r"><a class="nl bag-link" href="#sacola" data-bag-open>Sacola<span class="bag-count">0</span></a></nav>`;
  B.prepend(hdr);

  /* barra de anúncio: 5% off na primeira compra com o cupom BEMVINDO */
  const ann = document.createElement('div');
  ann.className = 'ann';
  ann.innerHTML = `<span>Sua primeira compra tem <b>5% off</b> · use o cupom <b>BEMVINDO</b></span>`;
  B.prepend(ann);

  const mm = document.createElement('div');
  mm.className = 'mmenu';
  mm.innerHTML = [['index.html', 'Início'], ['loja.html', 'Cafés'], ['presentes.html', 'Presentes'], ['historia.html', 'Nossa história']]
    .map(([h, t], i) => `<a class="big" href="${h}"><span style="transition-delay:${.06 * i + .25}s">${t}</span></a>`).join('') +
    `<div class="meta">Fazenda Santa Cruz · Sul de Minas</div>`;
  B.append(mm);
  $('.burger').addEventListener('click', () => {
    const o = B.classList.toggle('menu-open');
    $('.burger').setAttribute('aria-label', o ? 'Fechar menu' : 'Abrir menu');
  });

  /* rodapé */
  const ftr = document.createElement('footer');
  ftr.className = 'ftr t-espresso';
  ftr.innerHTML = `
    <div class="cols">
      <div>
        <p class="display sm" style="max-width:15em">Novas safras e kits de época, por e-mail. Pouco e quando vale a pena.</p>
        <form class="news" onsubmit="event.preventDefault();ORA.toast('Pronto. Você vai receber as novidades da ORA.');this.reset()">
          <label for="nw" style="position:absolute;left:-9999px">Seu e-mail</label>
          <input id="nw" type="email" required placeholder="Seu e-mail" autocomplete="email"><button>Assinar</button>
        </form>
      </div>
      <div><h4>Cafés</h4><ul><li><a href="produto.html?p=cafe-natural">Natural</a></li><li><a href="produto.html?p=cafe-cereja">Cereja Descascado</a></li><li><a href="presentes.html">Presentes</a></li></ul></div>
      <div><h4>A ORA</h4><ul><li><a href="historia.html">Nossa história</a></li><li><a href="index.html#preparo">Como preparar</a></li></ul></div>
      <div><h4>Contato</h4><ul><li><a href="https://instagram.com" target="_blank" rel="noopener">Instagram</a></li></ul></div>
    </div>
    <div class="giant">${oraLogo()}</div>
    <div class="base"><span>© 2026 ORA Café Especial</span><span>Fazenda Santa Cruz · Sul de Minas</span><span>todo momento tem sua ORA</span></div>`;
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
    if (p.tipoLoja === 'cafe') return 'Moído · ' + (i.t || '500') + ' g' + (i.sub ? ' · assinatura mensal (−10%)' : '');
    return 'Café ' + oraCafe(i.v).nome + (i.msg ? ' · com cartão' : '');
  };
  const precoItem = i => { const p = oraProd(i.h); let v = (i.t === '250' && p.p250) ? p.p250 : p.preco; if (i.sub) v = Math.round(v * .9); return v; };
  function renderBag() {
    bag = bag.filter(i => oraProd(i.h));
    $$('.bag-count').forEach(e => e.textContent = bag.reduce((a, i) => a + i.qty, 0));
    const items = $('.items', bagEl), pf = $('.pf', bagEl);
    if (!bag.length) {
      items.innerHTML = `<div class="empty"><p>Sua sacola está vazia.</p><a class="btn" href="loja.html">Ver os cafés ${ARR}</a></div>`;
      pf.innerHTML = ''; return;
    }
    items.innerHTML = bag.map((i, k) => {
      const p = oraProd(i.h);
      return `<div class="item"><div class="th ${p.tile || ''}"><img src="${p.thumb}" alt=""></div>
        <div><h5>${p.tipoLoja === 'cafe' ? 'Café ' + p.nome : p.nome}</h5><p>${linha(i)}</p>
          <div class="qty"><button aria-label="Diminuir" data-q="${k}" data-d="-1">−</button><span>${i.qty}</span><button aria-label="Aumentar" data-q="${k}" data-d="1">+</button></div>
          <button class="rm" data-rm="${k}">Remover</button></div>
        <div class="pr num">${brl(precoItem(i) * i.qty)}</div></div>`;
    }).join('');
    const tot = bag.reduce((a, i) => a + precoItem(i) * i.qty, 0);
    pf.innerHTML = `<div class="tot"><span class="eyebrow">Subtotal</span><b class="num">${brl(tot)}</b></div>
      <p class="note">Frete calculado pelo CEP na finalização. Cupom no fechamento, um por pedido: BEMVINDO (5% na 1ª compra) ou ORAPORSCHE (10%).</p>
      <button class="btn solid" style="width:100%;justify-content:center" data-checkout>Finalizar compra ${ARR}</button>`;
  }
  const save = () => { store.set('ora-bag3', bag); renderBag(); };
  const openBag = () => { bagEl.classList.add('open'); lenis && lenis.stop(); };
  const closeBag = () => { bagEl.classList.remove('open'); lenis && lenis.start(); };
  bagEl.addEventListener('click', e => {
    const q = e.target.closest('[data-q]'), r = e.target.closest('[data-rm]');
    if (q) { const i = bag[+q.dataset.q]; i.qty = Math.max(1, Math.min(20, i.qty + +q.dataset.d)); save(); }
    if (r) { bag.splice(+r.dataset.rm, 1); save(); }
    if (e.target.closest('[data-checkout]')) showToast('O pagamento será feito pela Shopify. A integração entra na publicação do site.', 5200);
    if (e.target.closest('[data-bag-close]')) closeBag();
  });
  document.addEventListener('click', e => {
    if (e.target.closest('[data-bag-open]')) { e.preventDefault(); B.classList.remove('menu-open'); openBag(); }
    const q = e.target.closest('[data-quick]');
    if (q) { e.preventDefault(); ORA.add(q.dataset.quick); }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeBag(); B.classList.remove('menu-open'); } });
  window.ORA = {
    add(h, o = {}) {
      const p = oraProd(h), v = p.cafe || o.v || 'natural', qty = o.qty || 1, msg = o.msg || '', sub = !!o.sub, t = p.p250 ? (o.t || '500') : undefined;
      const ex = bag.find(i => i.h === h && i.v === v && i.msg === msg && !!i.sub === sub && (i.t || '500') === (t || '500'));
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
      <a class="nl" href="loja.html"${cur('loja.html')}>Cafés</a>
      <a class="nl" href="presentes.html"${cur('presentes.html')}>Presentes</a>
      <a class="nl" href="historia.html"${cur('historia.html')}>Nossa história</a>
    </nav>
    <a href="index.html" class="logo" aria-label="ORA, início">${oraLogo()}</a>
    <nav class="r"><a class="nl bag-link" href="#sacola" data-bag-open>Sacola<span class="bag-count">0</span></a></nav>`;
  B.prepend(hdr);

  /* barra de anúncio: 5% off na primeira compra com o cupom BEMVINDO */
  const ann = document.createElement('div');
  ann.className = 'ann';
  ann.innerHTML = `<span>Sua primeira compra tem <b>5% off</b> · use o cupom <b>BEMVINDO</b></span>`;
  B.prepend(ann);

  const mm = document.createElement('div');
  mm.className = 'mmenu';
  mm.innerHTML = [['index.html', 'Início'], ['loja.html', 'Cafés'], ['presentes.html', 'Presentes'], ['historia.html', 'Nossa história']]
    .map(([h, t], i) => `<a class="big" href="${h}"><span style="transition-delay:${.06 * i + .25}s">${t}</span></a>`).join('') +
    `<div class="meta">Fazenda Santa Cruz · Sul de Minas</div>`;
  B.append(mm);
  $('.burger').addEventListener('click', () => {
    const o = B.classList.toggle('menu-open');
    $('.burger').setAttribute('aria-label', o ? 'Fechar menu' : 'Abrir menu');
  });

  /* rodapé */
  const ftr = document.createElement('footer');
  ftr.className = 'ftr t-espresso';
  ftr.innerHTML = `
    <div class="cols">
      <div>
        <p class="display sm" style="max-width:15em">Novas safras e kits de época, por e-mail. Pouco e quando vale a pena.</p>
        <form class="news" onsubmit="event.preventDefault();ORA.toast('Pronto. Você vai receber as novidades da ORA.');this.reset()">
          <label for="nw" style="position:absolute;left:-9999px">Seu e-mail</label>
          <input id="nw" type="email" required placeholder="Seu e-mail" autocomplete="email"><button>Assinar</button>
        </form>
      </div>
      <div><h4>Cafés</h4><ul><li><a href="produto.html?p=cafe-natural">Natural</a></li><li><a href="produto.html?p=cafe-cereja">Cereja Descascado</a></li><li><a href="presentes.html">Presentes</a></li></ul></div>
      <div><h4>A ORA</h4><ul><li><a href="historia.html">Nossa história</a></li><li><a href="index.html#preparo">Como preparar</a></li></ul></div>
      <div><h4>Contato</h4><ul><li><a href="https://instagram.com" target="_blank" rel="noopener">Instagram</a></li></ul></div>
    </div>
    <div class="giant">${oraLogo()}</div>
    <div class="base"><span>© 2026 ORA Café Especial</span><span>Fazenda Santa Cruz · Sul de Minas</span><span>todo momento tem sua ORA</span></div>`;
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
    if (p.tipoLoja === 'cafe') return 'Moído · ' + (i.t || '500') + ' g' + (i.sub ? ' · assinatura mensal (−10%)' : '');
    return 'Café ' + oraCafe(i.v).nome + (i.msg ? ' · com cartão' : '');
  };
  const precoItem = i => { const p = oraProd(i.h); let v = (i.t === '250' && p.p250) ? p.p250 : p.preco; if (i.sub) v = Math.round(v * .9); return v; };
  function renderBag() {
    bag = bag.filter(i => oraProd(i.h));
    $$('.bag-count').forEach(e => e.textContent = bag.reduce((a, i) => a + i.qty, 0));
    const items = $('.items', bagEl), pf = $('.pf', bagEl);
    if (!bag.length) {
      items.innerHTML = `<div class="empty"><p>Sua sacola está vazia.</p><a class="btn" href="loja.html">Ver os cafés ${ARR}</a></div>`;
      pf.innerHTML = ''; return;
    }
    items.innerHTML = bag.map((i, k) => {
      const p = oraProd(i.h);
      return `<div class="item"><div class="th ${p.tile || ''}"><img src="${p.thumb}" alt=""></div>
        <div><h5>${p.tipoLoja === 'cafe' ? 'Café ' + p.nome : p.nome}</h5><p>${linha(i)}</p>
          <div class="qty"><button aria-label="Diminuir" data-q="${k}" data-d="-1">−</button><span>${i.qty}</span><button aria-label="Aumentar" data-q="${k}" data-d="1">+</button></div>
          <button class="rm" data-rm="${k}">Remover</button></div>
        <div class="pr num">${brl(precoItem(i) * i.qty)}</div></div>`;
    }).join('');
    const tot = bag.reduce((a, i) => a + precoItem(i) * i.qty, 0);
    pf.innerHTML = `<div class="tot"><span class="eyebrow">Subtotal</span><b class="num">${brl(tot)}</b></div>
      <p class="note">Frete calculado pelo CEP na finalização. Cupom no fechamento, um por pedido: BEMVINDO (5% na 1ª compra) ou ORAPORSCHE (10%).</p>
      <button class="btn solid" style="width:100%;justify-content:center" data-checkout>Finalizar compra ${ARR}</button>`;
  }
  const save = () => { store.set('ora-bag3', bag); renderBag(); };
  const openBag = () => { bagEl.classList.add('open'); lenis && lenis.stop(); };
  const closeBag = () => { bagEl.classList.remove('open'); lenis && lenis.start(); };
  bagEl.addEventListener('click', e => {
    const q = e.target.closest('[data-q]'), r = e.target.closest('[data-rm]');
    if (q) { const i = bag[+q.dataset.q]; i.qty = Math.max(1, Math.min(20, i.qty + +q.dataset.d)); save(); }
    if (r) { bag.splice(+r.dataset.rm, 1); save(); }
    if (e.target.closest('[data-checkout]')) showToast('O pagamento será feito pela Shopify. A integração entra na publicação do site.', 5200);
    if (e.target.closest('[data-bag-close]')) closeBag();
  });
  document.addEventListener('click', e => {
    if (e.target.closest('[data-bag-open]')) { e.preventDefault(); B.classList.remove('menu-open'); openBag(); }
    const q = e.target.closest('[data-quick]');
    if (q) { e.preventDefault(); ORA.add(q.dataset.quick); }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeBag(); B.classList.remove('menu-open'); } });
  window.ORA = {
    add(h, o = {}) {
      const p = oraProd(h), v = p.cafe || o.v || 'natural', qty = o.qty || 1, msg = o.msg || '', sub = !!o.sub, t = p.p250 ? (o.t || '500') : undefined;
      const ex = bag.find(i => i.h === h && i.v === v && i.msg === msg && !!i.sub === sub && (i.t || '500') === (t || '500'));
      ex ? ex.qty = Math.min(20, ex.qty + qty) : bag.push({ h, v, qty, msg, sub, t });
      save();
      const nome = p.tipoLoja === 'cafe' ? 'Café ' + p.nome : p.nome + ' · ' + oraCafe(v).nome;
      showToast(`<span>${nome} na sacola.</span><a href="#sacola" data-bag-open>Ver sacola</a>`);
    },
    open: openBag, toast: showToast
  };
  renderBag();

  /* rolagem suave */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
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
  const solidAt = () => (B.dataset.hdr === 'light' ? 10 : innerHeight * .75);
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
    const tick = () => {
      const h = innerHeight;
      par.forEach(el => {
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom < -200 || r.top > h + 200) return;
        const k = ((r.top + r.height / 2) - h / 2) / h;
        el.style.transform = `translate3d(0,${(-k * parseFloat(el.dataset.par) * 100).toFixed(2)}px,0)` + (el.dataset.scale ? ` scale(${el.dataset.scale})` : '');
      });
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  window.ORA_PAGE && window.ORA_PAGE();
  runReveals();
})();
