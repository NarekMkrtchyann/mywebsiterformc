const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Simulate a user database (for demo only)
const usersFile = path.join(__dirname, 'users.json');
if (!fs.existsSync(usersFile)) fs.writeFileSync(usersFile, JSON.stringify([{username:"admin", password:"admin123"}]));

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Simple session (not safe for production!)
let sessions = {};

// Authentication middleware
function requireAuth(req, res, next) {
    let sid = req.headers.cookie && req.headers.cookie.replace('sid=','');
    if (sid && sessions[sid]) {
        req.user = sessions[sid];
        next();
    } else {
        res.redirect('/login.html');
    }
}

// Login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const users = JSON.parse(fs.readFileSync(usersFile));
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        const sid = Math.random().toString(36).slice(2);
        sessions[sid] = user;
        res.setHeader('Set-Cookie', 'sid='+sid+'; Path=/; HttpOnly');
        res.redirect('/dashboard.html');
    } else {
        res.send('Login failed. <a href="/login.html">Try again</a>');
    }
});

// Registration
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    let users = JSON.parse(fs.readFileSync(usersFile));
    if (users.find(u => u.username === username)) {
        return res.send('User exists. <a href="/login.html">Login</a>');
    }
    users.push({ username, password });
    fs.writeFileSync(usersFile, JSON.stringify(users));
    res.send('Registered! <a href="/login.html">Login now</a>');
});

// Fake servers data (should be in db in real project)
let servers = [
    { id: 1, name: "Survival Server", status: "online", players: 7 },
    { id: 2, name: "MiniGames Server", status: "offline", players: 0 }
];

// API endpoints (protected)
app.get('/api/servers', requireAuth, (req, res) => {
    res.json(servers);
});
app.post('/api/server/:id/start', requireAuth, (req, res) => {
    let srv = servers.find(s => s.id == req.params.id);
    if (!srv) return res.status(404).send('Not found');
    srv.status = 'online';
    res.json(srv);
});
app.post('/api/server/:id/stop', requireAuth, (req, res) => {
    let srv = servers.find(s => s.id == req.params.id);
    if (!srv) return res.status(404).send('Not found');
    srv.status = 'offline';
    res.json(srv);
});

// Default route
app.get('/', (req, res) => res.redirect('/login.html'));

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
