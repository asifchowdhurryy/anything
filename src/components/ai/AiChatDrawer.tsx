import React, { useState, useRef, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { generateAI, buildWorkspaceContext } from '../../ai/aiManager';
import { ModelSelector } from './ModelSelector';
import {
  Sparkles,
  Send,
  Plus,
  Trash2,
  BookOpen,
  FileText,
  Copy,
  Check,
  Loader2,
  Bot,
  User,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export const AiChatDrawer: React.FC = () => {
  const {
    conversations,
    activeConversationId,
    activeConversation,
    setActiveConversationId,
    createConversation,
    deleteConversation,
    addChatMessage,
    updateChatMessage,
    pages,
    providers,
    activeModel,
    settings,
    setActivePageId,
    setActiveViewMode,
  } = useWorkspace();

  const [inputPrompt, setInputPrompt] = useState('');
  const [useWorkspaceContext, setUseWorkspaceContext] = useState(settings.autoContext);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages, isGenerating]);

  const handleSend = async () => {
    if (!inputPrompt.trim() || isGenerating) return;

    let convId = activeConversationId;
    if (!convId) {
      convId = createConversation();
    }

    const userText = inputPrompt.trim();
    setInputPrompt('');

    // Add User message
    addChatMessage(convId, {
      role: 'user',
      content: userText,
    });

    // Build context if enabled
    let contextStr = '';
    let sources: any[] = [];
    if (useWorkspaceContext) {
      const result = buildWorkspaceContext(userText, pages);
      contextStr = result.contextString;
      sources = result.sources;
    }

    // Add empty Assistant message for streaming
    const assistantMsgId = addChatMessage(convId, {
      role: 'assistant',
      content: '',
      isStreaming: true,
      modelUsed: activeModel.isAuto ? 'auto' : activeModel.modelId,
      providerUsed: activeModel.providerId,
      sources,
    });

    setIsGenerating(true);

    // Prepare message history
    const currentMsgs = activeConversation?.messages || [];
    const chatHistory = [
      ...currentMsgs.map((m) => ({
        role: m.role as 'system' | 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user' as const, content: userText },
    ];

    try {
      await generateAI({
        activeModel,
        providers,
        messages: chatHistory,
        workspaceContext: contextStr,
        temperature: settings.temperature,
        maxTokens: settings.maxTokens,
        taskType: 'chat',
        onChunk: (textChunk) => {
          updateChatMessage(convId!, assistantMsgId, textChunk, true, sources);
        },
      });
      updateChatMessage(convId, assistantMsgId, undefined as any, false, sources);
    } catch (err: any) {
      updateChatMessage(
        convId,
        assistantMsgId,
        `⚠️ Error: ${err.message || 'Failed to generate AI response. Please verify provider settings and API keys.'}`,
        false
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 flex h-full bg-white dark:bg-zinc-950 overflow-hidden">
      {/* Conversations History Sidebar */}
      <div className="w-56 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/50 flex flex-col shrink-0">
        <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-zinc-500" />
            <span>AI Chats</span>
          </span>
          <button
            onClick={() => createConversation()}
            className="p-1 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 shadow-xs"
            title="New Chat"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.map((conv) => {
            const isActive = conv.id === activeConversationId;
            return (
              <div
                key={conv.id}
                onClick={() => setActiveConversationId(conv.id)}
                className={`group flex items-center justify-between px-2.5 py-2 rounded-lg text-xs cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                }`}
              >
                <span className="truncate flex-1">{conv.title || 'New Conversation'}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(conv.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-rose-500 p-0.5 rounded transition-opacity"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Chat Header */}
        <div className="p-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                {activeConversation?.title || 'Universal AI Assistant'}
              </div>
              <div className="text-[10px] text-zinc-400">
                Workspace context & cross-model reasoning
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Workspace Context Switch */}
            <label className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={useWorkspaceContext}
                onChange={(e) => setUseWorkspaceContext(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-zinc-300 dark:border-zinc-700 text-zinc-900 focus:ring-0 cursor-pointer"
              />
              <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden sm:inline">Workspace Context</span>
            </label>

            <ModelSelector />
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {(!activeConversation?.messages || activeConversation.messages.length === 0) && (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto text-zinc-400 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-600 dark:text-zinc-300">
                <Sparkles className="w-6 h-6 text-amber-500" />
              </div>
              <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                How can Anything AI help you today?
              </div>
              <div className="text-xs leading-relaxed">
                Ask questions about your documents, generate task plans, draft code, or analyze your sprint backlog.
              </div>
              <div className="grid grid-cols-2 gap-2 w-full pt-2">
                {[
                  'Summarize my weekly sync notes',
                  'Draft sprint tasks for next release',
                  'Explain local AI vs cloud latency',
                  'Suggest improvements to database design',
                ].map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => {
                      setInputPrompt(prompt);
                    }}
                    className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-left text-[11px] text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeConversation?.messages?.map((msg, idx) => {
            const isAssistant = msg.role === 'assistant';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 text-xs leading-relaxed max-w-3xl ${
                  isAssistant ? 'mr-auto' : 'ml-auto flex-row-reverse'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    isAssistant
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      : 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  }`}
                >
                  {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                {/* Content Box */}
                <div
                  className={`rounded-2xl p-4 space-y-2 ${
                    isAssistant
                      ? 'bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100'
                      : 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  }`}
                >
                  {/* Sources Citations */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mb-2 p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[11px]">
                      <div className="font-semibold text-zinc-500 mb-1 flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        <span>Referenced Workspace Pages:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.sources.map((src) => (
                          <button
                            key={src.pageId}
                            onClick={() => {
                              setActivePageId(src.pageId);
                              setActiveViewMode('page');
                            }}
                            className="px-2 py-0.5 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 flex items-center gap-1 hover:border-zinc-400"
                          >
                            <FileText className="w-3 h-3" />
                            <span className="truncate max-w-[120px]">{src.title}</span>
                            <ExternalLink className="w-2.5 h-2.5 text-zinc-400" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Body */}
                  <div className="prose prose-xs dark:prose-invert max-w-none">
                    <ReactMarkdown>{msg.content || ''}</ReactMarkdown>
                  </div>

                  {msg.isStreaming && (
                    <div className="flex items-center gap-1.5 text-zinc-400 pt-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span className="text-[10px]">Streaming response...</span>
                    </div>
                  )}

                  {/* Footer metadata for assistant */}
                  {isAssistant && msg.content && (
                    <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between text-[10px] text-zinc-400">
                      <span className="font-mono">
                        Model: {msg.modelUsed || activeModel.modelId} ({msg.providerUsed || 'AI'})
                      </span>

                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(msg.content);
                          setCopiedIndex(idx);
                          setTimeout(() => setCopiedIndex(null), 2000);
                        }}
                        className="flex items-center gap-1 hover:text-zinc-600 dark:hover:text-zinc-200"
                      >
                        {copiedIndex === idx ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <div className="relative rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus-within:border-zinc-400 dark:focus-within:border-zinc-600 focus-within:ring-1 focus-within:ring-zinc-400 transition-all p-2">
            <textarea
              ref={textareaRef}
              rows={2}
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything or request notes to be generated (Enter to send, Shift+Enter for newline)..."
              className="w-full bg-transparent border-none outline-none resize-none text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 px-1"
            />

            <div className="flex items-center justify-between pt-1 border-t border-zinc-200/60 dark:border-zinc-800/60 text-xs">
              <span className="text-[10px] text-zinc-400">
                {useWorkspaceContext ? '🔍 Grounded in workspace context' : '⚡ General AI knowledge'}
              </span>

              <button
                onClick={handleSend}
                disabled={isGenerating || !inputPrompt.trim()}
                className="p-1.5 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 disabled:opacity-40 transition-opacity hover:bg-black dark:hover:bg-white"
              >
                {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
