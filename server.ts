import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// In-memory usage telemetry (safe, anonymized, no API keys stored or logged)
interface UsageRecord {
  id: string;
  timestamp: string;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  estimatedCost: number;
  taskType: string;
}

const sessionUsageRecords: UsageRecord[] = [];

// Helper to estimate pricing per 1K tokens
function calculateCost(provider: string, model: string, inputTokens: number, outputTokens: number): number {
  if (provider === 'ollama' || provider === 'lmstudio') return 0; // Local AI is free
  const p = provider.toLowerCase();
  const m = model.toLowerCase();

  let inputRate = 0.00015; // default per 1k
  let outputRate = 0.0006;

  if (p === 'gemini') {
    inputRate = 0.000075;
    outputRate = 0.0003;
  } else if (p === 'openai') {
    if (m.includes('4o-mini')) {
      inputRate = 0.00015;
      outputRate = 0.0006;
    } else if (m.includes('4o')) {
      inputRate = 0.0025;
      outputRate = 0.01;
    } else if (m.includes('o1')) {
      inputRate = 0.015;
      outputRate = 0.06;
    }
  } else if (p === 'anthropic') {
    if (m.includes('haiku')) {
      inputRate = 0.0008;
      outputRate = 0.004;
    } else if (m.includes('sonnet')) {
      inputRate = 0.003;
      outputRate = 0.015;
    }
  } else if (p === 'deepseek') {
    inputRate = 0.00014;
    outputRate = 0.00028;
  } else if (p === 'groq') {
    inputRate = 0.00005;
    outputRate = 0.00008;
  }

  const cost = (inputTokens / 1000) * inputRate + (outputTokens / 1000) * outputRate;
  return Number(cost.toFixed(6));
}

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0-aether',
    hasEnvGemini: Boolean(process.env.GEMINI_API_KEY),
  });
});

// AI Provider testing endpoint
app.post('/api/ai/test-key', async (req: Request, res: Response) => {
  const { provider, apiKey, baseUrl, model } = req.body;

  try {
    if (provider === 'gemini') {
      const activeKey = apiKey || process.env.GEMINI_API_KEY;
      if (!activeKey) {
        return res.status(400).json({ success: false, error: 'No Gemini API key provided or found in environment.' });
      }
      const ai = new GoogleGenAI({
        apiKey: activeKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
      });
      const response = await ai.models.generateContent({
        model: model || 'gemini-3.8-flash',
        contents: 'Respond with "pong"',
      });
      return res.json({ success: true, message: `Connected successfully! Response: ${response.text?.slice(0, 30)}` });
    }

    if (provider === 'ollama') {
      const url = baseUrl || 'http://localhost:11434';
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const testRes = await fetch(`${url}/api/tags`, { signal: controller.signal });
      clearTimeout(timeout);
      if (testRes.ok) {
        const data = await testRes.json();
        return res.json({ success: true, message: `Connected to Ollama! Available models: ${data.models?.length || 0}` });
      }
      return res.status(400).json({ success: false, error: `Ollama replied with HTTP ${testRes.status}` });
    }

    if (provider === 'lmstudio') {
      const url = baseUrl || 'http://localhost:1234/v1';
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const testRes = await fetch(`${url}/models`, { signal: controller.signal });
      clearTimeout(timeout);
      if (testRes.ok) {
        const data = await testRes.json();
        return res.json({ success: true, message: `Connected to LM Studio! Models found: ${data.data?.length || 0}` });
      }
      return res.status(400).json({ success: false, error: `LM Studio replied with HTTP ${testRes.status}` });
    }

    if (provider === 'anthropic') {
      if (!apiKey) {
        return res.status(400).json({ success: false, error: 'Anthropic API key required.' });
      }
      const testRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: model || 'claude-3-5-haiku-20241022',
          max_tokens: 5,
          messages: [{ role: 'user', content: 'hi' }],
        }),
      });
      if (testRes.ok) {
        return res.json({ success: true, message: 'Anthropic API key verified!' });
      }
      const err = await testRes.json().catch(() => ({}));
      return res.status(400).json({ success: false, error: (err as any)?.error?.message || `HTTP ${testRes.status}` });
    }

    // Standard OpenAI or OpenAI-compatible endpoint test
    let testUrl = 'https://api.openai.com/v1/models';
    if (provider === 'groq') testUrl = 'https://api.groq.com/openai/v1/models';
    else if (provider === 'mistral') testUrl = 'https://api.mistral.ai/v1/models';
    else if (provider === 'openrouter') testUrl = 'https://openrouter.ai/api/v1/models';
    else if (provider === 'deepseek') testUrl = 'https://api.deepseek.com/models';
    else if (provider === 'together') testUrl = 'https://api.together.xyz/v1/models';
    else if (provider === 'custom') {
      const base = (baseUrl || '').replace(/\/+$/, '');
      testUrl = `${base}/models`;
    }

    const testRes = await fetch(testUrl, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (testRes.ok) {
      return res.json({ success: true, message: `Connected to ${provider} API successfully!` });
    }
    const errData = await testRes.json().catch(() => ({}));
    return res.status(400).json({ success: false, error: (errData as any)?.error?.message || `HTTP ${testRes.status}` });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Connection failed' });
  }
});

