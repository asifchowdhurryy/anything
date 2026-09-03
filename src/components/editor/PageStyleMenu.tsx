import React, { useState, useRef, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import {
  MoreHorizontal,
  Type,
  Maximize2,
  Minimize2,
  Lock,
  Unlock,
  Copy,
  Trash2,
  ListCollapse,
  Sparkles,
  Check,
  Languages,
  Clock,
  FileText,
} from 'lucide-react';

export const PageStyleMenu: React.FC<{
  onTriggerAI: (prompt: string) => void;
}> = ({ onTriggerAI }) => {
  const {
    activePage,
    updatePage,
    duplicatePage,
    deletePage,
    isOutlineOpen,
    setIsOutlineOpen,
  } = useWorkspace();

  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (!activePage) return null;

  const fontFamily = activePage.fontFamily || 'sans';
  const smallText = !!activePage.smallText;
  const fullWidth = !!activePage.fullWidth;
  const isLocked = !!activePage.isLocked;

  const totalWords = activePage.blocks.reduce(
    (acc, b) => acc + (b.content ? b.content.trim().split(/\s+/).length : 0),
    0
  );
  const readingTime = Math.max(1, Math.ceil(totalWords / 200));

  return (
    <div className="relative" ref={menuRef}>
      <button
        id="page-style-menu-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors"
        title="Page style & settings"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-3 z-50 text-xs text-zinc-800 dark:text-zinc-200 animate-in fade-in-50 zoom-in-95 duration-100">
          {/* Typography section */}
          <div className="mb-3">
            <div className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5 px-1">
              Typography
            </div>
            <div className="grid grid-cols-3 gap-1.5 bg-zinc-100 dark:bg-zinc-800/60 p-1 rounded-xl">
              <button
                onClick={() => updatePage(activePage.id, { fontFamily: 'sans' })}
                className={`py-1.5 text-xs rounded-lg font-sans transition-colors ${
                  fontFamily === 'sans'
                    ? 'bg-white dark:bg-zinc-900 shadow-xs font-semibold text-zinc-900 dark:text-zinc-50'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                Default
              </button>
              <button
                onClick={() => updatePage(activePage.id, { fontFamily: 'serif' })}
                className={`py-1.5 text-xs rounded-lg font-serif transition-colors ${
                  fontFamily === 'serif'
                    ? 'bg-white dark:bg-zinc-900 shadow-xs font-semibold text-zinc-900 dark:text-zinc-50'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                Serif
              </button>
              <button
                onClick={() => updatePage(activePage.id, { fontFamily: 'mono' })}
                className={`py-1.5 text-xs rounded-lg font-mono text-[11px] transition-colors ${
                  fontFamily === 'mono'
                    ? 'bg-white dark:bg-zinc-900 shadow-xs font-semibold text-zinc-900 dark:text-zinc-50'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                Mono
              </button>
            </div>
          </div>

          {/* Layout switches */}
          <div className="space-y-1 py-1 border-t border-zinc-100 dark:border-zinc-800">
            <button
              onClick={() => updatePage(activePage.id, { smallText: !smallText })}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Type className="w-3.5 h-3.5 text-zinc-400" />
                <span>Small text</span>
              </span>
              <div
                className={`w-7 h-4 rounded-full transition-colors relative ${
                  smallText ? 'bg-blue-600' : 'bg-zinc-300 dark:bg-zinc-700'
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-transform ${
                    smallText ? 'left-3.5' : 'left-0.5'
                  }`}
                />
              </div>
            </button>

            <button
              onClick={() => updatePage(activePage.id, { fullWidth: !fullWidth })}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Maximize2 className="w-3.5 h-3.5 text-zinc-400" />
                <span>Full width</span>
              </span>
              <div
                className={`w-7 h-4 rounded-full transition-colors relative ${
                  fullWidth ? 'bg-blue-600' : 'bg-zinc-300 dark:bg-zinc-700'
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-transform ${
                    fullWidth ? 'left-3.5' : 'left-0.5'
                  }`}
                />
              </div>
            </button>

            <button
              onClick={() => updatePage(activePage.id, { isLocked: !isLocked })}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors"
            >
              <span className="flex items-center gap-2">
                {isLocked ? <Lock className="w-3.5 h-3.5 text-amber-500" /> : <Unlock className="w-3.5 h-3.5 text-zinc-400" />}
                <span>Lock page</span>
              </span>
              <div
                className={`w-7 h-4 rounded-full transition-colors relative ${
                  isLocked ? 'bg-amber-500' : 'bg-zinc-300 dark:bg-zinc-700'
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-transform ${
                    isLocked ? 'left-3.5' : 'left-0.5'
                  }`}
                />
              </div>
            </button>

            <button
              onClick={() => {
                setIsOutlineOpen(!isOutlineOpen);
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors"
            >
              <span className="flex items-center gap-2">
                <ListCollapse className="w-3.5 h-3.5 text-zinc-400" />
                <span>Table of Contents</span>
              </span>
              {isOutlineOpen && <Check className="w-3.5 h-3.5 text-blue-600" />}
            </button>
          </div>

          {/* Quick AI Page Assistants */}
          <div className="py-2 border-t border-zinc-100 dark:border-zinc-800">
            <div className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5 px-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>AI Page Actions</span>
            </div>

            <button
              onClick={() => {
                onTriggerAI('Summarize the key points of this entire page concisely.');
                setIsOpen(false);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 flex items-center gap-2"
            >
              <FileText className="w-3.5 h-3.5 text-amber-500" />
              <span>Summarize page</span>
            </button>

            <button
              onClick={() => {
                onTriggerAI('Extract all action items, decisions, and todos from this page into a structured checklist.');
                setIsOpen(false);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 flex items-center gap-2"
            >
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span>Extract action items</span>
            </button>

            <button
              onClick={() => {
                onTriggerAI('Translate the text of this page into clear Spanish, French, and German summaries.');
                setIsOpen(false);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 flex items-center gap-2"
            >
              <Languages className="w-3.5 h-3.5 text-blue-500" />
              <span>Translate page...</span>
            </button>
          </div>

          {/* Page Management */}
          <div className="py-1 border-t border-zinc-100 dark:border-zinc-800 space-y-0.5">
            <button
              onClick={() => {
                duplicatePage(activePage.id);
                setIsOpen(false);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 flex items-center gap-2"
            >
              <Copy className="w-3.5 h-3.5 text-zinc-400" />
              <span>Duplicate page</span>
            </button>

            <button
              onClick={() => {
                deletePage(activePage.id);
                setIsOpen(false);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center gap-2"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete (Move to Trash)</span>
            </button>
          </div>

          {/* Page Stats Footer */}
          <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-[10px] text-zinc-400 flex items-center justify-between px-1">
            <span>{totalWords} words • {readingTime} min read</span>
            <span>{activePage.blocks.length} blocks</span>
          </div>
        </div>
      )}
    </div>
  );
};
