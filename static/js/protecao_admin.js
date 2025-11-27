document.addEventListener('DOMContentLoaded', () => {
  const userRole = localStorage.getItem('userRole');
  const usuarioLogado = localStorage.getItem('usuarioLogado');
  const menu = document.getElementById('menuLateralAdmin');

  if (!usuarioLogado || userRole !== 'admin') {
    if (menu) {
      alert('Acesso negado');
      window.location.href = '/templates/index.html';
    }
    return;
  }

  if (menu) {
    menu.style.display = 'flex';
    document.body.classList.add('menu-ativo');

    const logoutBtn = document.getElementById('logoutAdmin');
    if (logoutBtn && !logoutBtn.dataset.protecaoAttached) {
      logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('usuarioLogado');
        localStorage.removeItem('userRole');
        localStorage.removeItem('nomeUsuario');
        window.location.href = '/templates/tela_login.html';
      });
      logoutBtn.dataset.protecaoAttached = '1';
    }
  }
});
