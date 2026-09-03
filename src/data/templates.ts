import { WorkspaceTemplate } from '../types/workspace';

export const WORKSPACE_TEMPLATES: WorkspaceTemplate[] = [
  {
    id: 'product-roadmap',
    title: 'Product Roadmap & Feature Specs',
    icon: '🚀',
    category: 'Product',
    description: 'A comprehensive PRD layout with executive summary, user problem statements, technical considerations, and release milestones.',
    tags: ['PRD', 'Roadmap', 'Strategy', 'Agile'],
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&auto=format&fit=crop&q=80',
    page: {
      title: 'Product Roadmap & Feature Specs',
      icon: '🚀',
      coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&auto=format&fit=crop&q=80',
      parentId: null,
      blocks: [
        {
          id: 'tmpl-pr-1',
          type: 'callout',
          content: '🎯 **Product Vision**: Deliver an effortless, high-performance experience with zero friction and enterprise-grade intelligence.',
          properties: { icon: '💡', color: 'amber' },
        },
        {
          id: 'tmpl-pr-2',
          type: 'heading_1',
          content: 'Executive Summary & Problem Statement',
        },
        {
          id: 'tmpl-pr-3',
          type: 'paragraph',
          content: 'Modern distributed teams suffer from tool fragmentation. Users waste an average of 42 minutes per day context-switching between separate note editors, database tables, and AI interfaces. This project unifies all core workflows into one cohesive workspace.',
        },
        {
          id: 'tmpl-pr-4',
          type: 'heading_2',
          content: 'Target Personas & User Stories',
        },
        {
          id: 'tmpl-pr-5',
          type: 'bullet_list',
          content: '**Engineering Leads**: Need real-time tech specs, architecture diagrams, and syntax-highlighted code blocks with zero lag.',
        },
        {
          id: 'tmpl-pr-6',
          type: 'bullet_list',
          content: '**Product Managers**: Need linked databases with Kanban boards, sprint timeline dates, and customizable status tags.',
        },
        {
          id: 'tmpl-pr-7',
          type: 'bullet_list',
          content: '**Knowledge Workers**: Want rapid Markdown slash commands and in-line AI assistance to draft, condense, and rewrite.',
        },
        {
          id: 'tmpl-pr-8',
          type: 'heading_2',
          content: 'Release Milestones',
        },
        {
          id: 'tmpl-pr-9',
          type: 'todo',
          content: 'Phase 1: Core block engine & slash command popover',
          properties: { checked: true },
        },
        {
          id: 'tmpl-pr-10',
          type: 'todo',
          content: 'Phase 2: Multi-view relational database with Kanban & Calendar',
          properties: { checked: true },
        },
        {
          id: 'tmpl-pr-11',
          type: 'todo',
          content: 'Phase 3: Universal AI gateway with offline Ollama and streaming',
          properties: { checked: true },
        },
        {
          id: 'tmpl-pr-12',
          type: 'todo',
          content: 'Phase 4: Workspace templates hub, trash recovery, and full CSV export',
          properties: { checked: false },
        },
        {
          id: 'tmpl-pr-13',
          type: 'heading_2',
          content: 'Technical Specs & Data Flow',
        },
        {
          id: 'tmpl-pr-14',
          type: 'code',
          content: `// Workspace State Interface
interface WorkspaceState {
  pages: Page[];
  databases: Database[];
  activeModel: { providerId: string; modelId: string };
  settings: { theme: 'light' | 'dark' };
}`,
          properties: { language: 'typescript' },
        },
      ],
    },
    database: {
      title: 'Feature Release Pipeline',
      icon: '🗺️',
      description: 'Sprint milestones, ownership, and target deliverables',
      activeView: 'board',
      columns: [
        { id: 'c1', name: 'Feature Name', type: 'text' },
        {
          id: 'c2',
          name: 'Status',
          type: 'status',
          options: [
            { id: 'opt-backlog', label: 'Backlog', color: 'zinc' },
            { id: 'opt-in-dev', label: 'In Progress', color: 'blue' },
            { id: 'opt-review', label: 'In Review', color: 'amber' },
            { id: 'opt-shipped', label: 'Shipped', color: 'emerald' },
          ],
        },
        {
          id: 'c3',
          name: 'Priority',
          type: 'select',
          options: [
            { id: 'p-high', label: 'P0 - Urgent', color: 'rose' },
            { id: 'p-med', label: 'P1 - High', color: 'amber' },
            { id: 'p-low', label: 'P2 - Normal', color: 'zinc' },
          ],
        },
        { id: 'c4', name: 'Owner', type: 'person' },
        { id: 'c5', name: 'Release Date', type: 'date' },
      ],
      rows: [
        {
          id: 'r-f1',
          values: {
            c1: 'Local AI (Ollama & LM Studio) Integration',
            c2: 'Shipped',
            c3: 'P0 - Urgent',
            c4: 'Alex Rivera',
            c5: '2026-09-01',
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'r-f2',
          values: {
            c1: 'Trash Recovery & Restore Bin',
            c2: 'In Progress',
            c3: 'P1 - High',
            c4: 'Sarah Chen',
            c5: '2026-09-08',
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'r-f3',
          values: {
            c1: 'Templates Gallery & Instant Cloner',
            c2: 'In Review',
            c3: 'P1 - High',
            c4: 'David Kim',
            c5: '2026-09-12',
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    },
  },
  {
    id: 'weekly-team-sync',
    title: 'Weekly Team Sync & Meeting Notes',
    icon: '👥',
    category: 'Meetings',
    description: 'Keep meetings high-impact with clear agendas, timestamped discussion toggles, explicit key decisions, and assigned follow-up action items.',
    tags: ['Meetings', 'Team', 'Agile', 'Sync'],
    coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&auto=format&fit=crop&q=80',
    page: {
      title: 'Weekly Engineering & Product Sync',
      icon: '👥',
      coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&auto=format&fit=crop&q=80',
      parentId: null,
      blocks: [
        {
          id: 'tmpl-mtg-1',
          type: 'callout',
          content: '📅 **Meeting Schedule**: Every Monday at 10:00 AM PST • Facilitator: Tech Lead • Timekeeper: Product Lead',
          properties: { icon: '🗓️', color: 'blue' },
        },
        {
          id: 'tmpl-mtg-2',
          type: 'heading_2',
          content: 'Attendees',
        },
        {
          id: 'tmpl-mtg-3',
          type: 'bullet_list',
          content: 'Alex Rivera (Engineering)',
        },
        {
          id: 'tmpl-mtg-4',
          type: 'bullet_list',
          content: 'Sarah Chen (Product)',
        },
        {
          id: 'tmpl-mtg-5',
          type: 'bullet_list',
          content: 'Marcus Brody (Design)',
        },
        {
          id: 'tmpl-mtg-6',
          type: 'heading_2',
          content: 'Agenda & Discussion Topics',
        },
        {
          id: 'tmpl-mtg-7',
          type: 'toggle',
          content: '1. Sprint 24 Review & Demo Highlights',
          properties: { open: true },
        },
        {
          id: 'tmpl-mtg-8',
          type: 'paragraph',
          content: 'Demonstrated the zero-config local Ollama connector. Inference response latency benchmark clocked in at 42ms for streaming chunks on local M3 chips.',
        },
        {
          id: 'tmpl-mtg-9',
          type: 'toggle',
          content: '2. Architecture Discussion: Offline Persistence vs Cloud Sync',
          properties: { open: false },
        },
        {
          id: 'tmpl-mtg-10',
          type: 'heading_2',
          content: 'Key Decisions & Consensus',
        },
        {
          id: 'tmpl-mtg-11',
          type: 'callout',
          content: '✅ **Decision**: Client-first IndexedDB and local JSON portability remains our standard for single-player privacy, with optional server-side AI proxy.',
          properties: { icon: '💡', color: 'emerald' },
        },
        {
          id: 'tmpl-mtg-12',
          type: 'heading_2',
          content: 'Action Items & Next Steps',
        },
        {
          id: 'tmpl-mtg-13',
          type: 'todo',
          content: '@Alex: Push CSV export handler to production database view',
          properties: { checked: false },
        },
        {
          id: 'tmpl-mtg-14',
          type: 'todo',
          content: '@Sarah: Finalize template schema for Sprint Retrospective',
          properties: { checked: true },
        },
        {
          id: 'tmpl-mtg-15',
          type: 'todo',
          content: '@Marcus: Refine dark-mode contrast tokens for code blocks',
          properties: { checked: false },
        },
      ],
    },
  },
  {
    id: 'second-brain-para',
    title: 'Personal Knowledge Hub (PARA Method)',
    icon: '🧠',
    category: 'Personal',
    description: 'Tiago Forte’s world-renowned organization system: Projects (active), Areas (standards), Resources (topics of interest), and Archives (dormant items).',
    tags: ['Productivity', 'Second Brain', 'PARA', 'Knowledge'],
    coverImage: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1600&auto=format&fit=crop&q=80',
    page: {
      title: 'My Second Brain & Knowledge Hub',
      icon: '🧠',
      coverImage: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1600&auto=format&fit=crop&q=80',
      parentId: null,
      blocks: [
        {
          id: 'tmpl-sb-1',
          type: 'callout',
          content: '“Your mind is for having ideas, not holding them.” — David Allen. Organize your information based on actionability, not topic.',
          properties: { icon: '💡', color: 'purple' },
        },
        {
          id: 'tmpl-sb-2',
          type: 'heading_1',
          content: 'The 4 Pillars of PARA',
        },
        {
          id: 'tmpl-sb-3',
          type: 'heading_2',
          content: '1. Projects (Short-term efforts with a deadline)',
        },
        {
          id: 'tmpl-sb-4',
          type: 'todo',
          content: 'Launch Aether Workspace v1.2 with CSV export & Trash bin',
          properties: { checked: false },
        },
        {
          id: 'tmpl-sb-5',
          type: 'todo',
          content: 'Write comprehensive documentation for custom Ollama models',
          properties: { checked: false },
        },
        {
          id: 'tmpl-sb-6',
          type: 'heading_2',
          content: '2. Areas of Responsibility (Ongoing standards to maintain)',
        },
        {
          id: 'tmpl-sb-7',
          type: 'bullet_list',
          content: '**Health & Longevity**: Zone 2 cardio, resistance training 4x/wk, 8 hours sleep.',
        },
        {
          id: 'tmpl-sb-8',
          type: 'bullet_list',
          content: '**Financial Autonomy**: Automated index fund contributions, quarterly tax review.',
        },
        {
          id: 'tmpl-sb-9',
          type: 'bullet_list',
          content: '**Craft Mastery**: Read 2 computer science research papers per month.',
        },
        {
          id: 'tmpl-sb-10',
          type: 'heading_2',
          content: '3. Resources (Topics and curiosities for future reference)',
        },
        {
          id: 'tmpl-sb-11',
          type: 'toggle',
          content: 'Deep Learning & LLM Inference Quantization',
          properties: { open: true },
        },
        {
          id: 'tmpl-sb-12',
          type: 'paragraph',
          content: 'GGUF formats (Q4_K_M, Q8_0) balance memory consumption and perplexity. Running 70B models on dual Mac Studio unified memory yields 28 tokens/sec.',
        },
        {
          id: 'tmpl-sb-13',
          type: 'heading_2',
          content: '4. Archives (Completed or inactive projects)',
        },
        {
          id: 'tmpl-sb-14',
          type: 'bullet_list',
          content: 'Archive: 2025 Mobile App Redesign (Shipped Nov 2025)',
        },
      ],
    },
  },
  {
    id: 'system-architecture-spec',
    title: 'System Architecture & Engineering Wiki',
    icon: '🏗️',
    category: 'Engineering',
    description: 'Technical design doc with architectural overview, API contracts, sequence diagrams, latency SLAs, and security compliance.',
    tags: ['Architecture', 'Tech Spec', 'API', 'System Design'],
    coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&auto=format&fit=crop&q=80',
    page: {
      title: 'Distributed System Architecture & Tech Specs',
      icon: '🏗️',
      coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&auto=format&fit=crop&q=80',
      parentId: null,
      blocks: [
        {
          id: 'tmpl-eng-1',
          type: 'callout',
          content: '🛡️ **Architecture SLA**: 99.99% availability, p95 latency < 120ms, zero-retention privacy mode for customer queries.',
          properties: { icon: '🛡️', color: 'blue' },
        },
        {
          id: 'tmpl-eng-2',
          type: 'heading_1',
          content: 'System Overview & Component Topology',
        },
        {
          id: 'tmpl-eng-3',
          type: 'paragraph',
          content: 'The application utilizes a hybrid local-first architecture with optional edge acceleration. All block state and database tables are stored in client-side persistence, while AI requests route through an Express proxy to protect client secrets.',
        },
        {
          id: 'tmpl-eng-4',
          type: 'heading_2',
          content: 'Core API Endpoints',
        },
        {
          id: 'tmpl-eng-5',
          type: 'code',
          content: `POST /api/ai/generate
Content-Type: application/json

Request Payload:
{
  "provider": "gemini" | "ollama" | "openai" | "anthropic",
  "model": "gemini-3.8-flash" | "llama3",
  "messages": [{ "role": "user", "content": "..." }],
  "stream": true,
  "temperature": 0.7
}`,
          properties: { language: 'json' },
        },
        {
          id: 'tmpl-eng-6',
          type: 'heading_2',
          content: 'Security & Encryption Standards',
        },
        {
          id: 'tmpl-eng-7',
          type: 'bullet_list',
          content: 'TLS 1.3 enforced across all transport endpoints.',
        },
        {
          id: 'tmpl-eng-8',
          type: 'bullet_list',
          content: 'Server-side API keys never leak to browser inspect console.',
        },
        {
          id: 'tmpl-eng-9',
          type: 'bullet_list',
          content: 'Local AI mode operates completely on localhost with no outbound WAN sockets.',
        },
      ],
    },
  },
  {
    id: 'company-okrs',
    title: 'Company OKRs & Quarterly Goals',
    icon: '🎯',
    category: 'Strategy',
    description: 'Track high-level Objectives and Key Results with measurable metrics, quarterly timeline gates, and team alignment.',
    tags: ['OKRs', 'Strategy', 'Goals', 'Leadership'],
    coverImage: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1600&auto=format&fit=crop&q=80',
    page: {
      title: 'Company Objectives & Key Results (OKRs)',
      icon: '🎯',
      coverImage: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1600&auto=format&fit=crop&q=80',
      parentId: null,
      blocks: [
        {
          id: 'tmpl-okr-1',
          type: 'callout',
          content: '🚀 **North Star Metric**: Weekly Active Collaborative Workspaces (WACW) growing 15% MoM with > 70% retention.',
          properties: { icon: '🎯', color: 'amber' },
        },
        {
          id: 'tmpl-okr-2',
          type: 'heading_1',
          content: 'Objective 1: Establish Market Leadership in Local-First AI Productivity',
        },
        {
          id: 'tmpl-okr-3',
          type: 'todo',
          content: 'KR 1.1: Support zero-install Ollama and LM Studio integration with 100% offline uptime [Current: 100% Complete]',
          properties: { checked: true },
        },
        {
          id: 'tmpl-okr-4',
          type: 'todo',
          content: 'KR 1.2: Achieve sub-50ms keystroke editor rendering on 10,000-word documents [Current: Achieved]',
          properties: { checked: true },
        },
        {
          id: 'tmpl-okr-5',
          type: 'todo',
          content: 'KR 1.3: Launch pre-built templates gallery across 6 core industry verticals [Current: In Progress]',
          properties: { checked: false },
        },
        {
          id: 'tmpl-okr-6',
          type: 'heading_1',
          content: 'Objective 2: Delight Users with Frictionless Data Portability',
        },
        {
          id: 'tmpl-okr-7',
          type: 'todo',
          content: 'KR 2.1: Provide instant single-click full workspace JSON export and import [Current: Complete]',
          properties: { checked: true },
        },
        {
          id: 'tmpl-okr-8',
          type: 'todo',
          content: 'KR 2.2: Add CSV database export and native Markdown import [Current: Complete]',
          properties: { checked: false },
        },
      ],
    },
  },
  {
    id: 'cornell-study-notes',
    title: 'Cornell Study System & Research Notes',
    icon: '📚',
    category: 'Education',
    description: 'The proven Cornell Method: split notes into Cues/Questions, detailed Lecture Notes, and a bottom Synthesis Summary.',
    tags: ['Study', 'Research', 'Cornell', 'Learning'],
    coverImage: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1600&auto=format&fit=crop&q=80',
    page: {
      title: 'Cornell Research & Lecture Notes',
      icon: '📚',
      coverImage: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1600&auto=format&fit=crop&q=80',
      parentId: null,
      blocks: [
        {
          id: 'tmpl-cn-1',
          type: 'callout',
          content: '📖 **Methodology**: Record notes during lecture. Formulate questions/cues in the left column soon after. Summarize in your own words at the bottom.',
          properties: { icon: '💡', color: 'blue' },
        },
        {
          id: 'tmpl-cn-2',
          type: 'heading_2',
          content: 'Course / Topic: Distributed Systems & Consensus Algorithms',
        },
        {
          id: 'tmpl-cn-3',
          type: 'paragraph',
          content: '**Instructor**: Prof. Lamport • **Date**: Spring Semester • **Keywords**: Paxos, Raft, Byzantine Fault Tolerance, Quorums.',
        },
        {
          id: 'tmpl-cn-4',
          type: 'heading_2',
          content: 'Cues & Self-Test Questions',
        },
        {
          id: 'tmpl-cn-5',
          type: 'bullet_list',
          content: 'Q1: What is the minimum quorum size for a system of N nodes to tolerate F crash faults?',
        },
        {
          id: 'tmpl-cn-6',
          type: 'bullet_list',
          content: 'Q2: How does Raft elect a new leader when the heartbeat timer expires?',
        },
        {
          id: 'tmpl-cn-7',
          type: 'bullet_list',
          content: 'Q3: What distinguishes Byzantine faults from simple crash-stop failures?',
        },
        {
          id: 'tmpl-cn-8',
          type: 'heading_2',
          content: 'Detailed Notes',
        },
        {
          id: 'tmpl-cn-9',
          type: 'paragraph',
          content: 'Raft divides consensus into three sub-problems: Leader Election, Log Replication, and Safety. In any cluster of 2F+1 nodes, a majority quorum of F+1 nodes is guaranteed to overlap with any previously committed quorum by at least one node containing the latest term.',
        },
        {
          id: 'tmpl-cn-10',
          type: 'heading_2',
          content: 'Summary & Key Takeaway',
        },
        {
          id: 'tmpl-cn-11',
          type: 'callout',
          content: '✨ **Synthesis**: Consensus in asynchronous distributed networks cannot guarantee both safety and liveness under network partitions (FLP theorem), but practical protocols like Raft guarantee safety under all conditions and liveness when the network stabilizes.',
          properties: { icon: '✨', color: 'emerald' },
        },
      ],
    },
  },
];
