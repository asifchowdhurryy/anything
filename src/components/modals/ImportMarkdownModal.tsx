import React, { useState, useRef } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { X, UploadCloud, FileText, Check, ArrowRight } from 'lucide-react';

export const ImportMarkdownModal: React.FC = () => {
  const { isImportMarkdownOpen, setIsImportMarkdownOpen, importMarkdownToPage } = useWorkspace();
  const [markdownText, setMarkdownText] = useState('');
  const [pageTitle, setPageTitle] = useState('');
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isImportMarkdownOpen) return null;

  const handleFileUpload = (file: File) => {
    setFileName(file.name);
    const titleGuess = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    if (!pageTitle) setPageTitle(titleGuess);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = (e.target?.result as string) || '';
      setMarkdownText(content);
      // If first line is # Heading, extract it
      const match = content.match(/^#\s+(.+)$/m);
      if (match && match[1]) {
        setPageTitle(match[1].trim());
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleImport = () => {
    if (!markdownText.trim()) return;
    const finalTitle = pageTitle.trim() || fileName.replace(/\.[^/.]+$/, '') || 'Imported Note';
    importMarkdownToPage(finalTitle, markdownText);
    setIsImportMarkdownOpen(false);
    setMarkdownText('');
    setPageTitle('');
    setFileName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-zinc-900 dark:text-zinc-100 max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-zinc-50/50 dark:bg-zinc-950/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Import Markdown or Text</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Import existing notes from Obsidian, Notion export, or Bear into native blocks
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsImportMarkdownOpen(false)}
            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Drag and drop area */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-zinc-50/50 dark:bg-zinc-950/30"
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".md,.markdown,.txt"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />
            <UploadCloud className="w-8 h-8 mx-auto text-zinc-400 mb-2" />
            <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Drag & drop a <span className="font-mono text-blue-600 dark:text-blue-400">.md</span> or{' '}
              <span className="font-mono text-blue-600 dark:text-blue-400">.txt</span> file here, or click to browse
            </p>
            {fileName && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium flex items-center justify-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Selected: {fileName}</span>
              </p>
            )}
          </div>

          {/* Page Title Input */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Page Title
            </label>
            <input
              type="text"
              placeholder="e.g., Engineering System Architecture"
              value={pageTitle}
              onChange={(e) => setPageTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
            />
          </div>

          {/* Direct Paste Markdown */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Or Paste Markdown Directly
            </label>
            <textarea
              rows={8}
              placeholder={`# Heading 1\n\nSome paragraph text...\n\n- [ ] Todo item\n- [x] Completed task\n\n* Bullet point\n\n\`\`\`typescript\nconsole.log('Hello Anything');\n\`\`\``}
              value={markdownText}
              onChange={(e) => {
                setMarkdownText(e.target.value);
                if (!pageTitle) {
                  const match = e.target.value.match(/^#\s+(.+)$/m);
                  if (match && match[1]) setPageTitle(match[1].trim());
                }
              }}
              className="w-full font-mono text-xs p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 outline-none focus:border-zinc-400 dark:focus:border-zinc-500 leading-relaxed"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-950/40">
          <span className="text-[11px] text-zinc-400">
            {markdownText ? `${markdownText.split('\n').filter(Boolean).length} lines detected` : 'No content'}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsImportMarkdownOpen(false)}
              className="px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={!markdownText.trim()}
              onClick={handleImport}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-medium hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              <span>Import to Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
