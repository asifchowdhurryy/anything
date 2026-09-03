import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { EDITOR_AI_ACTIONS, generateAI } from '../../ai/aiManager';
import { getProviderBadge } from '../../ai/providers';
import { Sparkles, ArrowRight, Loader2, Check, RefreshCw, X, ChevronDown, CheckCheck } from 'lucide-react';

interface AskAiDialogProps {
  selectedText: string;
  onReplace: (newText: string) => void;
  onInsertBelow: (newText: string) => void;
  onClose: () => void;
}

export const AskAiDialog: React.FC<AskAiDialogProps> = ({
  selectedText,
  onReplace,
  onInsertBelow,
  onClose,
}) => {
  const { providers, activeModel, setActiveModel, pages } = useWorkspace();
  const [selectedActionId, setSelectedActionId] = useState<string>('improve');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isModelPickerOpen, setIsModelPickerOpen] = useState(false);

  const currentProvider = providers.find((p) => p.id === activeModel.providerId) || providers[0];
  const badge = getProviderBadge(currentProvider);

  const handleRunAI = async (actionId = selectedActionId) => {
    setIsGenerating(true);
    setGeneratedResult('');
    setErrorMsg(null);

    const action = EDITOR_AI_ACTIONS.find((a) => a.id === actionId);
    let promptInstruction = action?.prompt || '';
    if (actionId === 'custom') {
      promptInstruction = customPrompt || 'Respond thoughtfully to the following:';
    }

    const messages = [
      {
        role: 'system' as const,
        content:
          'You are an expert editor and writing assistant inside Anything. Return only the revised or generated text directly, without unsolicited conversational prefixes like "Sure! Here is the text:". Maintain clean formatting.',
      },
      {
        role: 'user' as const,
        content: `${promptInstruction}\n\n"""\n${selectedText || 'Generate an insightful overview about modern engineering and AI.'}\n"""`,
      },
    ];

    try {
      await generateAI({
        activeModel,
        providers,
        messages,
        taskType: 'editor_inline',
        onChunk: (chunk) => {
          setGeneratedResult(chunk);
        },
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to generate. Check your API key or model configuration.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header with Model Selector */}
        <div className="p-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/70 dark:bg-zinc-900/70">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-amber-500/10 text-amber-500">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">Ask AI in Document</span>
          </div>

          {/* Model Switcher inside dialog */}
          <div className="relative">
            <button
              onClick={() => setIsModelPickerOpen(!isModelPickerOpen)}
              className="flex items-center gap-1.5 px-2 py-1 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
            >
              <span className="text-[11px] font-medium truncate max-w-[120px]">
                {activeModel.isAuto ? 'Auto Model' : activeModel.modelId}
              </span>
              <span className={`text-[9px] px-1 py-0.2 rounded border ${badge.color}`}>{badge.label}</span>
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </button>

            {isModelPickerOpen && (
              <div className="absolute right-0 mt-1 w-64 max-h-60 overflow-y-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl rounded-xl p-1 z-50 text-xs">
                {providers.map((p) => (
                  <div key={p.id} className="mb-1">
                    <div className="px-2 py-0.5 text-[10px] font-semibold text-zinc-400 uppercase">{p.name}</div>
                    {p.availableModels.map((m) => (
                      <button
                        key={m}
                        onClick={() => {
                          setActiveModel({ providerId: p.id, modelId: m, isAuto: false });
                          setIsModelPickerOpen(false);
                        }}
                        className="w-full text-left px-2 py-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs truncate"
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button onClick={onClose} className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Selection Pills */}
        <div className="p-3 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/40 dark:bg-zinc-900/30">
          <div className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Choose AI Action:</div>
          <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
            {EDITOR_AI_ACTIONS.map((act) => {
              const isSelected = selectedActionId === act.id;
              return (
                <button
                  key={act.id}
                  onClick={() => {
                    setSelectedActionId(act.id);
                    if (act.id !== 'custom') {
                      handleRunAI(act.id);
                    }
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                      : 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                  }`}
                >
                  {act.label}
                </button>
              );
            })}
          </div>

          {selectedActionId === 'custom' && (
            <div className="mt-2 flex items-center gap-2">
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRunAI('custom')}
                placeholder="e.g. Turn into bullet points, or critique this proposal..."
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400"
              />
              <button
                onClick={() => handleRunAI('custom')}
                disabled={isGenerating || !customPrompt.trim()}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 disabled:opacity-50"
              >
                Generate
              </button>
            </div>
          )}
        </div>

        {/* Selected Context Preview */}
        {selectedText && (
          <div className="px-3.5 py-2 border-b border-zinc-100 dark:border-zinc-800/80 text-xs bg-zinc-50/20">
            <span className="text-zinc-400 font-medium">Selected text: </span>
            <span className="text-zinc-600 dark:text-zinc-300 italic truncate max-w-sm inline-block align-bottom">
              "{selectedText.slice(0, 100)}..."
            </span>
          </div>
        )}

        {/* Output Area */}
        <div className="p-3.5 min-h-[140px] max-h-[260px] overflow-y-auto font-sans text-xs leading-relaxed text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">
          {isGenerating && !generatedResult && (
            <div className="h-28 flex flex-col items-center justify-center gap-2 text-zinc-400">
              <Loader2 className="w-5 h-5 animate-spin text-zinc-500" />
              <span>Generating response with {activeModel.modelId}...</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs">
              <strong>Error: </strong>
              {errorMsg}
            </div>
          )}

          {generatedResult && (
            <div className="relative">
              {generatedResult}
              {isGenerating && <span className="inline-block w-1.5 h-3.5 bg-zinc-400 ml-1 animate-pulse" />}
            </div>
          )}

          {!isGenerating && !generatedResult && !errorMsg && (
            <div className="h-28 flex flex-col items-center justify-center text-zinc-400 text-center px-4">
              <span>Select an action above to generate, rewrite, or expand text.</span>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <button
            onClick={() => handleRunAI()}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>Regenerate</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              Discard
            </button>

            {selectedText && (
              <button
                onClick={() => {
                  onReplace(generatedResult);
                  onClose();
                }}
                disabled={!generatedResult || isGenerating}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-black dark:hover:bg-white disabled:opacity-50 shadow-xs transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Replace Selection</span>
              </button>
            )}

            <button
              onClick={() => {
                onInsertBelow(generatedResult);
                onClose();
              }}
              disabled={!generatedResult || isGenerating}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 disabled:opacity-50 transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>Insert Below</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
