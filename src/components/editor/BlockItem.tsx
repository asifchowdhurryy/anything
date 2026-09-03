import React, { useState, useRef, useEffect } from 'react';
import { Block, BlockType } from '../../types/workspace';
import {
  GripVertical,
  Plus,
  Trash2,
  Copy,
  ChevronRight,
  ChevronDown,
  Check,
  Code as CodeIcon,
  Sparkles,
  ExternalLink,
  Sigma,
  MoreHorizontal,
} from 'lucide-react';
import { SlashMenu } from './SlashMenu';

interface BlockItemProps {
  block: Block;
  index: number;
  onUpdate: (updates: Partial<Block>) => void;
  onDelete: () => void;
  onAddBelow: (type?: BlockType) => void;
  onDuplicate: () => void;
  onMove: (direction: 'up' | 'down') => void;
  onAskAI: (text: string) => void;
  autoFocus?: boolean;
}

export const BlockItem: React.FC<BlockItemProps> = ({
  block,
  index,
  onUpdate,
  onDelete,
  onAddBelow,
  onDuplicate,
  onMove,
  onAskAI,
  autoFocus,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSlashMenuOpen, setIsSlashMenuOpen] = useState(false);
  const [slashFilter, setSlashFilter] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [block.content]);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  // Handle content changes & markdown shortcuts
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;

    // Check slash command
    if (val.startsWith('/')) {
      setIsSlashMenuOpen(true);
      setSlashFilter(val);
    } else {
      setIsSlashMenuOpen(false);
    }

    // Markdown triggers
    if (val === '# ') {
      onUpdate({ type: 'heading_1', content: '' });
      return;
    }
    if (val === '## ') {
      onUpdate({ type: 'heading_2', content: '' });
      return;
    }
    if (val === '### ') {
      onUpdate({ type: 'heading_3', content: '' });
      return;
    }
    if (val === '- ' || val === '* ') {
      onUpdate({ type: 'bullet_list', content: '' });
      return;
    }
    if (val === '1. ') {
      onUpdate({ type: 'numbered_list', content: '' });
      return;
    }
    if (val === '[] ' || val === '[ ] ') {
      onUpdate({ type: 'todo', content: '', properties: { checked: false } });
      return;
    }
    if (val === '> ') {
      onUpdate({ type: 'quote', content: '' });
      return;
    }
    if (val === '--- ') {
      onUpdate({ type: 'divider', content: '' });
      return;
    }
    if (val === '``` ') {
      onUpdate({ type: 'code', content: '', properties: { language: 'typescript' } });
      return;
    }

    onUpdate({ content: val });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // If slash menu is open, let SlashMenu handle Enter / Escape
    if (isSlashMenuOpen) {
      if (e.key === 'Escape') {
        setIsSlashMenuOpen(false);
      }
      return;
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      // In code blocks, table, or equation, allow regular new lines
      if (block.type === 'code' || block.type === 'equation') {
        return;
      }
      e.preventDefault();
      onAddBelow(block.type === 'bullet_list' ? 'bullet_list' : block.type === 'numbered_list' ? 'numbered_list' : block.type === 'todo' ? 'todo' : 'paragraph');
    } else if (e.key === 'Backspace' && !block.content) {
      // If empty and not plain paragraph, convert to paragraph first
      if (block.type !== 'paragraph') {
        e.preventDefault();
        onUpdate({ type: 'paragraph' });
      } else {
        e.preventDefault();
        onDelete();
      }
    }
  };

  const handleSlashSelect = (commandId: BlockType | 'ask_ai') => {
    setIsSlashMenuOpen(false);
    if (commandId === 'ask_ai') {
      onAskAI(block.content);
      return;
    }

    if (commandId === 'table') {
      onUpdate({
        type: 'table',
        content: '',
        properties: {
          tableData: [
            ['Column 1', 'Column 2', 'Column 3'],
            ['Row 1', 'Item A', '100'],
            ['Row 2', 'Item B', '250'],
          ],
        },
      });
    } else if (commandId === 'callout') {
      onUpdate({ type: 'callout', content: block.content.replace(/^\/[a-zA-Z0-9]*/, ''), properties: { icon: '💡', color: 'amber' } });
    } else if (commandId === 'code') {
      onUpdate({ type: 'code', content: block.content.replace(/^\/[a-zA-Z0-9]*/, ''), properties: { language: 'typescript' } });
    } else {
      onUpdate({ type: commandId, content: block.content.replace(/^\/[a-zA-Z0-9]*/, '') });
    }
  };

  // Render block content based on type
  const renderBlockContent = () => {
    switch (block.type) {
      case 'heading_1':
        return (
          <textarea
            ref={textareaRef}
            rows={1}
            value={block.content}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            placeholder="Heading 1"
            className="w-full font-bold text-2xl tracking-tight text-zinc-900 dark:text-zinc-50 bg-transparent border-none outline-none resize-none overflow-hidden placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
          />
        );

      case 'heading_2':
        return (
          <textarea
            ref={textareaRef}
            rows={1}
            value={block.content}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            placeholder="Heading 2"
            className="w-full font-semibold text-xl tracking-tight text-zinc-900 dark:text-zinc-100 bg-transparent border-none outline-none resize-none overflow-hidden placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
          />
        );

      case 'heading_3':
        return (
          <textarea
            ref={textareaRef}
            rows={1}
            value={block.content}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            placeholder="Heading 3"
            className="w-full font-medium text-lg text-zinc-900 dark:text-zinc-100 bg-transparent border-none outline-none resize-none overflow-hidden placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
          />
        );

      case 'todo':
        return (
          <div className="flex items-start gap-2.5 w-full">
            <input
              type="checkbox"
              checked={block.properties?.checked || false}
              onChange={(e) =>
                onUpdate({ properties: { ...block.properties, checked: e.target.checked } })
              }
              className="mt-1 w-4 h-4 rounded border-zinc-300 dark:border-zinc-700 text-zinc-900 focus:ring-0 cursor-pointer"
            />
            <textarea
              ref={textareaRef}
              rows={1}
              value={block.content}
              onChange={handleContentChange}
              onKeyDown={handleKeyDown}
              placeholder="To-do item..."
              className={`flex-1 text-sm bg-transparent border-none outline-none resize-none overflow-hidden transition-all ${
                block.properties?.checked
                  ? 'line-through text-zinc-400 dark:text-zinc-600'
                  : 'text-zinc-800 dark:text-zinc-200'
              }`}
            />
          </div>
        );

      case 'bullet_list':
        return (
          <div className="flex items-start gap-2.5 w-full">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-zinc-700 dark:bg-zinc-300 shrink-0" />
            <textarea
              ref={textareaRef}
              rows={1}
              value={block.content}
              onChange={handleContentChange}
              onKeyDown={handleKeyDown}
              placeholder="List item..."
              className="flex-1 text-sm text-zinc-800 dark:text-zinc-200 bg-transparent border-none outline-none resize-none overflow-hidden"
            />
          </div>
        );

      case 'numbered_list':
        return (
          <div className="flex items-start gap-2.5 w-full">
            <span className="font-mono text-xs text-zinc-400 font-medium shrink-0 mt-0.5">
              {index + 1}.
            </span>
            <textarea
              ref={textareaRef}
              rows={1}
              value={block.content}
              onChange={handleContentChange}
              onKeyDown={handleKeyDown}
              placeholder="List item..."
              className="flex-1 text-sm text-zinc-800 dark:text-zinc-200 bg-transparent border-none outline-none resize-none overflow-hidden"
            />
          </div>
        );

      case 'quote':
        return (
          <div className="border-l-3 border-zinc-300 dark:border-zinc-700 pl-3 py-0.5 w-full">
            <textarea
              ref={textareaRef}
              rows={1}
              value={block.content}
              onChange={handleContentChange}
              onKeyDown={handleKeyDown}
              placeholder="Empty quote..."
              className="w-full text-sm italic text-zinc-700 dark:text-zinc-300 bg-transparent border-none outline-none resize-none overflow-hidden"
            />
          </div>
        );

      case 'divider':
        return <hr className="w-full border-zinc-200 dark:border-zinc-800 my-3" />;

      case 'callout':
        return (
          <div className="flex items-start gap-3 w-full p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-zinc-900 dark:text-zinc-100">
            <span className="text-lg select-none">{block.properties?.icon || '💡'}</span>
            <textarea
              ref={textareaRef}
              rows={1}
              value={block.content}
              onChange={handleContentChange}
              onKeyDown={handleKeyDown}
              placeholder="Callout text..."
              className="flex-1 text-sm bg-transparent border-none outline-none resize-none overflow-hidden"
            />
          </div>
        );

      case 'code':
        return (
          <div className="w-full rounded-xl bg-zinc-950 text-zinc-100 border border-zinc-800 overflow-hidden text-xs font-mono shadow-xs">
            <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900/80 border-b border-zinc-800 text-[11px] text-zinc-400">
              <span className="flex items-center gap-1.5">
                <CodeIcon className="w-3.5 h-3.5 text-emerald-400" />
                <select
                  value={block.properties?.language || 'typescript'}
                  onChange={(e) =>
                    onUpdate({ properties: { ...block.properties, language: e.target.value } })
                  }
                  className="bg-transparent text-zinc-300 outline-none cursor-pointer"
                >
                  <option value="typescript" className="bg-zinc-900">TypeScript</option>
                  <option value="javascript" className="bg-zinc-900">JavaScript</option>
                  <option value="python" className="bg-zinc-900">Python</option>
                  <option value="sql" className="bg-zinc-900">SQL</option>
                  <option value="html" className="bg-zinc-900">HTML</option>
                  <option value="json" className="bg-zinc-900">JSON</option>
                </select>
              </span>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(block.content);
                  setCopiedCode(true);
                  setTimeout(() => setCopiedCode(false), 2000);
                }}
                className="flex items-center gap-1 hover:text-zinc-200 transition-colors"
              >
                {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCode ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <textarea
              ref={textareaRef}
              rows={3}
              value={block.content}
              onChange={handleContentChange}
              onKeyDown={handleKeyDown}
              placeholder="// Write code here..."
              className="w-full p-3 text-xs font-mono text-emerald-300 bg-transparent border-none outline-none resize-none leading-relaxed overflow-hidden"
            />
          </div>
        );

      case 'table':
        const tableData = block.properties?.tableData || [
          ['Col 1', 'Col 2'],
          ['Val 1', 'Val 2'],
        ];

        return (
          <div className="w-full overflow-x-auto my-1 border border-zinc-200 dark:border-zinc-800 rounded-xl">
            <table className="w-full text-xs text-left border-collapse">
              <tbody>
                {tableData.map((row, rIdx) => (
                  <tr
                    key={rIdx}
                    className={rIdx === 0 ? 'bg-zinc-100/70 dark:bg-zinc-800/60 font-semibold' : 'border-t border-zinc-200 dark:border-zinc-800'}
                  >
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="p-2 border-r border-zinc-200 dark:border-zinc-800 last:border-r-0 min-w-[100px]">
                        <input
                          type="text"
                          value={cell}
                          onChange={(e) => {
                            const newTable = tableData.map((r) => [...r]);
                            newTable[rIdx][cIdx] = e.target.value;
                            onUpdate({ properties: { ...block.properties, tableData: newTable } });
                          }}
                          className="w-full bg-transparent outline-none text-zinc-800 dark:text-zinc-200"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-1.5 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex gap-2 text-[10px]">
              <button
                onClick={() => {
                  const newTable = [...tableData, new Array(tableData[0].length).fill('')];
                  onUpdate({ properties: { ...block.properties, tableData: newTable } });
                }}
                className="px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
              >
                + Add Row
              </button>
              <button
                onClick={() => {
                  const newTable = tableData.map((r) => [...r, '']);
                  onUpdate({ properties: { ...block.properties, tableData: newTable } });
                }}
                className="px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
              >
                + Add Column
              </button>
            </div>
          </div>
        );

      case 'equation':
        return (
          <div className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 my-1">
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 mb-1">
              <Sigma className="w-3.5 h-3.5 text-indigo-500" />
              <span>LaTeX / TeX Formula:</span>
            </div>
            <textarea
              ref={textareaRef}
              rows={1}
              value={block.content}
              onChange={handleContentChange}
              onKeyDown={handleKeyDown}
              placeholder="e.g. \sum_{i=1}^n x_i^2"
              className="w-full font-mono text-xs text-indigo-600 dark:text-indigo-400 bg-transparent border-none outline-none resize-none"
            />
            {block.content && (
              <div className="mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-800 text-center font-serif text-sm text-zinc-900 dark:text-zinc-100">
                {block.content}
              </div>
            )}
          </div>
        );

      case 'bookmark':
        return (
          <div className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <input
                type="text"
                value={block.content}
                onChange={(e) => onUpdate({ content: e.target.value })}
                placeholder="https://example.com"
                className="w-full font-medium text-xs text-blue-600 dark:text-blue-400 bg-transparent outline-none truncate"
              />
              <div className="text-[11px] text-zinc-400">Web Bookmark Link</div>
            </div>
            <a
              href={block.content.startsWith('http') ? block.content : `https://${block.content}`}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        );

      default: // paragraph
        return (
          <textarea
            ref={textareaRef}
            rows={1}
            value={block.content}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            placeholder="Type '/' for commands or ask AI..."
            className="w-full text-sm leading-relaxed text-zinc-800 dark:text-zinc-200 bg-transparent border-none outline-none resize-none overflow-hidden placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
          />
        );
    }
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsMenuOpen(false);
      }}
      className="group relative flex items-start -ml-8 pl-8 py-1 hover:bg-zinc-50/70 dark:hover:bg-zinc-900/40 rounded-lg transition-colors"
    >
      {/* Action Handle on Left */}
      <div
        className={`absolute left-0 top-1.5 flex items-center gap-0.5 transition-opacity ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <button
          onClick={() => onAddBelow()}
          className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
          title="Add block below"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>

        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-grab active:cursor-grabbing transition-colors"
            title="Drag or open block options"
          >
            <GripVertical className="w-3.5 h-3.5" />
          </button>

          {/* Block Menu Dropdown */}
          {isMenuOpen && (
            <div className="absolute left-6 top-0 w-44 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl rounded-xl p-1 z-30 text-xs">
              <button
                onClick={() => {
                  onAskAI(block.content);
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 font-medium"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask AI on Block</span>
              </button>

              <button
                onClick={() => {
                  onDuplicate();
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Duplicate</span>
              </button>

              <button
                onClick={() => {
                  onDelete();
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Block</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Actual Block Content */}
      <div className="flex-1 min-w-0 relative">
        {renderBlockContent()}

        {/* Slash Menu */}
        {isSlashMenuOpen && (
          <SlashMenu
            filterText={slashFilter}
            onSelect={handleSlashSelect}
            onClose={() => setIsSlashMenuOpen(false)}
          />
        )}
      </div>
    </div>
  );
};
