/* Saborê - favoritas (localStorage) */
(function () {
  'use strict';

  var CHAVE = 'sabore:favoritas';

  var RECEITAS = [
    {
      id: 'bolo-de-cenoura',
      titulo: 'Bolo de cenoura',
      href: 'receita.html',
      img: 'assets/img/bolo-de-cenoura.jpg',
      alt: 'Bolo de cenoura com cobertura de chocolate',
      ingredientes: ['3 cenouras médias', '3 ovos', '1 xícara de óleo', '2 xícaras de farinha de trigo', '2 xícaras de açúcar'],
      nivel: 'facil',
      nivelTexto: 'Fácil'
    },
    {
      id: 'frango-com-quiabo',
      titulo: 'Frango com quiabo',
      href: 'receita_2.html',
      img: 'assets/img/frango-com-quiabo.jpg',
      alt: 'Frango com quiabo em uma panela',
      ingredientes: ['1 kg de sobrecoxa de frango', '300 g de quiabo', '1 cebola', '3 dentes de alho', 'Cheiro-verde'],
      nivel: 'medio',
      nivelTexto: 'Médio'
    },
    {
      id: 'paella',
      titulo: 'Paella',
      href: 'receita_3.html',
      img: 'assets/img/paella.jpg',
      alt: 'Paella com frutos do mar',
      ingredientes: ['2 xícaras de arroz arbóreo', '300 g de camarão', '200 g de lula', '1 pimentão vermelho', 'Açafrão e caldo de peixe'],
      nivel: 'dificil',
      nivelTexto: 'Difícil'
    },
    {
      id: 'rosti-de-batata-com-queijo',
      titulo: 'Rosti de Batata com Queijo',
      href: 'receita.html',
      img: 'assets/img/rosti.jpeg',
      alt: 'Rosti de Batata com Queijo',
      ingredientes: ['3 batatas médias descascadas e fatiadas bem finas', '1 colher de sopa de farinha de trigo', 'queijo mussarela ralado a gosto', 'azeite', 'sal', 'pimenta'],
      nivel: 'facil',
      nivelTexto: 'Fácil'
    },
    {
      id: 'omelete-de-micro-ondas',
      titulo: 'Omelete de Micro-ondas',
      href: 'receita.html',
      img: 'assets/img/omelete.jpeg',
      alt: 'Omelete de Micro-ondas',
      ingredientes: ['2 colheres de sopa de leite', '2 ovos', 'sal à gosto', 'cheiro verde à gosto', 'recheio a gosto (como cubos de queijo, tomate picado ou presunto)'],
      nivel: 'facil',
      nivelTexto: 'Fácil'
    },
    {
      id: 'panqueca-fit-de-batata-doce',
      titulo: 'Panqueca Fit de Batata-Doce',
      href: 'receita.html',
      img: 'assets/img/images.jpeg',
      alt: 'Panqueca fit de batata-doce',
      ingredientes: ['4 ovos', '2 xícaras de batata doce ralada', '4 colheres de sopa de aveia', '1 colher de café de sal'],
      nivel: 'facil',
      nivelTexto: 'Fácil'
    }
  ];

  /* ---------- armazenamento ---------- */
  function ler() {
    try {
      var bruto = localStorage.getItem(CHAVE);
      var lista = bruto ? JSON.parse(bruto) : [];
      return Array.isArray(lista) ? lista : [];
    } catch (e) {
      return [];
    }
  }

  function gravar(lista) {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(lista));
    } catch (e) { /* armazenamento indisponível: segue só em memória */ }
  }

  function tem(id) {
    return ler().indexOf(id) !== -1;
  }

  function alternar(id) {
    var lista = ler();
    var i = lista.indexOf(id);
    if (i === -1) lista.push(id); else lista.splice(i, 1);
    gravar(lista);
    return i === -1;
  }

  function achar(id) {
    for (var i = 0; i < RECEITAS.length; i++) {
      if (RECEITAS[i].id === id) return RECEITAS[i];
    }
    return null;
  }

  function slug(texto) {
    return texto.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  /* ---------- botão de coração ---------- */
  var SVG_CORACAO =
    '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">' +
    '<path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 2.7 5 6 5c2 0 3.4 1.1 4.2 2.4h3.6C14.6 6.1 16 5 18 5c3.3 0 5.1 3.4 3.6 6.8C19.5 16.4 12 21 12 21z"/>' +
    '</svg>';

  function criarBotao(receita, aoMudar) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'fav-btn';
    btn.innerHTML = SVG_CORACAO;

    function atualizar() {
      var ativo = tem(receita.id);
      btn.setAttribute('aria-pressed', ativo ? 'true' : 'false');
      btn.setAttribute('aria-label',
        (ativo ? 'Remover dos favoritos: ' : 'Favoritar: ') + receita.titulo);
    }

    btn.addEventListener('click', function () {
      var agora = alternar(receita.id);
      atualizar();
      if (aoMudar) aoMudar(receita, agora);
    });

    atualizar();
    return btn;
  }

  /* ---------- página inicial: corações nos cards ---------- */
  function iniciarIndex() {
    var cards = document.querySelectorAll('.card-receita');
    Array.prototype.forEach.call(cards, function (card) {
      var titulo = card.querySelector('.card-titulo');
      if (!titulo) return;
      var receita = achar(card.getAttribute('data-id') || slug(titulo.textContent));
      if (!receita) return;
      card.appendChild(criarBotao(receita));
    });

    window.addEventListener('storage', function (e) {
      if (e.key !== CHAVE) return;
      Array.prototype.forEach.call(document.querySelectorAll('.fav-btn'), function (b) {
        var card = b.closest('.card-receita');
        var r = achar(card.getAttribute('data-id') || slug(card.querySelector('.card-titulo').textContent));
        if (!r) return;
        var ativo = tem(r.id);
        b.setAttribute('aria-pressed', ativo ? 'true' : 'false');
        b.setAttribute('aria-label', (ativo ? 'Remover dos favoritos: ' : 'Favoritar: ') + r.titulo);
      });
    });
  }

  /* ---------- página de favoritas ---------- */
  function iniciarFavoritas() {
    var lista = document.getElementById('lista-favoritas');
    var vazio = document.getElementById('fav-vazio');
    var semResultado = document.getElementById('fav-sem-resultado');
    var contagem = document.getElementById('fav-contagem');
    var filtros = document.getElementById('fav-filtros');
    var limpar = document.getElementById('fav-limpar');
    var aviso = document.getElementById('fav-aviso');
    var busca = document.querySelector('.pesquisar .input');

    var nivelAtual = 'todas';
    var termo = '';
    var ultimaRemovida = null;

    function normalizar(t) {
      return t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    function criarCard(r) {
      var card = document.createElement('article');
      card.className = 'card-receita';
      card.setAttribute('data-id', r.id);

      var link = document.createElement('a');
      link.href = r.href;

      var img = document.createElement('img');
      img.className = 'card-img';
      img.src = r.img;
      img.alt = r.alt;

      var corpo = document.createElement('div');
      corpo.className = 'card-corpo';

      var h2 = document.createElement('h2');
      h2.className = 'card-titulo';
      h2.textContent = r.titulo;

      var ul = document.createElement('ul');
      ul.className = 'card-ingredientes';
      r.ingredientes.forEach(function (ing) {
        var li = document.createElement('li');
        li.textContent = ing;
        ul.appendChild(li);
      });

      var nivel = document.createElement('span');
      nivel.className = 'complexidade ' + r.nivel;
      nivel.textContent = r.nivelTexto;

      corpo.appendChild(h2);
      corpo.appendChild(ul);
      corpo.appendChild(nivel);

      link.appendChild(img);
      link.appendChild(corpo);
      card.appendChild(link);
      card.appendChild(criarBotao(r, function (rec, ativo) {
        if (!ativo) {
          ultimaRemovida = rec.id;
          mostrarAviso('“' + rec.titulo + '” saiu dos favoritos.', true);
        }
        desenhar();
      }));
      return card;
    }

    function mostrarAviso(texto, comDesfazer) {
      aviso.textContent = texto + ' ';
      if (comDesfazer) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'fav-desfazer';
        b.textContent = 'Desfazer';
        b.addEventListener('click', function () {
          if (ultimaRemovida && !tem(ultimaRemovida)) {
            alternar(ultimaRemovida);
            ultimaRemovida = null;
            aviso.textContent = '';
            desenhar();
          }
        });
        aviso.appendChild(b);
      }
    }

    function desenhar() {
      var ids = ler();
      var favoritas = ids.map(achar).filter(Boolean);

      var visiveis = favoritas.filter(function (r) {
        var okNivel = nivelAtual === 'todas' || r.nivel === nivelAtual;
        var okTermo = !termo ||
          normalizar(r.titulo).indexOf(termo) !== -1 ||
          r.ingredientes.some(function (i) { return normalizar(i).indexOf(termo) !== -1; });
        return okNivel && okTermo;
      });

      lista.innerHTML = '';
      visiveis.forEach(function (r) { lista.appendChild(criarCard(r)); });

      var total = favoritas.length;
      contagem.textContent = total === 0
        ? ''
        : total + (total === 1 ? ' receita favoritada' : ' receitas favoritadas');

      vazio.hidden = total !== 0;
      filtros.hidden = total === 0;
      limpar.hidden = total === 0;
      semResultado.hidden = !(total > 0 && visiveis.length === 0);
      lista.hidden = visiveis.length === 0;
    }

    filtros.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-nivel]');
      if (!b) return;
      nivelAtual = b.getAttribute('data-nivel');
      Array.prototype.forEach.call(filtros.querySelectorAll('button'), function (x) {
        x.setAttribute('aria-pressed', x === b ? 'true' : 'false');
      });
      desenhar();
    });

    limpar.addEventListener('click', function () {
      var anteriores = ler();
      if (!anteriores.length) return;
      if (!window.confirm('Remover todas as receitas dos favoritos?')) return;
      gravar([]);
      ultimaRemovida = null;
      mostrarAviso('Todos os favoritos foram removidos.', false);
      desenhar();
    });

    if (busca) {
      busca.addEventListener('input', function () {
        termo = normalizar(busca.value.trim());
        desenhar();
      });
    }

    window.addEventListener('storage', function (e) {
      if (e.key === CHAVE) desenhar();
    });

    desenhar();
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('lista-favoritas')) iniciarFavoritas();
    else iniciarIndex();
  });
})();
