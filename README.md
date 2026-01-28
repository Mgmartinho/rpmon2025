# 🐎 RPMON 2025 — Frontend

![React](https://img.shields.io/badge/React-18-blue)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5-purple)
![Docker](https://img.shields.io/badge/Docker-Ready-blue)
![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow)

Frontend do sistema **RPMON 2025**, voltado à gestão operacional do Regimento de Polícia Montada, com **portal público** e **dashboard administrativo**.

---

## 📖 Índice

* [Sobre o Projeto](#-sobre-o-projeto)
* [Tecnologias](#-tecnologias)
* [Arquitetura](#-arquitetura)
* [Funcionalidades](#-funcionalidades)
* [Integração com API](#-integração-com-api)
* [Instalação e Execução](#-instalação-e-execução)
* [Docker](#-docker)
* [Boas Práticas](#-boas-práticas)
* [Roadmap](#-roadmap)
* [Autor](#-autor)

---

## 📌 Sobre o Projeto

O RPMON 2025 é um sistema desenvolvido para apoiar a gestão de solípedes, carga horária, históricos operacionais e rotinas administrativas do Regimento de Polícia Montada.

Este repositório contém o **frontend**, responsável por:

* Exibir o **portal institucional**
* Disponibilizar um **dashboard administrativo** seguro
* Integrar-se a uma API REST para operações de dados

---

## 🛠 Tecnologias

* **Linguagem:** JavaScript (ES6+)
* **Framework:** React.js
* **UI:** React-Bootstrap
* **Roteamento:** React Router DOM
* **HTTP Client:** Axios
* **Estilo:** Bootstrap + CSS
* **Ambiente:** Docker

---

## 🧱 Arquitetura

```bash
src/
├── assets/            # Imagens, ícones, fontes
├── components/        # Componentes reutilizáveis
├── pages/
│   ├── portal/         # Páginas públicas
│   └── dashboard/      # Área administrativa
├── services/          # Configuração do Axios e APIs
├── routes/            # Rotas da aplicação
├── hooks/             # Hooks personalizados
├── contexts/          # Context API (quando aplicável)
├── styles/            # Estilos globais
├── App.jsx
└── main.jsx
```

---

## 🚀 Funcionalidades

### 🌐 Portal

* Páginas institucionais
* Conteúdo público
* Navegação responsiva

### 🔐 Dashboard

* Autenticação e controle de acesso
* Listagem e gerenciamento de solípedes
* Aplicação de carga horária em lote
* Consulta e edição de histórico
* Feedback visual (alerts, modais, toasts)

---

## 🌐 Integração com API

O frontend consome uma API REST. Principais endpoints:

| Método | Endpoint                       | Descrição                        |
| ------ | ------------------------------ | -------------------------------- |
| GET    | `/solipedes`                   | Lista todos os solípedes         |
| POST   | `/solipedes/adicionarHoras`    | Aplica horas em lote             |
| GET    | `/solipedes/:numero/historico` | Retorna histórico de um solípede |
| PUT    | `/solipedes/:numero`           | Atualiza dados de um solípede    |
| DELETE | `/solipedes/:numero`           | Remove um solípede               |

### 📡 Padrões de Comunicação

* Requisições via **Axios**
* Interceptors para:

  * Inserir token automaticamente
  * Tratar erros globais

---

## 💻 Instalação e Execução

### Pré-requisitos

* Node.js 18+
* NPM ou Yarn

### Passos

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/rpmon2025-frontend.git

# Acesse a pasta
cd rpmon2025-frontend

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em: `http://localhost:5173` (ou conforme configuração).

---

## 🐳 Docker

### Build da imagem

```bash
docker build -t rpmonfront .
```

### Execução do container

```bash
docker run -d -p 3001:3001 --name rpmonfront rpmonfront
```

Acesse em: `http://localhost:3001`

---

## 🧪 Boas Práticas Adotadas

* Componentização
* Separação de responsabilidades (UI, lógica, serviços)
* Uso de hooks
* Feedback ao usuário
* Tratamento centralizado de erros

---

## 📈 Roadmap

* [ ] Controle de permissões por perfil
* [ ] Relatórios e dashboards gráficos
* [ ] Paginação avançada
* [ ] Modo escuro
* [ ] Testes automatizados (Jest / React Testing Library)

---

## 👤 Autor

**Marcelo Guilherme de Araujo Martinho**
Desenvolvedor Frontend — Projeto RPMON 2025

