const express = require('express');
const pool = require('../config/database');
const requireAuth = require('../middleware/require-auth');

const router = express.Router();

function idValido(valor) {
    const id = Number(valor);
    return Number.isInteger(id) && id > 0 ? id : null;
}

function tipoImagem(imagem) {
    if (!imagem || imagem.length < 4) return 'application/octet-stream';

    if (imagem.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
        return 'image/png';
    }
    if (imagem[0] === 0xff && imagem[1] === 0xd8 && imagem[2] === 0xff) {
        return 'image/jpeg';
    }
    if (imagem.subarray(0, 4).toString() === 'GIF8') return 'image/gif';
    if (imagem.subarray(0, 4).toString() === 'RIFF' && imagem.subarray(8, 12).toString() === 'WEBP') {
        return 'image/webp';
    }

    return 'application/octet-stream';
}

router.get('/categorias', async (req, res) => {
    try {
        const [categorias] = await pool.query(
            'SELECT id, nome_categoria FROM Categorias ORDER BY nome_categoria'
        );
        res.json(categorias);
    } catch (error) {
        console.error('Erro ao listar categorias:', error.message);
        res.status(500).json({ erro: 'Não foi possível carregar as categorias.' });
    }
});

router.get('/receitas', async (req, res) => {
    const busca = String(req.query.busca || '').trim();
    const categoria = req.query.categoria ? idValido(req.query.categoria) : null;

    if (req.query.categoria && !categoria) {
        return res.status(400).json({ erro: 'Categoria inválida.' });
    }

    const condicoes = [];
    const parametros = [];

    if (busca) {
        condicoes.push('(r.nome_receita LIKE ? OR r.descricao LIKE ?)');
        parametros.push(`%${busca}%`, `%${busca}%`);
    }

    if (categoria) {
        condicoes.push('r.id_categoria = ?');
        parametros.push(categoria);
    }

    const where = condicoes.length ? `WHERE ${condicoes.join(' AND ')}` : '';

    try {
        const [receitas] = await pool.execute(
            `SELECT r.id, r.nome_receita, r.descricao, r.dificuldade,
                    r.tempo_preparo, r.id_categoria,
                    c.nome_categoria,
                    (r.imagem IS NOT NULL) AS possui_imagem
             FROM Receitas r
             INNER JOIN Categorias c ON c.id = r.id_categoria
             ${where}
             ORDER BY r.id DESC`,
            parametros
        );

        res.json(receitas.map((receita) => ({
            ...receita,
            imagem_url: receita.possui_imagem ? `/api/receitas/${receita.id}/imagem` : null
        })));
    } catch (error) {
        console.error('Erro ao listar receitas:', error.message);
        res.status(500).json({ erro: 'Não foi possível carregar as receitas.' });
    }
});

// A coluna imagem do SQL é BLOB. A rota devolve os bytes sem expor o conteúdo no JSON.
router.get('/receitas/:id/imagem', async (req, res) => {
    const id = idValido(req.params.id);
    if (!id) return res.status(400).json({ erro: 'Identificador de receita inválido.' });

    try {
        const [linhas] = await pool.execute('SELECT imagem FROM Receitas WHERE id = ? LIMIT 1', [id]);
        if (linhas.length === 0 || !linhas[0].imagem) {
            return res.status(404).json({ erro: 'Esta receita não possui imagem cadastrada.' });
        }

        const imagem = linhas[0].imagem;
        res.set('Content-Type', tipoImagem(imagem));
        res.set('Cache-Control', 'public, max-age=3600');
        res.send(imagem);
    } catch (error) {
        console.error('Erro ao buscar imagem:', error.message);
        res.status(500).json({ erro: 'Não foi possível carregar a imagem.' });
    }
});

router.get('/receitas/:id', async (req, res) => {
    const id = idValido(req.params.id);
    if (!id) return res.status(400).json({ erro: 'Identificador de receita inválido.' });

    try {
        const [receitas] = await pool.execute(
            `SELECT r.id, r.nome_receita, r.descricao, r.dificuldade,
                    r.tempo_preparo, r.modo_preparo, r.id_categoria,
                    c.nome_categoria, (r.imagem IS NOT NULL) AS possui_imagem
             FROM Receitas r
             INNER JOIN Categorias c ON c.id = r.id_categoria
             WHERE r.id = ? LIMIT 1`,
            [id]
        );

        if (receitas.length === 0) {
            return res.status(404).json({ erro: 'Receita não encontrada.' });
        }

        const [ingredientes] = await pool.execute(
            `SELECT i.id, i.descricao_ingrediente, ri.quantidade, ri.unidade_medida
             FROM Receita_Ingrediente ri
             INNER JOIN Ingredientes i ON i.id = ri.id_ingrediente
             WHERE ri.id_receita = ?
             ORDER BY i.descricao_ingrediente`,
            [id]
        );

        const [comentarios] = await pool.execute(
            `SELECT c.id, c.conteudo, c.data_comentario,
                    u.id AS id_usuario, u.nome AS nome_usuario
             FROM Comentarios c
             INNER JOIN Usuario u ON u.id = c.id_usuario
             WHERE c.id_receita = ?
             ORDER BY c.data_comentario DESC, c.id DESC`,
            [id]
        );

        const receita = receitas[0];
        res.json({
            ...receita,
            imagem_url: receita.possui_imagem ? `/api/receitas/${id}/imagem` : null,
            ingredientes,
            comentarios
        });
    } catch (error) {
        console.error('Erro ao buscar receita:', error.message);
        res.status(500).json({ erro: 'Não foi possível carregar esta receita.' });
    }
});

router.post('/receitas/:id/comentarios', requireAuth, async (req, res) => {
    const id = idValido(req.params.id);
    const conteudo = String(req.body.conteudo || '').trim();

    if (!id) return res.status(400).json({ erro: 'Identificador de receita inválido.' });
    if (!conteudo || conteudo.length > 500) {
        return res.status(400).json({ erro: 'O comentário deve ter entre 1 e 500 caracteres.' });
    }

    try {
        const [receitas] = await pool.execute('SELECT id FROM Receitas WHERE id = ? LIMIT 1', [id]);
        if (receitas.length === 0) return res.status(404).json({ erro: 'Receita não encontrada.' });

        const [resultado] = await pool.execute(
            'INSERT INTO Comentarios (conteudo, id_usuario, id_receita) VALUES (?, ?, ?)',
            [conteudo, req.session.usuario.id, id]
        );

        const [comentarios] = await pool.execute(
            `SELECT c.id, c.conteudo, c.data_comentario,
                    u.id AS id_usuario, u.nome AS nome_usuario
             FROM Comentarios c
             INNER JOIN Usuario u ON u.id = c.id_usuario
             WHERE c.id = ? LIMIT 1`,
            [resultado.insertId]
        );

        res.status(201).json({ comentario: comentarios[0] });
    } catch (error) {
        console.error('Erro ao salvar comentário:', error.message);
        res.status(500).json({ erro: 'Não foi possível publicar o comentário.' });
    }
});

module.exports = router;
