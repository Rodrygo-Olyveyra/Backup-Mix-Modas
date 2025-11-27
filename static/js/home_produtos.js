document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('produtos-grid');

  function placeholder() {
    return '/static/img/sem-foto.png';
  }

  function atualizarCarrinhoVisual() {
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    const total = carrinho.reduce((t, p) => t + (p.quantidade || 0), 0);
    const link = document.getElementById('carrinhoLink');
    if (link) link.textContent = `🛒 Seu Carrinho (${total})`;
  }

  function adicionarAoCarrinho(prod) {
    let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    const idx = carrinho.findIndex(p => String(p.id) === String(prod.id));
    if (idx >= 0) carrinho[idx].quantidade = (carrinho[idx].quantidade || 0) + 1;
    else carrinho.push({ ...prod, quantidade: 1 });
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    atualizarCarrinhoVisual();
    alert(`${prod.nome} adicionado ao carrinho!`);
  }

  async function carregar() {
  try {
    const res = await fetch('/api/produtos');
    const list = await res.json();
    grid.innerHTML = '';
    const produtos = Array.isArray(list) ? list : [];

    if (produtos.length === 0) {
      grid.innerHTML = '<p>Nenhum produto disponível no momento.</p>';
      return;
    }

    produtos.forEach(p => {
      const card = document.createElement('article');
      card.className = 'produto';
      card.innerHTML = `
        ${p.preco ? `<div class="produto-tag"></div>` : ''}
        <img src="${p.imagem || placeholder()}" alt="${p.nome || ''}">
        <h3>${p.nome || 'Sem nome'}</h3>
        <p class="produto-preco">R$ ${Number(p.preco || 0).toFixed(2)}</p>
        <button class="btn-carrinho">Adicionar ao Carrinho</button>
      `;
      const btn = card.querySelector('.btn-carrinho');
      btn.addEventListener('click', () => adicionarAoCarrinho(p));
      grid.appendChild(card);
    });

    atualizarCarrinhoVisual();
  } catch (err) {
    console.error('Erro ao carregar produtos na home:', err);
    grid.innerHTML = '<p>Erro ao carregar produtos.</p>';
  }
}

  carregar();
});
