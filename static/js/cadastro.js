document.addEventListener('DOMContentLoaded', ()=>{
  const form = document.getElementById('cadastroForm');
  const msg = document.getElementById('mensagem');
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('password').value.trim();
    try{
      const res = await fetch('/api/cadastro', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({nome, email, senha}) });
      const data = await res.json();
      if(res.ok && data.success){ alert('Cadastrado!'); window.location.href='/'; }
      else msg.textContent = data.error || 'Erro';
    }catch(e){ msg.textContent='Erro conexão'; }
  });
});
