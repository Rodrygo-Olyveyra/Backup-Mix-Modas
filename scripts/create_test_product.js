const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

async function run() {
  const form = new FormData();
  form.append('nome', 'Camiseta Teste');
  form.append('descricao', 'Produto criado por script de teste');
  form.append('preco', '79.9');
  form.append('quantidade', '10');
  form.append('categoria', 'camisetas');
  form.append('imagem', fs.createReadStream('./uploads/test-img.png'));

  try {
    const res = await axios.post('http://localhost:4000/api/produtos', form, {
      headers: {
        ...form.getHeaders(),
        role: 'admin'
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });
    console.log('Response status:', res.status);
    console.log('Body:', res.data);
  } catch (e) {
    if (e.response) {
      console.error('Response status:', e.response.status);
      console.error('Body:', e.response.data);
    } else {
      console.error('Error:', e.message);
    }
  }
}

run();
