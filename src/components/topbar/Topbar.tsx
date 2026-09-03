import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { ModelSelector } from '../ai/ModelSelector';
import { PageStyleMenu } from '../editor/PageStyleMenu';
import {
  Menu,
  Star,
  Search,
  Settings as SettingsIcon,
  Download,
  MessageSquare,
  Sun,
  Moon,
  Laptop,
  Share2,
  FileText,
  FileCode,
  Printer,
  Table,
} from 'lucide-react';

export const Topbar: React.FC = () => {
  const {
    activePage,
    activeDatabase,
    activeViewMode,
    setActiveViewMode,
    sidebarCollapsed,
    setSidebarCollapsed,
    toggleFavorite,
    setIsCommandPaletteOpen,
    setIsSettingsOpen,
    settings,
    updateSettings,
    exportPageMarkdown,
    exportWorkspaceJSON,
    exportDatabaseCSV,
    addChatMessage,
    activeConversationId,
    createConversation,
    effectiveTheme,
  } = useWorkspace();

  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  const handleTriggerAI = (prompt: string) => {
    setActiveViewMode('ai-chat');
    const convId = activeConversationId || createConversation();
    addChatMessage(convId, {
      role: 'user',
      content: prompt,
    });
  };

  const title =
    activeViewMode === 'page'
      ? activePage?.title || 'Untitled Page'
      : activeViewMode === 'database'
      ? activeDatabase?.title || 'Database'
      : activeViewMode === 'ai-chat'
      ? 'AI Workspace Chat'
      : 'Files & Attachments';

  const icon =
    activeViewMode === 'page'
      ? activePage?.icon || '📄'
      : activeViewMode === 'database'
      ? activeDatabase?.icon || '📊'
      : activeViewMode === 'ai-chat'
      ? '💬'
      : '📎';

  const isFav = activeViewMode === 'page' && activePage?.isFavorite;

  const toggleTheme = () => {
    // Cycle: light -> dark -> system
    if (settings.theme === 'light') {
      updateSettings({ theme: 'dark' });
    } else if (settings.theme === 'dark') {
      updateSettings({ theme: 'system' });
    } else {
      updateSettings({ theme: 'light' });
    }
  };

  return (
    <header className="h-12 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md px-4 flex items-center justify-between z-20 shrink-0 sticky top-0">
      {/* Left: Sidebar Toggle & Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          id="sidebar-toggle-btn"
          onClick={() => setSidebarCollapsed((prev) => !prev)}
          className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
          title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 min-w-0">
          <span className="truncate max-w-[120px] hidden sm:inline">{settings.workspaceName}</span>
          <span className="text-zinc-300 dark:text-zinc-700 hidden sm:inline">/</span>
          <div className="flex items-center gap-1.5 font-medium text-zinc-900 dark:text-zinc-100 truncate">
            <span>{icon}</span>
            <span className="truncate max-w-[160px] md:max-w-[240px]">{title}</span>
          </div>
        </div>

        {activeViewMode === 'page' && activePage && (
          <button
            onClick={() => toggleFavorite(activePage.id)}
            className={`p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${
              isFav ? 'text-amber-500 fill-amber-500' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
            }`}
            title={isFav ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
          </button>
        )}
      </div>

      {/* Right: Search, AI Model, Export, Chat, Theme, Settings */}
      <div className="flex items-center gap-2">
        {/* Quick Search */}
        <button
          id="topbar-search-btn"
          onClick={() => setIsCommandPaletteOpen(true)}
          className="hidden md:flex items-center gap-2 px-2.5 py-1 text-xs text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Search or command...</span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded shadow-xs">
            ⌘K
          </kbd>
        </button>

        {/* Global AI Model Selector */}
        <ModelSelector />

        {/* AI Chat drawer toggle */}
        <button
          id="topbar-ai-chat-btn"
          onClick={() => setActiveViewMode(activeViewMode === 'ai-chat' ? 'page' : 'ai-chat')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
            activeViewMode === 'ai-chat'
              ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100'
              : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
          }`}
          title="Open Workspace AI Chat"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">AI Chat</span>
        </button>

        {/* Export Menu */}
        <div className="relative">
          <button
            id="topbar-export-btn"
            onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
            className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors"
            title="Export or Share"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>

          {isExportMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsExportMenuOpen(false)}
              />
              <div className="absolute right-0 mt-1.5 w-48 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl z-50 p-1 text-xs">
              {activeViewMode === 'page' && activePage && (
                <button
                  onClick={() => {
                    exportPageMarkdown(activePage.id);
                    setIsExportMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left text-zinc-700 dark:text-zinc-300"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Export Page as Markdown (.md)</span>
                </button>
              )}

              {activeViewMode === 'database' && activeDatabase && (
                <button
                  onClick={() => {
                    exportDatabaseCSV(activeDatabase.id);
                    setIsExportMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left text-zinc-700 dark:text-zinc-300"
                >
                  <Table className="w-3.5 h-3.5 text-blue-500" />
                  <span>Export Table as CSV (.csv)</span>
                </button>
              )}

              <button
                onClick={() => {
                  exportWorkspaceJSON();
                  setIsExportMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left text-zinc-700 dark:text-zinc-300"
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Export Full Workspace (.json)</span>
              </button>

              <button
                onClick={() => {
                  window.print();
                  setIsExportMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left text-zinc-700 dark:text-zinc-300"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Save as PDF</span>
              </button>
            </div>
          </>
        )}
      </div>

        {/* Page Style Menu (Notion-style ... for typography, width, lock, TOC) */}
        {activeViewMode === 'page' && activePage && (
          <PageStyleMenu onTriggerAI={handleTriggerAI} />
        )}

        {/* Theme Toggle */}
        <button
          id="theme-toggle-btn"
          onClick={toggleTheme}
          className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors flex items-center gap-1"
          title={`Theme: ${
            settings.theme === 'system'
              ? `System (${effectiveTheme === 'dark' ? 'Dark' : 'Light'})`
              : settings.theme === 'dark'
              ? 'Dark'
              : 'Light'
          } (Click to switch)`}
          aria-label="Toggle visual theme"
        >
          {settings.theme === 'light' ? (
            <Sun className="w-3.5 h-3.5 text-amber-500" />
          ) : settings.theme === 'dark' ? (
            <Moon className="w-3.5 h-3.5 text-indigo-400" />
          ) : (
            <Laptop className="w-3.5 h-3.5 text-blue-500" />
          )}
        </button>

        {/* Settings Gear */}
        <button
          id="topbar-settings-btn"
          onClick={() => setIsSettingsOpen(true)}
          className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors"
          title="Workspace & AI Settings"
        >
          <SettingsIcon className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
