(function () {
    'use strict';

    async function enviar(url, dados) {
        const resposta = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify(dados)
        });
        const resultado = await resposta.json();
        if (!resposta.ok) throw new Error(resultado.erro || 'Não foi possível concluir a operação.');
        return resultado;
    }

    const formularioLogin = document.getElementById('form-login');
    if (formularioLogin) {
        formularioLogin.addEventListener('submit', async (evento) => {
            evento.preventDefault();
            const mensagem = document.getElementById('mensagem-formulario');
            const botao = formularioLogin.querySelector('button[type="submit"]');
            mensagem.textContent = '';
            botao.disabled = true;

            try {
                await enviar('/api/auth/login', {
                    email: document.getElementById('email').value.trim(),
                    senha: document.getElementById('senha').value
                });
                window.location.href = 'index.html';
            } catch (erro) {
                mensagem.textContent = erro.message;
            } finally {
                botao.disabled = false;
            }
        });
    }

    const formularioCadastro = document.getElementById('form-cadastro');
    if (formularioCadastro) {
        formularioCadastro.addEventListener('submit', async (evento) => {
            evento.preventDefault();
            const mensagem = document.getElementById('mensagem-formulario');
            const botao = formularioCadastro.querySelector('button[type="submit"]');
            const senha = document.getElementById('senha').value;
            const confirmacao = document.getElementById('confirmar-senha').value;
            mensagem.textContent = '';

            if (senha !== confirmacao) {
                mensagem.textContent = 'As senhas não coincidem.';
                return;
            }

            botao.disabled = true;
            try {
                await enviar('/api/auth/cadastro', {
                    nome: document.getElementById('nome').value.trim(),
                    email: document.getElementById('email').value.trim(),
                    senha,
                    data_nasc: document.getElementById('data-nasc').value || null,
                    descricao: document.getElementById('descricao').value.trim() || null
                });
                window.location.href = 'index.html';
            } catch (erro) {
                mensagem.textContent = erro.message;
            } finally {
                botao.disabled = false;
            }
        });
    }
})();
