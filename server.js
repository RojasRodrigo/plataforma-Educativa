const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Base de datos en archivo
const db = new sqlite3.Database('./usuarios.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    username TEXT PRIMARY KEY,
    password TEXT
  )`);

  // Insertamos un usuario de ejemplo si no existe
  db.get("SELECT * FROM users WHERE username = 'admin'", (err, row) => {
    if (!row) {
      db.run("INSERT INTO users (username, password) VALUES ('admin', '1234')");
    }
  });
});

// Login endpoint
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.get("SELECT * FROM users WHERE username = ? AND password = ?", [username, password], (err, user) => {
    if (err) return res.status(500).json({ success: false, message: 'Error en el servidor' });

    if (user) {
      res.json({ success: true });
    } else {
      res.json({ success: false, message: 'Usuario o contraseña incorrectos' });
    }
  });
});

app.post('/register', (req, res) => {
    const { username, password } = req.body;
  
    if (!username || !password) {
      return res.json({ success: false, message: 'Campos obligatorios' });
    }
  
    // Verificar si el usuario ya existe
    db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
      if (row) {
        return res.json({ success: false, message: 'El usuario ya existe' });
      }
  
      // Insertar nuevo usuario
      db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, password], (err) => {
        if (err) {
          return res.json({ success: false, message: 'Error al registrar usuario' });
        }
  
        res.json({ success: true });
      });
    });
  });
  
// Ruta para mostrar los usuarios (solo para uso interno/admin)
app.get('/usuarios', (req, res) => {
  db.all("SELECT username FROM users", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener usuarios' });
    }
    res.json(rows);
  });
});


app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

app.post('/delete-user', (req, res) => {
  const { username } = req.body;

  if (username === 'admin') {
    return res.json({ success: false, message: 'No puedes eliminar al administrador principal' });
  }

  db.run("DELETE FROM users WHERE username = ?", [username], function(err) {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error al eliminar usuario' });
    }

    res.json({ success: true });
  });
});
