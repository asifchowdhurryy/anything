import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { BlockItem } from './BlockItem';
import { SelectionToolbar } from './SelectionToolbar';
import { AskAiDialog } from './AskAiDialog';
import { TableOfContentsDrawer } from './TableOfContentsDrawer';
import { Image, Smile, Trash2, Plus, Sparkles, Clock, FileText, Lock } from 'lucide-react';
import { BlockType } from '../../types/workspace';

const PRESET_COVERS = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&auto=format&fit=crop&q=80',
];

const PRESET_ICONS = ['📄', '📝', '✨', '🧠', '⚡', '📊', '🚀', '🎯', '💡', '🛡️', '💬', '🔥', '📚', '🌟'];

export const BlockEditor: React.FC = () => {
  const {
    activePage,
    updatePage,
    addBlock,
    updateBlock,
    deleteBlock,
    moveBlock,
    duplicateBlock,
  } = useWorkspace();

  const [isCoverPickerOpen, setIsCoverPickerOpen] = useState(false);
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [aiDialogState, setAiDialogState] = useState<{
    isOpen: boolean;
    selectedText: string;
    targetBlockId?: string;
  }>({
    isOpen: false,
    selectedText: '',
  });

  if (!activePage) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-zinc-400">
        <FileText className="w-12 h-12 mb-3 stroke-1 text-zinc-300 dark:text-zinc-700" />
        <p className="text-sm">No page selected. Select or create a page from the sidebar.</p>
      </div>
    );
  }

  // Calculate stats
  const totalWords = activePage.blocks.reduce(
    (acc, b) => acc + (b.content ? b.content.trim().split(/\s+/).length : 0),
    0
  );
  const readingTime = Math.max(1, Math.ceil(totalWords / 200));

  const handleAskAIFromSelection = (text: string) => {
    setAiDialogState({
      isOpen: true,
      selectedText: text,
    });
  };

  const handleAskAIFromBlock = (blockId: string, text: string) => {
    setAiDialogState({
      isOpen: true,
      selectedText: text,
      targetBlockId: blockId,
    });
  };

  const handleAiReplace = (newText: string) => {
    if (aiDialogState.targetBlockId) {
      updateBlock(activePage.id, aiDialogState.targetBlockId, { content: newText });
    } else {
      // Replace active selection via execCommand or new block
      document.execCommand('insertText', false, newText);
    }
  };

  const handleAiInsertBelow = (newText: string) => {
    addBlock(activePage.id, aiDialogState.targetBlockId, 'paragraph');
    const lastBlock = activePage.blocks[activePage.blocks.length - 1];
    if (lastBlock) {
      updateBlock(activePage.id, lastBlock.id, { content: newText });
    }
  };

  const fontClass =
    activePage.fontFamily === 'serif'
      ? 'font-serif'
      : activePage.fontFamily === 'mono'
      ? 'font-mono'
      : 'font-sans';
  const sizeClass = activePage.smallText ? 'text-xs' : 'text-sm';
  const widthClass = activePage.fullWidth
    ? 'w-full px-6 sm:px-12'
    : 'max-w-4xl mx-auto px-8 sm:px-14';
  const isLocked = !!activePage.isLocked;

  return (
    <div className={`flex-1 overflow-y-auto bg-white dark:bg-zinc-950 pb-32 ${fontClass}`}>
      {/* Floating Selection Toolbar (only if not locked) */}
      {!isLocked && (
        <SelectionToolbar
          onAskAI={handleAskAIFromSelection}
          onFormat={(cmd, val) => document.execCommand(cmd, false, val)}
        />
      )}

      {/* Floating Table of Contents Outline */}
      <TableOfContentsDrawer />

      {/* In-Editor AI Dialog */}
      {aiDialogState.isOpen && (
        <AskAiDialog
          selectedText={aiDialogState.selectedText}
          onReplace={handleAiReplace}
          onInsertBelow={handleAiInsertBelow}
          onClose={() => setAiDialogState({ isOpen: false, selectedText: '' })}
        />
      )}

      {/* Cover Image Area */}
      <div className="group/cover relative h-48 sm:h-64 w-full bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
        {activePage.coverImage ? (
          <img
            src={activePage.coverImage}
            alt="Page Cover"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-100 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900" />
        )}

        {/* Cover Action Buttons (only if not locked) */}
        {!isLocked && (
          <div className="absolute right-4 bottom-3 opacity-0 group-hover/cover:opacity-100 transition-opacity flex items-center gap-2">
            <button
              onClick={() => setIsCoverPickerOpen(!isCoverPickerOpen)}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-black/60 hover:bg-black/80 text-white backdrop-blur-xs flex items-center gap-1.5 transition-colors"
            >
              <Image className="w-3.5 h-3.5" />
              <span>{activePage.coverImage ? 'Change Cover' : 'Add Cover'}</span>
            </button>

            {activePage.coverImage && (
              <button
                onClick={() => updatePage(activePage.id, { coverImage: undefined })}
                className="p-1 text-xs font-medium rounded-lg bg-black/60 hover:bg-black/80 text-white backdrop-blur-xs transition-colors"
                title="Remove Cover"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Cover Picker Popover */}
        {!isLocked && isCoverPickerOpen && (
          <div className="absolute right-4 top-16 w-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-2xl p-3 z-30 text-xs">
            <div className="font-semibold text-zinc-800 dark:text-zinc-200 mb-2">Choose Cover Image</div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {PRESET_COVERS.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Preset ${i}`}
                  onClick={() => {
                    updatePage(activePage.id, { coverImage: url });
                    setIsCoverPickerOpen(false);
                  }}
                  className="h-14 w-full object-cover rounded-lg cursor-pointer hover:ring-2 hover:ring-zinc-900 dark:hover:ring-white transition-all"
                />
              ))}
            </div>
            <input
              type="text"
              placeholder="Or paste image URL..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  updatePage(activePage.id, { coverImage: e.currentTarget.value });
                  setIsCoverPickerOpen(false);
                }
              }}
              className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs outline-none"
            />
          </div>
        )}
      </div>

      {/* Main Page Content Container */}
      <div className={`${widthClass} pt-4 ${sizeClass}`}>
        {/* Page Icon Picker */}
        <div className="relative -mt-14 mb-4">
          <button
            disabled={isLocked}
            onClick={() => !isLocked && setIsIconPickerOpen(!isIconPickerOpen)}
            className={`text-5xl p-2 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-lg ${
              isLocked ? 'cursor-default' : 'hover:scale-105 cursor-pointer'
            } transition-transform`}
            title={isLocked ? 'Page is locked' : 'Change Icon'}
          >
            {activePage.icon || '📄'}
          </button>

          {!isLocked && isIconPickerOpen && (
            <div className="absolute left-0 top-16 w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-2xl p-3 z-30">
              <div className="text-[11px] font-semibold text-zinc-400 mb-2 uppercase">Select Emoji</div>
              <div className="grid grid-cols-7 gap-1">
                {PRESET_ICONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      updatePage(activePage.id, { icon: emoji });
                      setIsIconPickerOpen(false);
                    }}
                    className="text-2xl p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Locked Notification Banner */}
        {isLocked && (
          <div className="mb-4 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 flex items-center justify-between text-xs text-amber-800 dark:text-amber-200">
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>This page is locked. Editing, moving, and block additions are disabled.</span>
            </div>
            <button
              onClick={() => updatePage(activePage.id, { isLocked: false })}
              className="text-xs font-semibold underline hover:opacity-80"
            >
              Unlock
            </button>
          </div>
        )}

        {/* Page Title */}
        <input
          type="text"
          value={activePage.title}
          readOnly={isLocked}
          onChange={(e) => updatePage(activePage.id, { title: e.target.value })}
          placeholder="Untitled Page"
          className={`w-full text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 bg-transparent border-none outline-none mb-3 placeholder:text-zinc-300 dark:placeholder:text-zinc-700 ${
            isLocked ? 'cursor-default' : ''
          }`}
        />

        {/* Page Metadata Row */}
        <div className="flex items-center gap-4 text-xs text-zinc-400 dark:text-zinc-500 mb-8 border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Updated {new Date(activePage.updatedAt).toLocaleDateString()}</span>
          </span>
          <span>•</span>
          <span>{totalWords} words</span>
          <span>•</span>
          <span>{readingTime} min read</span>
          {activePage.fontFamily && (
            <>
              <span>•</span>
              <span className="capitalize">{activePage.fontFamily}</span>
            </>
          )}
        </div>

        {/* Blocks List */}
        <div className="space-y-0.5">
          {activePage.blocks.map((block, idx) => (
            <BlockItem
              key={block.id}
              block={block}
              index={idx}
              onUpdate={(updates) => !isLocked && updateBlock(activePage.id, block.id, updates)}
              onDelete={() => !isLocked && deleteBlock(activePage.id, block.id)}
              onAddBelow={(type) => !isLocked && addBlock(activePage.id, block.id, type)}
              onDuplicate={() => !isLocked && duplicateBlock(activePage.id, block.id)}
              onMove={(dir) => !isLocked && moveBlock(activePage.id, block.id, dir)}
              onAskAI={(text) => handleAskAIFromBlock(block.id, text)}
            />
          ))}
        </div>

        {/* Bottom Add Block Click Area (hidden when locked) */}
        {!isLocked && (
          <div
            onClick={() => addBlock(activePage.id, undefined, 'paragraph')}
            className="mt-6 py-6 border-t border-dashed border-zinc-200 dark:border-zinc-800 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 flex items-center justify-center gap-1.5 cursor-pointer rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Click to add a block, or type "/" for commands</span>
          </div>
        )}
      </div>
    </div>
  );
};
