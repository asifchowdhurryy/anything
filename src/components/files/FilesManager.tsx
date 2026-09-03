import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import {
  UploadCloud,
  FileText,
  Trash2,
  Download,
  FileCode,
  FileSpreadsheet,
  Image as ImageIcon,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const FilesManager: React.FC = () => {
  const { files, uploadFile, deleteFile } = useWorkspace();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFileForPreview, setSelectedFileForPreview] = useState<string | null>(null);

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (!droppedFiles.length) return;

    setIsUploading(true);
    for (const f of droppedFiles) {
      await uploadFile(f);
    }
    setIsUploading(false);
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files);
    setIsUploading(true);
    for (const f of selected) {
      await uploadFile(f);
    }
    setIsUploading(false);
  };

  const getFileIcon = (type: string) => {
    if (type.includes('image')) return <ImageIcon className="w-5 h-5 text-blue-500" />;
    if (type.includes('sheet') || type.includes('csv')) return <FileSpreadsheet className="w-5 h-5 text-emerald-500" />;
    if (type.includes('json') || type.includes('code') || type.includes('javascript') || type.includes('typescript')) {
      return <FileCode className="w-5 h-5 text-purple-500" />;
    }
    return <FileText className="w-5 h-5 text-zinc-500" />;
  };

  const activePreview = files.find((f) => f.id === selectedFileForPreview);

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-zinc-950 p-6 overflow-y-auto">
      <div className="max-w-5xl mx-auto w-full space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Files & Knowledge Context</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Upload PDFs, Markdown documents, CSVs, or text files. Anything extracts text from files to enrich your AI context.
          </p>
        </div>

        {/* Drag & Drop Upload Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
            isDragging
              ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-900'
              : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600'
          }`}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                {isUploading ? 'Extracting & uploading files...' : 'Drag and drop files here'}
              </div>
              <div className="text-xs text-zinc-400 mt-0.5">Supports PDF, Markdown, TXT, CSV, JSON, PNG, JPG</div>
            </div>

            <label className="mt-2 px-4 py-2 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-medium cursor-pointer hover:bg-black dark:hover:bg-white transition-colors shadow-xs">
              <span>Browse Files</span>
              <input type="file" multiple onChange={handleFileInput} className="hidden" />
            </label>
          </div>
        </div>

        {/* Files Grid / List */}
        {files.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              Uploaded Files ({files.length})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col justify-between gap-3 shadow-xs"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 shrink-0">
                      {getFileIcon(file.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                        {file.name}
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        {Math.round(file.size / 1024)} KB • {new Date(file.uploadedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {file.extractedText && (
                    <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 text-[10px] text-zinc-500 font-mono line-clamp-2">
                      <span className="font-sans font-semibold text-amber-600 dark:text-amber-400 mr-1 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5 inline" /> AI Extracted:
                      </span>
                      {file.extractedText}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/60 text-xs">
                    <button
                      onClick={() => setSelectedFileForPreview(file.id)}
                      className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                    >
                      Preview text
                    </button>

                    <button
                      onClick={() => deleteFile(file.id)}
                      className="p-1 rounded text-zinc-400 hover:text-rose-500 transition-colors"
                      title="Delete File"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Text Preview Modal */}
        {activePreview && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-xl p-5 text-xs flex flex-col max-h-[80vh]">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <span className="font-semibold text-sm">{activePreview.name}</span>
                <button
                  onClick={() => setSelectedFileForPreview(null)}
                  className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800"
                >
                  Close
                </button>
              </div>

              <div className="mt-4 p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-y-auto flex-1 font-mono text-[11px] whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
                {activePreview.extractedText || 'No extracted text found for this file type.'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
