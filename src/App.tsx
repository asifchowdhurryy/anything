import React from 'react';
import { WorkspaceProvider, useWorkspace } from './context/WorkspaceContext';
import { Sidebar } from './components/sidebar/Sidebar';
import { Topbar } from './components/topbar/Topbar';
import { BlockEditor } from './components/editor/BlockEditor';
import { DatabaseView } from './components/database/DatabaseView';
import { AiChatDrawer } from './components/ai/AiChatDrawer';
import { FilesManager } from './components/files/FilesManager';
import { SettingsModal } from './components/settings/SettingsModal';
import { CommandPalette } from './components/search/CommandPalette';
import { TemplatesModal } from './components/templates/TemplatesModal';
import { TrashModal } from './components/trash/TrashModal';
import { ImportMarkdownModal } from './components/modals/ImportMarkdownModal';

const MainLayout: React.FC = () => {
  const { activeViewMode } = useWorkspace();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans antialiased select-none">
      {/* Notion-style collapsible sidebar */}
      <Sidebar />

      {/* Primary content area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0 select-text">
        <Topbar />

        {/* Dynamic View Router */}
        <main className="flex-1 flex flex-col h-[calc(100vh-3rem)] overflow-hidden relative">
          {activeViewMode === 'page' && <BlockEditor />}
          {activeViewMode === 'database' && <DatabaseView />}
          {activeViewMode === 'ai-chat' && <AiChatDrawer />}
          {activeViewMode === 'files' && <FilesManager />}
        </main>
      </div>

      {/* Global Modals & Palettes */}
      <SettingsModal />
      <CommandPalette />
      <TemplatesModal />
      <TrashModal />
      <ImportMarkdownModal />
    </div>
  );
};

export default function App() {
  return (
    <WorkspaceProvider>
      <MainLayout />
    </WorkspaceProvider>
  );
}
