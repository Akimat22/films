const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const moviesData = require('./movies.json');

const app = express();
const PORT = 3000;


app.use(express.json());
app.use(cors({
    origin: '*', // Allow all origins (you can restrict this to specific origins like 'http://localhost:5500')
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow these HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow these headers
}));

const db = new sqlite3.Database(':memory:', (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Connecté à la base de données SQLite.');
        db.run(`CREATE TABLE IF NOT EXISTS movies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nom TEXT NOT NULL,
            dateDeSortie TEXT NOT NULL,
            realisateur TEXT NOT NULL,
            note REAL,
            notePublic REAL,
            compagnie TEXT NOT NULL,
            description TEXT NOT NULL,
            origine TEXT NOT NULL,
            lienImage TEXT NOT NULL
        )`, () => {
            db.get('SELECT COUNT(*) AS count FROM movies', (err, row) => {
                if (row.count === 0) {
                    console.log('Base de données vide, insertion des films...');
                    const stmt = db.prepare('INSERT INTO movies (nom, dateDeSortie, realisateur, note, notePublic, compagnie, description, origine, lienImage) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
                    moviesData.forEach(movie => {
                        stmt.run(movie.nom, movie.dateDeSortie, movie.realisateur, movie.note, movie.notePublic, movie.compagnie, movie.description, movie.origine, movie.lienImage);
                    });
                    stmt.finalize();
                }
            });
        });
    }
});

app.post('/movies', (req, res) => {
    const { nom, dateDeSortie, realisateur, note, notePublic, compagnie, description, origine, lienImage } = req.body;
    if (!nom || !dateDeSortie || !realisateur || !compagnie || !description || !origine || !lienImage) {
        return res.status(400).json({ error: 'Tous les champs obligatoires doivent être remplis' });
    }
    db.run('INSERT INTO movies (nom, dateDeSortie, realisateur, note, notePublic, compagnie, description, origine, lienImage) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [nom, dateDeSortie, realisateur, note, notePublic, compagnie, description, origine, lienImage],
        function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.status(201).json({ id: this.lastID, message: 'Film ajouté avec succès' });
            }
        }
    );
});

app.delete('/movies/:id', (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM movies WHERE id = ?', [id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json({ message: 'Film supprimé avec succès' });
    });
});

app.get('/movies', (req, res) => {
    const { origine, niveau, noteMin, noteMax } = req.query;

    let query = "SELECT * FROM movies WHERE 1=1";
    const params = [];

    if (origine && origine !== "TOUS") {
        query += " AND origine = ?";
        params.push(origine);
    }

    if (niveau) {
        if (niveau === "Banger" && noteMin) {
            query += " AND note >= ?";
            params.push(parseFloat(noteMin));
        }
        else if (niveau === "Navet" && noteMax) {
            query += " AND note <= ?";
            params.push(parseFloat(noteMax));
        }
        else if (niveau === "Classic" && noteMin && noteMax) {
            query += " AND note BETWEEN ? AND ?";
            params.push(parseFloat(noteMin), parseFloat(noteMax));
        }
    }

    db.all(query, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

app.put('/movies/:id', (req, res) => {
    const movieId = req.params.id;
    const { nom, realisateur, compagnie, dateDeSortie, note, notePublic, description, lienImage, origine } = req.body;

    const sql = `UPDATE movies 
                 SET nom = ?, realisateur = ?, compagnie = ?, dateDeSortie = ?, note = ?, notePublic = ?, description = ?, lienImage = ?, origine = ?
                 WHERE id = ?`;
    const params = [nom, realisateur, compagnie, dateDeSortie, note, notePublic, description, lienImage, origine, movieId];

    db.run(sql, params, function (err) {
        if (err) {
            res.status(500).json({ success: false, error: err.message });
            return;
        }
        res.json({ success: true });
    });
});

app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});