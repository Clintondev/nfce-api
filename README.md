# NFC-e API

Esta API foi desenvolvida em Node.js utilizando Express e representa uma solução robusta e escalável para consulta e extração de dados de NFC-e (Nota Fiscal de Consumidor Eletrônica). A aplicação integra diversas tecnologias e práticas modernas, oferecendo desde scraping dinâmico com Puppeteer até autenticação segura via Google OAuth2 e JWT. A seguir, apresenta-se uma descrição detalhada e técnica da arquitetura, das funcionalidades e das configurações necessárias.

---

## Sumário

- [Descrição Geral](#descrição-geral)
- [Principais Funcionalidades](#principais-funcionalidades)
- [Arquitetura do Projeto](#arquitetura-do-projeto)
- [Pré-Requisitos e Configuração](#pré-requisitos-e-configuração)
- [Instalação e Execução](#instalação-e-execução)
- [Endpoints Principais](#endpoints-principais)
- [Fluxo de Autenticação e Segurança](#fluxo-de-autenticação-e-segurança)
- [Tratamento de Erros e Validação](#tratamento-de-erros-e-validação)
- [Documentação e Testes](#documentação-e-testes)
- [Considerações Finais](#considerações-finais)

---

## Descrição Geral

A NFC-e API permite consultar e extrair informações de notas fiscais eletrônicas diretamente das páginas oficiais da NFC-e por meio de técnicas de scraping com Puppeteer. Os dados extraídos são estruturados e persistidos em um banco de dados MySQL utilizando Sequelize. Além disso, a API implementa autenticação via Google OAuth2, emitindo tokens JWT para controle de sessão e proteção dos endpoints.

---

## Principais Funcionalidades

- **Scraping Dinâmico:**  
  Utiliza o Puppeteer para navegar na página da NFC-e, extrair dados como informações do fornecedor, detalhes da nota, itens, informações de pagamento e dados complementares.

- **Autenticação e Autorização:**  
  Implementação do Google OAuth2 com Passport, onde o refresh token é criptografado (AES-256-CBC) e tokens JWT são gerados para controle de sessão com validade configurada.

- **Persistência de Dados:**  
  Utiliza Sequelize para definir modelos (User, NfceData, Vendor, Item) e persistir as informações extraídas em um banco de dados MySQL.  
  A sincronização do banco é realizada na inicialização da aplicação.

- **Documentação da API:**  
  Endpoints documentados com Swagger (acessíveis via `/api-docs`), facilitando a integração e testes dos serviços.

- **Validação e Tratamento de Erros:**  
  Utilização de middlewares para validação de entradas (express-validator) e um handler global para captura e resposta a exceções.

---

## Arquitetura do Projeto

A estrutura do projeto é organizada de forma modular, promovendo a separação de responsabilidades:

- **/src/config:**  
  Configurações essenciais, incluindo conexão com o banco (Sequelize), configurações do Swagger, Passport e criptografia (crypto).

- **/src/models:**  
  Definição dos modelos de dados (User, NfceData, Vendor, Item) utilizando Sequelize.

- **/src/routes:**  
  Definição dos endpoints da API. Exemplo:  
  - `/auth`: Fluxo de autenticação com Google OAuth2.  
  - `/nfce`: Consulta e extração de dados de NFC-e.

- **/src/controllers:**  
  Implementação da lógica dos endpoints. Responsáveis por coordenar chamadas aos serviços e interagir com os modelos.

- **/src/services:**  
  Contém a lógica de negócio, como:  
  - `nfceService`: Realiza o scraping com Puppeteer e estrutura os dados da NFC-e.  
  - `googleService`: Gerencia a obtenção e renovação de tokens de acesso via Google API.

- **/src/middlewares:**  
  Middlewares para:  
  - Autenticação (validação de token JWT).  
  - Validação de entradas (express-validator).  
  - Tratamento global de erros.

- **/src/config/crypto.js:**  
  Funções de criptografia e descriptografia utilizadas para proteger o refresh token.

---

## Pré-Requisitos e Configuração

### Dependências

- **Node.js:** Versão recomendada ≥ 12.
- **MySQL:** Para persistência de dados via Sequelize.
- **Puppeteer:** Para realizar o scraping dinâmico.
- **Sequelize:** ORM para modelagem e acesso ao banco de dados.
- **Express:** Framework para criação da API.
- **Passport (Google OAuth2):** Para autenticação.
- **JWT:** Para emissão e verificação de tokens.
- **Swagger UI Express:** Para documentação dos endpoints.
- **express-validator:** Para validação de entradas.
- **dotenv:** Para gerenciamento de variáveis de ambiente.

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes configurações:

```
PORT=3400
DB_NAME=nome_do_banco
DB_USER=usuario
DB_PASSWORD=senha
DB_HOST=localhost
GOOGLE_CLIENT_ID=seu_client_id_google
GOOGLE_CLIENT_SECRET=seu_client_secret_google
JWT_SECRET=sua_chave_secreta_jwt
ENCRYPTION_KEY=chave_hexadecimal_de_32_bytes
```

---

## Instalação e Execução

1. **Instalar Dependências:**

   ```bash
   npm install
   ```

2. **Configurar Variáveis de Ambiente:**

   Crie e configure o arquivo `.env` conforme as instruções acima.

3. **Inicializar a Aplicação:**

   ```bash
   node index.js
   ```

   O servidor iniciará na porta definida (padrão: 3400). Durante a inicialização, o Sequelize sincroniza os modelos com o banco de dados.

4. **Acessar a Documentação:**

   Após iniciar o servidor, acesse:

   ```
   http://localhost:3400/api-docs
   ```

   para visualizar a documentação Swagger da API.

---

## Endpoints Principais

### Autenticação (/auth)

- **GET /auth/google:**  
  Inicia o fluxo de autenticação com o Google OAuth2.

- **GET /auth/google/callback:**  
  Callback que processa a autenticação e retorna um token JWT para o cliente.

- **GET /auth/logout:**  
  Encerra a sessão do usuário.

- **POST /auth/refresh-token:**  
  Renova o token JWT do usuário autenticado.

### Consulta NFC-e (/nfce)

- **GET /nfce/{parametro}:**  
  Consulta os dados de uma NFC-e usando a chave de acesso (parametro).  
  - Valida o parâmetro utilizando `express-validator`.
  - Utiliza Puppeteer para acessar e extrair dados da página oficial da NFC-e.
  - Persiste os dados extraídos (NfceData, Vendor e Items) no banco.
  - Retorna os dados estruturados da NFC-e.

---

## Fluxo de Autenticação e Segurança

- **Google OAuth2 com Passport:**  
  A autenticação é iniciada via endpoint `/auth/google`. Após o login com o Google, o callback processa o perfil do usuário, cria ou atualiza o registro no banco e gera um token JWT com validade de 1 hora.

- **Criptografia dos Refresh Tokens:**  
  Os refresh tokens recebidos são criptografados utilizando AES-256-CBC, garantindo segurança adicional na persistência.

- **Middleware de Autenticação:**  
  Endpoints protegidos usam o middleware `ensureAuthenticated`, que verifica a validade do token JWT presente no cabeçalho da requisição.

---

## Tratamento de Erros e Validação

- **Validação de Entradas:**  
  Utiliza `express-validator` para sanitização e validação de parâmetros e payloads, garantindo que os dados enviados estejam no formato esperado.

- **Middleware Global de Erros:**  
  Um handler central captura exceções e erros não tratados, logando detalhes no console e retornando respostas com status HTTP apropriados (ex.: 500 Internal Server Error).

---

