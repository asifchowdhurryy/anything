import { AIProviderConfig, ActiveAIModel, Page, ChatSource } from '../types/workspace';

export interface GenerateOptions {
  activeModel: ActiveAIModel;
  providers: AIProviderConfig[];
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[];
  workspaceContext?: string;
  temperature?: number;
  maxTokens?: number;
  taskType?: string;
  onChunk?: (chunk: string) => void;
}

export interface GenerateResult {
  text: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    cost: number;
    latencyMs: number;
  };
}

// In-editor AI tasks
export const EDITOR_AI_ACTIONS = [
  { id: 'improve', label: 'Improve writing', prompt: 'Improve the clarity, flow, and vocabulary of the following text while keeping its core meaning:' },
  { id: 'grammar', label: 'Fix grammar & spelling', prompt: 'Proofread and correct all grammar, spelling, punctuation, and typographical mistakes in the following text:' },
  { id: 'summarize', label: 'Summarize', prompt: 'Provide a concise, clear bulleted summary capturing the key takeaways of the following text:' },
  { id: 'shorter', label: 'Make shorter', prompt: 'Condense the following text into a much shorter, punchy version without losing vital information:' },
  { id: 'longer', label: 'Make longer', prompt: 'Expand on the following text by providing thoughtful details, background context, and clear explanations:' },
  { id: 'rewrite', label: 'Rewrite in different tone', prompt: 'Rewrite the following text with a polished, professional, and engaging tone:' },
  { id: 'continue', label: 'Continue writing', prompt: 'Naturally continue and extend this text with logical next paragraphs, ideas, or action items:' },
  { id: 'ideas', label: 'Generate ideas', prompt: 'Brainstorm creative, actionable ideas and insights directly inspired by the following topic or text:' },
  { id: 'outline', label: 'Create outline', prompt: 'Construct a structured, hierarchical outline with sections and bullet points based on the following text:' },
  { id: 'translate', label: 'Translate to Spanish', prompt: 'Translate the following text accurately into natural, professional Spanish:' },
  { id: 'custom', label: 'Custom instruction...', prompt: '' },
];

/**
 * Resolves the actual provider & model to use, taking 'Auto' into consideration.
 */
export function resolveActiveModel(activeModel: ActiveAIModel, providers: AIProviderConfig[]): { provider: AIProviderConfig; model: string } {
  const enabledProviders = providers.filter((p) => p.enabled);

  if (activeModel.isAuto || !activeModel.providerId) {
    // Pick first enabled provider or default to Gemini
    const primary = enabledProviders.find((p) => p.id === 'gemini') || enabledProviders[0] || providers[0];
    return {
      provider: primary,
      model: primary.defaultModel || primary.availableModels[0] || 'gemini-3.8-flash',
    };
  }

  const targetProvider = providers.find((p) => p.id === activeModel.providerId) || providers[0];
  return {
    provider: targetProvider,
    model: activeModel.modelId || targetProvider.defaultModel || targetProvider.availableModels[0],
  };
}

/**
 * Searches the workspace pages for relevant context based on keyword/semantic relevance.
 */
export function buildWorkspaceContext(query: string, pages: Page[]): { contextString: string; sources: ChatSource[] } {
  if (!query || !pages.length) return { contextString: '', sources: [] };

  const queryTerms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 2);
  const scoredPages: { page: Page; score: number; excerpt: string }[] = [];

  for (const page of pages) {
    let score = 0;
    const titleLower = page.title.toLowerCase();
    
    // Check title match
    for (const term of queryTerms) {
      if (titleLower.includes(term)) score += 5;
    }

    // Check blocks content
    const allContent = page.blocks.map((b) => b.content).join(' ');
    const contentLower = allContent.toLowerCase();

    for (const term of queryTerms) {
      if (contentLower.includes(term)) score += 2;
    }

    if (score > 0) {
      const excerpt = allContent.slice(0, 300) || page.title;
      scoredPages.push({ page, score, excerpt });
    }
  }

  // Sort by score descending and take top 3
  scoredPages.sort((a, b) => b.score - a.score);
  const topSources = scoredPages.slice(0, 3);

  if (!topSources.length) {
    return { contextString: '', sources: [] };
  }

  const sources: ChatSource[] = topSources.map((s) => ({
    pageId: s.page.id,
    title: s.page.title,
    excerpt: s.excerpt,
  }));

  const contextBlocks = topSources.map((s) => {
    const pageText = s.page.blocks.map((b) => `- ${b.content}`).join('\n');
    return `### Document: "${s.page.title}"\n${pageText}`;
  });

  return {
    contextString: contextBlocks.join('\n\n'),
    sources,
  };
}

/**
 * Universal AI Generation function calling /api/ai/generate with streaming support.
 */
export async function generateAI(options: GenerateOptions): Promise<GenerateResult> {
  const { provider, model } = resolveActiveModel(options.activeModel, options.providers);

  const payload = {
    provider: provider.providerType,
    model,
    apiKey: provider.apiKey,
    baseUrl: provider.baseUrl,
    messages: options.messages,
    workspaceContext: options.workspaceContext,
    temperature: options.temperature ?? 0.7,
    maxTokens: options.maxTokens ?? 2048,
    stream: Boolean(options.onChunk),
    taskType: options.taskType || 'chat',
  };

  const response = await fetch('/api/ai/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `AI Request failed with status ${response.status}`);
  }

  // If streaming
  if (options.onChunk && response.body) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let accumulatedText = '';
    let finalUsage: any = undefined;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            if (parsed.text) {
              accumulatedText += parsed.text;
              options.onChunk(accumulatedText);
            }
            if (parsed.done && parsed.usage) {
              finalUsage = parsed.usage;
            }
          } catch {}
        }
      }
    }

    return {
      text: accumulatedText,
      usage: finalUsage,
    };
  }

  // Direct JSON response
  const data = await response.json();
  return {
    text: data.text,
    usage: data.usage,
  };
}
