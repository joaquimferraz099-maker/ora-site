(() => {
  const C = ORA_CATALOGO, $ = s => document.querySelector(s);
  $('[data-cafes]').innerHTML = C.produtos.filter(p => p.tipoLoja === 'cafe').map((p, i) => {
    const c = oraCafe(p.cafe);
    return `<article class="row${i % 2 ? ' rev' : ''}" id="c-${p.cafe}" data-h="${p.handle}">
      <a class="pk media" data-open href="produto.html?p=${p.handle}">
        <div class="pack ${c.cor === 'mocha' ? 'mocha' : ''}"><img ${oraImg(c.img, '(max-width: 760px) 35vw, 15vw')} alt="Pacote do ${c.nomeCompleto}, 500 g"></div>
        <span class="ix">0${i + 1}</span>
      </a>
      <div class="tx">
        <p class="eyebrow ln-l" data-fade>Processo ${c.processo.toLowerCase()}</p>
        <h2 data-fade><a href="produto.html?p=${p.handle}">${p.nome}</a></h2>
        <span class="sub" data-fade>${c.sub}</span>
        <div data-fade><div class="tam">${p.p250 ? `<button type="button" data-t="250" aria-pressed="false">250 g</button><button type="button" data-t="500" aria-pressed="true">500 g</button>` : `<span class="tam-tx">500 g · moído para coado</span>`}</div>
        <p class="claim">${p.p250 ? 'No pacote de 500 g, o grama sai 25% mais barato.' : ''}</p></div>
        <div class="buy" data-fade><span class="num" data-pr>${brl(p.preco)}</span><button class="btn solid" data-add>Adicionar</button><a class="link" href="produto.html?p=${p.handle}">Conheça este café</a></div>
      </div>
    </article>`;
  }).join('');
  document.querySelectorAll('.row').forEach(r => {
    const p = oraProd(r.dataset.h), c = oraCafe(p.cafe), img = r.querySelector('.pack img');
    let t = '500';
    r.querySelectorAll('[data-t]').forEach(b => b.addEventListener('click', () => {
      t = b.dataset.t;
      r.querySelectorAll('[data-t]').forEach(x => x.setAttribute('aria-pressed', x === b));
      r.querySelector('[data-pr]').textContent = brl(t === '250' ? p.p250 : p.preco);
      img.src = t === '250' && c.img250 ? c.img250 : c.img;
      img.classList.toggle('k', t === '250');
      img.alt = 'Pacote do ' + c.nomeCompleto + ', ' + t + ' g';
    }));
    r.querySelector('[data-add]').addEventListener('click', () => ORA.add(p.handle, { t }));
  });
  const d = oraProd('drip-coffee');
  $('[data-cafes]').insertAdjacentHTML('beforeend', `<article class="row drip t-espresso" id="drip">
      <div class="pk media" data-open><img class="ph" ${oraImg(d.img, '(max-width: 760px) 105vw, 53vw')} alt="Água quente caindo no saquinho de Drip Coffee, apoiado em um copo"><span class="ix">03</span></div>
      <div class="tx">
        <p class="eyebrow ln-l" data-fade>Para coar na xícara</p>
        <h2 data-fade>Drip Coffee</h2>
        <span class="sub" data-fade>Saquinho de filtro, vendido vazio</span>
        <p class="fr" data-fade>${d.resumo}</p>
        <ol class="how" data-fade><li>Coloque 10 g de café moído no saquinho.</li><li>Abra as abas e apoie na borda da xícara.</li><li>Despeje 150 ml de água quente, aos poucos.</li></ol>
        <div class="dq" data-fade><span>Quantidade</span><div class="qty"><button type="button" aria-label="Diminuir" data-dq="-1">−</button><span data-dn>10</span><button type="button" aria-label="Aumentar" data-dq="1">+</button></div><span class="un">${brl(d.preco)} a unidade</span></div>
        <div class="buy" data-fade><span class="num" data-dt>${brl(d.preco * 10)}</span><button class="btn light" data-dadd>Adicionar</button></div>
      </div>
    </article>`);
  {
    const r = $('#drip'); let q = 10;
    r.addEventListener('click', e => {
      const b = e.target.closest('[data-dq]');
      if (b) { q = Math.max(1, Math.min(100, q + +b.dataset.dq)); r.querySelector('[data-dn]').textContent = q; r.querySelector('[data-dt]').textContent = brl(d.preco * q); }
      if (e.target.closest('[data-dadd]')) ORA.add('drip-coffee', { qty: q });
    });
  }
  const [n, c] = C.cafes;
  $('[data-cmp]').innerHTML = [['Variedade', 'variedade'], ['Notas', x => (x.notas.join(', ').charAt(0) + x.notas.join(', ').slice(1).toLowerCase())], ['Acidez', 'acidez'], ['Corpo', 'corpo'], ['Final', 'final']]
    .map(([k, f]) => `<tr><th scope="row">${k}</th><td>${typeof f === 'function' ? f(n) : n[f]}</td><td>${typeof f === 'function' ? f(c) : c[f]}</td></tr>`).join('');
})();