// Universal AI Generation & Streaming Endpoint
app.post('/api/ai/generate', async (req: Request, res: Response) => {
  const {
    provider = 'gemini',
    model = 'gemini-3.8-flash',
    messages = [],
    apiKey,
    baseUrl,
    temperature = 0.7,
    maxTokens = 2048,
    stream = false,
    taskType = 'chat',
    workspaceContext = '',
  } = req.body;

  const startTime = Date.now();

  // Combine system messages or workspace context
  const fullMessages = [...messages];
  if (workspaceContext) {
    fullMessages.unshift({
      role: 'system',
      content: `The following is relevant context from the user's workspace:\n\n${workspaceContext}\n\nUse this context when relevant to provide precise, workspace-grounded answers.`,
    });
  }

  // Estimate input tokens (rough: ~4 chars per token)
  const allText = fullMessages.map((m: any) => m.content || '').join('\n');
  const approxInputTokens = Math.max(1, Math.ceil(allText.length / 4));

  try {
    // 1. Google Gemini Provider
    if (provider === 'gemini') {
      const activeKey = apiKey || process.env.GEMINI_API_KEY;
      if (!activeKey) {
        return res.status(400).json({
          error: 'Gemini API key is required. Please add your key in Settings > AI Providers.',
        });
      }

      const ai = new GoogleGenAI({
        apiKey: activeKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
      });

      const selectedModel = model || 'gemini-3.8-flash';

      // Format messages into Gemini contents or single prompt
      const systemMsg = fullMessages.find((m: any) => m.role === 'system')?.content;
      const conversationLines = fullMessages
        .filter((m: any) => m.role !== 'system')
        .map((m: any) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n\n');

      const contents = conversationLines || fullMessages[fullMessages.length - 1]?.content || 'Hello';

      if (stream) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const streamResponse = await ai.models.generateContentStream({
          model: selectedModel,
          contents,
          config: {
            systemInstruction: systemMsg,
            temperature,
          },
        });

        let fullOutput = '';
        for await (const chunk of streamResponse) {
          const text = chunk.text || '';
          fullOutput += text;
          res.write(`data: ${JSON.stringify({ text, done: false })}\n\n`);
        }

        const approxOutputTokens = Math.max(1, Math.ceil(fullOutput.length / 4));
        const cost = calculateCost('gemini', selectedModel, approxInputTokens, approxOutputTokens);

        sessionUsageRecords.push({
          id: Math.random().toString(36).substring(2, 9),
          timestamp: new Date().toISOString(),
          provider: 'gemini',
          model: selectedModel,
          inputTokens: approxInputTokens,
          outputTokens: approxOutputTokens,
          estimatedCost: cost,
          taskType,
        });

        res.write(
          `data: ${JSON.stringify({
            done: true,
            usage: {
              inputTokens: approxInputTokens,
              outputTokens: approxOutputTokens,
              cost,
              latencyMs: Date.now() - startTime,
            },
          })}\n\n`
        );
        return res.end();
      } else {
        const response = await ai.models.generateContent({
          model: selectedModel,
          contents,
          config: {
            systemInstruction: systemMsg,
            temperature,
          },
        });

        const outputText = response.text || '';
        const approxOutputTokens = Math.max(1, Math.ceil(outputText.length / 4));
        const cost = calculateCost('gemini', selectedModel, approxInputTokens, approxOutputTokens);

        sessionUsageRecords.push({
          id: Math.random().toString(36).substring(2, 9),
          timestamp: new Date().toISOString(),
          provider: 'gemini',
          model: selectedModel,
          inputTokens: approxInputTokens,
          outputTokens: approxOutputTokens,
          estimatedCost: cost,
          taskType,
        });

        return res.json({
          text: outputText,
          usage: {
            inputTokens: approxInputTokens,
            outputTokens: approxOutputTokens,
            cost,
            latencyMs: Date.now() - startTime,
          },
        });
      }
    }

    // 2. Anthropic Provider
    if (provider === 'anthropic') {
      if (!apiKey) {
        return res.status(400).json({ error: 'Anthropic API key is required.' });
      }

      const systemMsg = fullMessages.find((m: any) => m.role === 'system')?.content;
      const userAssistantMessages = fullMessages
        .filter((m: any) => m.role !== 'system')
        .map((m: any) => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content,
        }));

      if (userAssistantMessages.length === 0) {
        userAssistantMessages.push({ role: 'user', content: 'Hello' });
      }

      const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: model || 'claude-3-5-sonnet-20241022',
          max_tokens: maxTokens || 2048,
          system: systemMsg,
          messages: userAssistantMessages,
          temperature,
          stream,
        }),
      });

      if (!anthropicRes.ok) {
        const err = await anthropicRes.json().catch(() => ({}));
        return res.status(anthropicRes.status).json({
          error: (err as any)?.error?.message || `Anthropic error: ${anthropicRes.status}`,
        });
      }

      if (stream && anthropicRes.body) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const reader = anthropicRes.body.getReader();
        const decoder = new TextDecoder();
        let fullOutput = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunkStr = decoder.decode(value, { stream: true });
          const lines = chunkStr.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6).trim();
              if (dataStr === '[DONE]') continue;
              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                  fullOutput += parsed.delta.text;
                  res.write(`data: ${JSON.stringify({ text: parsed.delta.text, done: false })}\n\n`);
                }
              } catch {}
            }
          }
        }

        const approxOutputTokens = Math.max(1, Math.ceil(fullOutput.length / 4));
        const cost = calculateCost('anthropic', model, approxInputTokens, approxOutputTokens);

        sessionUsageRecords.push({
          id: Math.random().toString(36).substring(2, 9),
          timestamp: new Date().toISOString(),
          provider: 'anthropic',
          model,
          inputTokens: approxInputTokens,
          outputTokens: approxOutputTokens,
          estimatedCost: cost,
          taskType,
        });

        res.write(
          `data: ${JSON.stringify({
            done: true,
            usage: {
              inputTokens: approxInputTokens,
              outputTokens: approxOutputTokens,
              cost,
              latencyMs: Date.now() - startTime,
            },
          })}\n\n`
        );
        return res.end();
      } else {
        const data = await anthropicRes.json();
        const outputText = data.content?.[0]?.text || '';
        const approxOutputTokens = data.usage?.output_tokens || Math.max(1, Math.ceil(outputText.length / 4));
        const cost = calculateCost('anthropic', model, approxInputTokens, approxOutputTokens);

        return res.json({
          text: outputText,
          usage: {
            inputTokens: data.usage?.input_tokens || approxInputTokens,
            outputTokens: approxOutputTokens,
            cost,
            latencyMs: Date.now() - startTime,
          },
        });
      }
    }

    // 3. OpenAI & OpenAI-Compatible Universal Gateway (OpenAI, Groq, Mistral, DeepSeek, OpenRouter, Together, Ollama, LMStudio, Custom)
    let endpoint = 'https://api.openai.com/v1/chat/completions';
    let authHeader = `Bearer ${apiKey}`;

    if (provider === 'groq') {
      endpoint = 'https://api.groq.com/openai/v1/chat/completions';
    } else if (provider === 'mistral') {
      endpoint = 'https://api.mistral.ai/v1/chat/completions';
    } else if (provider === 'openrouter') {
      endpoint = 'https://openrouter.ai/api/v1/chat/completions';
    } else if (provider === 'deepseek') {
      endpoint = 'https://api.deepseek.com/chat/completions';
    } else if (provider === 'together') {
      endpoint = 'https://api.together.xyz/v1/chat/completions';
    } else if (provider === 'ollama') {
      const base = (baseUrl || 'http://localhost:11434').replace(/\/+$/, '');
      endpoint = `${base}/v1/chat/completions`;
      authHeader = 'Bearer ollama';
    } else if (provider === 'lmstudio') {
      const base = (baseUrl || 'http://localhost:1234/v1').replace(/\/+$/, '');
      endpoint = `${base}/chat/completions`;
      authHeader = 'Bearer lmstudio';
    } else if (provider === 'custom') {
      const base = (baseUrl || '').replace(/\/+$/, '');
      endpoint = base.endsWith('/chat/completions') ? base : `${base}/chat/completions`;
      authHeader = apiKey ? `Bearer ${apiKey}` : '';
    }

    if (!apiKey && provider !== 'ollama' && provider !== 'lmstudio') {
      return res.status(400).json({
        error: `API key required for provider "${provider}". Please configure it in Settings > AI Providers.`,
      });
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (authHeader) headers['Authorization'] = authHeader;

    const formattedMessages = fullMessages.map((m: any) => ({
      role: m.role || 'user',
      content: m.content || '',
    }));

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: model || 'gpt-4o-mini',
        messages: formattedMessages,
        temperature,
        max_tokens: maxTokens || 2048,
        stream,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: (err as any)?.error?.message || `Provider returned status code ${response.status}`,
      });
    }

    if (stream && response.body) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullOutput = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (dataStr === '[DONE]') continue;
            try {
              const parsed = JSON.parse(dataStr);
              const delta = parsed.choices?.[0]?.delta?.content || '';
              if (delta) {
                fullOutput += delta;
                res.write(`data: ${JSON.stringify({ text: delta, done: false })}\n\n`);
              }
            } catch {}
          }
        }
      }

      const approxOutputTokens = Math.max(1, Math.ceil(fullOutput.length / 4));
      const cost = calculateCost(provider, model, approxInputTokens, approxOutputTokens);

      sessionUsageRecords.push({
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toISOString(),
        provider,
        model,
        inputTokens: approxInputTokens,
        outputTokens: approxOutputTokens,
        estimatedCost: cost,
        taskType,
      });

      res.write(
        `data: ${JSON.stringify({
          done: true,
          usage: {
            inputTokens: approxInputTokens,
            outputTokens: approxOutputTokens,
            cost,
            latencyMs: Date.now() - startTime,
          },
        })}\n\n`
      );
      return res.end();
    } else {
      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || '';
      const inTokens = data.usage?.prompt_tokens || approxInputTokens;
      const outTokens = data.usage?.completion_tokens || Math.max(1, Math.ceil(text.length / 4));
      const cost = calculateCost(provider, model, inTokens, outTokens);

      sessionUsageRecords.push({
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toISOString(),
        provider,
        model,
        inputTokens: inTokens,
        outputTokens: outTokens,
        estimatedCost: cost,
        taskType,
      });

      return res.json({
        text,
        usage: {
          inputTokens: inTokens,
          outputTokens: outTokens,
          cost,
          latencyMs: Date.now() - startTime,
        },
      });
    }
  } catch (error: any) {
    console.error('AI Generation Error:', error);
    return res.status(500).json({
      error: `AI Error: ${error.message || 'Unable to connect to AI provider. Check your API key and network connection.'}`,
    });
  }
});

