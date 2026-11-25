(function () {
    'use strict';

    const CHAVE_FAVORITOS = 'sabore:favoritas';
    const IMAGEM_PADRAO = '/assets/img/AdobeStock_115079322-scaled.webp';
    const IMAGENS_EXISTENTES = {
        'bolo-de-cenoura': '/assets/img/bolo-de-cenoura.jpg',
        'omelete': '/assets/img/omelete.jpeg'
    };

    async function requisicao(url, opcoes) {
        const resposta = await fetch(url, { credentials: 'same-origin', ...(opcoes || {}) });
        const dados = await resposta.json();
        if (!resposta.ok) throw new Error(dados.erro || 'Não foi possível concluir a solicitação.');
        return dados;
    }

    function lerFavoritos() {
        try {
            const dados = JSON.parse(localStorage.getItem(CHAVE_FAVORITOS) || '[]');
            return Array.isArray(dados) ? dados.map(String) : [];
        } catch (erro) {
            return [];
        }
    }

    function salvarFavoritos(ids) {
        localStorage.setItem(CHAVE_FAVORITOS, JSON.stringify(ids));
    }

    // Compatibilidade com a versão anterior, que gravava slugs em vez de IDs numéricos.
    function slugReceita(nome) {
        return String(nome || '').toLocaleLowerCase('pt-BR')
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }

    function estaFavoritada(receita, ids) {
        const aliases = {
            'omelete': 'omelete-de-micro-ondas'
        };
        const slug = slugReceita(receita.nome_receita);
        return ids.includes(String(receita.id)) || ids.includes(slug) ||
            (aliases[slug] && ids.includes(aliases[slug]));
    }

    function imagemDaReceita(receita) {
        return receita.imagem_url || IMAGENS_EXISTENTES[slugReceita(receita.nome_receita)] || IMAGEM_PADRAO;
    }

    function slugDificuldade(dificuldade) {
        if (dificuldade === 'Fácil') return 'facil';
        if (dificuldade === 'Médio') return 'medio';
        if (dificuldade === 'Difícil') return 'dificil';
        return '';
    }

    function criarBotaoFavorito(receita, aoAlterar) {
        const botao = document.createElement('button');
        botao.type = 'button';
        botao.className = 'fav-btn';
        botao.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 2.7 5 6 5c2 0 3.4 1.1 4.2 2.4h3.6C14.6 6.1 16 5 18 5c3.3 0 5.1 3.4 3.6 6.8C19.5 16.4 12 21 12 21z"/></svg>';

        function atualizar() {
            const ativo = estaFavoritada(receita, lerFavoritos());
            botao.setAttribute('aria-pressed', String(ativo));
            botao.setAttribute('aria-label', `${ativo ? 'Remover dos favoritos' : 'Favoritar'}: ${receita.nome_receita}`);
        }

        botao.addEventListener('click', () => {
            const ids = lerFavoritos();
            const id = String(receita.id);
            const indice = ids.indexOf(id);
            const slug = slugReceita(receita.nome_receita);
            const slugIndice = ids.indexOf(slug);
            const alias = slug === 'omelete' ? 'omelete-de-micro-ondas' : null;
            const aliasIndice = alias ? ids.indexOf(alias) : -1;
            const ativo = indice === -1 && slugIndice === -1 && aliasIndice === -1;
            if (ativo) ids.push(id);
            else {
                [id, slug, alias].filter(Boolean).forEach((chave) => {
                    const posicao = ids.indexOf(chave);
                    if (posicao !== -1) ids.splice(posicao, 1);
                });
            }
            salvarFavoritos(ids);
            atualizar();
            if (aoAlterar) aoAlterar(ativo);
        });

        atualizar();
        return botao;
    }

    function criarCard(receita, aoAlterar) {
        const card = document.createElement('article');
        card.className = 'card-receita';
        card.dataset.id = receita.id;

        const link = document.createElement('a');
        link.href = `/receita.html?id=${encodeURIComponent(receita.id)}`;
        link.className = 'card-link-receita';

        const imagem = document.createElement('img');
        imagem.className = 'card-img';
        imagem.src = imagemDaReceita(receita);
        imagem.alt = receita.nome_receita;
        imagem.loading = 'lazy';
        imagem.addEventListener('error', () => { imagem.src = IMAGEM_PADRAO; }, { once: true });

        const corpo = document.createElement('div');
        corpo.className = 'card-corpo';

        const titulo = document.createElement('h2');
        titulo.className = 'card-titulo';
        titulo.textContent = receita.nome_receita;

        const descricao = document.createElement('p');
        descricao.className = 'card-descricao';
        descricao.textContent = receita.descricao || 'Confira os ingredientes e o modo de preparo.';

        const categoria = document.createElement('span');
        categoria.className = 'card-categoria';
        categoria.textContent = receita.nome_categoria || '';

        const dificuldade = document.createElement('span');
        dificuldade.className = `complexidade ${slugDificuldade(receita.dificuldade)}`;
        dificuldade.textContent = receita.dificuldade || 'Não informada';

        const tempo = document.createElement('small');
        tempo.className = 'card-tempo';
        tempo.textContent = receita.tempo_preparo ? `${receita.tempo_preparo} min` : 'Tempo não informado';

        corpo.append(titulo, descricao, categoria, dificuldade, tempo);
        link.append(imagem, corpo);
        card.append(link, criarBotaoFavorito(receita, aoAlterar));
        return card;
    }

    function mostrarErro(container, mensagem) {
        container.innerHTML = '';
        const aviso = document.createElement('p');
        aviso.className = 'estado-carregamento';
        aviso.textContent = mensagem;
        container.appendChild(aviso);
    }

    async function iniciarPaginaInicial() {
        const grade = document.getElementById('receitas');
        const categorias = document.getElementById('lista-categorias');
        const busca = document.querySelector('.pesquisar .input');
        let receitas = [];
        let categoriaAtual = '';
        let termoAtual = '';

        try {
            const resultados = await Promise.all([
                requisicao('/api/receitas'),
                requisicao('/api/categorias')
            ]);
            receitas = resultados[0];
            const listaCategorias = resultados[1];

            categorias.innerHTML = '';
            const todas = document.createElement('a');
            todas.href = '#receitas';
            todas.textContent = 'Todas';
            todas.dataset.categoria = '';
            categorias.appendChild(todas);

            listaCategorias.forEach((categoria) => {
                const link = document.createElement('a');
                link.href = '#receitas';
                link.textContent = categoria.nome_categoria;
                link.dataset.categoria = String(categoria.id);
                categorias.appendChild(link);
            });

            categorias.addEventListener('click', (evento) => {
                const link = evento.target.closest('a[data-categoria]');
                if (!link) return;
                evento.preventDefault();
                categoriaAtual = link.dataset.categoria;
                desenhar();
            });

            if (busca) {
                busca.addEventListener('input', () => {
                    termoAtual = busca.value.trim().toLocaleLowerCase('pt-BR');
                    desenhar();
                });
            }

            function desenhar() {
                const filtradas = receitas.filter((receita) => {
                    const combinaCategoria = !categoriaAtual || String(receita.id_categoria) === categoriaAtual;
                    const texto = `${receita.nome_receita} ${receita.descricao || ''}`.toLocaleLowerCase('pt-BR');
                    return combinaCategoria && texto.includes(termoAtual);
                });

                grade.innerHTML = '';
                if (filtradas.length === 0) {
                    mostrarErro(grade, 'Nenhuma receita encontrada para essa pesquisa.');
                    return;
                }
                filtradas.forEach((receita) => grade.appendChild(criarCard(receita)));
            }

            desenhar();
        } catch (erro) {
            mostrarErro(grade, `${erro.message} Verifique se o servidor Node.js e o MySQL estão ativos.`);
        }
    }

    async function iniciarFavoritos() {
        const grade = document.getElementById('lista-favoritas');
        const vazio = document.getElementById('fav-vazio');
        const semResultado = document.getElementById('fav-sem-resultado');
        const contagem = document.getElementById('fav-contagem');
        const filtros = document.getElementById('fav-filtros');
        const limpar = document.getElementById('fav-limpar');
        const aviso = document.getElementById('fav-aviso');
        const busca = document.querySelector('.pesquisar .input');
        let receitas = [];
        let nivelAtual = 'todas';
        let termoAtual = '';

        try {
            receitas = await requisicao('/api/receitas');
        } catch (erro) {
            mostrarErro(grade, `${erro.message} Verifique se o servidor Node.js e o MySQL estão ativos.`);
            return;
        }

        function desenhar() {
            const ids = lerFavoritos();
            const favoritas = receitas.filter((receita) => estaFavoritada(receita, ids));
            const visiveis = favoritas.filter((receita) => {
                const combinaNivel = nivelAtual === 'todas' || slugDificuldade(receita.dificuldade) === nivelAtual;
                const texto = `${receita.nome_receita} ${receita.descricao || ''}`.toLocaleLowerCase('pt-BR');
                return combinaNivel && texto.includes(termoAtual);
            });

            grade.innerHTML = '';
            visiveis.forEach((receita) => {
                grade.appendChild(criarCard(receita, () => desenhar()));
            });

            contagem.textContent = favoritas.length
                ? `${favoritas.length} ${favoritas.length === 1 ? 'receita favoritada' : 'receitas favoritadas'}`
                : '';
            vazio.hidden = favoritas.length !== 0;
            filtros.hidden = favoritas.length === 0;
            limpar.hidden = favoritas.length === 0;
            semResultado.hidden = !(favoritas.length > 0 && visiveis.length === 0);
            grade.hidden = visiveis.length === 0;
        }

        filtros.addEventListener('click', (evento) => {
            const botao = evento.target.closest('button[data-nivel]');
            if (!botao) return;
            nivelAtual = botao.dataset.nivel;
            filtros.querySelectorAll('button[data-nivel]').forEach((item) => {
                item.setAttribute('aria-pressed', String(item === botao));
            });
            desenhar();
        });

        limpar.addEventListener('click', () => {
            if (!window.confirm('Remover todas as receitas dos favoritos?')) return;
            salvarFavoritos([]);
            aviso.textContent = 'Todos os favoritos foram removidos.';
            desenhar();
        });

        if (busca) {
            busca.addEventListener('input', () => {
                termoAtual = busca.value.trim().toLocaleLowerCase('pt-BR');
                desenhar();
            });
        }

        window.addEventListener('storage', (evento) => {
            if (evento.key === CHAVE_FAVORITOS) desenhar();
        });
        desenhar();
    }

    function criarComentario(comentario) {
        const item = document.createElement('article');
        item.className = 'comentario';
        const autor = document.createElement('strong');
        autor.textContent = comentario.nome_usuario;
        const data = document.createElement('small');
        data.textContent = comentario.data_comentario
            ? new Date(comentario.data_comentario).toLocaleString('pt-BR')
            : '';
        const texto = document.createElement('p');
        texto.textContent = comentario.conteudo;
        item.append(autor, data, texto);
        return item;
    }

    async function iniciarDetalheReceita() {
        const container = document.getElementById('detalhe-receita');
        const parametros = new URLSearchParams(window.location.search);
        const id = parametros.get('id');
        const mensagem = document.getElementById('estado-receita');

        if (!id || !/^\d+$/.test(id)) {
            mensagem.textContent = 'Selecione uma receita na página inicial.';
            return;
        }

        try {
            const receita = await requisicao(`/api/receitas/${encodeURIComponent(id)}`);
            document.title = `Saborê - ${receita.nome_receita}`;
            mensagem.textContent = '';

            const imagem = document.getElementById('receita-imagem');
            imagem.src = imagemDaReceita(receita);
            imagem.alt = receita.nome_receita;

            document.getElementById('receita-titulo').textContent = receita.nome_receita;
            const descricao = document.getElementById('receita-descricao');
            descricao.textContent = receita.descricao || '';

            const info = document.getElementById('receita-info');
            info.innerHTML = '';
            [
                receita.nome_categoria,
                receita.tempo_preparo ? `⏳ ${receita.tempo_preparo} min` : 'Tempo não informado',
                receita.dificuldade || 'Dificuldade não informada'
            ].forEach((texto, indice) => {
                const item = document.createElement('li');
                item.textContent = texto;
                if (indice === 2) item.className = `complexidade ${slugDificuldade(receita.dificuldade)}`;
                info.appendChild(item);
            });

            const listaIngredientes = document.getElementById('receita-ingredientes');
            listaIngredientes.innerHTML = '';
            receita.ingredientes.forEach((ingrediente) => {
                const item = document.createElement('li');
                const label = document.createElement('label');
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                const quantidade = ingrediente.quantidade !== null && ingrediente.quantidade !== undefined
                    ? `${ingrediente.quantidade} ${ingrediente.unidade_medida || ''} de `
                    : '';
                label.append(checkbox, document.createTextNode(`${quantidade}${ingrediente.descricao_ingrediente}`));
                item.appendChild(label);
                listaIngredientes.appendChild(item);
            });

            const passos = document.getElementById('receita-passos');
            passos.innerHTML = '';
            const textoPreparo = (receita.modo_preparo || '').trim();
            const etapas = textoPreparo
                ? textoPreparo.split(/\r?\n+/).map((linha) => linha.trim()).filter(Boolean)
                : [];
            if (etapas.length === 0 && textoPreparo) etapas.push(textoPreparo);
            if (etapas.length === 0) etapas.push('O modo de preparo ainda não foi cadastrado.');
            etapas.forEach((etapa) => {
                const item = document.createElement('li');
                const paragrafo = document.createElement('p');
                paragrafo.textContent = etapa;
                item.appendChild(paragrafo);
                passos.appendChild(item);
            });

            const listaComentarios = document.getElementById('lista-comentarios');
            listaComentarios.innerHTML = '';
            if (receita.comentarios.length === 0) {
                const vazio = document.createElement('p');
                vazio.textContent = 'Ainda não há comentários para esta receita.';
                listaComentarios.appendChild(vazio);
            } else {
                receita.comentarios.forEach((comentario) => listaComentarios.appendChild(criarComentario(comentario)));
            }

            const formulario = document.getElementById('form-comentario');
            const avisoComentario = document.getElementById('mensagem-comentario');
            formulario.addEventListener('submit', async (evento) => {
                evento.preventDefault();
                const campo = document.getElementById('conteudo-comentario');
                const botao = formulario.querySelector('button[type="submit"]');
                avisoComentario.textContent = '';
                botao.disabled = true;

                try {
                    const resultado = await requisicao(`/api/receitas/${encodeURIComponent(id)}/comentarios`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ conteudo: campo.value.trim() })
                    });
                    listaComentarios.prepend(criarComentario(resultado.comentario));
                    campo.value = '';
                } catch (erro) {
                    avisoComentario.textContent = `${erro.message} ${erro.message.includes('Entre na sua conta') ? 'Acesse o login para comentar.' : ''}`;
                } finally {
                    botao.disabled = false;
                }
            });
        } catch (erro) {
            mensagem.textContent = erro.message;
        }
    }


    async function iniciarMenuConta() {
        const menus = document.querySelectorAll('.dropdown-user');
        if (menus.length === 0) return;

        try {
            const dados = await requisicao('/api/auth/me');
            if (!dados.usuario) return;

            menus.forEach((menu) => {
                const conteudo = menu.querySelector('.dropdown-content-user');
                if (!conteudo) return;
                conteudo.innerHTML = '';

                const saudacao = document.createElement('a');
                saudacao.href = '#';
                saudacao.textContent = `Olá, ${dados.usuario.nome}`;
                saudacao.addEventListener('click', (evento) => evento.preventDefault());

                const sair = document.createElement('a');
                sair.href = '#';
                sair.textContent = 'Sair';
                sair.addEventListener('click', async (evento) => {
                    evento.preventDefault();
                    try {
                        await requisicao('/api/auth/logout', { method: 'POST' });
                        window.location.reload();
                    } catch (erro) {
                        window.alert(erro.message);
                    }
                });

                conteudo.append(saudacao, sair);
            });
        } catch (erro) {
            // A ausência de sessão não impede a navegação pública.
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        if (document.getElementById('receitas')) iniciarPaginaInicial();
        if (document.getElementById('lista-favoritas')) iniciarFavoritos();
        if (document.getElementById('detalhe-receita')) iniciarDetalheReceita();
        iniciarMenuConta();
    });
})();
