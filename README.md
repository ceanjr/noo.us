# 💖 noo.us - App de Surpresas para Casais

Um app especial para casais compartilharem surpresas, momentos e manterem o relacionamento vivo.

## 🚀 Tecnologias

- **Frontend**: Astro + React 18
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Autenticação**: Email, Phone (SMS), Google
- **Deploy**: Firebase Hosting / Vercel

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Preencher com suas credenciais do Firebase

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

## 🔑 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
PUBLIC_FIREBASE_API_KEY=your_api_key
PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
PUBLIC_FIREBASE_PROJECT_ID=your_project_id
PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 🏗️ Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── dashboard/      # Componentes do Dashboard
│   └── auth/           # Componentes de Autenticação
├── hooks/              # Custom Hooks
│   ├── useAuthState.js
│   ├── useDashboardData.js
│   ├── useMoments.js
│   └── ...
├── services/           # Lógica de negócio
│   ├── authService.js
│   ├── userService.js
│   └── validationService.js
├── utils/              # Funções utilitárias
├── lib/                # Configurações (Firebase)
├── contexts/           # React Contexts
├── pages/              # Páginas Astro
└── styles/             # CSS Global
```

## ✨ Features

### Autenticação
- ✅ Login/Cadastro com Email
- ✅ Login/Cadastro com Telefone (SMS)
- ✅ Login com Google
- ✅ Recuperação de senha
- ✅ Persistência de sessão

### Dashboard
- ✅ Vínculos múltiplos (parceiro, família, amigos)
- ✅ Sistema de notificações em tempo real
- ✅ Perfil personalizável (foto, nome)

### Surpresas
- ✅ 4 tipos: Mensagem, Foto, Música, Encontro
- ✅ Sistema de reações (emojis)
- ✅ Modo privado para conteúdo sensível
- ✅ "Momento do Dia" - memória aleatória
- ✅ Filtros por período (hoje, semana, mês, ano)
- ✅ Contador de streak (dias consecutivos)

### UI/UX
- ✅ Design responsivo (mobile-first)
- ✅ Tema claro com paleta harmônica
- ✅ Animações suaves
- ✅ Toasts para feedback
- ✅ Modais elegantes

## 🔒 Segurança

- ✅ Firebase Rules granulares
- ✅ Validação de dados (frontend + backend)
- ✅ reCAPTCHA em autenticação por telefone
- ✅ Rate limiting (planejado)
- ✅ Autenticação gerenciada pelo Firebase Auth

## 🧪 Testes

```bash
# Testes unitários (em implementação)
npm test

# Testes E2E (planejado)
npm run test:e2e
```

## 📊 Performance

- ✅ Paginação em queries Firebase
- ✅ Memoization com React.memo
- ✅ useCallback para handlers
- ✅ Lazy loading de componentes (em implementação)
- ✅ Compressão de imagens

## 🛠️ Scripts Disponíveis

```bash
npm run dev        # Servidor de desenvolvimento
npm run build      # Build para produção
npm run preview    # Preview da build
```

## 📱 Deploy

### Firebase Hosting

```bash
# Build
npm run build

# Deploy
firebase deploy
```

### Vercel

```bash
# Conectar repositório ao Vercel
# Deploy automático no push para main
```

## 🐛 Troubleshooting

### Erro de permissão no Firestore
- Verifique se as Firebase Rules estão atualizadas
- Execute: `firebase deploy --only firestore:rules`

### SMS não está sendo enviado
- Verifique se o reCAPTCHA está configurado corretamente
- Confirme que o telefone está no formato correto (+55...)

### Build falha
- Limpe o cache: `rm -rf node_modules dist .astro && npm install`
- Verifique as variáveis de ambiente

## 📖 Documentação Adicional

- [Firebase Documentation](https://firebase.google.com/docs)
- [Astro Documentation](https://docs.astro.build)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'feat: add some amazing feature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Conventional Commits

Use o padrão de commits:
- `feat:` nova feature
- `fix:` correção de bug
- `docs:` mudanças na documentação
- `style:` formatação, ponto e vírgula, etc
- `refactor:` refatoração de código
- `perf:` melhorias de performance
- `test:` adição de testes
- `chore:` mudanças em build, CI, etc

## 📝 Changelog

Veja [PLANO_DE_ACAO.md](./PLANO_DE_ACAO.md) para o plano detalhado de melhorias.

## 📄 Licença

Este projeto é privado e proprietário.

## 👥 Autores

- **Desenvolvimento** - Equipe noo.us

## 🙏 Agradecimentos

- Firebase pela infraestrutura
- Comunidade React
- Comunidade Astro
- Lucide por ícones incríveis
