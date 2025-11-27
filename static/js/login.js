document.addEventListener('DOMContentLoaded', ()=>{
  const form = document.getElementById('loginForm');
  const msg = document.getElementById('mensagem');
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('password').value.trim();
    try{
      const res = await fetch('/api/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({email, senha}) });
      const data = await res.json();
      if(res.ok && data.success){
        localStorage.setItem('usuarioLogado', data.email);
        localStorage.setItem('userRole', data.role);
        if (data.role === 'admin') {
          window.location.href = '/templates/lista_produtos.html';
        } else {
          window.location.href = '/templates/index.html';
        }
      } else {
        msg.textContent = data.error || 'Erro no login';
      }
    }catch(err){ msg.textContent='Erro de conexão'; }
  });
});
