import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { AIProviderConfig } from '../../types/workspace';
import {
  X,
  Key,
  Sliders,
  Sparkles,
  BarChart3,
  Download,
  Upload,
  CheckCircle2,
  XCircle,
  Loader2,
  Plus,
  Cpu,
  Cloud,
  ShieldCheck,
  RotateCcw,
  Sun,
  Moon,
  Laptop,
  Palette,
} from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const {
    isSettingsOpen,
    setIsSettingsOpen,
    settingsTab,
    setSettingsTab,
    settings,
    updateSettings,
    providers,
    updateProvider,
    addCustomProvider,
    deleteProvider,
    exportWorkspaceJSON,
    importWorkspaceJSON,
    effectiveTheme,
  } = useWorkspace();

  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { ok: boolean; message: string }>>({});
  const [isAddCustomOpen, setIsAddCustomOpen] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Custom provider state
  const [customName, setCustomName] = useState('');
  const [customBaseUrl, setCustomBaseUrl] = useState('');
  const [customApiKey, setCustomApiKey] = useState('');
  const [customModel, setCustomModel] = useState('');
  const [customIsLocal, setCustomIsLocal] = useState(false);

  if (!isSettingsOpen) return null;

  const testProviderConnection = async (provider: AIProviderConfig) => {
    setTestingId(provider.id);
    try {
      const res = await fetch('/api/ai/test-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: provider.providerType,
          apiKey: provider.apiKey,
          baseUrl: provider.baseUrl,
        }),
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        setTestResults((prev) => ({
          ...prev,
          [provider.id]: { ok: true, message: data.message || 'Connected successfully' },
        }));
      } else {
        setTestResults((prev) => ({
          ...prev,
          [provider.id]: { ok: false, message: data.error || 'Connection failed' },
        }));
      }
    } catch (err: any) {
      setTestResults((prev) => ({
        ...prev,
        [provider.id]: { ok: false, message: err.message || 'Network error' },
      }));
    } finally {
      setTestingId(null);
    }
  };

  const handleCreateCustom = () => {
    if (!customName.trim() || !customBaseUrl.trim() || !customModel.trim()) return;

    addCustomProvider({
      name: customName.trim(),
      providerType: 'custom',
      apiKey: customApiKey.trim() || undefined,
      baseUrl: customBaseUrl.trim(),
      isLocal: customIsLocal,
      enabled: true,
      availableModels: [customModel.trim()],
      defaultModel: customModel.trim(),
    });

    setCustomName('');
    setCustomBaseUrl('');
    setCustomApiKey('');
    setCustomModel('');
    setIsAddCustomOpen(false);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const success = importWorkspaceJSON(text);
      if (success) {
        setImportStatus('Workspace restored successfully!');
      } else {
        setImportStatus('Failed to parse JSON file.');
      }
      setTimeout(() => setImportStatus(null), 3000);
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/70 dark:bg-zinc-900/70 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Workspace Settings</span>
          </div>

          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content layout: Left nav + Right pane */}
        <div className="flex flex-1 overflow-hidden">
          {/* Navigation tabs */}
          <div className="w-48 border-r border-zinc-200 dark:border-zinc-800 p-2 space-y-1 bg-zinc-50/40 dark:bg-zinc-900/30 shrink-0 text-xs font-medium">
            <button
              onClick={() => setSettingsTab('providers')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-colors ${
                settingsTab === 'providers'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>AI Providers & Keys</span>
            </button>

            <button
              onClick={() => setSettingsTab('preferences')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-colors ${
                settingsTab === 'preferences'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>AI Preferences</span>
            </button>

            <button
              onClick={() => setSettingsTab('usage')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-colors ${
                settingsTab === 'usage'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Usage & Tokens</span>
            </button>

            <button
              id="settings-tab-appearance"
              onClick={() => setSettingsTab('general')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-colors ${
                settingsTab === 'general'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Appearance & Theme</span>
            </button>

            <button
              onClick={() => setSettingsTab('export')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-colors ${
                settingsTab === 'export'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export & Backup</span>
            </button>
          </div>

          {/* Right Pane Body */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* ================= TAB 1: AI PROVIDERS & KEYS ================= */}
            {settingsTab === 'providers' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    Universal AI Provider Hub (BYOK)
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Connect any LLM using your own API keys. Keys are handled securely through server-side proxies and never stored on third-party tracking databases.
                  </p>
                </div>

                {/* Privacy Assurance Banner */}
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 flex items-start gap-2.5 text-xs">
                  <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <span className="font-semibold">Privacy First & Local AI: </span>
                    You can run Ollama or LM Studio completely offline without sending any data over the internet.
                  </div>
                </div>

                {/* Providers List */}
                <div className="space-y-3">
                  {providers.map((p) => {
                    const testStatus = testResults[p.id];
                    const isTesting = testingId === p.id;

                    return (
                      <div
                        key={p.id}
                        className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {p.isLocal ? (
                              <Cpu className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <Cloud className="w-4 h-4 text-blue-500" />
                            )}
                            <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">{p.name}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                              {p.isLocal ? 'Local Offline' : 'Cloud API'}
                            </span>
                          </div>

                          <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
                            <span className="text-zinc-400">{p.enabled ? 'Enabled' : 'Disabled'}</span>
                            <input
                              type="checkbox"
                              checked={p.enabled}
                              onChange={(e) => updateProvider(p.id, { enabled: e.target.checked })}
                              className="w-4 h-4 rounded cursor-pointer"
                            />
                          </label>
                        </div>

                        {/* Config Inputs */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          {/* API Key (if not local without key) */}
                          <div>
                            <label className="block text-zinc-500 mb-1">API Key</label>
                            <input
                              type="password"
                              value={p.apiKey || ''}
                              onChange={(e) => updateProvider(p.id, { apiKey: e.target.value })}
                              placeholder={p.isLocal ? 'Optional for local' : 'Enter API Key (sk-...)'}
                              className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none font-mono text-[11px]"
                            />
                          </div>

                          {/* Base URL (especially for Ollama or Custom) */}
                          <div>
                            <label className="block text-zinc-500 mb-1">Base URL (Endpoint)</label>
                            <input
                              type="text"
                              value={p.baseUrl || ''}
                              onChange={(e) => updateProvider(p.id, { baseUrl: e.target.value })}
                              placeholder="https://api.openai.com/v1"
                              className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none font-mono text-[11px]"
                            />
                          </div>
                        </div>

                        {/* Test Connection Button & Result */}
                        <div className="flex items-center justify-between pt-1 border-t border-zinc-200/50 dark:border-zinc-800/50 text-xs">
                          <button
                            onClick={() => testProviderConnection(p)}
                            disabled={isTesting}
                            className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                          >
                            {isTesting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Key className="w-3 h-3" />}
                            <span>Test Connection</span>
                          </button>

                          {testStatus && (
                            <span
                              className={`flex items-center gap-1 text-[11px] ${
                                testStatus.ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
                              }`}
                            >
                              {testStatus.ok ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                              <span>{testStatus.message}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add Custom Provider */}
                <div>
                  {!isAddCustomOpen ? (
                    <button
                      onClick={() => setIsAddCustomOpen(true)}
                      className="flex items-center gap-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Custom OpenAI-Compatible Provider...</span>
                    </button>
                  ) : (
                    <div className="p-4 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 space-y-3 text-xs">
                      <div className="font-semibold text-sm">Add Custom Provider</div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-zinc-500 mb-1">Provider Name</label>
                          <input
                            type="text"
                            value={customName}
                            onChange={(e) => setCustomName(e.target.value)}
                            placeholder="e.g. My Fast LLM"
                            className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-zinc-500 mb-1">Model Name</label>
                          <input
                            type="text"
                            value={customModel}
                            onChange={(e) => setCustomModel(e.target.value)}
                            placeholder="e.g. llama-3.3-70b"
                            className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 outline-none font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-zinc-500 mb-1">Endpoint Base URL</label>
                          <input
                            type="text"
                            value={customBaseUrl}
                            onChange={(e) => setCustomBaseUrl(e.target.value)}
                            placeholder="https://api.together.xyz/v1"
                            className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 outline-none font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-zinc-500 mb-1">API Key</label>
                          <input
                            type="password"
                            value={customApiKey}
                            onChange={(e) => setCustomApiKey(e.target.value)}
                            placeholder="Optional"
                            className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 outline-none font-mono"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={customIsLocal}
                            onChange={(e) => setCustomIsLocal(e.target.checked)}
                            className="w-4 h-4 rounded"
                          />
                          <span>This is running on my local machine</span>
                        </label>

                        <div className="flex gap-2">
                          <button
                            onClick={() => setIsAddCustomOpen(false)}
                            className="px-3 py-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-500"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleCreateCustom}
                            className="px-3 py-1 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-medium"
                          >
                            Save Provider
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ================= TAB 2: AI PREFERENCES ================= */}
            {settingsTab === 'preferences' && (
              <div className="space-y-5 text-xs">
                <div>
                  <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">AI Preferences</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Configure default temperature, context retrieval, and custom instructions.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block font-semibold mb-1">Default System Prompt</label>
                    <textarea
                      rows={3}
                      value={settings.defaultSystemPrompt}
                      onChange={(e) => updateSettings({ defaultSystemPrompt: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 outline-none leading-relaxed"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold mb-1">
                      <span>Temperature: {settings.temperature}</span>
                      <span className="text-zinc-400">
                        {settings.temperature < 0.4 ? 'Precise & Direct' : settings.temperature > 0.8 ? 'Creative & Exploratory' : 'Balanced'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={settings.temperature}
                      onChange={(e) => updateSettings({ temperature: parseFloat(e.target.value) })}
                      className="w-full cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                    <div>
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100">Automatic Workspace Context</div>
                      <div className="text-zinc-400 text-[11px]">
                        Automatically search notes and pages when chatting with the AI
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.autoContext}
                      onChange={(e) => updateSettings({ autoContext: e.target.checked })}
                      className="w-4 h-4 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ================= TAB 3: USAGE & TOKENS ================= */}
            {settingsTab === 'usage' && (
              <div className="space-y-5 text-xs">
                <div>
                  <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Token & Cost Analytics</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Real-time tracking of token throughput and estimated cost savings with local AI models.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60">
                    <div className="text-zinc-400 text-[11px]">Total Tokens (Session)</div>
                    <div className="text-xl font-bold font-mono mt-1 text-zinc-900 dark:text-zinc-100">18,420</div>
                  </div>

                  <div className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60">
                    <div className="text-zinc-400 text-[11px]">Estimated API Cost</div>
                    <div className="text-xl font-bold font-mono mt-1 text-zinc-900 dark:text-zinc-100">$0.0032</div>
                  </div>

                  <div className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60">
                    <div className="text-zinc-400 text-[11px]">Local AI Savings</div>
                    <div className="text-xl font-bold font-mono mt-1 text-emerald-600 dark:text-emerald-400">100% Free</div>
                  </div>
                </div>
              </div>
            )}

            {/* ================= TAB 4: APPEARANCE & THEME ================= */}
            {settingsTab === 'general' && (
              <div className="space-y-6 text-xs">
                <div>
                  <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Appearance & Theme</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Customize the interface visual theme and workspace identity. Your theme preference persists across all documents and devices.
                  </p>
                </div>

                {/* Theme Selector Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        Interface Theme
                      </label>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        Choose how Anything renders across your workspace
                      </p>
                    </div>

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-medium">
                      Active: {settings.theme === 'system' ? `System (${effectiveTheme})` : settings.theme}
                    </span>
                  </div>

                  {/* 3 Visual Cards for Light, Dark, System */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" role="radiogroup" aria-label="Appearance Theme">
                    {/* Light Theme Card */}
                    <button
                      type="button"
                      id="theme-select-light"
                      role="radio"
                      aria-checked={settings.theme === 'light'}
                      onClick={() => updateSettings({ theme: 'light' })}
                      className={`relative p-3 rounded-2xl border text-left transition-all group flex flex-col justify-between cursor-pointer ${
                        settings.theme === 'light'
                          ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800/90 ring-2 ring-zinc-900/10 dark:ring-zinc-100/20 shadow-xs'
                          : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 hover:border-zinc-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      {/* Mini Mockup Light */}
                      <div className="w-full h-18 rounded-xl bg-zinc-100 p-1.5 border border-zinc-200/80 flex flex-col gap-1 overflow-hidden pointer-events-none mb-3 shadow-xs">
                        <div className="h-3 w-full bg-white rounded-md flex items-center px-1 gap-1 border border-zinc-200/60">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          <div className="w-6 h-1 rounded-full bg-zinc-200" />
                        </div>
                        <div className="flex-1 flex gap-1">
                          <div className="w-6 bg-white rounded-md flex flex-col gap-1 p-1 border border-zinc-200/60">
                            <div className="w-3.5 h-1 rounded-full bg-zinc-300" />
                            <div className="w-2.5 h-1 rounded-full bg-zinc-200" />
                            <div className="w-3 h-1 rounded-full bg-zinc-200" />
                          </div>
                          <div className="flex-1 bg-white rounded-md p-1 flex flex-col gap-1 border border-zinc-200/60">
                            <div className="w-12 h-1.5 rounded-full bg-zinc-700" />
                            <div className="w-full h-1 rounded-full bg-zinc-200" />
                            <div className="w-4/5 h-1 rounded-full bg-zinc-200" />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                            <Sun className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">Light</div>
                            <div className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">Crisp & clear</div>
                          </div>
                        </div>

                        {settings.theme === 'light' && (
                          <CheckCircle2 className="w-4 h-4 text-zinc-900 dark:text-zinc-100 shrink-0 ml-1" />
                        )}
                      </div>
                    </button>

                    {/* Dark Theme Card */}
                    <button
                      type="button"
                      id="theme-select-dark"
                      role="radio"
                      aria-checked={settings.theme === 'dark'}
                      onClick={() => updateSettings({ theme: 'dark' })}
                      className={`relative p-3 rounded-2xl border text-left transition-all group flex flex-col justify-between cursor-pointer ${
                        settings.theme === 'dark'
                          ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800/90 ring-2 ring-zinc-900/10 dark:ring-zinc-100/20 shadow-xs'
                          : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 hover:border-zinc-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      {/* Mini Mockup Dark */}
                      <div className="w-full h-18 rounded-xl bg-zinc-950 p-1.5 border border-zinc-800 flex flex-col gap-1 overflow-hidden pointer-events-none mb-3 shadow-xs">
                        <div className="h-3 w-full bg-zinc-900 rounded-md flex items-center px-1 gap-1 border border-zinc-800">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                          <div className="w-6 h-1 rounded-full bg-zinc-700" />
                        </div>
                        <div className="flex-1 flex gap-1">
                          <div className="w-6 bg-zinc-900 rounded-md flex flex-col gap-1 p-1 border border-zinc-800">
                            <div className="w-3.5 h-1 rounded-full bg-zinc-600" />
                            <div className="w-2.5 h-1 rounded-full bg-zinc-700" />
                            <div className="w-3 h-1 rounded-full bg-zinc-700" />
                          </div>
                          <div className="flex-1 bg-zinc-900 rounded-md p-1 flex flex-col gap-1 border border-zinc-800">
                            <div className="w-12 h-1.5 rounded-full bg-zinc-200" />
                            <div className="w-full h-1 rounded-full bg-zinc-700" />
                            <div className="w-4/5 h-1 rounded-full bg-zinc-700" />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 flex items-center justify-center shrink-0">
                            <Moon className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">Dark</div>
                            <div className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">Night focus</div>
                          </div>
                        </div>

                        {settings.theme === 'dark' && (
                          <CheckCircle2 className="w-4 h-4 text-zinc-900 dark:text-zinc-100 shrink-0 ml-1" />
                        )}
                      </div>
                    </button>

                    {/* System Theme Card */}
                    <button
                      type="button"
                      id="theme-select-system"
                      role="radio"
                      aria-checked={settings.theme === 'system'}
                      onClick={() => updateSettings({ theme: 'system' })}
                      className={`relative p-3 rounded-2xl border text-left transition-all group flex flex-col justify-between cursor-pointer ${
                        settings.theme === 'system'
                          ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800/90 ring-2 ring-zinc-900/10 dark:ring-zinc-100/20 shadow-xs'
                          : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 hover:border-zinc-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      {/* Mini Mockup Split */}
                      <div className="w-full h-18 rounded-xl border border-zinc-200 dark:border-zinc-800 flex overflow-hidden pointer-events-none mb-3 shadow-xs">
                        {/* Light Half */}
                        <div className="w-1/2 bg-zinc-100 p-1.5 flex flex-col gap-1 border-r border-zinc-200 dark:border-zinc-800">
                          <div className="h-3 w-full bg-white rounded-md flex items-center px-1 gap-1 border border-zinc-200/60">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          </div>
                          <div className="flex-1 bg-white rounded-md p-1 flex flex-col gap-1 border border-zinc-200/60">
                            <div className="w-8 h-1.5 rounded-full bg-zinc-700" />
                            <div className="w-full h-1 rounded-full bg-zinc-200" />
                          </div>
                        </div>
                        {/* Dark Half */}
                        <div className="w-1/2 bg-zinc-950 p-1.5 flex flex-col gap-1">
                          <div className="h-3 w-full bg-zinc-900 rounded-md flex items-center px-1 gap-1 border border-zinc-800">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                          </div>
                          <div className="flex-1 bg-zinc-900 rounded-md p-1 flex flex-col gap-1 border border-zinc-800">
                            <div className="w-8 h-1.5 rounded-full bg-zinc-200" />
                            <div className="w-full h-1 rounded-full bg-zinc-700" />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                            <Laptop className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">System</div>
                            <div className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">Auto-sync</div>
                          </div>
                        </div>

                        {settings.theme === 'system' && (
                          <CheckCircle2 className="w-4 h-4 text-zinc-900 dark:text-zinc-100 shrink-0 ml-1" />
                        )}
                      </div>
                    </button>
                  </div>

                  {/* Live Status Description */}
                  <div className="p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <span>
                        {settings.theme === 'system' ? (
                          <>
                            Syncing with device appearance: currently rendering in{' '}
                            <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">
                              {effectiveTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                            </strong>
                            . Automatically adapts if your OS changes.
                          </>
                        ) : settings.theme === 'dark' ? (
                          <>
                            <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">Dark Mode</strong> is locked on across all views and sessions.
                          </>
                        ) : (
                          <>
                            <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">Light Mode</strong> is locked on across all views and sessions.
                          </>
                        )}
                      </span>
                    </div>

                    {settings.theme !== 'system' && (
                      <button
                        type="button"
                        onClick={() => updateSettings({ theme: 'system' })}
                        className="text-[11px] font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 underline shrink-0 ml-2"
                      >
                        Auto-sync with OS
                      </button>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-200/80 dark:border-zinc-800/80 space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Workspace Identity</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div className="sm:col-span-3">
                        <label className="block text-zinc-500 mb-1">Workspace Name</label>
                        <input
                          type="text"
                          value={settings.workspaceName}
                          onChange={(e) => updateSettings({ workspaceName: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-500 mb-1">Icon (Emoji)</label>
                        <input
                          type="text"
                          value={settings.workspaceIcon}
                          onChange={(e) => updateSettings({ workspaceIcon: e.target.value })}
                          className="w-full text-center text-base px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ================= TAB 5: EXPORT & BACKUP ================= */}
            {settingsTab === 'export' && (
              <div className="space-y-5 text-xs">
                <div>
                  <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    Data Portability & Backup
                  </h3>
                  <p className="text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Your data belongs to you. Export the complete workspace as a single JSON file or restore from a backup.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100">Export Full Workspace JSON</div>
                      <div className="text-zinc-400 text-[11px]">Includes all pages, blocks, databases, and settings</div>
                    </div>
                    <button
                      onClick={exportWorkspaceJSON}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-medium"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export JSON</span>
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100">Import Workspace JSON</div>
                      <div className="text-zinc-400 text-[11px]">Restore your workspace from an exported backup file</div>
                    </div>
                    <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-medium cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Select File</span>
                      <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
                    </label>
                  </div>

                  {importStatus && (
                    <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium text-center">
                      {importStatus}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
