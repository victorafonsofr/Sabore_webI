function requireAuth(req, res, next) {
    if (!req.session || !req.session.usuario) {
        return res.status(401).json({ erro: 'Entre na sua conta para realizar esta ação.' });
    }

    next();
}

module.exports = requireAuth;
