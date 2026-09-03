export type BlockType =
  | 'paragraph'
  | 'heading_1'
  | 'heading_2'
  | 'heading_3'
  | 'bullet_list'
  | 'numbered_list'
  | 'todo'
  | 'quote'
  | 'divider'
  | 'code'
  | 'callout'
  | 'toggle'
  | 'table'
  | 'bookmark'
  | 'image'
  | 'equation'
  | 'ai_block';

export interface BlockProperties {
  checked?: boolean;
  language?: string;
  icon?: string;
  color?: string;
  open?: boolean;
  tableData?: string[][];
  url?: string;
  caption?: string;
  prompt?: string;
  status?: 'idle' | 'generating' | 'done';
}

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  properties?: BlockProperties;
}

export interface Page {
  id: string;
  title: string;
  icon: string;
  coverImage?: string;
  parentId?: string | null;
  isFavorite?: boolean;
  blocks: Block[];
  createdAt: string;
  updatedAt: string;
  fontFamily?: 'sans' | 'serif' | 'mono';
  smallText?: boolean;
  fullWidth?: boolean;
  isLocked?: boolean;
}

export interface TrashItem {
  id: string;
  page: Page;
  deletedAt: string;
}

export interface WorkspaceTemplate {
  id: string;
  title: string;
  icon: string;
  category: 'Product' | 'Engineering' | 'Meetings' | 'Personal' | 'Strategy' | 'Education';
  description: string;
  tags: string[];
  coverImage?: string;
  page: Omit<Page, 'id' | 'createdAt' | 'updatedAt'>;
  database?: Omit<Database, 'id'>;
}

export type PropertyType =
  | 'text'
  | 'number'
  | 'select'
  | 'multi_select'
  | 'status'
  | 'date'
  | 'checkbox'
  | 'person'
  | 'url'
  | 'email';

export interface SelectOption {
  id: string;
  label: string;
  color: string;
}

export interface DatabaseColumn {
  id: string;
  name: string;
  type: PropertyType;
  options?: SelectOption[];
}

export interface DatabaseRow {
  id: string;
  values: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export type DatabaseViewType = 'table' | 'board' | 'list' | 'calendar' | 'gallery';

export interface Database {
  id: string;
  title: string;
  icon: string;
  description?: string;
  columns: DatabaseColumn[];
  rows: DatabaseRow[];
  activeView: DatabaseViewType;
  filter?: {
    columnId: string;
    value: string;
  };
  sort?: {
    columnId: string;
    direction: 'asc' | 'desc';
  };
}

export type UniversalProviderType =
  | 'gemini'
  | 'openai'
  | 'anthropic'
  | 'groq'
  | 'mistral'
  | 'deepseek'
  | 'openrouter'
  | 'together'
  | 'ollama'
  | 'lmstudio'
  | 'custom';

export interface AIProviderConfig {
  id: string;
  name: string;
  providerType: UniversalProviderType;
  apiKey?: string;
  baseUrl?: string;
  isLocal: boolean;
  enabled: boolean;
  defaultModel: string;
  availableModels: string[];
  description?: string;
}

export interface ActiveAIModel {
  providerId: string;
  modelId: string;
  isAuto: boolean;
}

export interface ChatSource {
  pageId: string;
  title: string;
  excerpt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  modelUsed?: string;
  providerUsed?: string;
  sources?: ChatSource[];
  isStreaming?: boolean;
}

export interface ChatConversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceFile {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl: string;
  pageId?: string;
  extractedText?: string;
  uploadedAt: string;
}

export interface UserSettings {
  workspaceName: string;
  workspaceIcon: string;
  theme: 'light' | 'dark' | 'system';
  autoContext: boolean;
  privacyMode: boolean;
  defaultSystemPrompt: string;
  temperature: number;
  maxTokens: number;
}
