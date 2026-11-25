require('dotenv').config();

const express = require('express');
const path = require('path');
const helmet = require('helmet');
const session = require('express-session');

const pool = require('./src/config/database');
const authRoutes = require('./src/routes/auth.routes');
const recipeRoutes = require('./src/routes/recipes.routes');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET;

if (!SESSION_SECRET || SESSION_SECRET.length < 24) {
    console.error('Defina SESSION_SECRET no arquivo .env com pelo menos 24 caracteres.');
    process.exit(1);
}

app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

app.use(session({
    name: 'sabore.sid',
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 6
    }
}));

// Verifica se a API consegue consultar o banco configurado.
app.get('/api/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.json({ status: 'ok', banco: 'conectado' });
    } catch (error) {
        console.error('Falha no teste de conexão:', error.message);
        res.status(503).json({ status: 'erro', banco: 'indisponível' });
    }
});

app.use('/api/auth', authRoutes);
app.use('/api', recipeRoutes);

// O frontend continua na pasta web. Assets e scripts são publicados separadamente.
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/scripts', express.static(path.join(__dirname, 'scripts')));
app.use(express.static(path.join(__dirname, 'web')));

app.use('/api', (req, res) => {
    res.status(404).json({ erro: 'Rota da API não encontrada.' });
});

app.use((error, req, res, next) => {
    console.error('Erro não tratado:', error);
    res.status(500).json({ erro: 'Ocorreu um erro interno no servidor.' });
});

const server = app.listen(PORT, () => {
    console.log(`Saborê disponível em http://localhost:${PORT}`);
});

async function encerrar() {
    server.close(async () => {
        await pool.end();
        process.exit(0);
    });
}

process.on('SIGINT', encerrar);
process.on('SIGTERM', encerrar);
