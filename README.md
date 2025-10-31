# Sistema de Gestão de Estoque e Logística

Sistema completo de gerenciamento de estoque, logística e expedições desenvolvido com arquitetura moderna full-stack, integrando frontend em Next.js e backend em .NET.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Arquitetura do Sistema](#arquitetura-do-sistema)
- [Backend - .NET Core](#backend---net-core)
- [Frontend - Next.js](#frontend---nextjs)
- [Entidades e Regras de Negócio](#entidades-e-regras-de-negócio)
- [Funcionalidades Principais](#funcionalidades-principais)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Configuração e Instalação](#configuração-e-instalação)
- [Convenções de Código](#convenções-de-código)

---

## 🎯 Visão Geral

O **Sistema de Gestão de Estoque e Logística** é uma plataforma completa desenvolvida para otimizar e centralizar o gerenciamento de operações logísticas e de estoque. O sistema oferece controle total sobre frotas, motoristas, inventário, pedidos e expedições, com interface intuitiva e regras de negócio robustas.

### Principais Capacidades

- **Gerenciamento de Frota**: Controle completo de caminhões com rastreamento de disponibilidade e capacidade
- **Administração de Motoristas**: Cadastro com validação de CNH e categorias habilitadas
- **Controle de Inventário**: Gestão de estoque com rastreamento de quantidades e preços
- **Entradas de Materiais**: Registro de entrada de materiais com controle de fornecedores
- **Gestão de Pedidos**: Criação e acompanhamento de pedidos vinculados ao estoque
- **Coordenação de Expedições**: Planejamento de entregas conectando motoristas, caminhões e pedidos

---

## 🚀 Tecnologias Utilizadas

### Backend

- **ASP.NET Core 8.0** - Framework web moderno e de alta performance
- **Entity Framework Core** - ORM para acesso e manipulação de dados
- **SQL Server** - Banco de dados relacional robusto
- **AutoMapper** - Mapeamento objeto-objeto
- **FluentValidation** - Validação de dados declarativa
- **CQRS** - Padrão de isolamento de lógica fora de endpoints (MediatR)
- **DDD - Domain Driven Design** - Padrão de isolamento de lógica fora de endpoints (MediatR)

### Frontend

- **Next.js 14+** - Framework React com renderização híbrida (SSR, SSG, ISR)
- **React 18** - Biblioteca JavaScript para interfaces de usuário
- **TypeScript** - Superset tipado do JavaScript
- **Tailwind CSS v4** - Framework CSS utilitário moderno
- **Zustand** - Gerenciamento de estado leve e eficiente
- **Axios** - Cliente HTTP para requisições à API
- **shadcn/ui** - Componentes UI modernos e acessíveis
- **Lucide React** - Biblioteca de ícones
- **Sonner** - Sistema de notificações toast
- **React Hook Form** - Gerenciamento de formulários
- **date-fns** - Manipulação de datas

---

## 🏗️ Arquitetura do Sistema

### Arquitetura Backend

```
┌─────────────────────────────────────────┐
│          API Controllers                │
│  (REST API com validações)              │
└───────────────┬─────────────────────────┘
                │
┌───────────────▼─────────────────────────┐
│         Services Layer                  │
│  (Lógica de negócio)                    │
└───────────────┬─────────────────────────┘
                │
┌───────────────▼─────────────────────────┐
│     Entity Framework Core               │
│  (ORM e Context)                        │
└───────────────┬─────────────────────────┘
                │
┌───────────────▼─────────────────────────┐
│         SQL Server                      │
│  (Banco de Dados)                       │
└─────────────────────────────────────────┘
```

### Arquitetura Frontend

```
┌─────────────────────────────────────────┐
│         Next.js App Components          │
│  (Pages + Layout + Domain)              │
└───────────────┬─────────────────────────┘
                │
┌───────────────▼─────────────────────────┐
│         Zustand Store                   │
│  (Estado Global)                        │
└─────────────────────────────────────────┘
                │
┌───────────────▼─────────────────────────┐
│         Services Layer                  │
│  (API Communication)                    │
└───────────────┬─────────────────────────┘
                │
┌───────────────▼─────────────────────────┐
│            Axios                        │
│  (HTTP Client)                          │
└───────────────┬─────────────────────────┘
                │
┌───────────────▼─────────────────────────┐
│        Backend API                      │
│  https://localhost:7252/api             │
└─────────────────────────────────────────┘
```

---

## 🔧 Backend - .NET Core

### Estrutura da API

A API segue o padrão RESTful e todas as rotas estão no singular:

- `/api/driver` - Gerenciamento de motoristas
- `/api/truck` - Gerenciamento de caminhões
- `/api/inventory` - Gerenciamento de inventário
- `/api/order` - Gerenciamento de pedidos
- `/api/inbound-entry` - Entradas de materiais
- `/api/expedition` - Coordenação de expedições

### Banco de Dados - SQL Server

- **Migrações** automáticas
- **Relacionamentos** entre entidades
- **Índices** para otimização de consultas
- **Constraints** para integridade referencial

### Padrões e Convenções

- **DTOs** para transferência de dados
- **AutoMapper** para conversão de entidades
- **Repository Pattern** (via EF Core)
- **Dependency Injection** nativo do .NET
- **Exception Handling** centralizado
- **Validações** em múltiplas camadas

---

## 💻 Frontend - Next.js

### Organização do Código

Cada módulo possui sua própria página usando o Next.js App Router:
- `app/page.tsx` - Home
- `app/drivers/page.tsx`
- `app/trucks/page.tsx`
- `app/inventory/page.tsx`
- `app/orders/page.tsx`
- `app/inbound-entry/page.tsx`
- `app/expeditions/page.tsx`

#### Components
- `layout/` - Header, Sidebar, Footer
- `domain/` - Componentes de domínio (DateRangeFilter, MessageModal)
- `ui/` - Componentes shadcn/ui

#### Services
- API calls com Axios
- Interceptors para tratamento de erros
- Ajuste de datas para fim do dia

#### Types
- TypeScript interfaces para todas as entidades

#### Store (Zustand)
- Tema (Dark Mode)
- Estado do sidebar
- Configurações de usuário

### Recursos Visuais

- **Responsividade** - Layout adaptável
- **Feedback Visual** - Toasts, modals e estados de loading
- **Validações** - Feedback em tempo real nos formulários
- **Tabelas Interativas** - Ordenação, filtros e paginação

---

## 📊 Entidades e Regras de Negócio

### 🚗 Caminhões (Truck)
**Campos:** id, model, licensePlate, capacity, available, createdAt, updatedAt

### 👨‍✈️ Motoristas (Driver)
**Campos:** id, name, cnh, category, phone, active, createdAt, updatedAt

### 📦 Inventário (Inventory)
**Campos:** id, productCode, description, quantity, price, active, createdAt, updatedAt

### 📥 Entradas de Materiais (InboundEntry)
**Campos:** id, inventoryId, productCode, description, quantity, price, reference, supplierName, observation, createdAt, updatedAt

### 🛒 Pedidos (Order)
**Campos:** id, orderNumber, customerName, status, items, createdAt, updatedAt

### 🚚 Expedições (Expedition)
**Campos:** id, orderId, driverId, truckId, customerName, orderStatus, driverName, truckModel, truckPlate, createdAt, updatedAt

---

## ⚙️ Funcionalidades Principais

- Filtros de Data, CRUD completo, Layout responsivo, Dark Mode, Feedback visual, Validações em tempo real, Tabelas interativas
- Sistema robusto de tratamento de erros (Backend + Axios + Toasts)

---

## 📁 Estrutura do Projeto

```
/
├── app/                     # Pages principais e rotas
├── components/
│   ├── layout/
│   ├── domain/
│   └── ui/
├── services/
├── types/
├── store/
├── utils/
└── styles/
```

---

## 🔧 Configuração e Instalação

### Backend
- .NET SDK 8.0+
- SQL Server
- Visual Studio ou VS Code

### Frontend
- Node.js 18+
- npm ou yarn

### Comandos
- `npm install`
- `npm run dev`

---

## 📝 Convenções de Código

- Backend: PascalCase, Async/Await, DTOs, FluentValidation
- Frontend: camelCase, PascalCase para componentes, TypeScript, Hooks, Next.js App Router, Prettier + ESLint

---

## 🎯 Roadmap Futuro

- Autenticação JWT, Relatórios, Exportação de dados, Notificações em tempo real, Auditoria, Integração com transportadoras, App mobile

---

## 📄 Licença

Projeto proprietário e confidencial.

---

## 👥 Autor

Desenvolvido com ⚡ usando as melhores práticas de desenvolvimento full-stack.

**Stack:** .NET Core + Next.js + TypeScript + SQL Server + Tailwind CSS

