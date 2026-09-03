import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { WORKSPACE_TEMPLATES } from '../../data/templates';
import { WorkspaceTemplate } from '../../types/workspace';
import {
  X,
  Sparkles,
  LayoutTemplate,
  Check,
  ChevronRight,
  Search,
  ArrowRight,
} from 'lucide-react';

const CATEGORIES = ['All', 'Product', 'Engineering', 'Meetings', 'Personal', 'Strategy', 'Education'] as const;

export const TemplatesModal: React.FC = () => {
  const { isTemplatesOpen, setIsTemplatesOpen, instantiateTemplate } = useWorkspace();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<WorkspaceTemplate>(WORKSPACE_TEMPLATES[0]);

  if (!isTemplatesOpen) return null;

  const filteredTemplates = WORKSPACE_TEMPLATES.filter((tmpl) => {
    const matchesCategory = selectedCategory === 'All' || tmpl.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      tmpl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tmpl.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tmpl.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleUseTemplate = (tmpl: WorkspaceTemplate) => {
    instantiateTemplate(tmpl.id);
    setIsTemplatesOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-5xl h-[85vh] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-zinc-900 dark:text-zinc-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-zinc-50/50 dark:bg-zinc-950/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
              <LayoutTemplate className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Templates Gallery</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Kickstart projects with curated Notion-style workspaces, PRDs, specs, and databases
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsTemplatesOpen(false)}
            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-zinc-900 shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
            />
          </div>
        </div>

        {/* Body: Left List + Right Live Preview */}
        <div className="flex-1 flex overflow-hidden">
          {/* Templates Selector List */}
          <div className="w-80 sm:w-96 border-r border-zinc-200 dark:border-zinc-800 overflow-y-auto p-3 space-y-1.5 shrink-0 bg-zinc-50/30 dark:bg-zinc-950/20">
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-12 text-zinc-400 text-xs">
                No templates found matching your search.
              </div>
            ) : (
              filteredTemplates.map((tmpl) => {
                const isSelected = selectedTemplate.id === tmpl.id;
                return (
                  <div
                    key={tmpl.id}
                    onClick={() => setSelectedTemplate(tmpl)}
                    className={`p-3 rounded-xl cursor-pointer border transition-all ${
                      isSelected
                        ? 'bg-white dark:bg-zinc-800/90 border-zinc-300 dark:border-zinc-600 shadow-xs'
                        : 'bg-white/60 dark:bg-zinc-900/40 border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 hover:bg-white dark:hover:bg-zinc-800/40'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="text-2xl shrink-0 p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800">
                        {tmpl.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <h4 className="text-xs font-semibold truncate text-zinc-900 dark:text-zinc-100">
                            {tmpl.title}
                          </h4>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-medium">
                            {tmpl.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-2 leading-relaxed">
                          {tmpl.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {tmpl.tags.map((t) => (
                            <span
                              key={t}
                              className="text-[9px] px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800/80 text-zinc-500 dark:text-zinc-400"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Preview Pane */}
          <div className="flex-1 overflow-y-auto flex flex-col bg-white dark:bg-zinc-900">
            {selectedTemplate ? (
              <div className="flex-1 flex flex-col">
                {/* Template Banner Cover */}
                {selectedTemplate.coverImage && (
                  <div className="h-36 sm:h-44 w-full relative overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0">
                    <img
                      src={selectedTemplate.coverImage}
                      alt={selectedTemplate.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="p-6 flex-1 flex flex-col">
                  {/* Template Header & Use Button */}
                  <div className="flex items-start justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800 mb-6">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{selectedTemplate.icon}</span>
                      <div>
                        <h3 className="text-xl font-bold">{selectedTemplate.title}</h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                          Category: <span className="font-medium text-zinc-700 dark:text-zinc-300">{selectedTemplate.category}</span>
                          {selectedTemplate.database && (
                            <span className="ml-2 px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[10px]">
                              + Includes Linked Database
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleUseTemplate(selectedTemplate)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium text-xs hover:opacity-90 transition-opacity shadow-sm shrink-0"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Use this template</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Template Block Content Preview */}
                  <div className="space-y-3 max-w-2xl">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                      Template Content Preview
                    </div>
                    {selectedTemplate.page.blocks.map((b, i) => {
                      if (b.type === 'callout') {
                        return (
                          <div
                            key={i}
                            className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 text-xs leading-relaxed"
                          >
                            {b.content}
                          </div>
                        );
                      }
                      if (b.type === 'heading_1') {
                        return (
                          <h4 key={i} className="text-base font-bold pt-2 border-b border-zinc-100 dark:border-zinc-800 pb-1">
                            {b.content}
                          </h4>
                        );
                      }
                      if (b.type === 'heading_2') {
                        return (
                          <h5 key={i} className="text-xs font-semibold pt-1 text-zinc-800 dark:text-zinc-200">
                            {b.content}
                          </h5>
                        );
                      }
                      if (b.type === 'todo') {
                        return (
                          <div key={i} className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                            <input
                              type="checkbox"
                              checked={b.properties?.checked || false}
                              readOnly
                              className="rounded border-zinc-300 dark:border-zinc-700"
                            />
                            <span>{b.content}</span>
                          </div>
                        );
                      }
                      if (b.type === 'code') {
                        return (
                          <pre
                            key={i}
                            className="p-3 rounded-lg bg-zinc-900 text-zinc-200 font-mono text-[11px] overflow-x-auto"
                          >
                            <code>{b.content}</code>
                          </pre>
                        );
                      }
                      return (
                        <p key={i} className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                          {b.content}
                        </p>
                      );
                    })}

                    {selectedTemplate.database && (
                      <div className="mt-4 p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20">
                        <div className="text-xs font-semibold text-blue-900 dark:text-blue-200 mb-1 flex items-center gap-1.5">
                          <span>{selectedTemplate.database.icon}</span>
                          <span>{selectedTemplate.database.title}</span>
                        </div>
                        <p className="text-[11px] text-blue-700 dark:text-blue-300">
                          Pre-configured columns: {selectedTemplate.database.columns.map((c) => c.name).join(', ')} with sample rows ready to go.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
