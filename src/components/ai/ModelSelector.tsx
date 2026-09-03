import React, { useState, useRef, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { getProviderBadge } from '../../ai/providers';
import { ChevronDown, Sparkles, Cpu, Cloud, Settings as SettingsIcon, Check } from 'lucide-react';

export const ModelSelector: React.FC = () => {
  const { providers, activeModel, setActiveModel, setIsSettingsOpen, setSettingsTab } = useWorkspace();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentProvider = providers.find((p) => p.id === activeModel.providerId) || providers[0];
  const currentBadge = getProviderBadge(currentProvider);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        id="model-selector-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 shadow-xs transition-colors"
        title="Switch AI Provider and Model"
      >
        <span className="flex items-center gap-1.5">
          {activeModel.isAuto ? (
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          ) : currentProvider.isLocal ? (
            <Cpu className="w-3.5 h-3.5 text-emerald-500" />
          ) : (
            <Cloud className="w-3.5 h-3.5 text-blue-500" />
          )}

          <span className="font-semibold truncate max-w-[130px]">
            {activeModel.isAuto ? 'Auto (Smart Route)' : activeModel.modelId}
          </span>
        </span>

        <span
          className={`inline-flex items-center px-1.5 py-0.2 text-[10px] font-medium rounded-md border ${currentBadge.color}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full mr-1 ${currentBadge.dot}`} />
          {activeModel.isAuto ? 'Auto' : currentBadge.label}
        </span>

        <ChevronDown className="w-3 h-3 text-zinc-400" />
      </button>

      {isOpen && (
        <div
          id="model-selector-dropdown"
          className="absolute right-0 mt-1.5 w-72 origin-top-right rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl z-50 p-1 text-xs focus:outline-none max-h-96 overflow-y-auto"
        >
          {/* Auto Mode Option */}
          <div className="p-1 border-b border-zinc-100 dark:border-zinc-800">
            <button
              onClick={() => {
                setActiveModel({ providerId: 'gemini', modelId: 'gemini-3.8-flash', isAuto: true });
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-colors ${
                activeModel.isAuto
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-medium'
                  : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <div>
                  <div className="font-semibold">Auto (Recommended)</div>
                  <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                    Intelligently picks the fastest/best configured model
                  </div>
                </div>
              </div>
              {activeModel.isAuto && <Check className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />}
            </button>
          </div>

          {/* Providers List */}
          <div className="py-1">
            {providers.map((provider) => {
              const badge = getProviderBadge(provider);
              const isSelectedProvider = !activeModel.isAuto && activeModel.providerId === provider.id;

              return (
                <div key={provider.id} className="mb-1.5 last:mb-0">
                  <div className="px-2 py-1 text-[10px] font-semibold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase flex items-center justify-between">
                    <span>{provider.name}</span>
                    <span className={`text-[9px] px-1 rounded border ${badge.color}`}>{badge.label}</span>
                  </div>

                  {provider.availableModels.map((modelName) => {
                    const isModelActive = isSelectedProvider && activeModel.modelId === modelName;

                    return (
                      <button
                        key={modelName}
                        onClick={() => {
                          setActiveModel({ providerId: provider.id, modelId: modelName, isAuto: false });
                          setIsOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition-colors ${
                          isModelActive
                            ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium'
                            : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-300'
                        }`}
                      >
                        <span className="truncate pr-2 font-mono text-[11px]">{modelName}</span>
                        {isModelActive && <Check className="w-3.5 h-3.5 text-zinc-700 dark:text-zinc-300" />}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Manage Providers link */}
          <div className="p-1 border-t border-zinc-100 dark:border-zinc-800">
            <button
              onClick={() => {
                setIsOpen(false);
                setSettingsTab('providers');
                setIsSettingsOpen(true);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors font-medium"
            >
              <SettingsIcon className="w-3.5 h-3.5" />
              <span>Configure AI Keys & Custom APIs...</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
