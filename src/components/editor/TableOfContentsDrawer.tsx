import React from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { ListCollapse, X, ChevronRight, Hash } from 'lucide-react';

export const TableOfContentsDrawer: React.FC = () => {
  const { activePage, isOutlineOpen, setIsOutlineOpen } = useWorkspace();

  if (!isOutlineOpen || !activePage) return null;

  const headings = activePage.blocks.filter(
    (b) => b.type === 'heading_1' || b.type === 'heading_2' || b.type === 'heading_3'
  );

  const scrollToBlock = (blockId: string) => {
    const el = document.getElementById(`block-${blockId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      el.classList.add('ring-2', 'ring-blue-400', 'transition-all');
      setTimeout(() => {
        el.classList.remove('ring-2', 'ring-blue-400');
      }, 1200);
    }
  };

  return (
    <div className="fixed right-6 top-16 z-40 w-72 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl p-4 animate-in slide-in-from-right-2 duration-150 text-zinc-900 dark:text-zinc-100">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
          <ListCollapse className="w-4 h-4 text-blue-500" />
          <span>Table of Contents</span>
        </div>
        <button
          onClick={() => setIsOutlineOpen(false)}
          className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="max-h-[60vh] overflow-y-auto space-y-1 text-xs">
        {headings.length === 0 ? (
          <p className="text-zinc-400 dark:text-zinc-500 text-[11px] py-4 text-center">
            No headings found on this page. Add H1, H2, or H3 blocks to generate an outline.
          </p>
        ) : (
          headings.map((h) => {
            const indent =
              h.type === 'heading_1' ? 'pl-1 font-semibold text-zinc-900 dark:text-zinc-100' :
              h.type === 'heading_2' ? 'pl-4 text-zinc-700 dark:text-zinc-300' :
              'pl-7 text-zinc-500 dark:text-zinc-400 text-[11px]';

            return (
              <button
                key={h.id}
                onClick={() => scrollToBlock(h.id)}
                className={`w-full text-left py-1.5 px-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors flex items-center gap-1.5 truncate ${indent}`}
              >
                <Hash className="w-3 h-3 text-zinc-300 dark:text-zinc-600 shrink-0" />
                <span className="truncate">{h.content || 'Untitled Heading'}</span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
