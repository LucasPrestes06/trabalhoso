# Dashboard SO — Documentação

Aplicação web para monitoramento de informações do sistema operacional em tempo real, desenvolvida com Node.js e Express.

---

## Sumário

- [Visão Geral](#visão-geral)
- [Tecnologias](#tecnologias)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Instalação e Execução](#instalação-e-execução)
- [Docker](#docker)
- [API](#api)
- [Frontend](#frontend)
- [Problemas Conhecidos](#problemas-conhecidos)

---

## Visão Geral

O **Dashboard SO** é uma aplicação cliente-servidor que expõe métricas do sistema operacional via uma API REST e as exibe em um painel web atualizado automaticamente a cada 5 segundos.

Métricas exibidas:
- Hostname e endereço IP da máquina
- Plataforma, tipo de SO, versão do kernel e arquitetura
- Número de CPUs e carga média (load average)
- Uso de memória RAM (total, livre e percentual)
- Uptime do sistema
- Versão do Node.js em execução
- Ambiente de execução (local ou Render cloud)
- Total de arquivos no diretório da aplicação
- Status geral de saúde da memória (Saudável / Atenção / Crítico)

---

## Tecnologias

| Camada    | Tecnologia           | Versão   |
|-----------|----------------------|----------|
| Runtime   | Node.js              | ≥ 18     |
| Framework | Express              | ^4.18.2  |
| CORS      | cors                 | ^2.8.5   |
| Container | Docker (node alpine) | 24       |
| Frontend  | HTML + CSS + JS puro | —        |

---

## Estrutura do Projeto

```
trabalhoso/
├── index.js              # Servidor Express + lógica da API
├── package.json          # Dependências e scripts npm
├── package-lock.json
├── public/
│   ├── index.html        # Interface web (Dashboard)
│   └── public/
│       ├── Dockerfile    # Imagem Docker da aplicação
│       ├── style.css     # Estilos do dashboard
│       └── public/
│           └── app.js    # Lógica de polling e atualização do DOM
```


---

## Instalação e Execução

### Pré-requisitos

- Node.js 18 ou superior
- npm

### Passos

```bash
# 1. Clone o repositório
git clone https://github.com/LucasPrestes06/trabalhoso.git
cd trabalhoso

# 2. Instale as dependências
npm install

# 3. Inicie o servidor
npm start
```

O servidor sobe na porta **3000** por padrão. Acesse:

```
http://localhost:3000
```

A porta pode ser alterada via variável de ambiente:

```bash
PORT=8080 npm start
```

---

## Docker

O projeto inclui um `Dockerfile` baseado na imagem `node:24-alpine`.

### Build e execução

```bash
# Build da imagem
docker build -t dashboard-so .

# Execução do container
docker run -p 3000:3000 dashboard-so
```

### Conteúdo do Dockerfile

```dockerfile
FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "index.js"]
```

---

## API

### `GET /api/system`

Retorna as métricas do sistema em formato JSON.

**Exemplo de resposta:**

```json
{
  "hostname": "meu-servidor",
  "platform": "linux",
  "type": "Linux",
  "release": "5.15.0",
  "architecture": "x64",
  "cpus": 4,
  "memory": {
    "total": "15.87",
    "free": "4.20",
    "usedPercent": "73.54"
  },
  "uptime": 86400,
  "nodeVersion": "v20.11.0",
  "ip": "192.168.1.10",
  "environment": "Local",
  "cpuLoad": 0.85,
  "totalArquivos": 312,
  "status": "Saudável"
}
```

**Campos de resposta:**

| Campo           | Tipo   | Descrição                                              |
|-----------------|--------|--------------------------------------------------------|
| `hostname`      | string | Nome da máquina                                        |
| `platform`      | string | Plataforma do SO (`linux`, `darwin`, `win32`)          |
| `type`          | string | Tipo do SO                                             |
| `release`       | string | Versão do kernel                                       |
| `architecture`  | string | Arquitetura do processador                             |
| `cpus`          | number | Número de núcleos lógicos                              |
| `memory.total`  | string | Memória total em GB                                    |
| `memory.free`   | string | Memória livre em GB                                    |
| `memory.usedPercent` | string | Percentual de memória utilizada                  |
| `uptime`        | number | Tempo de atividade em segundos                         |
| `nodeVersion`   | string | Versão do Node.js em execução                          |
| `ip`            | string | Endereço IPv4 externo da máquina                       |
| `environment`   | string | `"Cloud (Render)"` ou `"Local"`                        |
| `cpuLoad`       | number | Carga média do CPU no último minuto (load average [0]) |
| `totalArquivos` | number | Total de arquivos no diretório da aplicação            |
| `status`        | string | `"Saudável"`, `"Atenção"` (>80%) ou `"Crítico"` (>95%)|

---

## Frontend

O painel web (`public/index.html`) consome a rota `/api/system` via `fetch` e atualiza os campos do DOM automaticamente.

**Comportamento:**
- Atualização automática a cada **5 segundos** via `setInterval`.
- O uptime é formatado para o padrão `Xh Ym`.
- Os cartões do dashboard exibem cada métrica individualmente.

**Fluxo simplificado:**

```
Página carrega → carregarDados() → fetch /api/system → atualiza DOM
      ↑                                                        |
      └──────────── setInterval(5000ms) ──────────────────────┘
```

---

## Problemas Conhecidos

Os itens abaixo foram identificados na análise do código e devem ser corrigidos:

### 1. Declarações duplicadas de `require` em `index.js`

Os módulos `express`, `cors`, `os` e `path` são declarados duas vezes com `require`. Isso causa um erro em tempo de execução (`SyntaxError: Identifier 'express' has already been declared`).

**Solução:** remover o segundo bloco de `require` (linhas 25–28).

### 2. Dois blocos `res.json()` na mesma rota

A rota `/api/system` chama `res.json()` duas vezes. Apenas a primeira resposta é enviada ao cliente; a segunda gera um erro de cabeçalho já enviado (`Cannot set headers after they are sent to the client`).

**Solução:** unificar os dois objetos de resposta em um único `res.json({...})`.

### 3. Acesso a `dados` fora do escopo em `app.js`

Em `app.js`, as linhas que atualizam `cpuLoad`, `totalArquivos` e `status` estão fora da função `carregarDados()`, onde a variável `dados` não existe. Isso resulta em `ReferenceError: dados is not defined`.

**Solução:** mover essas linhas para dentro da função `carregarDados()`, junto com as demais atualizações do DOM.

### 4. Estrutura de pastas incorreta

Os arquivos estáticos (`app.js`, `style.css`) e o `Dockerfile` estão em subdiretórios aninhados incorretamente (`public/public/` e `public/public/public/`), ao invés de estarem diretamente em `public/` e na raiz do projeto, respectivamente.

**Solução:** reorganizar a estrutura para:

```
trabalhoso/
├── Dockerfile
├── index.js
├── package.json
└── public/
    ├── index.html
    ├── app.js
    └── style.css
```

---

## Deploy no Render

A aplicação detecta automaticamente o ambiente Render via variável de ambiente `process.env.RENDER`. Ao fazer o deploy, configure:

- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Port:** `3000` (ou configure a variável `PORT`)
