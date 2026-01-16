const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');
const app = express();

app.use(bodyParser.json());
app.use(cors());

// Connexion à la base de données MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'immobilier'
});

db.connect((err) => {
  if (err) {
    console.error('Erreur de connexion à MySQL : ', err);
  } else {
    console.log('Connecté à la base de données MySQL');
  }
});

// Enregistrer un nouveau propriétaire
app.post('/api/register', async (req, res) => {
  const { nom, email, mot_de_passe } = req.body;
  const hashedPassword = await bcrypt.hash(mot_de_passe, 10);

  const sql = 'INSERT INTO proprietaires (nom, email, mot_de_passe) VALUES (?, ?, ?)';
  db.query(sql, [nom, email, hashedPassword], (err, result) => {
    if (err) {
      return res.status(500).send('Erreur lors de l\'enregistrement');
    }
    res.status(200).send('Propriétaire enregistré');
  });
});

// Authentifier un propriétaire
app.post('/api/login', (req, res) => {
  const { email, mot_de_passe } = req.body;

  const sql = 'SELECT * FROM proprietaires WHERE email = ?';
  db.query(sql, [email], async (err, results) => {
    if (err) {
      return res.status(500).send('Erreur lors de la connexion');
    }
    if (results.length === 0) {
      return res.status(404).send('Utilisateur non trouvé');
    }

    const proprietaire = results[0];
    const isMatch = await bcrypt.compare(mot_de_passe, proprietaire.mot_de_passe);

    if (!isMatch) {
      return res.status(401).send('Mot de passe incorrect');
    }

    res.status(200).send('Connexion réussie');
  });
});

// Lancer le serveur
app.listen(3001, () => {
  console.log('Serveur démarré sur le port 3001');
});
