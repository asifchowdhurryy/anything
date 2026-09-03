import React, { useEffect, useState } from 'react';
import { Sparkles, Bold, Italic, Code, Strikethrough, Link as LinkIcon } from 'lucide-react';

interface SelectionToolbarProps {
  onAskAI: (selectedText: string) => void;
  onFormat: (command: string, value?: string) => void;
}

export const SelectionToolbar: React.FC<SelectionToolbarProps> = ({ onAskAI, onFormat }) => {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [selectedText, setSelectedText] = useState<string>('');

  useEffect(() => {
    function handleSelectionChange() {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        setPosition(null);
        setSelectedText('');
        return;
      }

      const text = selection.toString().trim();
      if (!text || text.length < 2) {
        setPosition(null);
        setSelectedText('');
        return;
      }

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      // Only show if selection is within the editor
      if (rect.width > 0 && rect.height > 0) {
        setSelectedText(text);
        setPosition({
          top: Math.max(10, rect.top - 46),
          left: Math.max(10, rect.left + rect.width / 2 - 120),
        });
      }
    }

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

  if (!position || !selectedText) return null;

  return (
    <div
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
      className="fixed z-50 flex items-center gap-0.5 bg-zinc-900 text-white dark:bg-zinc-800 border border-zinc-700/80 shadow-2xl rounded-xl px-1 py-1 text-xs select-none animate-in fade-in zoom-in-95 duration-100"
    >
      {/* Ask AI button */}
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          onAskAI(selectedText);
        }}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500/20 to-purple-500/20 hover:from-amber-500/30 hover:to-purple-500/30 text-amber-300 font-semibold transition-all"
      >
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <span>Ask AI</span>
      </button>

      <div className="w-[1px] h-4 bg-zinc-700 mx-1" />

      {/* Bold */}
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          document.execCommand('bold');
        }}
        className="p-1.5 rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-300 hover:text-white"
        title="Bold (Cmd+B)"
      >
        <Bold className="w-3.5 h-3.5" />
      </button>

      {/* Italic */}
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          document.execCommand('italic');
        }}
        className="p-1.5 rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-300 hover:text-white"
        title="Italic (Cmd+I)"
      >
        <Italic className="w-3.5 h-3.5" />
      </button>

      {/* Strikethrough */}
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          document.execCommand('strikeThrough');
        }}
        className="p-1.5 rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-300 hover:text-white"
        title="Strikethrough"
      >
        <Strikethrough className="w-3.5 h-3.5" />
      </button>

      {/* Code inline */}
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          document.execCommand('formatBlock', false, 'pre');
        }}
        className="p-1.5 rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-300 hover:text-white"
        title="Inline Code"
      >
        <Code className="w-3.5 h-3.5" />
      </button>

      {/* Link */}
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          const url = prompt('Enter URL:');
          if (url) document.execCommand('createLink', false, url);
        }}
        className="p-1.5 rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-300 hover:text-white"
        title="Add Link"
      >
        <LinkIcon className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
