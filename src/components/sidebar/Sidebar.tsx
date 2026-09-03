import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import {
  Search,
  MessageSquare,
  FileText,
  Database as DatabaseIcon,
  Settings as SettingsIcon,
  Plus,
  ChevronRight,
  ChevronDown,
  Trash2,
  Star,
  FolderOpen,
  Sparkles,
  Cpu,
  Layers,
  MoreHorizontal,
  LayoutTemplate,
  UploadCloud,
  Copy,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    pages,
    activePageId,
    setActivePageId,
    databases,
    activeDatabaseId,
    setActiveDatabaseId,
    activeViewMode,
    setActiveViewMode,
    sidebarCollapsed,
    createPage,
    duplicatePage,
    deletePage,
    toggleFavorite,
    trashPages,
    setIsTrashOpen,
    setIsTemplatesOpen,
    setIsImportMarkdownOpen,
    createDatabase,
    deleteDatabase,
    setIsCommandPaletteOpen,
    setIsSettingsOpen,
    settings,
    providers,
  } = useWorkspace();

  const [expandedPages, setExpandedPages] = useState<Record<string, boolean>>({
    'page-welcome': true,
  });

  const [pageMenuOpen, setPageMenuOpen] = useState<string | null>(null);

  const toggleExpand = (pageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedPages((prev) => ({ ...prev, [pageId]: !prev[pageId] }));
  };

  const favoritePages = pages.filter((p) => p.isFavorite);
  const rootPages = pages.filter((p) => !p.parentId);

  const localProvider = providers.find((p) => p.isLocal && p.enabled);

  if (sidebarCollapsed) {
    return null;
  }

  const renderPageItem = (page: typeof pages[0], depth = 0) => {
    const subpages = pages.filter((p) => p.parentId === page.id);
    const hasSubpages = subpages.length > 0;
    const isExpanded = expandedPages[page.id] ?? false;
    const isActive = activeViewMode === 'page' && activePageId === page.id;

    return (
      <div key={page.id} className="group/item relative">
        <div
          onClick={() => {
            setActivePageId(page.id);
            setActiveViewMode('page');
          }}
          style={{ paddingLeft: `${depth * 14 + 10}px` }}
          className={`group flex items-center justify-between pr-2 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
            isActive
              ? 'bg-zinc-200/80 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            {hasSubpages ? (
              <button
                onClick={(e) => toggleExpand(page.id, e)}
                className="p-0.5 rounded hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-400"
              >
                {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              </button>
            ) : (
              <span className="w-3 h-3 inline-block" />
            )}

            <span className="text-sm shrink-0">{page.icon || '📄'}</span>
            <span className="truncate">{page.title || 'Untitled'}</span>
          </div>

          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 shrink-0 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                createPage(page.id);
                setExpandedPages((prev) => ({ ...prev, [page.id]: true }));
              }}
              className="p-0.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              title="Add subpage"
            >
              <Plus className="w-3 h-3" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setPageMenuOpen(pageMenuOpen === page.id ? null : page.id);
              }}
              className="p-0.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            >
              <MoreHorizontal className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Page Context Menu */}
        {pageMenuOpen === page.id && (
          <>
            <div
              className="fixed inset-0 z-20"
              onClick={(e) => {
                e.stopPropagation();
                setPageMenuOpen(null);
              }}
            />
            <div className="absolute right-2 top-7 w-36 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl rounded-lg p-1 z-30 text-xs">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(page.id);
                  setPageMenuOpen(null);
                }}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-left text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <Star className="w-3 h-3" />
                <span>{page.isFavorite ? 'Unfavorite' : 'Favorite'}</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  duplicatePage(page.id);
                  setPageMenuOpen(null);
                }}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-left text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <Copy className="w-3 h-3" />
                <span>Duplicate</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deletePage(page.id);
                  setPageMenuOpen(null);
                }}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete</span>
              </button>
            </div>
          </>
        )}

        {/* Nested Subpages */}
        {hasSubpages && isExpanded && (
          <div className="flex flex-col">{subpages.map((sub) => renderPageItem(sub, depth + 1))}</div>
        )}
      </div>
    );
  };

  return (
    <aside className="w-64 h-screen bg-zinc-50 dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col shrink-0 select-none z-10">
      {/* Workspace Brand / Header */}
      <div className="p-3 border-b border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center text-sm font-semibold shadow-xs">
            {settings.workspaceIcon || '🌌'}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
              {settings.workspaceName}
            </div>
            <div className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate flex items-center gap-1">
              <span>Universal AI Workspace</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Action Links */}
      <div className="p-2 space-y-0.5 border-b border-zinc-200/60 dark:border-zinc-800/60">
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-zinc-400" />
            <span>Search</span>
          </div>
          <kbd className="text-[10px] font-mono px-1 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-500">⌘K</kbd>
        </button>

        <button
          onClick={() => setActiveViewMode('ai-chat')}
          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
            activeViewMode === 'ai-chat'
              ? 'bg-zinc-200/80 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>AI Assistant</span>
          </div>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-medium">
            Universal
          </span>
        </button>

        <button
          onClick={() => setActiveViewMode('files')}
          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
            activeViewMode === 'files'
              ? 'bg-zinc-200/80 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <FolderOpen className="w-3.5 h-3.5 text-zinc-400" />
            <span>Files & Context</span>
          </div>
        </button>

        <button
          onClick={() => setIsTemplatesOpen(true)}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <div className="flex items-center gap-2">
            <LayoutTemplate className="w-3.5 h-3.5 text-zinc-400" />
            <span>Templates</span>
          </div>
          <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-medium">
            Notion Hub
          </span>
        </button>

        <button
          onClick={() => setIsImportMarkdownOpen(true)}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <div className="flex items-center gap-2">
            <UploadCloud className="w-3.5 h-3.5 text-zinc-400" />
            <span>Import Note</span>
          </div>
          <span className="text-[9px] text-zinc-400 font-mono">.md</span>
        </button>

        <button
          onClick={() => setIsTrashOpen(true)}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Trash2 className="w-3.5 h-3.5 text-zinc-400" />
            <span>Trash Bin</span>
          </div>
          {trashPages.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-semibold">
              {trashPages.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setIsSettingsOpen(true)}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-3.5 h-3.5 text-zinc-400" />
            <span>Settings & Keys</span>
          </div>
        </button>
      </div>

      {/* Main Navigation Scroll Area */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {/* Favorites Section */}
        {favoritePages.length > 0 && (
          <div>
            <div className="px-2 mb-1 text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1">
              <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
              <span>Favorites</span>
            </div>
            <div className="space-y-0.5">
              {favoritePages.map((page) => (
                <div
                  key={`fav-${page.id}`}
                  onClick={() => {
                    setActivePageId(page.id);
                    setActiveViewMode('page');
                  }}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                    activeViewMode === 'page' && activePageId === page.id
                      ? 'bg-zinc-200/80 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span className="text-sm shrink-0">{page.icon || '📄'}</span>
                  <span className="truncate">{page.title || 'Untitled'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Workspace Pages Tree */}
        <div>
          <div className="px-2 mb-1 text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center justify-between">
            <span>Pages</span>
            <button
              onClick={() => createPage(null)}
              className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              title="Add new page"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-0.5">{rootPages.map((page) => renderPageItem(page, 0))}</div>
        </div>

        {/* Databases Section */}
        <div>
          <div className="px-2 mb-1 text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center justify-between">
            <span>Databases</span>
            <button
              onClick={createDatabase}
              className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              title="Add database"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-0.5">
            {databases.map((db) => {
              const isActive = activeViewMode === 'database' && activeDatabaseId === db.id;
              return (
                <div
                  key={db.id}
                  onClick={() => {
                    setActiveDatabaseId(db.id);
                    setActiveViewMode('database');
                  }}
                  className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-zinc-200/80 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm shrink-0">{db.icon || '📊'}</span>
                    <span className="truncate">{db.title}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteDatabase(db.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-400 hover:text-rose-500 transition-opacity"
                    title="Delete database"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer / Status Area */}
      <div className="p-3 border-t border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/50">
        <div className="flex items-center justify-between text-[11px] mb-2">
          <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${localProvider ? 'bg-emerald-500' : 'bg-blue-500'}`} />
            <span>{localProvider ? 'Local AI Ready' : 'Cloud AI Ready'}</span>
          </span>
          <button
            onClick={() => createPage(null)}
            className="flex items-center gap-1 text-zinc-700 dark:text-zinc-300 font-medium hover:text-black dark:hover:text-white"
          >
            <Plus className="w-3 h-3" />
            <span>Page</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
