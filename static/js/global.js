// Gerenciamento global de estado de login e carrinho
function atualizarEstadoLogin() {
    const usuarioLogado = localStorage.getItem('usuarioLogado');
    const loginLink = document.getElementById('loginLink');
    
    if (loginLink && usuarioLogado) {
        loginLink.innerHTML = `👤 Sair (${usuarioLogado})`;
        loginLink.href = "#";
        loginLink.onclick = function(e) {
            e.preventDefault();
            fazerLogout();
        };
    } else if (loginLink) {
        loginLink.innerHTML = '👤 Entrar';
        loginLink.href = "/templates/tela_login.html";
        loginLink.onclick = null;
    }
}

function fazerLogout() {
    localStorage.removeItem('usuarioLogado');
    localStorage.removeItem('userRole');
    localStorage.removeItem('nomeUsuario');
    window.location.href = '/templates/index.html';
}

function atualizarCarrinhoVisual() {
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    const total = carrinho.reduce((t, p) => t + (p.quantidade || 0), 0);
    const link = document.getElementById('carrinhoLink');
    if (link) link.textContent = `🛒 Carrinho (${total})`;
}

function atualizarFavoritosVisual() {
    const fav = JSON.parse(localStorage.getItem('favoritos')) || [];
    const link = document.getElementById('listaDesejosLink');
    if (link) link.textContent = `❤️ Lista de Desejos (${fav.length})`;
}

// Inicializar em todas as páginas
document.addEventListener('DOMContentLoaded', function() {
    atualizarEstadoLogin();
    atualizarCarrinhoVisual();
    atualizarFavoritosVisual();
});