import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { DatabaseRow, DatabaseViewType, PropertyType } from '../../types/workspace';
import { DatabaseCardModal } from './DatabaseCardModal';
import {
  Table as TableIcon,
  LayoutGrid,
  List as ListIcon,
  Calendar as CalendarIcon,
  Image as GalleryIcon,
  Plus,
  Search,
  Filter,
  Trash2,
  Calendar,
  User,
  CheckCircle2,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

export const DatabaseView: React.FC = () => {
  const {
    activeDatabase,
    updateDatabase,
    addRow,
    updateRow,
    deleteRow,
    addColumn,
  } = useWorkspace();

  const [activeTab, setActiveTab] = useState<DatabaseViewType>(
    activeDatabase?.activeView || 'board'
  );
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedRow, setSelectedRow] = useState<DatabaseRow | null>(null);
  const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [newColType, setNewColType] = useState<PropertyType>('text');

  if (!activeDatabase) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-zinc-400">
        <TableIcon className="w-12 h-12 mb-3 stroke-1 text-zinc-300 dark:text-zinc-700" />
        <p className="text-sm">No database selected. Choose or create one from the sidebar.</p>
      </div>
    );
  }

  const titleCol = activeDatabase.columns[0];
  const statusCol = activeDatabase.columns.find((c) => c.type === 'status');
  const priorityCol = activeDatabase.columns.find((c) => c.name.toLowerCase().includes('priority'));
  const assigneeCol = activeDatabase.columns.find((c) => c.type === 'person');
  const dueCol = activeDatabase.columns.find((c) => c.type === 'date');
  const aiCol = activeDatabase.columns.find((c) => c.type === 'checkbox');

  // Filter rows
  const filteredRows = activeDatabase.rows.filter((row) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return Object.values(row.values).some((v) =>
      String(v || '').toLowerCase().includes(q)
    );
  });

  const handleAddColumnSubmit = () => {
    if (!newColName.trim()) return;
    addColumn(activeDatabase.id, newColName.trim(), newColType);
    setNewColName('');
    setIsAddColumnOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-zinc-950 overflow-hidden">
      {/* Row Detail Modal */}
      {selectedRow && (
        <DatabaseCardModal
          database={activeDatabase}
          row={selectedRow}
          onUpdateRow={(vals) => updateRow(activeDatabase.id, selectedRow.id, vals)}
          onDeleteRow={() => deleteRow(activeDatabase.id, selectedRow.id)}
          onClose={() => setSelectedRow(null)}
        />
      )}

      {/* Database Header */}
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div className="flex items-center gap-3">
            <span className="text-3xl p-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800">
              {activeDatabase.icon || '📊'}
            </span>
            <div>
              <input
                type="text"
                value={activeDatabase.title}
                onChange={(e) => updateDatabase(activeDatabase.id, { title: e.target.value })}
                className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 bg-transparent border-none outline-none"
              />
              <input
                type="text"
                value={activeDatabase.description || ''}
                onChange={(e) => updateDatabase(activeDatabase.id, { description: e.target.value })}
                placeholder="Add a description..."
                className="text-xs text-zinc-400 dark:text-zinc-500 bg-transparent border-none outline-none w-full"
              />
            </div>
          </div>

          <button
            onClick={() => addRow(activeDatabase.id, { [titleCol?.id || 'name']: 'New Task' })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-medium hover:bg-black dark:hover:bg-white shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Item</span>
          </button>
        </div>

        {/* View Switcher Tabs & Filters */}
        <div className="flex items-center justify-between gap-4 mt-4 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('board')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'board'
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Board</span>
            </button>

            <button
              onClick={() => setActiveTab('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'table'
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>

            <button
              onClick={() => setActiveTab('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'list'
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <ListIcon className="w-3.5 h-3.5" />
              <span>List</span>
            </button>

            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'calendar'
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Calendar</span>
            </button>

            <button
              onClick={() => setActiveTab('gallery')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'gallery'
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <GalleryIcon className="w-3.5 h-3.5" />
              <span>Gallery</span>
            </button>
          </div>

          {/* Search bar inside database */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-zinc-400" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter items..."
                className="pl-8 pr-3 py-1 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 outline-none w-44"
              />
            </div>

            <button
              onClick={() => setIsAddColumnOpen(true)}
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs flex items-center gap-1"
              title="Add Column Property"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Property</span>
            </button>
          </div>
        </div>
      </div>

      {/* Add Column Modal */}
      {isAddColumnOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl w-full max-w-sm p-4 text-xs">
            <div className="font-semibold text-sm mb-3">Add New Property Column</div>
            <div className="space-y-3">
              <div>
                <label className="block text-zinc-500 mb-1">Property Name</label>
                <input
                  type="text"
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  placeholder="e.g. Priority, Tag, Cost..."
                  className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 outline-none"
                />
              </div>
              <div>
                <label className="block text-zinc-500 mb-1">Property Type</label>
                <select
                  value={newColType}
                  onChange={(e) => setNewColType(e.target.value as PropertyType)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 outline-none"
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="status">Status</option>
                  <option value="select">Select</option>
                  <option value="date">Date</option>
                  <option value="person">Person</option>
                  <option value="checkbox">Checkbox</option>
                  <option value="url">URL</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setIsAddColumnOpen(false)}
                className="px-3 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
              >
                Cancel
              </button>
              <button
                onClick={handleAddColumnSubmit}
                className="px-3 py-1.5 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-medium"
              >
                Add Column
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main View Renderers */}
      <div className="flex-1 overflow-auto p-6">
        {/* ================= BOARD (KANBAN) VIEW ================= */}
        {activeTab === 'board' && (
          <div className="flex items-start gap-4 h-full overflow-x-auto pb-4">
            {(statusCol?.options || [
              { id: 'todo', label: 'To Do', color: 'bg-zinc-100 text-zinc-700' },
              { id: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
              { id: 'done', label: 'Done', color: 'bg-emerald-100 text-emerald-700' },
            ]).map((status) => {
              const columnRows = filteredRows.filter((r) => {
                const val = r.values[statusCol?.id || 'col-status'];
                return val === status.id || (!val && status.id === 'todo');
              });

              return (
                <div
                  key={status.id}
                  className="w-72 shrink-0 bg-zinc-50/70 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl flex flex-col max-h-full"
                >
                  {/* Lane Header */}
                  <div className="p-3 border-b border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${status.color}`}>
                        {status.label}
                      </span>
                      <span className="text-xs text-zinc-400 font-medium">{columnRows.length}</span>
                    </div>

                    <button
                      onClick={() =>
                        addRow(activeDatabase.id, {
                          [titleCol?.id || 'name']: 'New Item',
                          [statusCol?.id || 'col-status']: status.id,
                        })
                      }
                      className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Lane Cards */}
                  <div className="p-2 space-y-2 overflow-y-auto flex-1">
                    {columnRows.map((row) => {
                      const title = row.values[titleCol?.id || 'name'] || 'Untitled';
                      const assignee = row.values[assigneeCol?.id || 'col-assignee'];
                      const due = row.values[dueCol?.id || 'col-due'];
                      const isAi = row.values[aiCol?.id || 'col-ai'];

                      return (
                        <div
                          key={row.id}
                          onClick={() => setSelectedRow(row)}
                          className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xs hover:border-zinc-400 dark:hover:border-zinc-600 cursor-pointer transition-all space-y-2"
                        >
                          <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
                            {title}
                          </div>

                          <div className="flex items-center justify-between pt-1 text-[11px] text-zinc-400">
                            <div className="flex items-center gap-2">
                              {due && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>{due}</span>
                                </span>
                              )}
                              {assignee && (
                                <span className="flex items-center gap-1 text-zinc-600 dark:text-zinc-300">
                                  <User className="w-3 h-3" />
                                  <span>{assignee}</span>
                                </span>
                              )}
                            </div>

                            {isAi && (
                              <span className="flex items-center gap-0.5 text-amber-500" title="AI Automated">
                                <Sparkles className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    <button
                      onClick={() =>
                        addRow(activeDatabase.id, {
                          [titleCol?.id || 'name']: 'New Item',
                          [statusCol?.id || 'col-status']: status.id,
                        })
                      }
                      className="w-full py-1.5 text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg flex items-center justify-center gap-1 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Card</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ================= TABLE VIEW ================= */}
        {activeTab === 'table' && (
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800/80 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-medium">
                  {activeDatabase.columns.map((col) => (
                    <th key={col.id} className="p-3 border-r border-zinc-200 dark:border-zinc-800 last:border-r-0">
                      {col.name}
                    </th>
                  ))}
                  <th className="p-3 w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {filteredRows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer group"
                  >
                    {activeDatabase.columns.map((col, cIdx) => {
                      const val = row.values[col.id];

                      return (
                        <td
                          key={col.id}
                          onClick={() => cIdx === 0 && setSelectedRow(row)}
                          className="p-3 border-r border-zinc-200 dark:border-zinc-800 last:border-r-0"
                        >
                          {col.type === 'status' || col.type === 'select' ? (
                            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                              {val || '—'}
                            </span>
                          ) : col.type === 'checkbox' ? (
                            <input
                              type="checkbox"
                              checked={Boolean(val)}
                              onChange={(e) => updateRow(activeDatabase.id, row.id, { [col.id]: e.target.checked })}
                              className="w-4 h-4 rounded cursor-pointer"
                            />
                          ) : (
                            <input
                              type="text"
                              value={val ?? ''}
                              onChange={(e) => updateRow(activeDatabase.id, row.id, { [col.id]: e.target.value })}
                              className="w-full bg-transparent outline-none text-zinc-900 dark:text-zinc-100 truncate"
                            />
                          )}
                        </td>
                      );
                    })}
                    <td className="p-3 text-right">
                      <button
                        onClick={() => deleteRow(activeDatabase.id, row.id)}
                        className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-rose-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ================= LIST VIEW ================= */}
        {activeTab === 'list' && (
          <div className="space-y-2 max-w-3xl">
            {filteredRows.map((row) => {
              const title = row.values[titleCol?.id || 'name'] || 'Untitled';
              const statusVal = row.values[statusCol?.id || 'col-status'];
              const due = row.values[dueCol?.id || 'col-due'];

              return (
                <div
                  key={row.id}
                  onClick={() => setSelectedRow(row)}
                  className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-700 flex items-center justify-between gap-4 cursor-pointer transition-colors shadow-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <CheckCircle2
                      className={`w-4 h-4 shrink-0 ${statusVal === 'done' ? 'text-emerald-500' : 'text-zinc-300 dark:text-zinc-700'}`}
                    />
                    <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">{title}</span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-zinc-400 shrink-0">
                    {due && <span>{due}</span>}
                    <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
                      {statusVal || 'To Do'}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ================= CALENDAR VIEW ================= */}
        {activeTab === 'calendar' && (
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 p-4">
            <div className="text-xs font-semibold mb-3 text-zinc-600 dark:text-zinc-400">September 2026</div>
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium text-zinc-400 pb-2 border-b border-zinc-200 dark:border-zinc-800">
              <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
            </div>
            <div className="grid grid-cols-7 gap-2 pt-2 text-xs">
              {Array.from({ length: 30 }).map((_, i) => {
                const dayNum = i + 1;
                const dateStr = `2026-09-${String(dayNum).padStart(2, '0')}`;
                const dayRows = filteredRows.filter((r) => r.values[dueCol?.id || 'col-due'] === dateStr);

                return (
                  <div
                    key={dayNum}
                    className="min-h-[70px] p-1.5 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col justify-between"
                  >
                    <span className="text-[10px] font-mono text-zinc-400">{dayNum}</span>
                    <div className="space-y-1 mt-1">
                      {dayRows.map((r) => (
                        <div
                          key={r.id}
                          onClick={() => setSelectedRow(r)}
                          className="p-1 rounded bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 text-blue-700 dark:text-blue-300 text-[10px] font-medium truncate cursor-pointer"
                        >
                          {r.values[titleCol?.id || 'name']}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= GALLERY VIEW ================= */}
        {activeTab === 'gallery' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredRows.map((row) => {
              const title = row.values[titleCol?.id || 'name'] || 'Untitled';
              const statusVal = row.values[statusCol?.id || 'col-status'];
              const assignee = row.values[assigneeCol?.id || 'col-assignee'];

              return (
                <div
                  key={row.id}
                  onClick={() => setSelectedRow(row)}
                  className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs hover:border-zinc-400 dark:hover:border-zinc-700 cursor-pointer transition-all flex flex-col"
                >
                  <div className="h-24 bg-gradient-to-tr from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 p-3 flex items-start justify-between">
                    <span className="text-xl">📌</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/80 dark:bg-zinc-800/80 font-medium">
                      {statusVal || 'Open'}
                    </span>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</div>
                    <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/60 text-xs text-zinc-400 flex items-center justify-between">
                      <span>{assignee || 'Unassigned'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
