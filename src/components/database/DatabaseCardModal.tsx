import React from 'react';
import { Database, DatabaseRow } from '../../types/workspace';
import { X, Calendar, User, Tag, CheckSquare, Hash, AlignLeft, Sparkles } from 'lucide-react';

interface DatabaseCardModalProps {
  database: Database;
  row: DatabaseRow;
  onUpdateRow: (values: Record<string, any>) => void;
  onDeleteRow: () => void;
  onClose: () => void;
}

export const DatabaseCardModal: React.FC<DatabaseCardModalProps> = ({
  database,
  row,
  onUpdateRow,
  onDeleteRow,
  onClose,
}) => {
  const getPropIcon = (type: string) => {
    switch (type) {
      case 'date':
        return <Calendar className="w-3.5 h-3.5 text-zinc-400" />;
      case 'person':
        return <User className="w-3.5 h-3.5 text-zinc-400" />;
      case 'status':
      case 'select':
        return <Tag className="w-3.5 h-3.5 text-zinc-400" />;
      case 'checkbox':
        return <CheckSquare className="w-3.5 h-3.5 text-zinc-400" />;
      case 'number':
        return <Hash className="w-3.5 h-3.5 text-zinc-400" />;
      default:
        return <AlignLeft className="w-3.5 h-3.5 text-zinc-400" />;
    }
  };

  const titleCol = database.columns[0];
  const titleVal = row.values[titleCol?.id] || 'Untitled Item';

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <span>{database.icon || '📊'}</span>
            <span>{database.title}</span>
            <span>/</span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-xs">{titleVal}</span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Main Title Input */}
          {titleCol && (
            <div>
              <input
                type="text"
                value={titleVal}
                onChange={(e) => onUpdateRow({ [titleCol.id]: e.target.value })}
                placeholder="Item Title..."
                className="w-full text-2xl font-bold text-zinc-900 dark:text-zinc-50 bg-transparent border-none outline-none placeholder:text-zinc-300"
              />
            </div>
          )}

          {/* Properties Grid */}
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-xs">
            {database.columns.slice(1).map((col) => {
              const val = row.values[col.id];

              return (
                <div key={col.id} className="py-2.5 flex items-center justify-between gap-4">
                  <div className="w-36 flex items-center gap-2 text-zinc-500 dark:text-zinc-400 shrink-0">
                    {getPropIcon(col.type)}
                    <span>{col.name}</span>
                  </div>

                  <div className="flex-1">
                    {col.type === 'status' || col.type === 'select' ? (
                      <select
                        value={val || ''}
                        onChange={(e) => onUpdateRow({ [col.id]: e.target.value })}
                        className="px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 outline-none text-xs"
                      >
                        <option value="">-- None --</option>
                        {col.options?.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : col.type === 'checkbox' ? (
                      <input
                        type="checkbox"
                        checked={Boolean(val)}
                        onChange={(e) => onUpdateRow({ [col.id]: e.target.checked })}
                        className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-700 cursor-pointer"
                      />
                    ) : col.type === 'date' ? (
                      <input
                        type="date"
                        value={val || ''}
                        onChange={(e) => onUpdateRow({ [col.id]: e.target.value })}
                        className="px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 outline-none text-xs"
                      />
                    ) : (
                      <input
                        type={col.type === 'number' ? 'number' : 'text'}
                        value={val ?? ''}
                        onChange={(e) =>
                          onUpdateRow({
                            [col.id]: col.type === 'number' ? Number(e.target.value) : e.target.value,
                          })
                        }
                        className="w-full px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 outline-none text-xs"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <button
            onClick={() => {
              onDeleteRow();
              onClose();
            }}
            className="text-xs text-rose-600 dark:text-rose-400 hover:underline"
          >
            Delete Item
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
