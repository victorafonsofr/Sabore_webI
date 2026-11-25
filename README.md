# Saborê — integração com Node.js e MySQL

O frontend continua em HTML, CSS e JavaScript. O backend usa Node.js, Express e `mysql2` para consultar o banco `sabore`.

## 1. Requisitos

- Node.js 18 ou superior;
- MySQL ou MariaDB em execução;
- banco criado a partir do arquivo `sabore.sql`.

## 2. Preparar o banco

Este pacote é uma camada de integração para ser copiada sobre o repositório existente. Preserve os arquivos atuais `assets/style.css`, `assets/favoritos.css` e as pastas `assets/img/` e `assets/icons/`: as páginas adaptadas continuam usando esses estilos e imagens do projeto. Copie os arquivos deste pacote para a raiz do clone do repositório, permitindo substituir os HTML e scripts indicados, mas sem remover os recursos existentes.


No MySQL Workbench, phpMyAdmin ou terminal, execute o arquivo `sabore.sql` fornecido junto a esta solicitação. Ele cria o banco `sabore`, as tabelas e os registros de demonstração.

O esquema atual não possui tabela de curtidas. Por isso, os favoritos continuam no `localStorage` do navegador, como na versão anterior. Cadastro, autenticação, receitas, ingredientes e comentários utilizam o banco.

## 3. Configurar o Node.js

Na pasta raiz do repositório, instale as dependências:

```bash
npm install
```

Copie `.env.example` para `.env` e ajuste os dados de conexão:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha_do_mysql
DB_NAME=sabore
PORT=3000
NODE_ENV=development
SESSION_SECRET=uma-chave-aleatoria-com-pelo-menos-24-caracteres
```

Não envie o arquivo `.env` ao GitHub. Ele está listado no `.gitignore`.

## 4. Executar

```bash
npm start
```

Acesse **http://localhost:3000**. Não abra os arquivos HTML diretamente pelo explorador de arquivos: as páginas precisam ser servidas pelo Express para que as chamadas `/api` funcionem.

Para desenvolvimento com reinicialização automática:

```bash
npm run dev
```

Teste a conexão com o banco acessando `http://localhost:3000/api/health`. A resposta esperada é:

```json
{
  "status": "ok",
  "banco": "conectado"
}
```

## 5. Rotas implementadas

| Método | Rota | Função |
|---|---|---|
| GET | `/api/health` | Verifica conexão com o banco |
| GET | `/api/categorias` | Lista categorias |
| GET | `/api/receitas` | Lista receitas; aceita `busca` e `categoria` |
| GET | `/api/receitas/:id` | Retorna receita, ingredientes e comentários |
| GET | `/api/receitas/:id/imagem` | Entrega a imagem armazenada como BLOB |
| POST | `/api/auth/cadastro` | Cadastra usuário |
| POST | `/api/auth/login` | Autentica usuário |
| GET | `/api/auth/me` | Consulta usuário da sessão |
| POST | `/api/auth/logout` | Encerra sessão |
| POST | `/api/receitas/:id/comentarios` | Publica comentário (requer login) |

## 6. Observações sobre os dados existentes

- Os novos cadastros armazenam a senha com hash bcrypt.
- No `sabore.sql` original, as senhas dos usuários de demonstração estão em texto puro (`senha123`). Para manter esses cadastros utilizáveis, o primeiro login válido converte automaticamente a senha daquele usuário para bcrypt.
- O campo `Receitas.imagem` é BLOB. Quando estiver vazio, o frontend usa uma imagem genérica já existente em `assets/img`.
- Os favoritos permanecem locais ao navegador porque a modelagem enviada não contém tabela para relacionar usuários e receitas favoritadas. A versão anterior gravava alguns favoritos por slug; o novo JavaScript tenta reconhecer os slugs compatíveis com receitas existentes no banco. Receitas da interface antiga que não existem em `Receitas` não aparecem na nova listagem de favoritos.
- A tabela `Receitas` não possui `id_usuario` ou outro campo de autoria. Por isso, esta integração não implementa publicação de receitas por usuários; essa funcionalidade exige uma alteração explícita na modelagem.

## 7. Nota para publicação

A configuração de sessão usa o armazenamento em memória padrão do Express, adequado somente para desenvolvimento/avaliação local. Antes de publicar o sistema, configure um armazenamento persistente de sessões, HTTPS (`NODE_ENV=production`) e uma chave `SESSION_SECRET` forte.
