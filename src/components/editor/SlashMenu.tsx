import React, { useState, useEffect, useRef } from 'react';
import { BlockType } from '../../types/workspace';
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  CheckSquare,
  List,
  ListOrdered,
  Quote,
  Minus,
  Code,
  AlertCircle,
  ChevronRight,
  Table,
  Sparkles,
  Bookmark,
  Sigma,
} from 'lucide-react';

interface SlashCommandItem {
  id: BlockType | 'ask_ai';
  label: string;
  description: string;
  icon: React.ReactNode;
  category: 'AI' | 'Basic' | 'Lists' | 'Media & Code';
}

const COMMANDS: SlashCommandItem[] = [
  {
    id: 'ask_ai',
    label: 'Ask AI',
    description: 'Draft ideas, write outlines, or generate blocks with AI',
    icon: <Sparkles className="w-4 h-4 text-amber-500" />,
    category: 'AI',
  },
  {
    id: 'paragraph',
    label: 'Text',
    description: 'Plain text paragraph with rich formatting',
    icon: <Type className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />,
    category: 'Basic',
  },
  {
    id: 'heading_1',
    label: 'Heading 1',
    description: 'Large section heading (#)',
    icon: <Heading1 className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />,
    category: 'Basic',
  },
  {
    id: 'heading_2',
    label: 'Heading 2',
    description: 'Medium sub-section heading (##)',
    icon: <Heading2 className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />,
    category: 'Basic',
  },
  {
    id: 'heading_3',
    label: 'Heading 3',
    description: 'Small group heading (###)',
    icon: <Heading3 className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />,
    category: 'Basic',
  },
  {
    id: 'todo',
    label: 'To-do List',
    description: 'Track tasks with interactive checkboxes ([] )',
    icon: <CheckSquare className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />,
    category: 'Lists',
  },
  {
    id: 'bullet_list',
    label: 'Bulleted List',
    description: 'Create a simple bulleted list (- or *)',
    icon: <List className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />,
    category: 'Lists',
  },
  {
    id: 'numbered_list',
    label: 'Numbered List',
    description: 'Create an ordered sequence (1. )',
    icon: <ListOrdered className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />,
    category: 'Lists',
  },
  {
    id: 'toggle',
    label: 'Toggle List',
    description: 'Collapsible accordion block for details',
    icon: <ChevronRight className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />,
    category: 'Lists',
  },
  {
    id: 'callout',
    label: 'Callout',
    description: 'Highlighted callout box with custom icon',
    icon: <AlertCircle className="w-4 h-4 text-amber-600" />,
    category: 'Basic',
  },
  {
    id: 'quote',
    label: 'Quote',
    description: 'Capture a notable quote or citation (> )',
    icon: <Quote className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />,
    category: 'Basic',
  },
  {
    id: 'divider',
    label: 'Divider',
    description: 'Horizontal rule separating sections (---)',
    icon: <Minus className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />,
    category: 'Basic',
  },
  {
    id: 'code',
    label: 'Code Block',
    description: 'Syntax-highlighted code snippet (```)',
    icon: <Code className="w-4 h-4 text-emerald-600" />,
    category: 'Media & Code',
  },
  {
    id: 'table',
    label: 'Table',
    description: 'Structured grid with editable rows and columns',
    icon: <Table className="w-4 h-4 text-blue-600" />,
    category: 'Media & Code',
  },
  {
    id: 'equation',
    label: 'Math Equation',
    description: 'Mathematical formula rendered with TeX formatting',
    icon: <Sigma className="w-4 h-4 text-indigo-600" />,
    category: 'Media & Code',
  },
  {
    id: 'bookmark',
    label: 'Web Bookmark',
    description: 'Embedded preview card for a link',
    icon: <Bookmark className="w-4 h-4 text-rose-600" />,
    category: 'Media & Code',
  },
];

interface SlashMenuProps {
  filterText: string;
  onSelect: (commandId: BlockType | 'ask_ai') => void;
  onClose: () => void;
  position?: { top: number; left: number };
}

export const SlashMenu: React.FC<SlashMenuProps> = ({ filterText, onSelect, onClose, position }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  const filteredCommands = COMMANDS.filter((cmd) => {
    if (!filterText) return true;
    const query = filterText.toLowerCase().replace(/^\//, '');
    return (
      cmd.label.toLowerCase().includes(query) ||
      cmd.description.toLowerCase().includes(query) ||
      cmd.id.toLowerCase().includes(query)
    );
  });

  useEffect(() => {
    setSelectedIndex(0);
  }, [filterText]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          onSelect(filteredCommands[selectedIndex].id);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredCommands, selectedIndex, onSelect, onClose]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (!filteredCommands.length) return null;

  return (
    <div
      ref={menuRef}
      style={position ? { top: `${position.top}px`, left: `${position.left}px` } : undefined}
      className="absolute z-50 w-72 max-h-80 overflow-y-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-xl p-1 text-xs"
    >
      <div className="px-2 py-1 text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
        Basic & AI Blocks
      </div>

      <div className="space-y-0.5">
        {filteredCommands.map((cmd, idx) => {
          const isSelected = idx === selectedIndex;
          return (
            <button
              key={cmd.id}
              onClick={() => onSelect(cmd.id)}
              onMouseEnter={() => setSelectedIndex(idx)}
              className={`w-full flex items-start gap-2.5 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                isSelected
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                  : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
              }`}
            >
              <div className="mt-0.5 p-1 rounded-md bg-zinc-100 dark:bg-zinc-800 shrink-0">{cmd.icon}</div>
              <div className="min-w-0">
                <div className="font-medium text-xs text-zinc-900 dark:text-zinc-100">{cmd.label}</div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">{cmd.description}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
