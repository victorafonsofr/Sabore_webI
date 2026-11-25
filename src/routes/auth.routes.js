const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');

const router = express.Router();

function usuarioPublico(usuario) {
    return {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email
    };
}

function salvarSessao(req, usuario, res, statusCode = 200) {
    req.session.regenerate((erro) => {
        if (erro) {
            console.error('Erro ao iniciar sessão:', erro.message);
            return res.status(500).json({ erro: 'Não foi possível iniciar sua sessão.' });
        }

        req.session.usuario = usuarioPublico(usuario);
        req.session.save((erroAoSalvar) => {
            if (erroAoSalvar) {
                console.error('Erro ao salvar sessão:', erroAoSalvar.message);
                return res.status(500).json({ erro: 'Não foi possível salvar sua sessão.' });
            }

            res.status(statusCode).json({ mensagem: 'Autenticação realizada.', usuario: req.session.usuario });
        });
    });
}

// Cadastro de novos usuários. As senhas novas são armazenadas com hash bcrypt.
router.post('/cadastro', async (req, res) => {
    const { nome, email, senha, data_nasc, descricao } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ erro: 'Preencha nome, e-mail e senha.' });
    }

    const nomeLimpo = String(nome).trim();
    const emailLimpo = String(email).trim().toLowerCase();
    const senhaTexto = String(senha);

    if (nomeLimpo.length > 55) {
        return res.status(400).json({ erro: 'O nome deve ter no máximo 55 caracteres.' });
    }

    if (emailLimpo.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpo)) {
        return res.status(400).json({ erro: 'Informe um e-mail válido.' });
    }

    if (senhaTexto.length < 8 || senhaTexto.length > 72) {
        return res.status(400).json({ erro: 'A senha deve ter entre 8 e 72 caracteres.' });
    }

    if (descricao && String(descricao).length > 255) {
        return res.status(400).json({ erro: 'A descrição deve ter no máximo 255 caracteres.' });
    }

    try {
        const [existentes] = await pool.execute(
            'SELECT id FROM Usuario WHERE email = ? LIMIT 1',
            [emailLimpo]
        );

        if (existentes.length > 0) {
            return res.status(409).json({ erro: 'Já existe uma conta cadastrada com esse e-mail.' });
        }

        const hash = await bcrypt.hash(senhaTexto, 12);
        const [resultado] = await pool.execute(
            `INSERT INTO Usuario (nome, email, senha, data_nasc, descricao)
             VALUES (?, ?, ?, ?, ?)`,
            [nomeLimpo, emailLimpo, hash, data_nasc || null, descricao ? String(descricao).trim() : null]
        );

        const usuario = { id: resultado.insertId, nome: nomeLimpo, email: emailLimpo };
        salvarSessao(req, usuario, res, 201);
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ erro: 'Já existe uma conta cadastrada com esse e-mail.' });
        }
        console.error('Erro no cadastro:', error.message);
        res.status(500).json({ erro: 'Não foi possível concluir o cadastro.' });
    }
});

// Login por e-mail e senha.
// Os usuários de demonstração do SQL original têm senha em texto puro.
// No primeiro login válido, a senha é convertida automaticamente para bcrypt.
router.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ erro: 'Informe e-mail e senha.' });
    }

    try {
        const [usuarios] = await pool.execute(
            'SELECT id, nome, email, senha FROM Usuario WHERE email = ? LIMIT 1',
            [String(email).trim().toLowerCase()]
        );

        if (usuarios.length === 0) {
            return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
        }

        const usuario = usuarios[0];
        const senhaArmazenada = String(usuario.senha);
        let senhaValida = false;

        if (/^\$2[aby]\$/.test(senhaArmazenada)) {
            senhaValida = await bcrypt.compare(String(senha), senhaArmazenada);
        } else if (senhaArmazenada === String(senha)) {
            // Compatibilidade com os registros de demonstração do sabore.sql.
            senhaValida = true;
            const novoHash = await bcrypt.hash(String(senha), 12);
            await pool.execute('UPDATE Usuario SET senha = ? WHERE id = ?', [novoHash, usuario.id]);
        }

        if (!senhaValida) {
            return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
        }

        salvarSessao(req, usuario, res);
    } catch (error) {
        console.error('Erro no login:', error.message);
        res.status(500).json({ erro: 'Não foi possível realizar o login.' });
    }
});

router.get('/me', (req, res) => {
    res.json({ usuario: req.session && req.session.usuario ? req.session.usuario : null });
});

router.post('/logout', (req, res) => {
    if (!req.session) {
        return res.json({ mensagem: 'Sessão encerrada.' });
    }

    req.session.destroy((error) => {
        if (error) {
            console.error('Erro ao encerrar sessão:', error.message);
            return res.status(500).json({ erro: 'Não foi possível encerrar a sessão.' });
        }

        res.clearCookie('sabore.sid', { httpOnly: true, sameSite: 'lax' });
        res.json({ mensagem: 'Sessão encerrada.' });
    });
});

module.exports = router;