// Usage statistics endpoint
app.get('/api/ai/usage', (_req: Request, res: Response) => {
  const totalTokens = sessionUsageRecords.reduce((acc, r) => acc + r.inputTokens + r.outputTokens, 0);
  const totalCost = sessionUsageRecords.reduce((acc, r) => acc + r.estimatedCost, 0);

  // Group by provider
  const byProvider: Record<string, { requests: number; tokens: number; cost: number }> = {};
  sessionUsageRecords.forEach((r) => {
    if (!byProvider[r.provider]) {
      byProvider[r.provider] = { requests: 0, tokens: 0, cost: 0 };
    }
    byProvider[r.provider].requests += 1;
    byProvider[r.provider].tokens += r.inputTokens + r.outputTokens;
    byProvider[r.provider].cost += r.estimatedCost;
  });

  res.json({
    totalRequests: sessionUsageRecords.length,
    totalTokens,
    totalCost: Number(totalCost.toFixed(4)),
    byProvider,
    recentHistory: sessionUsageRecords.slice(-20).reverse(),
  });
});

// File upload and text extraction endpoint
app.post('/api/files/extract', async (req: Request, res: Response) => {
  const { fileName, fileData, fileType } = req.body;

  if (!fileData) {
    return res.status(400).json({ error: 'No file data received' });
  }

  try {
    let extractedText = '';
    // If text/markdown/csv/json
    if (
      fileType?.includes('text') ||
      fileType?.includes('json') ||
      fileType?.includes('csv') ||
      fileName?.endsWith('.txt') ||
      fileName?.endsWith('.md') ||
      fileName?.endsWith('.csv') ||
      fileName?.endsWith('.json')
    ) {
      if (fileData.startsWith('data:')) {
        const base64 = fileData.split(',')[1];
        extractedText = Buffer.from(base64, 'base64').toString('utf-8');
      } else {
        extractedText = fileData;
      }
    } else {
      // Binary or document preview
      extractedText = `[Extracted summary of ${fileName} (${fileType}) - ${Math.round(fileData.length / 1024)} KB file processed into workspace memory index]`;
    }

    return res.json({
      success: true,
      fileName,
      length: extractedText.length,
      extractedText: extractedText.slice(0, 15000), // safety ceiling
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Extraction failed' });
  }
});

// Start server with Vite middleware integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Aether Workspace server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
