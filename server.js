const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ⚠️ Firebase desativado temporariamente para testes
console.log("⚠️ Firebase desativado para testes iniciais");
const realtimeDB = null;

// ✅ CORREÇÃO CRÍTICA: Inicializar o banco de dados
let db;
try {
  const dbPath = path.join('/tmp', 'loja.db');
  db = new sqlite3.Database(dbPath); // ← ESTA LINHA ESTAVA FALTANDO!
  
  console.log("✅ SQLite conectado em:", dbPath);
  
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS usuarios (
      email TEXT PRIMARY KEY,
      nome TEXT,
      senha TEXT,
      role TEXT DEFAULT 'user'
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS produtos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT,
      descricao TEXT,
      preco REAL,
      quantidade INTEGER,
      imagem TEXT,
      categoria TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS lista_desejos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_email TEXT,
      produto_id INTEGER,
      FOREIGN KEY(usuario_email) REFERENCES usuarios(email),
      FOREIGN KEY(produto_id) REFERENCES produtos(id)
    )`);
    
    // Inserir alguns dados de teste
    db.run(`INSERT OR IGNORE INTO produtos (nome, descricao, preco, quantidade, categoria) 
            VALUES ('Produto Teste', 'Descrição teste', 29.99, 10, 'Roupas')`);
    
    console.log("✅ Tabelas criadas/verificadas com sucesso!");
  });
} catch (dbError) {
  console.error("❌ Erro ao conectar SQLite:", dbError.message);
}

// Configuração do Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = '/tmp/uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const safeName = Date.now() + path.extname(file.originalname);
    cb(null, safeName);
  },
});
const upload = multer({ storage });

// --------------------- ROTAS ---------------------

// 🏠 Rota raiz
app.get("/", (req, res) => {
  res.json({ 
    message: "🚀 API Mix Modas Online!",
    status: "success",
    database: db ? "connected" : "disconnected",
    timestamp: new Date().toISOString()
  });
});

// 🩺 Health check
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "healthy",
    database: db ? "connected" : "disconnected",
    firebase: "disabled",
    timestamp: new Date().toISOString()
  });
});

// 📦 GET - listar produtos
app.get("/api/produtos", (req, res) => {
  if (!db) return res.status(500).json({ error: "Banco de dados não disponível" });
  
  const categoria = req.query.categoria;
  const sql = categoria
    ? "SELECT * FROM produtos WHERE LOWER(categoria) = LOWER(?)"
    : "SELECT * FROM produtos";
  const params = categoria ? [categoria] : [];

  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error("❌ Erro ao listar produtos:", err.message);
      return res.status(500).json({ error: "Erro ao buscar produtos" });
    }
    res.json(rows);
  });
});

// ➕ POST - criar produto
app.post("/api/produtos", (req, res) => {
  if (!db) return res.status(500).json({ error: "Banco de dados não disponível" });

  const contentType = req.headers["content-type"] || "";
  const isMultipart = contentType.includes("multipart/form-data");

  const proceed = () => {
    let { nome, descricao, preco, quantidade, categoria } = req.body;
    const imagem = req.file ? `/tmp/uploads/${req.file.filename}` : (req.body.imagem || null);

    preco = typeof preco === "string" ? preco.trim() : preco;
    const precoNumerico = parseFloat(preco);
    const quantidadeNumerica = parseInt(quantidade) || 0;

    if (!nome || isNaN(precoNumerico)) {
      return res.status(400).json({ error: "Nome e preço são obrigatórios" });
    }

    db.run(
      "INSERT INTO produtos (nome, descricao, preco, quantidade, categoria, imagem) VALUES (?, ?, ?, ?, ?, ?)",
      [nome, descricao || "", precoNumerico, quantidadeNumerica, categoria || "Outros", imagem],
      function (err) {
        if (err) {
          console.error("❌ Erro SQLite:", err.message);
          return res.status(500).json({ error: "Erro ao salvar produto" });
        }

        const produto = {
          id: this.lastID,
          nome,
          descricao: descricao || "",
          preco: precoNumerico,
          quantidade: quantidadeNumerica,
          categoria: categoria || "Outros",
          imagem,
        };

        res.json({ success: true, produto });
      }
    );
  };

  if (isMultipart) {
    upload.single("imagem")(req, res, (err) => {
      if (err) return res.status(500).json({ error: "Erro no upload" });
      proceed();
    });
  } else {
    proceed();
  }
});

// 👤 Cadastro de usuários (simplificado)
app.post("/api/cadastro", (req, res) => {
  if (!db) return res.status(500).json({ error: "Banco de dados não disponível" });

  const { nome, email, senha } = req.body;
  if (!nome || !email || !senha) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios" });
  }

  const hash = bcrypt.hashSync(senha, 10);

  db.run(
    "INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)",
    [nome, email, hash],
    function (err) {
      if (err) {
        return res.status(500).json({ error: "Email já cadastrado" });
      }
      res.json({ success: true, message: "Usuário cadastrado com sucesso" });
    }
  );
});

// 🔐 Login
app.post("/api/login", (req, res) => {
  if (!db) return res.status(500).json({ error: "Banco de dados não disponível" });

  const { email, senha } = req.body;
  if (!email || !senha) {
    return res.status(400).json({ error: "Email e senha são obrigatórios" });
  }

  db.get("SELECT * FROM usuarios WHERE email = ?", [email], (err, user) => {
    if (err) return res.status(500).json({ error: "Erro no servidor" });
    if (!user) return res.status(401).json({ error: "Credenciais inválidas" });

    bcrypt.compare(senha, user.senha, (err, result) => {
      if (result) {
        res.json({ success: true, email: user.email, role: user.role });
      } else {
        res.status(401).json({ error: "Credenciais inválidas" });
      }
    });
  });
});

// ❌ Handler para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({ error: "Rota não encontrada" });
});

module.exports = app;