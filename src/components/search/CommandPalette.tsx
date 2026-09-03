import React, { useState, useEffect, useRef } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import {
  Search,
  FileText,
  Database,
  Sparkles,
  Plus,
  Settings,
  Download,
  Moon,
  Sun,
  Laptop,
  ChevronRight,
} from 'lucide-react';

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    searchQuery,
    setSearchQuery,
    searchResults,
    setActivePageId,
    setActiveDatabaseId,
    setActiveViewMode,
    createPage,
    createDatabase,
    setIsSettingsOpen,
    setSettingsTab,
    exportWorkspaceJSON,
    settings,
    updateSettings,
  } = useWorkspace();

  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global keyboard shortcut Cmd+K / Ctrl+K
  useEffect(() => {
    function handleGlobalKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(!isCommandPaletteOpen);
      }
    }
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isCommandPaletteOpen, setIsCommandPaletteOpen]);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setSearchQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen, setSearchQuery]);

  if (!isCommandPaletteOpen) return null;

  const quickActions = [
    {
      id: 'new_page',
      title: 'Create new page',
      icon: <Plus className="w-4 h-4 text-blue-500" />,
      run: () => {
        createPage(null);
        setIsCommandPaletteOpen(false);
      },
    },
    {
      id: 'new_db',
      title: 'Create new database',
      icon: <Database className="w-4 h-4 text-emerald-500" />,
      run: () => {
        createDatabase();
        setIsCommandPaletteOpen(false);
      },
    },
    {
      id: 'open_ai',
      title: 'Open Universal AI Assistant',
      icon: <Sparkles className="w-4 h-4 text-amber-500" />,
      run: () => {
        setActiveViewMode('ai-chat');
        setIsCommandPaletteOpen(false);
      },
    },
    {
      id: 'open_settings',
      title: 'Configure AI Provider API Keys',
      icon: <Settings className="w-4 h-4 text-purple-500" />,
      run: () => {
        setSettingsTab('providers');
        setIsSettingsOpen(true);
        setIsCommandPaletteOpen(false);
      },
    },
    {
      id: 'export_json',
      title: 'Export full workspace to JSON',
      icon: <Download className="w-4 h-4 text-zinc-500" />,
      run: () => {
        exportWorkspaceJSON();
        setIsCommandPaletteOpen(false);
      },
    },
    {
      id: 'theme_light',
      title: 'Set Theme: Light',
      icon: <Sun className="w-4 h-4 text-amber-500" />,
      run: () => {
        updateSettings({ theme: 'light' });
        setIsCommandPaletteOpen(false);
      },
    },
    {
      id: 'theme_dark',
      title: 'Set Theme: Dark',
      icon: <Moon className="w-4 h-4 text-indigo-400" />,
      run: () => {
        updateSettings({ theme: 'dark' });
        setIsCommandPaletteOpen(false);
      },
    },
    {
      id: 'theme_system',
      title: 'Set Theme: System (Auto-sync with OS)',
      icon: <Laptop className="w-4 h-4 text-blue-500" />,
      run: () => {
        updateSettings({ theme: 'system' });
        setIsCommandPaletteOpen(false);
      },
    },
  ];

  const handleSelectResult = (res: typeof searchResults[0]) => {
    if (res.pageId) {
      setActivePageId(res.pageId);
      setActiveViewMode('page');
    } else if (res.databaseId) {
      setActiveDatabaseId(res.databaseId);
      setActiveViewMode('database');
    }
    setIsCommandPaletteOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const listLength = searchResults.length || quickActions.length;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % listLength);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + listLength) % listLength);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (searchResults.length > 0) {
        handleSelectResult(searchResults[selectedIndex]);
      } else if (quickActions[selectedIndex]) {
        quickActions[selectedIndex].run();
      }
    } else if (e.key === 'Escape') {
      setIsCommandPaletteOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-start justify-center pt-24 p-4 z-50">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 flex flex-col">
        {/* Search Input */}
        <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
          <Search className="w-4 h-4 text-zinc-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search pages, notes, tasks, or type a command..."
            className="w-full text-xs text-zinc-900 dark:text-zinc-100 bg-transparent border-none outline-none placeholder:text-zinc-400"
          />
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700 text-zinc-400">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 text-xs">
          {searchResults.length > 0 ? (
            <div className="space-y-0.5">
              <div className="px-2 py-1 text-[10px] font-semibold text-zinc-400 uppercase">Search Results</div>
              {searchResults.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <button
                    key={`${item.type}-${item.id}`}
                    onClick={() => handleSelectResult(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors ${
                      isSelected
                        ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                        : 'text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-sm shrink-0">{item.icon}</span>
                      <div className="min-w-0">
                        <div className="font-medium truncate">{item.title}</div>
                        {item.subtitle && <div className="text-[10px] text-zinc-400 truncate">{item.subtitle}</div>}
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  </button>
                );
              })}
            </div>
          ) : searchQuery ? (
            <div className="p-8 text-center text-zinc-400">No results found for "{searchQuery}"</div>
          ) : (
            <div className="space-y-0.5">
              <div className="px-2 py-1 text-[10px] font-semibold text-zinc-400 uppercase">Quick Actions</div>
              {quickActions.map((action, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <button
                    key={action.id}
                    onClick={action.run}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors ${
                      isSelected
                        ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                        : 'text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800">{action.icon}</div>
                      <span className="font-medium">{action.title}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
