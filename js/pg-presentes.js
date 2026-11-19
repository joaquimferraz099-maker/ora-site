(() => {
  const K = ORA_CATALOGO.produtos.filter(p => p.tipoLoja === 'kit');
  document.querySelector('[data-grid]').innerHTML = K.map(oraKitCard).join('');
})();
