import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Page,
  Block,
  BlockType,
  Database,
  PropertyType,
  AIProviderConfig,
  ActiveAIModel,
  UserSettings,
  ChatConversation,
  ChatMessage,
  WorkspaceFile,
  ChatSource,
  TrashItem,
} from '../types/workspace';
import { INITIAL_PAGES, INITIAL_DATABASES, INITIAL_SETTINGS } from '../data/initialWorkspace';
import { DEFAULT_PROVIDERS } from '../ai/providers';
import { WORKSPACE_TEMPLATES } from '../data/templates';

export interface SearchResult {
  type: 'page' | 'database' | 'block' | 'file';
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  pageId?: string;
  databaseId?: string;
}

interface WorkspaceContextType {
  pages: Page[];
  activePageId: string | null;
  activePage: Page | null;
  setActivePageId: (id: string | null) => void;

  databases: Database[];
  activeDatabaseId: string | null;
  activeDatabase: Database | null;
  setActiveDatabaseId: (id: string | null) => void;

  activeViewMode: 'page' | 'database' | 'ai-chat' | 'files';
  setActiveViewMode: (mode: 'page' | 'database' | 'ai-chat' | 'files') => void;

  providers: AIProviderConfig[];
  activeModel: ActiveAIModel;
  setActiveModel: (model: ActiveAIModel) => void;
  updateProvider: (id: string, updates: Partial<AIProviderConfig>) => void;
  addCustomProvider: (provider: Omit<AIProviderConfig, 'id'>) => void;
  deleteProvider: (id: string) => void;

  settings: UserSettings;
  updateSettings: (updates: Partial<UserSettings>) => void;
  effectiveTheme: 'light' | 'dark';

  // Modals & Panels
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  isTemplatesOpen: boolean;
  setIsTemplatesOpen: (open: boolean) => void;
  isTrashOpen: boolean;
  setIsTrashOpen: (open: boolean) => void;
  isImportMarkdownOpen: boolean;
  setIsImportMarkdownOpen: (open: boolean) => void;
  isOutlineOpen: boolean;
  setIsOutlineOpen: (open: boolean) => void;
  settingsTab: 'general' | 'providers' | 'preferences' | 'usage' | 'export';
  setSettingsTab: (tab: 'general' | 'providers' | 'preferences' | 'usage' | 'export') => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;

  // Page Operations
  createPage: (parentId?: string | null) => Page;
  duplicatePage: (id: string) => Page;
  updatePage: (id: string, updates: Partial<Page>) => void;
  deletePage: (id: string) => void;
  toggleFavorite: (id: string) => void;

  // Trash Operations
  trashPages: TrashItem[];
  restorePage: (id: string) => void;
  permanentlyDeletePage: (id: string) => void;
  emptyTrash: () => void;

  // Templates
  instantiateTemplate: (templateId: string) => Page;

  // Block Operations
  addBlock: (pageId: string, afterBlockId?: string, type?: BlockType) => Block;
  updateBlock: (pageId: string, blockId: string, updates: Partial<Block>) => void;
  deleteBlock: (pageId: string, blockId: string) => void;
  moveBlock: (pageId: string, blockId: string, direction: 'up' | 'down') => void;
  duplicateBlock: (pageId: string, blockId: string) => void;

  // Database Operations
  createDatabase: () => Database;
  updateDatabase: (id: string, updates: Partial<Database>) => void;
  deleteDatabase: (id: string) => void;
  addRow: (dbId: string, initialValues?: Record<string, any>) => void;
  updateRow: (dbId: string, rowId: string, values: Record<string, any>) => void;
  deleteRow: (dbId: string, rowId: string) => void;
  addColumn: (dbId: string, name: string, type: PropertyType) => void;

