import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Trash2, RotateCcw, X, Search, AlertCircle, FileText } from 'lucide-react';

export const TrashModal: React.FC = () => {
  const {
    isTrashOpen,
    setIsTrashOpen,
    trashPages,
    restorePage,
    permanentlyDeletePage,
    emptyTrash,
  } = useWorkspace();

  const [searchQuery, setSearchQuery] = useState('');
  const [confirmEmpty, setConfirmEmpty] = useState(false);

  if (!isTrashOpen) return null;

  const filteredTrash = trashPages.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.page.title.toLowerCase().includes(q) ||
      item.page.blocks.some((b) => b.content.toLowerCase().includes(q))
    );
  });

  const formatTimeAgo = (iso: string) => {
    const diffMs = Date.now() - new Date(iso).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-zinc-900 dark:text-zinc-100 max-h-[80vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-zinc-50/50 dark:bg-zinc-950/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Trash2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Trash Bin</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Restore accidentally deleted pages or permanently purge them
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {trashPages.length > 0 && (
              <>
                {confirmEmpty ? (
                  <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/40 px-2 py-1 rounded-lg border border-rose-200 dark:border-rose-900">
                    <span className="text-[11px] text-rose-600 dark:text-rose-400">Are you sure?</span>
                    <button
                      onClick={() => {
                        emptyTrash();
                        setConfirmEmpty(false);
                      }}
                      className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-medium"
                    >
                      Yes, Empty
                    </button>
                    <button
                      onClick={() => setConfirmEmpty(false)}
                      className="px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[10px]"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmEmpty(true)}
                    className="px-2.5 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg font-medium transition-colors"
                  >
                    Empty Trash
                  </button>
                )}
              </>
            )}

            <button
              onClick={() => setIsTrashOpen(false)}
              className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search deleted pages by title or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
            />
          </div>
        </div>

        {/* List of Deleted Pages */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-zinc-100 dark:divide-zinc-800/60">
          {filteredTrash.length === 0 ? (
            <div className="py-16 text-center text-zinc-400 dark:text-zinc-500 text-xs flex flex-col items-center">
              <FileText className="w-10 h-10 mb-2 stroke-1 text-zinc-300 dark:text-zinc-700" />
              <p className="font-medium">Trash is empty</p>
              <p className="text-[11px] text-zinc-400 mt-1">
                Pages you delete will appear here so you can restore them anytime.
              </p>
            </div>
          ) : (
            filteredTrash.map((item) => (
              <div
                key={item.id}
                className="py-3 flex items-center justify-between gap-4 group hover:bg-zinc-50 dark:hover:bg-zinc-800/30 px-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xl shrink-0 p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800">
                    {item.page.icon || '📄'}
                  </span>
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                      {item.page.title || 'Untitled Page'}
                    </h4>
                    <p className="text-[11px] text-zinc-400">
                      Deleted {formatTimeAgo(item.deletedAt)} • {item.page.blocks.length} blocks
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => restorePage(item.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-medium hover:opacity-90 transition-opacity"
                    title="Restore back to workspace"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore</span>
                  </button>

                  <button
                    onClick={() => permanentlyDeletePage(item.id)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    title="Delete permanently"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
