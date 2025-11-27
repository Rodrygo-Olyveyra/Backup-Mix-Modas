(async () => {
  const tests = [
    { name: 'noEmail', body: {} },
    { name: 'anonEmail', body: { email: 'anon@example.com', carrinho: [{ id:1, nome:'Teste', preco:1.00, quantidade:1 }], subtotal:1.00, frete:0, total:1.00 } },
    { name: 'admin', body: { email: 'admin@mix-modas.com', carrinho: [{ id:1, nome:'Mesa Grande', preco:1.04, quantidade:1, imagem: '/uploads/test.png' }], subtotal:1.04, frete:0, total:1.04 } },
  ];

  for (const t of tests) {
    console.log('---- TEST:', t.name, '----');
    try {
      const r = await fetch('http://localhost:3000/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(t.body),
      });
      const txt = await r.text();
      console.log('STATUS:', r.status);
      try { console.log('BODY:', JSON.parse(txt)); } catch { console.log('BODY (raw):', txt); }
    } catch (err) {
      console.error('ERROR:', err);
    }
    console.log();
  }
})();