  // Chat Operations
  conversations: ChatConversation[];
  activeConversationId: string | null;
  activeConversation: ChatConversation | null;
  setActiveConversationId: (id: string | null) => void;
  createConversation: () => string;
  deleteConversation: (id: string) => void;
  renameConversation: (id: string, title: string) => void;
  addChatMessage: (conversationId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => string;
  updateChatMessage: (
    conversationId: string,
    messageId: string,
    content: string,
    isStreaming?: boolean,
    sources?: ChatSource[]
  ) => void;

  // File Operations
  files: WorkspaceFile[];
  uploadFile: (file: File) => Promise<WorkspaceFile>;
  deleteFile: (id: string) => void;

  // Global Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchResults: SearchResult[];

  // Export / Import
  exportWorkspaceJSON: () => void;
  exportPageMarkdown: (pageId: string) => void;
  exportDatabaseCSV: (dbId: string) => void;
  importWorkspaceJSON: (jsonString: string) => boolean;
  importMarkdownToPage: (title: string, markdownContent: string) => Page;
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export const WorkspaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load state from localStorage with safe fallback
  const [pages, setPages] = useState<Page[]>(() => {
    try {
      const saved = localStorage.getItem('aether_pages');
      return saved ? JSON.parse(saved) : INITIAL_PAGES;
    } catch {
      return INITIAL_PAGES;
    }
  });

  const [activePageId, setActivePageId] = useState<string | null>(pages[0]?.id || null);

  const [databases, setDatabases] = useState<Database[]>(() => {
    try {
      const saved = localStorage.getItem('aether_databases');
      return saved ? JSON.parse(saved) : INITIAL_DATABASES;
    } catch {
      return INITIAL_DATABASES;
    }
  });

  const [activeDatabaseId, setActiveDatabaseId] = useState<string | null>(null);
  const [activeViewMode, setActiveViewMode] = useState<'page' | 'database' | 'ai-chat' | 'files'>('page');

  const [providers, setProviders] = useState<AIProviderConfig[]>(() => {
    try {
      const saved = localStorage.getItem('aether_providers');
      return saved ? JSON.parse(saved) : DEFAULT_PROVIDERS;
    } catch {
      return DEFAULT_PROVIDERS;
    }
  });

  const [activeModel, setActiveModel] = useState<ActiveAIModel>(() => {
    try {
      const saved = localStorage.getItem('aether_active_model');
      return saved ? JSON.parse(saved) : { providerId: 'gemini', modelId: 'gemini-3.8-flash', isAuto: false };
    } catch {
      return { providerId: 'gemini', modelId: 'gemini-3.8-flash', isAuto: false };
    }
  });

  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem('aether_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          parsed.workspaceName === 'Acme Research & Engineering' ||
          parsed.workspaceName === 'OmniFlow Workspace' ||
          !parsed.workspaceName
        ) {
          parsed.workspaceName = 'Anything';
        }
        return parsed;
      }
      return INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  const [conversations, setConversations] = useState<ChatConversation[]>(() => {
    try {
      const saved = localStorage.getItem('aether_conversations');
      return saved
        ? JSON.parse(saved)
        : [
            {
              id: 'conv-default',
              title: 'Workspace Assistant',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              messages: [
                {
                  id: 'm1',
                  role: 'assistant',
                  content:
                    'Hello! I am your Anything AI assistant. Ask me anything about your project plans, tasks, or connected AI models. Toggle "Include Workspace Context" if you want me to search your notes!',
                  timestamp: new Date().toISOString(),
                  modelUsed: 'gemini-3.8-flash',
                  providerUsed: 'gemini',
                },
              ],
            },
          ];
    } catch {
      return [];
    }
  });

  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    conversations[0]?.id || null
  );

  const [files, setFiles] = useState<WorkspaceFile[]>(() => {
    try {
      const saved = localStorage.getItem('aether_files');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [trashPages, setTrashPages] = useState<TrashItem[]>(() => {
    try {
      const saved = localStorage.getItem('aether_trash');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // UI state
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isTrashOpen, setIsTrashOpen] = useState(false);
  const [isImportMarkdownOpen, setIsImportMarkdownOpen] = useState(false);
  const [isOutlineOpen, setIsOutlineOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'general' | 'providers' | 'preferences' | 'usage' | 'export'>('general');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('aether_trash', JSON.stringify(trashPages));
    } catch {}
  }, [trashPages]);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('aether_pages', JSON.stringify(pages));
    } catch {}
  }, [pages]);

  useEffect(() => {
    try {
      localStorage.setItem('aether_databases', JSON.stringify(databases));
    } catch {}
  }, [databases]);

  useEffect(() => {
    try {
      localStorage.setItem('aether_providers', JSON.stringify(providers));
    } catch {}
  }, [providers]);

  useEffect(() => {
    try {
      localStorage.setItem('aether_active_model', JSON.stringify(activeModel));
    } catch {}
  }, [activeModel]);

  useEffect(() => {
    try {
      localStorage.setItem('aether_settings', JSON.stringify(settings));
    } catch {}
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem('aether_conversations', JSON.stringify(conversations));
    } catch {}
  }, [conversations]);

  useEffect(() => {
    try {
      localStorage.setItem('aether_files', JSON.stringify(files));
    } catch {}
  }, [files]);

  // Handle Theme switching & dynamic system preference listener
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    try {
      const saved = localStorage.getItem('aether_settings');
      const theme = saved ? JSON.parse(saved).theme : 'light';
      if (theme === 'dark') return 'dark';
      if (theme === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      let isDark = false;
      if (settings.theme === 'dark') {
        isDark = true;
      } else if (settings.theme === 'light') {
        isDark = false;
      } else {
        // system
        isDark = mediaQuery.matches;
      }

      if (isDark) {
        root.classList.add('dark');
        setEffectiveTheme('dark');
      } else {
        root.classList.remove('dark');
        setEffectiveTheme('light');
      }
    };

    applyTheme();

    const handleChange = () => {
      if (settings.theme === 'system') {
        applyTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [settings.theme]);

  // Active items helpers
  const activePage = useMemo(() => pages.find((p) => p.id === activePageId) || null, [pages, activePageId]);
  const activeDatabase = useMemo(() => databases.find((d) => d.id === activeDatabaseId) || null, [databases, activeDatabaseId]);
  const activeConversation = useMemo(() => conversations.find((c) => c.id === activeConversationId) || null, [conversations, activeConversationId]);

  // Page Operations
  const createPage = (parentId?: string | null): Page => {
    const newPage: Page = {
      id: `page-${Math.random().toString(36).substring(2, 9)}`,
      title: 'Untitled',
      icon: '📄',
      parentId: parentId || null,
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      blocks: [
        {
          id: `b-${Math.random().toString(36).substring(2, 9)}`,
          type: 'paragraph',
          content: '',
        },
      ],
    };

    setPages((prev) => [newPage, ...prev]);
    setActivePageId(newPage.id);
    setActiveViewMode('page');
    return newPage;
  };

  const duplicatePage = (id: string): Page => {
    const original = pages.find((p) => p.id === id);
    if (!original) return createPage();

    const newPage: Page = {
      ...original,
      id: `page-${Math.random().toString(36).substring(2, 9)}`,
      title: `${original.title} (Copy)`,
      blocks: original.blocks.map((b) => ({
        ...b,
        id: `b-${Math.random().toString(36).substring(2, 9)}`,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setPages((prev) => [newPage, ...prev]);
    setActivePageId(newPage.id);
    setActiveViewMode('page');
    return newPage;
  };

  const updatePage = (id: string, updates: Partial<Page>) => {
    setPages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p))
    );
  };

  const deletePage = (id: string) => {
    const target = pages.find((p) => p.id === id);
    if (target) {
      setTrashPages((prev) => [
        { id: target.id, page: target, deletedAt: new Date().toISOString() },
        ...prev.filter((t) => t.id !== target.id),
      ]);
    }

    setPages((prev) => prev.filter((p) => p.id !== id && p.parentId !== id));
    if (activePageId === id) {
      const remaining = pages.filter((p) => p.id !== id);
      setActivePageId(remaining[0]?.id || null);
    }
  };

  const restorePage = (id: string) => {
    const item = trashPages.find((t) => t.id === id);
    if (!item) return;

    setPages((prev) => [item.page, ...prev]);
    setTrashPages((prev) => prev.filter((t) => t.id !== id));
    setActivePageId(item.page.id);
    setActiveViewMode('page');
  };

  const permanentlyDeletePage = (id: string) => {
    setTrashPages((prev) => prev.filter((t) => t.id !== id));
  };

  const emptyTrash = () => {
    setTrashPages([]);
  };

  const instantiateTemplate = (templateId: string): Page => {
    const tmpl = WORKSPACE_TEMPLATES.find((t) => t.id === templateId);
    if (!tmpl) return createPage();

    const newPageId = `page-${Math.random().toString(36).substring(2, 9)}`;
    const clonedBlocks = tmpl.page.blocks.map((b) => ({
      ...b,
      id: `b-${Math.random().toString(36).substring(2, 9)}`,
    }));

    const newPage: Page = {
      id: newPageId,
      title: tmpl.page.title,
      icon: tmpl.page.icon,
      coverImage: tmpl.page.coverImage,
      parentId: null,
      blocks: clonedBlocks,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (tmpl.database) {
      const newDbId = `db-${Math.random().toString(36).substring(2, 9)}`;
      const newDb: Database = {
        ...tmpl.database,
        id: newDbId,
        rows: tmpl.database.rows.map((r) => ({
          ...r,
          id: `r-${Math.random().toString(36).substring(2, 9)}`,
        })),
      };
      setDatabases((prev) => [newDb, ...prev]);
    }

    setPages((prev) => [newPage, ...prev]);
    setActivePageId(newPage.id);
    setActiveViewMode('page');
    return newPage;
  };

  const toggleFavorite = (id: string) => {
    setPages((prev) => prev.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p)));
  };

  // Block Operations
  const addBlock = (pageId: string, afterBlockId?: string, type: BlockType = 'paragraph'): Block => {
    const newBlock: Block = {
      id: `b-${Math.random().toString(36).substring(2, 9)}`,
      type,
      content: '',
      properties: type === 'todo' ? { checked: false } : type === 'code' ? { language: 'typescript' } : {},
    };

    setPages((prev) =>
      prev.map((page) => {
        if (page.id !== pageId) return page;
        if (!afterBlockId) {
          return { ...page, blocks: [...page.blocks, newBlock] };
        }
        const index = page.blocks.findIndex((b) => b.id === afterBlockId);
        if (index === -1) {
          return { ...page, blocks: [...page.blocks, newBlock] };
        }
        const newBlocks = [...page.blocks];
        newBlocks.splice(index + 1, 0, newBlock);
        return { ...page, blocks: newBlocks };
      })
    );

    return newBlock;
  };

  const updateBlock = (pageId: string, blockId: string, updates: Partial<Block>) => {
    setPages((prev) =>
      prev.map((page) => {
        if (page.id !== pageId) return page;
        return {
          ...page,
          blocks: page.blocks.map((b) => (b.id === blockId ? { ...b, ...updates } : b)),
        };
      })
    );
  };

  const deleteBlock = (pageId: string, blockId: string) => {
    setPages((prev) =>
      prev.map((page) => {
        if (page.id !== pageId) return page;
        // Keep at least one empty block if deleting the last one
        if (page.blocks.length <= 1) {
          return {
            ...page,
            blocks: [{ id: `b-${Math.random().toString(36).substring(2, 9)}`, type: 'paragraph', content: '' }],
          };
        }
        return {
          ...page,
          blocks: page.blocks.filter((b) => b.id !== blockId),
        };
      })
    );
  };

  const moveBlock = (pageId: string, blockId: string, direction: 'up' | 'down') => {
    setPages((prev) =>
      prev.map((page) => {
        if (page.id !== pageId) return page;
        const index = page.blocks.findIndex((b) => b.id === blockId);
        if (index === -1) return page;
        if (direction === 'up' && index === 0) return page;
        if (direction === 'down' && index === page.blocks.length - 1) return page;

        const newBlocks = [...page.blocks];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        const [moved] = newBlocks.splice(index, 1);
        newBlocks.splice(targetIndex, 0, moved);
        return { ...page, blocks: newBlocks };
      })
    );
  };

  const duplicateBlock = (pageId: string, blockId: string) => {
    setPages((prev) =>
      prev.map((page) => {
        if (page.id !== pageId) return page;
        const index = page.blocks.findIndex((b) => b.id === blockId);
        if (index === -1) return page;
        const source = page.blocks[index];
        const copy: Block = {
          ...source,
          id: `b-${Math.random().toString(36).substring(2, 9)}`,
        };
        const newBlocks = [...page.blocks];
        newBlocks.splice(index + 1, 0, copy);
        return { ...page, blocks: newBlocks };
      })
    );
  };

  // Database Operations
  const createDatabase = (): Database => {
    const newDb: Database = {
      id: `db-${Math.random().toString(36).substring(2, 9)}`,
      title: 'New Database',
      icon: '📊',
      activeView: 'table',
      columns: [
        { id: 'col-name', name: 'Name', type: 'text' },
        {
          id: 'col-status',
          name: 'Status',
          type: 'status',
          options: [
            { id: 'not_started', label: 'Not Started', color: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300' },
            { id: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300' },
            { id: 'done', label: 'Done', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300' },
          ],
        },
        { id: 'col-date', name: 'Date', type: 'date' },
      ],
      rows: [
        {
          id: `row-${Math.random().toString(36).substring(2, 9)}`,
          values: {
            'col-name': 'Sample item',
            'col-status': 'not_started',
            'col-date': new Date().toISOString().split('T')[0],
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    };

    setDatabases((prev) => [newDb, ...prev]);
    setActiveDatabaseId(newDb.id);
    setActiveViewMode('database');
    return newDb;
  };

  const updateDatabase = (id: string, updates: Partial<Database>) => {
    setDatabases((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)));
  };

  const deleteDatabase = (id: string) => {
    setDatabases((prev) => prev.filter((d) => d.id !== id));
    if (activeDatabaseId === id) {
      setActiveDatabaseId(null);
      setActiveViewMode('page');
    }
  };

  const addRow = (dbId: string, initialValues: Record<string, any> = {}) => {
    const newRow = {
      id: `row-${Math.random().toString(36).substring(2, 9)}`,
      values: initialValues,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setDatabases((prev) =>
      prev.map((db) => (db.id === dbId ? { ...db, rows: [...db.rows, newRow] } : db))
    );
  };

  const updateRow = (dbId: string, rowId: string, values: Record<string, any>) => {
    setDatabases((prev) =>
      prev.map((db) => {
        if (db.id !== dbId) return db;
        return {
          ...db,
          rows: db.rows.map((r) =>
            r.id === rowId ? { ...r, values: { ...r.values, ...values }, updatedAt: new Date().toISOString() } : r
          ),
        };
      })
    );
  };

  const deleteRow = (dbId: string, rowId: string) => {
    setDatabases((prev) =>
      prev.map((db) => {
        if (db.id !== dbId) return db;
        return { ...db, rows: db.rows.filter((r) => r.id !== rowId) };
      })
    );
  };

  const addColumn = (dbId: string, name: string, type: PropertyType) => {
    const colId = `col-${Math.random().toString(36).substring(2, 9)}`;
    const newCol = { id: colId, name, type };
    setDatabases((prev) =>
      prev.map((db) => (db.id === dbId ? { ...db, columns: [...db.columns, newCol] } : db))
    );
  };

  // Provider Operations
  const updateProvider = (id: string, updates: Partial<AIProviderConfig>) => {
    setProviders((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const addCustomProvider = (provider: Omit<AIProviderConfig, 'id'>) => {
    const newId = `custom-${Math.random().toString(36).substring(2, 9)}`;
    const newProvider: AIProviderConfig = { ...provider, id: newId };
    setProviders((prev) => [...prev, newProvider]);
  };

  const deleteProvider = (id: string) => {
    setProviders((prev) => prev.filter((p) => p.id !== id));
  };

  const updateSettings = (updates: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  // Chat Operations
  const createConversation = (): string => {
    const newId = `conv-${Math.random().toString(36).substring(2, 9)}`;
    const newConv: ChatConversation = {
      id: newId,
      title: 'New Conversation',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newId);
    return newId;
  };

  const deleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConversationId === id) {
      const remaining = conversations.filter((c) => c.id !== id);
      setActiveConversationId(remaining[0]?.id || null);
    }
  };

  const renameConversation = (id: string, title: string) => {
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, title } : c)));
  };

  const addChatMessage = (conversationId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>): string => {
    const msgId = `m-${Math.random().toString(36).substring(2, 9)}`;
    const fullMessage: ChatMessage = {
      ...message,
      id: msgId,
      timestamp: new Date().toISOString(),
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== conversationId) return c;
        const isFirst = c.messages.length === 0;
        const newTitle = isFirst && message.role === 'user' ? message.content.slice(0, 30) : c.title;
        return {
          ...c,
          title: newTitle,
          updatedAt: new Date().toISOString(),
          messages: [...c.messages, fullMessage],
        };
      })
    );

    return msgId;
  };

  const updateChatMessage = (
    conversationId: string,
    messageId: string,
    content: string,
    isStreaming = false,
    sources?: ChatSource[]
  ) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== conversationId) return c;
        return {
          ...c,
          messages: c.messages.map((m) =>
            m.id === messageId ? { ...m, content, isStreaming, ...(sources ? { sources } : {}) } : m
          ),
        };
      })
    );
  };

  // File Operations
  const uploadFile = async (file: File): Promise<WorkspaceFile> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;

        // Try extracting text via backend
        let extractedText = '';
        try {
          const res = await fetch('/api/files/extract', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileName: file.name,
              fileData: dataUrl,
              fileType: file.type,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            extractedText = data.extractedText || '';
          }
        } catch {}

        const newFile: WorkspaceFile = {
          id: `file-${Math.random().toString(36).substring(2, 9)}`,
          name: file.name,
          size: file.size,
          type: file.type || 'application/octet-stream',
          dataUrl,
          extractedText,
          uploadedAt: new Date().toISOString(),
        };

        setFiles((prev) => [newFile, ...prev]);
        resolve(newFile);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const deleteFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  // Search Results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const results: SearchResult[] = [];

    // Search pages
    pages.forEach((page) => {
      if (page.title.toLowerCase().includes(q)) {
        results.push({
          type: 'page',
          id: page.id,
          title: page.title,
          subtitle: 'Page',
          icon: page.icon || '📄',
          pageId: page.id,
        });
      }
      page.blocks.forEach((block) => {
        if (block.content.toLowerCase().includes(q)) {
          results.push({
            type: 'block',
            id: block.id,
            title: block.content.slice(0, 60),
            subtitle: `In ${page.title} (${block.type})`,
            icon: '📝',
            pageId: page.id,
          });
        }
      });
    });

    // Search databases
    databases.forEach((db) => {
      if (db.title.toLowerCase().includes(q) || db.description?.toLowerCase().includes(q)) {
        results.push({
          type: 'database',
          id: db.id,
          title: db.title,
          subtitle: 'Database',
          icon: db.icon || '📊',
          databaseId: db.id,
        });
      }
    });

    // Search files
    files.forEach((file) => {
      if (file.name.toLowerCase().includes(q)) {
        results.push({
          type: 'file',
          id: file.id,
          title: file.name,
          subtitle: `${Math.round(file.size / 1024)} KB`,
          icon: '📎',
        });
      }
    });

    return results.slice(0, 12);
  }, [searchQuery, pages, databases, files]);

  // Export / Import
  const exportWorkspaceJSON = () => {
    const data = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      settings,
      pages,
      databases,
      files: files.map((f) => ({ ...f, dataUrl: '' })), // avoid huge base64
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aether-workspace-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPageMarkdown = (pageId: string) => {
    const page = pages.find((p) => p.id === pageId);
    if (!page) return;

    let md = `# ${page.icon} ${page.title}\n\n`;
    page.blocks.forEach((b) => {
      switch (b.type) {
        case 'heading_1':
          md += `# ${b.content}\n\n`;
          break;
        case 'heading_2':
          md += `## ${b.content}\n\n`;
          break;
        case 'heading_3':
          md += `### ${b.content}\n\n`;
          break;
        case 'bullet_list':
          md += `* ${b.content}\n`;
          break;
        case 'numbered_list':
          md += `1. ${b.content}\n`;
          break;
        case 'todo':
          md += `- [${b.properties?.checked ? 'x' : ' '}] ${b.content}\n`;
          break;
        case 'quote':
          md += `> ${b.content}\n\n`;
          break;
        case 'code':
          md += `\`\`\`${b.properties?.language || ''}\n${b.content}\n\`\`\`\n\n`;
          break;
        case 'callout':
          md += `> **${b.properties?.icon || '💡'}** ${b.content}\n\n`;
          break;
        case 'divider':
          md += `---\n\n`;
          break;
        default:
          md += `${b.content}\n\n`;
      }
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${page.title.toLowerCase().replace(/\s+/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importWorkspaceJSON = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed.pages)) setPages(parsed.pages);
      if (Array.isArray(parsed.databases)) setDatabases(parsed.databases);
      if (parsed.settings) setSettings(parsed.settings);
      return true;
    } catch {
      return false;
    }
  };

  const exportDatabaseCSV = (dbId: string) => {
    const db = databases.find((d) => d.id === dbId);
    if (!db) return;

    const headers = db.columns.map((c) => `"${c.name.replace(/"/g, '""')}"`).join(',');
    const rowLines = db.rows.map((row) => {
      return db.columns
        .map((col) => {
          const val = row.values[col.id];
          const str = val !== undefined && val !== null ? String(val) : '';
          return `"${str.replace(/"/g, '""')}"`;
        })
        .join(',');
    });

    const csvContent = [headers, ...rowLines].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${db.title.toLowerCase().replace(/\s+/g, '-')}-export.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importMarkdownToPage = (title: string, markdown: string): Page => {
    const lines = markdown.split('\n');
    const blocks: Block[] = [];
    let inCodeBlock = false;
    let codeLang = '';
    let codeContent: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeLang = line.replace('```', '').trim() || 'typescript';
          codeContent = [];
        } else {
          inCodeBlock = false;
          blocks.push({
            id: `b-${Math.random().toString(36).substring(2, 9)}`,
            type: 'code',
            content: codeContent.join('\n'),
            properties: { language: codeLang },
          });
        }
        continue;
      }

      if (inCodeBlock) {
        codeContent.push(line);
        continue;
      }

      const trimmed = line.trim();
      if (!trimmed) continue;

      if (trimmed.startsWith('# ')) {
        blocks.push({
          id: `b-${Math.random().toString(36).substring(2, 9)}`,
          type: 'heading_1',
          content: trimmed.replace('# ', '').trim(),
        });
      } else if (trimmed.startsWith('## ')) {
        blocks.push({
          id: `b-${Math.random().toString(36).substring(2, 9)}`,
          type: 'heading_2',
          content: trimmed.replace('## ', '').trim(),
        });
      } else if (trimmed.startsWith('### ')) {
        blocks.push({
          id: `b-${Math.random().toString(36).substring(2, 9)}`,
          type: 'heading_3',
          content: trimmed.replace('### ', '').trim(),
        });
      } else if (trimmed.startsWith('- [ ] ') || trimmed.startsWith('* [ ] ')) {
        blocks.push({
          id: `b-${Math.random().toString(36).substring(2, 9)}`,
          type: 'todo',
          content: trimmed.slice(6).trim(),
          properties: { checked: false },
        });
      } else if (trimmed.startsWith('- [x] ') || trimmed.startsWith('* [x] ') || trimmed.startsWith('- [X] ')) {
        blocks.push({
          id: `b-${Math.random().toString(36).substring(2, 9)}`,
          type: 'todo',
          content: trimmed.slice(6).trim(),
          properties: { checked: true },
        });
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        blocks.push({
          id: `b-${Math.random().toString(36).substring(2, 9)}`,
          type: 'bullet_list',
          content: trimmed.slice(2).trim(),
        });
      } else if (/^\d+\.\s/.test(trimmed)) {
        blocks.push({
          id: `b-${Math.random().toString(36).substring(2, 9)}`,
          type: 'numbered_list',
          content: trimmed.replace(/^\d+\.\s/, '').trim(),
        });
      } else if (trimmed.startsWith('> ')) {
        blocks.push({
          id: `b-${Math.random().toString(36).substring(2, 9)}`,
          type: 'quote',
          content: trimmed.slice(2).trim(),
        });
      } else if (trimmed === '---' || trimmed === '***') {
        blocks.push({
          id: `b-${Math.random().toString(36).substring(2, 9)}`,
          type: 'divider',
          content: '',
        });
      } else {
        blocks.push({
          id: `b-${Math.random().toString(36).substring(2, 9)}`,
          type: 'paragraph',
          content: trimmed,
        });
      }
    }

    const newPage: Page = {
      id: `page-${Math.random().toString(36).substring(2, 9)}`,
      title: title || 'Imported Markdown Note',
      icon: '📝',
      blocks:
        blocks.length > 0
          ? blocks
          : [{ id: `b-${Math.random().toString(36).substring(2, 9)}`, type: 'paragraph', content: '' }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setPages((prev) => [newPage, ...prev]);
    setActivePageId(newPage.id);
    setActiveViewMode('page');
    return newPage;
  };

  return (
    <WorkspaceContext.Provider
      value={{
        pages,
        activePageId,
        activePage,
        setActivePageId,
        databases,
        activeDatabaseId,
        activeDatabase,
        setActiveDatabaseId,
        activeViewMode,
        setActiveViewMode,
        providers,
        activeModel,
        setActiveModel,
        updateProvider,
        addCustomProvider,
        deleteProvider,
        settings,
        updateSettings,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        isSettingsOpen,
        setIsSettingsOpen,
        isTemplatesOpen,
        setIsTemplatesOpen,
        isTrashOpen,
        setIsTrashOpen,
        isImportMarkdownOpen,
        setIsImportMarkdownOpen,
        isOutlineOpen,
        setIsOutlineOpen,
        settingsTab,
        setSettingsTab,
        sidebarCollapsed,
        setSidebarCollapsed,
        createPage,
        duplicatePage,
        updatePage,
        deletePage,
        toggleFavorite,
        trashPages,
        restorePage,
        permanentlyDeletePage,
        emptyTrash,
        instantiateTemplate,
        addBlock,
        updateBlock,
        deleteBlock,
        moveBlock,
        duplicateBlock,
        createDatabase,
        updateDatabase,
        deleteDatabase,
        addRow,
        updateRow,
        deleteRow,
        addColumn,
        conversations,
        activeConversationId,
        activeConversation,
        setActiveConversationId,
        createConversation,
        deleteConversation,
        renameConversation,
        addChatMessage,
        updateChatMessage,
        files,
        uploadFile,
        deleteFile,
        searchQuery,
        setSearchQuery,
        searchResults,
        exportWorkspaceJSON,
        exportPageMarkdown,
        exportDatabaseCSV,
        importWorkspaceJSON,
        importMarkdownToPage,
        effectiveTheme,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error('useWorkspace must be used within a WorkspaceProvider');
  return context;
};
