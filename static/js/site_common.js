(function () {
  const menuAdmin = document.getElementById('menuLateralAdmin');
  const usuarioLogado = localStorage.getItem('usuarioLogado');
  const role = localStorage.getItem('userRole');
  if (menuAdmin) {
    menuAdmin.style.display = 'none';
    document.body.classList.remove('menu-ativo');

    if (usuarioLogado && role === 'admin') {
      menuAdmin.style.display = 'flex';
      document.body.classList.add('menu-ativo');
    }

    document.getElementById('logoutAdmin')?.addEventListener('click', () => {
      localStorage.removeItem('usuarioLogado');
      localStorage.removeItem('userRole');
      localStorage.removeItem('nomeUsuario');
      menuAdmin.style.display = 'none';
      document.body.classList.remove('menu-ativo');
      window.location.href = '/templates/tela_login.html';
    });
  }

  function atualizarCarrinho() {
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    const total = carrinho.reduce((t, p) => t + (p.quantidade || 0), 0);
    const link = document.getElementById('carrinhoLink');
    if (link) link.textContent = `🛒 Seu Carrinho (${total})`;
  }

  atualizarCarrinho();

  document.addEventListener('DOMContentLoaded', () => {
    try {
      const loginLink = document.querySelector('a[href="/templates/tela_login.html"]');
      const usuario = localStorage.getItem('usuarioLogado');
      const nomeUsuario = localStorage.getItem('nomeUsuario');
      if (loginLink) {
        if (usuario && usuario.trim()) {
          const span = document.createElement('a');
          span.href = '#';
          span.id = 'logoutLink';
          span.textContent = nomeUsuario ? `Sair (${nomeUsuario})` : `Sair`;
          span.style.cursor = 'pointer';
          loginLink.parentNode.replaceChild(span, loginLink);
          span.addEventListener('click', () => {
            localStorage.removeItem('usuarioLogado');
            localStorage.removeItem('userRole');
            localStorage.removeItem('nomeUsuario');
            atualizarCarrinho();
            window.location.href = '/templates/tela_login.html';
          });
        }
      }
    } catch (e) {
      console.error('Erro ao inicializar link de login/logout:', e);
    }
  });

  window._site = window._site || {};
  window._site.atualizarCarrinho = atualizarCarrinho;
})();
