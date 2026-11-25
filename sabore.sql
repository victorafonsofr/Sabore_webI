
CREATE DATABASE sabore;
USE sabore;

-- Tabela de usuários
CREATE TABLE Usuario (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(55) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    data_nasc DATE,
    descricao VARCHAR(255)
);

-- Tabela de categorias
CREATE TABLE Categorias (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome_categoria VARCHAR(55) NOT NULL
);

-- Tabela de ingredientes
CREATE TABLE Ingredientes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    descricao_ingrediente VARCHAR(100) NOT NULL
);

-- Tabela de receitas
CREATE TABLE Receitas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome_receita VARCHAR(100) NOT NULL,
    descricao VARCHAR(255),
    dificuldade ENUM('Fácil', 'Médio', 'Difícil'),
    tempo_preparo INT,
    modo_preparo TEXT,
    imagem BLOB,
    id_categoria INT NOT NULL,

    FOREIGN KEY (id_categoria)
        REFERENCES Categorias(id)
);

-- Tabela associativa entre receitas e ingredientes
CREATE TABLE Receita_Ingrediente (
    id_receita INT NOT NULL,
    id_ingrediente INT NOT NULL,
    quantidade DECIMAL(10,2),
    unidade_medida VARCHAR(30),

    PRIMARY KEY (id_receita, id_ingrediente),

    FOREIGN KEY (id_receita)
        REFERENCES Receitas(id),

    FOREIGN KEY (id_ingrediente)
        REFERENCES Ingredientes(id)
);

-- Tabela de comentários
CREATE TABLE Comentarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    conteudo VARCHAR(500) NOT NULL,
    data_comentario DATETIME DEFAULT CURRENT_TIMESTAMP,
    id_usuario INT NOT NULL,
    id_receita INT NOT NULL,

    FOREIGN KEY (id_usuario)
        REFERENCES Usuario(id),

    FOREIGN KEY (id_receita)
        REFERENCES Receitas(id)
);

-- inserts usuarios

INSERT INTO Usuario (nome, email, senha, data_nasc, descricao) VALUES
('Ana Silva', 'ana@email.com', 'senha123', '2001-05-12', 'Apaixonada por confeitaria.'),
('João Santos', 'joao@email.com', 'senha123', '1998-08-20', 'Gosto de cozinhar pratos tradicionais.'),
('Maria Oliveira', 'maria@email.com', 'senha123', '2000-02-15', 'Compartilho receitas saudáveis.'),
('Pedro Costa', 'pedro@email.com', 'senha123', '1997-11-03', 'Amante de churrasco.'),
('Julia Almeida', 'julia@email.com', 'senha123', '2002-04-25', 'Especialista em sobremesas.'),
('Lucas Ferreira', 'lucas@email.com', 'senha123', '1999-09-10', 'Cozinho por hobby.'),
('Beatriz Lima', 'bia@email.com', 'senha123', '2001-12-18', 'Adoro receitas vegetarianas.'),
('Gabriel Rocha', 'gabriel@email.com', 'senha123', '1996-06-30', 'Apaixonado por massas.'),
('Camila Martins', 'camila@email.com', 'senha123', '2003-03-22', 'Gosto de experimentar novos sabores.'),
('Rafael Gomes', 'rafael@email.com', 'senha123', '1998-07-14', 'Cozinheiro amador.'),
('Larissa Souza', 'larissa@email.com', 'senha123', '2000-10-05', 'Adoro preparar bolos.'),
('Matheus Ribeiro', 'matheus@email.com', 'senha123', '1997-01-19', 'Fã de comida brasileira.'),
('Isabela Mendes', 'isabela@email.com', 'senha123', '2002-08-11', 'Receitas simples e práticas.'),
('Felipe Nunes', 'felipe@email.com', 'senha123', '1995-12-09', 'Gosto de pratos sofisticados.'),
('Mariana Dias', 'mariana@email.com', 'senha123', '2001-06-17', 'Apaixonada por alimentação saudável.'),
('Bruno Carvalho', 'bruno@email.com', 'senha123', '1999-04-02', 'Especialista em hambúrgueres.'),
('Sofia Cardoso', 'sofia@email.com', 'senha123', '2003-09-27', 'Adoro cozinhar com minha família.'),
('André Moreira', 'andre@email.com', 'senha123', '1996-02-08', 'Gosto de receitas rápidas.'),
('Clara Teixeira', 'clara@email.com', 'senha123', '2000-11-21', 'Fã de culinária italiana.'),
('Daniel Barros', 'daniel@email.com', 'senha123', '1998-05-16', 'Sempre buscando novas receitas.');

INSERT INTO Categorias (nome_categoria) VALUES
('Massas'),
('Sobremesas'),
('Bolos'),
('Carnes'),
('Saladas'),
('Bebidas'),
('Lanches'),
('Sopas'),
('Comida Brasileira'),
('Comida Italiana'),
('Comida Japonesa'),
('Pães'),
('Tortas'),
('Doces'),
('Acompanhamentos'),
('Café da Manhã'),
('Receitas Fitness'),
('Frutos do Mar'),
('Petiscos'),
('Molhos');

