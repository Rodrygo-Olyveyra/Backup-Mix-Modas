const admin = require("firebase-admin");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const serviceAccount = require("./config/firebase-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://sistema-de-loja-85c8a-default-rtdb.firebaseio.com/",
});

const db = new sqlite3.Database(path.join(__dirname, "loja.db"));
const realtimeDB = admin.database();

async function sincronizar() {
  console.log("🔄 Iniciando sincronização SQLite → Firebase...");

  db.all("SELECT * FROM usuarios", async (err, usuarios) => {
    if (err) return console.error("Erro ao ler usuários:", err);

    for (const user of usuarios) {
      try {
        let userRecord;
        try {
          userRecord = await admin.auth().getUserByEmail(user.email);
        } catch {
          userRecord = await admin.auth().createUser({
            email: user.email,
            password: "123456",
            displayName: user.nome,
          });
        }

        await realtimeDB.ref("usuarios/" + userRecord.uid).set({
          nome: user.nome,
          email: user.email,
          role: user.role,
          origem: "migração inicial",
        });

        console.log("✅ Usuário sincronizado:", user.email);
      } catch (e) {
        console.error("❌ Erro ao sincronizar usuário:", user.email, e.message);
      }
    }

    db.all("SELECT * FROM produtos", async (err, produtos) => {
      if (err) return console.error("Erro ao ler produtos:", err);

      for (const produto of produtos) {
        try {
          await realtimeDB.ref("produtos/" + produto.id).set(produto);
          console.log("📦 Produto sincronizado:", produto.nome);
        } catch (e) {
          console.error("❌ Erro ao sincronizar produto:", produto.nome, e.message);
        }
      }

      console.log("🏁 Sincronização inicial concluída!");
      db.close();
    });
  });
}

sincronizar();
