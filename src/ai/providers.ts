import { AIProviderConfig, UniversalProviderType } from '../types/workspace';

export const DEFAULT_PROVIDERS: AIProviderConfig[] = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    providerType: 'gemini',
    isLocal: false,
    enabled: true,
    defaultModel: 'gemini-3.8-flash',
    availableModels: [
      'gemini-3.8-flash',
      'gemini-3.1-pro-preview',
      'gemini-3.1-flash-lite',
    ],
    description: 'High-speed, long-context Google Gemini intelligence.',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    providerType: 'openai',
    isLocal: false,
    enabled: false,
    defaultModel: 'gpt-4o-mini',
    availableModels: ['gpt-4o', 'gpt-4o-mini', 'o1', 'o3-mini'],
    description: 'Industry-standard GPT-4o and reasoning models.',
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    providerType: 'anthropic',
    isLocal: false,
    enabled: false,
    defaultModel: 'claude-3-5-sonnet-20241022',
    availableModels: [
      'claude-3-5-sonnet-20241022',
      'claude-3-5-haiku-20241022',
      'claude-3-opus-20240229',
    ],
    description: 'Claude 3.5 Sonnet for nuanced writing and synthesis.',
  },
  {
    id: 'groq',
    name: 'Groq Cloud',
    providerType: 'groq',
    isLocal: false,
    enabled: false,
    defaultModel: 'llama-3.3-70b-versatile',
    availableModels: [
      'llama-3.3-70b-versatile',
      'llama-3.1-8b-instant',
      'deepseek-r1-distill-llama-70b',
      'mixtral-8x7b-32768',
    ],
    description: 'Ultra-low latency LPU inference for open weights.',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    providerType: 'deepseek',
    isLocal: false,
    enabled: false,
    defaultModel: 'deepseek-chat',
    availableModels: ['deepseek-chat', 'deepseek-reasoner'],
    description: 'State-of-the-art DeepSeek-V3 and R1 reasoning.',
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    providerType: 'mistral',
    isLocal: false,
    enabled: false,
    defaultModel: 'mistral-large-latest',
    availableModels: ['mistral-large-latest', 'mistral-small-latest', 'codestral-latest'],
    description: 'European frontier open-weight & commercial models.',
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    providerType: 'openrouter',
    isLocal: false,
    enabled: false,
    defaultModel: 'meta-llama/llama-3.3-70b-instruct',
    availableModels: [
      'meta-llama/llama-3.3-70b-instruct',
      'anthropic/claude-3.5-sonnet',
      'deepseek/deepseek-r1',
    ],
    description: 'Unified gateway to hundreds of models.',
  },
  {
    id: 'ollama',
    name: 'Ollama (Local AI)',
    providerType: 'ollama',
    baseUrl: 'http://localhost:11434',
    isLocal: true,
    enabled: false,
    defaultModel: 'llama3.2',
    availableModels: ['llama3.2', 'deepseek-r1', 'mistral', 'qwen2.5-coder', 'phi3'],
    description: '100% private, on-device local execution via Ollama.',
  },
  {
    id: 'lmstudio',
    name: 'LM Studio (Local AI)',
    providerType: 'lmstudio',
    baseUrl: 'http://localhost:1234/v1',
    isLocal: true,
    enabled: false,
    defaultModel: 'local-model',
    availableModels: ['local-model'],
    description: 'Run any GGUF or open weights model locally on Mac/PC/Linux.',
  },
];

export function getProviderBadge(provider: AIProviderConfig | { isLocal: boolean }) {
  if (provider.isLocal) {
    return {
      label: 'Local AI',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50',
      dot: 'bg-emerald-500',
    };
  }
  return {
    label: 'Cloud AI',
    color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/50',
    dot: 'bg-blue-500',
  };
}