INSERT INTO Ingredientes (descricao_ingrediente) VALUES
('Farinha de trigo'),
('Açúcar'),
('Ovos'),
('Leite'),
('Manteiga'),
('Chocolate em pó'),
('Fermento em pó'),
('Cenoura'),
('Óleo'),
('Sal'),
('Tomate'),
('Cebola'),
('Alho'),
('Queijo mussarela'),
('Frango'),
('Arroz'),
('Macarrão'),
('Azeite'),
('Batata'),
('Creme de leite');

INSERT INTO Receitas
(nome_receita, descricao, dificuldade, tempo_preparo, modo_preparo, imagem, id_categoria)
VALUES
('Bolo de cenoura', 'Bolo fofinho com cobertura de chocolate.', 'Fácil', 50,
 'Bata cenouras, ovos e óleo. Misture farinha, açúcar e fermento. Asse e cubra com chocolate.', NULL, 3),

('Brigadeiro', 'Doce tradicional brasileiro.', 'Fácil', 20,
 'Misture leite condensado, chocolate e manteiga. Cozinhe até desgrudar da panela.', NULL, 14),

('Lasanha de frango', 'Lasanha cremosa com frango desfiado.', 'Médio', 60,
 'Prepare o molho, cozinhe o frango e monte camadas de massa, recheio e queijo. Leve ao forno.', NULL, 1),

('Salada tropical', 'Salada leve com vegetais frescos.', 'Fácil', 15,
 'Corte os vegetais, misture e tempere com azeite e sal.', NULL, 5),

('Panqueca simples', 'Panquecas macias para qualquer ocasião.', 'Fácil', 30,
 'Bata ovos, leite e farinha. Despeje porções em uma frigideira e doure dos dois lados.', NULL, 7),

('Macarrão alho e óleo', 'Receita rápida e tradicional.', 'Fácil', 20,
 'Cozinhe o macarrão. Doure alho no azeite e misture à massa.', NULL, 10),

('Frango grelhado', 'Filé de frango temperado e grelhado.', 'Fácil', 25,
 'Tempere o frango com sal e alho. Grelhe até ficar completamente cozido.', NULL, 4),

('Torta de chocolate', 'Torta cremosa de chocolate.', 'Médio', 70,
 'Prepare a massa, asse e adicione o recheio de chocolate com creme de leite.', NULL, 13),

('Sopa de legumes', 'Sopa nutritiva e reconfortante.', 'Fácil', 40,
 'Cozinhe os legumes com alho, cebola e sal até ficarem macios.', NULL, 8),

('Arroz temperado', 'Arroz soltinho com temperos.', 'Fácil', 30,
 'Refogue alho e cebola no azeite. Adicione arroz, sal e água. Cozinhe até secar.', NULL, 9),

('Pizza caseira', 'Pizza com queijo e molho de tomate.', 'Médio', 90,
 'Prepare a massa, deixe descansar, abra, adicione molho e queijo e asse.', NULL, 10),

('Pão caseiro', 'Pão macio feito em casa.', 'Médio', 120,
 'Misture farinha, fermento, leite, açúcar e sal. Sove, deixe crescer e asse.', NULL, 12),

('Omelete', 'Omelete simples e nutritiva.', 'Fácil', 10,
 'Bata os ovos com sal e queijo. Despeje em uma frigideira e cozinhe.', NULL, 16),

('Batata gratinada', 'Batatas assadas com queijo e creme.', 'Médio', 50,
 'Corte as batatas, misture com creme de leite e queijo e leve ao forno.', NULL, 15),

('Chocolate quente', 'Bebida cremosa para dias frios.', 'Fácil', 15,
 'Aqueça leite com chocolate e creme de leite, mexendo até ficar homogêneo.', NULL, 6),

('Hambúrguer caseiro', 'Hambúrguer artesanal preparado em casa.', 'Médio', 35,
 'Modele a carne, tempere, grelhe e monte o hambúrguer.', NULL, 7),

('Bolo de chocolate', 'Bolo fofinho de chocolate.', 'Fácil', 45,
 'Misture farinha, açúcar, ovos, leite e chocolate. Acrescente fermento e asse.', NULL, 3),

('Frango com legumes', 'Frango refogado com vegetais.', 'Fácil', 35,
 'Refogue alho e cebola, adicione frango e legumes e cozinhe até ficar macio.', NULL, 17),

('Molho de tomate', 'Molho caseiro para massas.', 'Fácil', 30,
 'Refogue alho e cebola, adicione tomates picados e cozinhe até engrossar.', NULL, 20),

('Macarrão cremoso', 'Macarrão com molho de queijo e creme.', 'Fácil', 30,
 'Cozinhe o macarrão e misture com creme de leite e queijo até ficar cremoso.', NULL, 1);
 
 INSERT INTO Receita_Ingrediente
