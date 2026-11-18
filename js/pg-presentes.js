(() => {
  const $ = s => document.querySelector(s), K = ORA_CATALOGO.produtos.filter(p => p.tipoLoja === 'kit');
  $('[data-grid]').innerHTML = K.map(oraKitCard).join('');
  $('#mKit').innerHTML = K.map(p => `<option value="${p.handle}">${p.nome} · ${brl(p.preco)}</option>`).join('');
  $('[data-pv-logo]').innerHTML = oraLogo();
  const upd = () => {
    const to = $('#mTo').value.trim(), tx = $('#mTx').value;
    const vazio = !to && !tx.trim() && !$('#mFr').value.trim(), semTx = !tx.trim();
    $('[data-pv-tx]').textContent = vazio ? 'Helena,\nPara as suas pausas de domingo. Com carinho.' : (to ? to + ',\n' : '') + (tx || 'Sua mensagem aparece aqui.');
    $('[data-pv-fr]').textContent = vazio ? 'Marina' : $('#mFr').value.trim();
    $('[data-pv]')?.classList.toggle('ex', vazio); $('[data-msg-add]').firstChild.textContent = semTx ? 'Adicionar sem mensagem ' : 'Adicionar com este cartão ';
  };
  ['#mTo', '#mTx', '#mFr'].forEach(s => $(s).addEventListener('input', upd)); upd();
  $('[data-msg-add]').addEventListener('click', () => ORA.add($('#mKit').value, { v: $('#mCf').value, msg: $('#mTx').value.trim() ? ($('#mTo').value.trim() ? $('#mTo').value.trim() + ', ' : '') + $('#mTx').value.trim() + ($('#mFr').value.trim() ? ' · ' + $('#mFr').value.trim() : '') : '' }));
  const cnt = $('[data-cnt]'); $('#mTx').addEventListener('input', () => { cnt.textContent = $('#mTx').value.length + '/140'; });
})();
