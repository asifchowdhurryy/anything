# Contributing to Aether Workspace

We welcome contributions to Aether, the open-source Notion-like AI workspace!

## How to Contribute

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Install dependencies (`npm install`)
4. Run the development server (`npm run dev`)
5. Verify linting & type-checking (`npm run lint`)
6. Commit your changes (`git commit -m 'feat: add amazing feature'`)
7. Push to your branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## Adding New AI Providers

Aether is built with a universal AI provider gateway. To add a new provider:
1. Extend `UniversalProviderType` in `src/types/workspace.ts`
2. Add provider specifications to `src/ai/providers.ts`
3. If custom wire protocol is required, handle it in `server.ts`

## Code Guidelines
- Use TypeScript strict typing.
- Never log or store raw user API keys on the client or in telemetry.
- Follow Tailwind CSS utility styling standards.