(id_receita, id_ingrediente, quantidade, unidade_medida)
VALUES
-- Bolo de cenoura
(1, 8, 3, 'unidades'),
(1, 3, 3, 'unidades'),
(1, 1, 2, 'xícaras'),
(1, 2, 2, 'xícaras'),
(1, 9, 0.5, 'xícara'),
(1, 7, 1, 'colher'),

-- Brigadeiro
(2, 2, 3, 'colheres'),
(2, 5, 1, 'colher'),
(2, 6, 4, 'colheres'),

-- Lasanha de frango
(3, 15, 500, 'gramas'),
(3, 14, 300, 'gramas'),
(3, 11, 3, 'unidades'),
(3, 12, 1, 'unidade'),

-- Salada tropical
(4, 11, 2, 'unidades'),
(4, 12, 1, 'unidade'),
(4, 18, 2, 'colheres'),

-- Panqueca simples
(5, 3, 2, 'unidades'),
(5, 4, 1, 'xícara'),
(5, 1, 1, 'xícara'),

-- Macarrão alho e óleo
(6, 17, 250, 'gramas'),
(6, 13, 3, 'dentes'),
(6, 18, 3, 'colheres'),

-- Frango grelhado
(7, 15, 300, 'gramas'),
(7, 13, 2, 'dentes'),
(7, 10, 1, 'pitada'),

-- Torta de chocolate
(8, 1, 2, 'xícaras'),
(8, 6, 1, 'xícara'),
(8, 20, 1, 'caixa'),

-- Sopa de legumes
(9, 19, 2, 'unidades'),
(9, 8, 2, 'unidades'),
(9, 12, 1, 'unidade'),
(9, 13, 2, 'dentes'),

-- Arroz temperado
(10, 16, 2, 'xícaras'),
(10, 12, 1, 'unidade'),
(10, 13, 2, 'dentes'),

-- Pizza caseira
(11, 1, 3, 'xícaras'),
(11, 11, 3, 'unidades'),
(11, 14, 200, 'gramas'),

-- Pão caseiro
(12, 1, 4, 'xícaras'),
(12, 4, 1, 'xícara'),
(12, 7, 1, 'colher'),
(12, 2, 2, 'colheres'),

-- Omelete
(13, 3, 3, 'unidades'),
(13, 14, 50, 'gramas'),
(13, 10, 1, 'pitada'),

-- Batata gratinada
(14, 19, 4, 'unidades'),
(14, 20, 1, 'caixa'),
(14, 14, 200, 'gramas'),

-- Chocolate quente
(15, 4, 2, 'xícaras'),
(15, 6, 3, 'colheres'),
(15, 20, 0.5, 'caixa'),

-- Hambúrguer caseiro
(16, 10, 1, 'pitada'),
(16, 13, 1, 'dente'),

-- Bolo de chocolate
(17, 1, 2, 'xícaras'),
(17, 2, 2, 'xícaras'),
(17, 3, 3, 'unidades'),
(17, 6, 1, 'xícara'),
(17, 7, 1, 'colher'),

-- Frango com legumes
(18, 15, 300, 'gramas'),
(18, 19, 2, 'unidades'),
(18, 12, 1, 'unidade'),

-- Molho de tomate
(19, 11, 5, 'unidades'),
(19, 12, 1, 'unidade'),
(19, 13, 2, 'dentes'),
(19, 18, 2, 'colheres'),

-- Macarrão cremoso
(20, 17, 250, 'gramas'),
(20, 20, 1, 'caixa'),
(20, 14, 150, 'gramas');

INSERT INTO Comentarios (conteudo, id_usuario, id_receita) VALUES
('Fiz essa receita e ficou maravilhosa!', 1, 1),
('Muito fácil de preparar. Gostei bastante.', 2, 2),
('Minha família adorou essa lasanha!', 3, 3),
('Uma salada muito refrescante.', 4, 4),
('Perfeita para o café da manhã.', 5, 5),
('Receita simples e muito saborosa.', 6, 6),
('O frango ficou muito suculento.', 7, 7),
('A torta ficou deliciosa!', 8, 8),
('Ótima opção para dias frios.', 9, 9),
('Fiz no almoço e todos gostaram.', 10, 10),
('A massa ficou muito boa!', 11, 11),
('O pão cresceu bastante e ficou macio.', 12, 12),
('Adorei! Acrescentei um pouco mais de queijo.', 13, 13),
('Ficou muito cremoso.', 14, 14),
('Perfeito para o inverno.', 15, 15),
('Melhor hambúrguer que já fiz em casa!', 16, 16),
('O bolo ficou fofinho e saboroso.', 17, 17),
('Uma receita prática para o dia a dia.', 18, 18),
('O molho combinou perfeitamente com a massa.', 19, 19),
('Muito cremoso e fácil de fazer.', 20, 20);

