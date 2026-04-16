import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FolderOpen,
  Music,
  Brain,
  Archive,
  Star,
  Settings,
  HelpCircle,
  Search,
  Bell,
  UserCircle,
  LayoutGrid,
  List,
  MoreVertical,
  Play,
  BadgeCheck,
  TrendingUp,
  Info,
  Filter,
  ArrowDownWideNarrow,
  Share2,
  Trash2,
  Download,
  ChevronDown,
  ChevronUp,
  X,
  Link as LinkIcon,
  Twitter,
  Facebook,
  Menu,
  Activity,
  History,
  Loader2,
  Pause,
  CheckCircle,
  FileText,
  Square,
  UploadCloud,
  FileAudio,
  Plus,
  Database,
  Sparkles,
  Zap,
  AlertTriangle,
  Target,
  Award,
  BarChart3,
  TrendingDown,
  Crosshair,
  ShieldCheck,
  Lightbulb,
  RefreshCw,
  Eye,
  Star,
  Archive,
  ArrowRight,
  Crown,
  Video,
} from 'lucide-react';

import { db } from './db';
import WaveformVisualizer from './components/WaveformVisualizer';

// ─── Types ──────────────────────────────────────────────────────────────────

interface NeuralInsights {
  summary: {
    quality: string;
    diagnosis: string;
  };
  weaknesses: string[];
  actions: string[];
  optimized_script: string | null;
  variant_ranking: {
    name: string;
    rank: number;
    engagement_score: number;
    strengths: string;
    weaknesses: string;
  }[];
  winner: {
    name: string;
    reason: string;
    dominant_signal: string;
  };
  _raw?: {
    variantName: string;
    tribeMarkdown: string;
  }[];
}

// ─── Context ────────────────────────────────────────────────────────────────

const ToastContext = React.createContext<{ showToast: (msg: string) => void }>({ showToast: () => {} });
const useToast = () => React.useContext(ToastContext);

// ─── Quality Badge Colors ───────────────────────────────────────────────────

const qualityConfig: Record<string, { color: string; bg: string; border: string; glow: string; icon: React.ReactNode }> = {
  Elite: { 
    color: 'text-tertiary', 
    bg: 'bg-tertiary/10', 
    border: 'border-tertiary/30', 
    glow: 'shadow-[0_0_40px_rgba(183,254,77,0.3)]',
    icon: <Crown size={24} />
  },
  Strong: { 
    color: 'text-green-400', 
    bg: 'bg-green-400/10', 
    border: 'border-green-400/30', 
    glow: 'shadow-[0_0_30px_rgba(74,222,128,0.2)]',
    icon: <BadgeCheck size={24} />
  },
  Good: { 
    color: 'text-secondary', 
    bg: 'bg-secondary/10', 
    border: 'border-secondary/30', 
    glow: 'shadow-[0_0_30px_rgba(105,156,255,0.2)]',
    icon: <Activity size={24} />
  },
  Average: { 
    color: 'text-yellow-400', 
    bg: 'bg-yellow-400/10', 
    border: 'border-yellow-400/30', 
    glow: 'shadow-[0_0_20px_rgba(250,204,21,0.15)]',
    icon: <Info size={24} />
  },
  Bad: { 
    color: 'text-red-400', 
    bg: 'bg-red-400/10', 
    border: 'border-red-400/30', 
    glow: 'shadow-[0_0_30px_rgba(248,113,113,0.25)]',
    icon: <AlertTriangle size={24} />
  },
};

const signalIcons: Record<string, React.ReactNode> = {
  emotion: <Zap size={14} />,
  recall: <Brain size={14} />,
  attention: <Eye size={14} />,
  virality: <TrendingUp size={14} />,
  intent: <Target size={14} />,
};

// ─── Neural Insights Panel ──────────────────────────────────────────────────

const NeuralInsightsPanel = ({ insights, isLoading, onClose }: { insights: NeuralInsights | null; isLoading: boolean; onClose?: () => void }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'actions' | 'script' | 'raw'>('overview');

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface-container-low/30 border border-primary/20 rounded-2xl p-8 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-[shimmer_2s_infinite] w-[200%] -translate-x-1/2"></div>
        <div className="flex flex-col items-center gap-4 relative z-10">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Brain className="text-primary animate-pulse" size={28} />
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border-2 border-transparent border-t-primary/40 rounded-full"
            />
          </div>
          <div className="text-center">
            <h3 className="text-sm font-headline font-bold text-primary">Running Neural Analysis...</h3>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-2">
              TRIBE v2 is processing engagement, emotion, and recall patterns
            </p>
          </div>
          <div className="flex items-center gap-2 mt-2">
            {['Engagement', 'Emotion', 'Recall', 'Attention'].map((label, i) => (
              <motion.span
                key={label}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                className="text-[8px] uppercase tracking-widest text-on-surface-variant/60 bg-surface-container/50 px-2 py-1 rounded"
              >
                {label}
              </motion.span>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  if (!insights) return null;

  const isSimulated = insights._raw?.some(r => r.tribeMarkdown?.toLowerCase().includes('failed') || r.tribeMarkdown?.toLowerCase().includes('timeout'));
  const qConfig = qualityConfig[insights.summary?.quality || 'Average'] || qualityConfig.Average;

  const diagnosisFallback = {
    Elite: "Neural benchmarks indicate industry-leading engagement potential across all markers.",
    Strong: "Content shows strong alignment with neuro-retention patterns and emotional cues.",
    Good: "Performance markers are above average with minor hook optimization recommended.",
    Average: "Baseline engagement detected. Substantial friction noted in cognitive load metrics.",
    Bad: "Critical friction detected. High cognitive load and low emotional connectivity benchmarks."
  }[insights.summary?.quality || 'Average'] || "Processing neural diagnostic...";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface-container-low/20 border border-outline/10 rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-outline/10 bg-surface-container-low/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2.5 rounded-xl text-primary">
              <Zap size={20} />
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-on-surface">Neural Analysis</h3>
              <p className="text-[10px] text-on-surface-variant mt-0.5">TRIBE v2 Intelligence Report</p>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface p-1">
              <X size={18} />
            </button>
          )}
        </div>

        {/* Quality Badge */}
        <div className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-700 ${qConfig.border} ${qConfig.bg} ${qConfig.glow}`}>
          <div className="flex items-center gap-3">
            <div className={`text-2xl font-headline font-extrabold ${qConfig.color}`}>
              {insights.summary?.quality || 'Analyzing'}
            </div>
            <div className="w-px h-8 bg-outline/20" />
            <div className="flex flex-col">
              {isSimulated && (
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                  <span className="text-[8px] uppercase tracking-widest font-bold text-yellow-400/80">Neural Bypass Active (AI Simulated)</span>
                </div>
              )}
              <p className="text-xs text-on-surface/80 max-w-sm leading-relaxed">
                {insights.summary?.diagnosis || diagnosisFallback}
              </p>
            </div>
          </div>
          <div className={qConfig.color}>{qConfig.icon}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-outline/10">
        {[
          { key: 'overview' as const, label: 'Insights', icon: <BarChart3 size={14} /> },
          { key: 'actions' as const, label: 'Actions', icon: <Lightbulb size={14} /> },
          ...(insights.optimized_script ? [{ key: 'script' as const, label: 'Optimized', icon: <FileText size={14} /> }] : []),
          ...(insights._raw ? [{ key: 'raw' as const, label: 'Raw', icon: <Database size={14} /> }] : []),
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] uppercase tracking-widest font-bold transition-all border-b-2 ${
              activeTab === tab.key
                ? 'text-primary border-primary bg-primary/5'
                : 'text-on-surface-variant border-transparent hover:text-on-surface hover:bg-white/5'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              {/* Weaknesses */}
              <div>
                <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-red-400/80 flex items-center gap-2 mb-3">
                  <AlertTriangle size={14} /> Key Weaknesses
                </h4>
                <div className="space-y-2">
                  {insights.weaknesses?.map((w, i) => (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      transition={{ delay: i * 0.1 }}
                      key={i} 
                      className="flex items-start gap-3 p-3 bg-red-500/5 border border-red-500/10 rounded-xl hover:bg-red-500/10 transition-colors"
                    >
                      <span className="text-[9px] font-bold text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded mt-0.5 shrink-0">W{i + 1}</span>
                      <p className="text-xs text-on-surface/80 leading-relaxed">{w}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Winner */}
              {insights.winner && (
                <div className="p-4 bg-tertiary/5 border border-tertiary/20 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <Crown size={16} className="text-tertiary" />
                    <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-tertiary">Winner</h4>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-headline font-bold text-on-surface">{insights.winner?.name}</p>
                      <p className="text-xs text-on-surface-variant mt-1">{insights.winner?.reason}</p>
                    </div>
                    <div className="flex items-center gap-2 bg-tertiary/10 px-3 py-1.5 rounded-lg">
                      {signalIcons[insights.winner?.dominant_signal || ''] || <Zap size={14} />}
                      <span className="text-[10px] uppercase tracking-widest font-bold text-tertiary">{insights.winner?.dominant_signal}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Variant Ranking */}
              {insights.variant_ranking && (insights.variant_ranking?.length || 0) > 1 && (
                <div>
                  <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant flex items-center gap-2 mb-3">
                    <Award size={14} /> Variant Ranking
                  </h4>
                  <div className="space-y-2">
                    {insights.variant_ranking?.slice().sort((a: any, b: any) => b.score - a.score).map((v: any) => (
                      <div key={v.name} className="flex items-center gap-4 p-3 bg-surface-container/30 border border-outline/10 rounded-xl">
                        <span className={`text-sm font-headline font-extrabold ${v.rank === 1 ? 'text-tertiary' : v.rank === 2 ? 'text-secondary' : 'text-on-surface-variant'}`}>
                          #{v.rank}
                        </span>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-on-surface">{v.name}</p>
                          <p className="text-[10px] text-on-surface-variant mt-0.5">{v.strengths}</p>
                        </div>
                        {v.engagement_score > 0 && (
                          <span className="text-xs font-bold text-primary">{(v.engagement_score * 100).toFixed(0)}%</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'actions' && (
            <motion.div key="actions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary flex items-center gap-2 mb-2">
                <Crosshair size={14} /> Optimization Actions
              </h4>
              {insights.actions?.map((a, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: i * 0.1 }}
                  key={i} 
                  className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/10 rounded-xl group hover:border-primary/30 transition-colors"
                >
                  <div className="w-7 h-7 shrink-0 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-headline font-bold text-xs">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-on-surface leading-relaxed">{a}</p>
                  </div>
                  <ArrowRight size={14} className="text-on-surface-variant/40 group-hover:text-primary transition-colors shrink-0 mt-0.5" />
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'script' && insights.optimized_script && (
            <motion.div key="script" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-secondary flex items-center gap-2 mb-3">
                <FileText size={14} /> Optimized Script
              </h4>
              <div className="bg-black/30 border border-secondary/10 rounded-xl p-5 relative group">
                <p className="text-sm text-on-surface/90 leading-relaxed font-light whitespace-pre-wrap">{insights.optimized_script}</p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(insights.optimized_script || '');
                  }}
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-surface-container-high hover:bg-surface-variant text-on-surface-variant px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-widest border border-outline/10"
                >
                  Copy
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'raw' && insights._raw && (
            <motion.div key="raw" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant flex items-center gap-2 mb-2">
                <Database size={14} /> Raw TRIBE v2 Output
              </h4>
              {insights._raw?.map((raw, i) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  transition={{ delay: i * 0.1 }}
                  key={i} 
                  className="bg-black/30 border border-outline/10 rounded-xl p-4 overflow-hidden relative"
                >
                  {raw.tribeMarkdown?.toLowerCase().includes('failed') && (
                    <div className="absolute top-4 right-4 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded text-[8px] uppercase tracking-widest font-bold text-red-400">
                      Connection Failed
                    </div>
                  )}
                  <p className="text-[10px] text-primary uppercase tracking-widest font-bold mb-3">{raw.variantName}</p>
                  <pre className="text-[11px] text-on-surface-variant/80 whitespace-pre-wrap leading-relaxed font-mono overflow-auto max-h-60 custom-scrollbar bg-black/20 p-3 rounded-lg border border-outline/5">
                    {raw.tribeMarkdown}
                  </pre>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// ─── Sidebar ────────────────────────────────────────────────────────────────

const Sidebar = ({ 
  className, 
  onClose, 
  onNewProject, 
  projects, 
  onSelectProject, 
  onDeleteProject, 
  currentProjectId, 
  activeView, 
  onViewChange 
}: { 
  className?: string, 
  onClose?: () => void, 
  onNewProject?: () => void,
  projects?: any[],
  onSelectProject?: (project: any) => void,
  onDeleteProject?: (project: any) => void,
  currentProjectId?: string,
  activeView: 'dashboard' | 'library',
  onViewChange: (view: 'dashboard' | 'library') => void
}) => {
  const { showToast } = useToast();
  return (
  <aside className={`flex flex-col py-10 px-6 glass-panel z-50 ${className}`}>
    {/* ... (Header keeps existing content, simplified for brevity) ... */}
    <div className="mb-12 flex justify-between items-start">
      <div>
        <h1 className="text-lg font-headline font-bold tracking-tight text-[#dee5ff]">Oumi Audio</h1>
        <p className="font-headline font-normal text-[9px] uppercase tracking-[0.2em] text-on-surface-variant/70">Creative Intelligence</p>
      </div>
      {onClose && (
        <button onClick={onClose} className="lg:hidden text-on-surface-variant hover:text-on-surface">
          <X size={24} />
        </button>
      )}
    </div>
    <button 
      onClick={() => { 
        if (onNewProject) onNewProject();
        if (onClose) onClose(); 
      }}
      className="mb-10 w-full py-2.5 px-4 rounded-lg bg-primary/10 border border-primary/20 text-primary font-headline font-medium text-[11px] uppercase tracking-widest hover:bg-primary/20 transition-all duration-300"
    >
      New Project
    </button>
    <nav className="flex-1 space-y-1">
      <a 
        onClick={(e) => { 
          e.preventDefault(); 
          onViewChange('dashboard');
          if (onClose) onClose(); 
        }} 
        className={`flex items-center gap-3 py-2.5 px-4 rounded-lg transition-all ${activeView === 'dashboard' ? 'text-primary bg-primary/5 font-medium' : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'}`} 
        href="#"
      >
        <FolderOpen size={20} strokeWidth={1.5} />
        <span className="font-headline text-[11px] uppercase tracking-widest">Projects</span>
      </a>
      <a 
        onClick={(e) => { 
          e.preventDefault(); 
          onViewChange('library');
          if (onClose) onClose(); 
        }} 
        className={`flex items-center gap-3 py-2.5 px-4 rounded-lg transition-all ${activeView === 'library' ? 'text-primary bg-primary/5 font-medium' : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'}`} 
        href="#"
      >
        <Music size={20} strokeWidth={1.5} />
        <span className="font-headline text-[11px] uppercase tracking-widest">Library</span>
      </a>
      <a onClick={(e) => { e.preventDefault(); showToast("Opening Creative Memory..."); if (onClose) onClose(); }} className="flex items-center gap-3 py-2.5 px-4 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all" href="#">
        <Brain size={20} strokeWidth={1.5} />
        <span className="font-headline text-[11px] uppercase tracking-widest">Creative Memory</span>
      </a>
      <a onClick={(e) => { e.preventDefault(); showToast("Opening Settings..."); if (onClose) onClose(); }} className="flex items-center gap-3 py-2.5 px-4 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all" href="#">
        <Settings size={20} strokeWidth={1.5} />
        <span className="font-headline text-[11px] uppercase tracking-widest">Settings</span>
      </a>
    </nav>

    {/* Project List */}
    <div className="mt-10 flex-1 overflow-y-auto custom-scrollbar pr-2">
      <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant/50 px-4 mb-4">Recent Projects</h3>
      <div className="space-y-1">
        {projects?.map((p) => (
          <div key={p.projectId} className="group relative">
            <button
              onClick={() => {
                if (onSelectProject) onSelectProject(p);
                if (onClose) onClose();
              }}
              className={`w-full text-left px-4 py-2 rounded-lg transition-all flex items-center gap-3 ${currentProjectId === p.projectId ? 'bg-primary/10 text-primary border border-primary/20' : 'text-on-surface-variant hover:bg-white/5 hover:text-on-surface border border-transparent'}`}
            >
              <FolderOpen size={16} className={currentProjectId === p.projectId ? 'text-primary' : 'text-on-surface-variant/40 group-hover:text-on-surface-variant'} />
              <span className="text-[11px] truncate flex-1">{p.projectName}</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onDeleteProject) {
                  onDeleteProject(p);
                }
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 opacity-0 group-hover:opacity-100 text-on-surface-variant/40 hover:text-error transition-all"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {(!projects || projects.length === 0) && (
          <p className="px-4 text-[10px] text-on-surface-variant/40 italic">No projects yet</p>
        )}
      </div>
    </div>
    <div className="mt-auto pt-6 border-t border-outline/5">
      <a onClick={(e) => { e.preventDefault(); showToast("Opening Help Center..."); if (onClose) onClose(); }} className="flex items-center gap-3 py-2 px-4 rounded-lg text-on-surface-variant/60 hover:text-on-surface transition-colors" href="#">
        <HelpCircle size={18} strokeWidth={1.5} />
        <span className="font-headline text-[10px] uppercase tracking-widest">Help Center</span>
      </a>
    </div>
  </aside>
  );
};

const Header = ({ onLeftMenuClick, onRightMenuClick }: { onLeftMenuClick: () => void, onRightMenuClick: () => void }) => {
  return (
    <header className="sticky top-0 right-0 w-full h-14 flex items-center justify-between px-4 md:px-10 z-40 glass-nav border-b border-outline/5">
      <div className="flex-1 flex justify-start">
        <button className="lg:hidden text-on-surface-variant hover:text-on-surface" onClick={onLeftMenuClick}>
          <Menu size={24} />
        </button>
      </div>
      <div className="flex-1 flex justify-end">
        <button className="xl:hidden text-on-surface-variant hover:text-on-surface" onClick={onRightMenuClick}>
          <Activity size={24} />
        </button>
      </div>
    </header>
  );
};


const slides = [
  {
    id: 1,
    title: (
      <>
        Audio <span className="text-primary text-glow">Synthesis</span> Studio
      </>
    ),
    description: "Synthesize high-conversion audio variants leveraging neuro-data benchmarks.",
    bgImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuBAwy1qTJq5IoSIxJjSay1R2k8Al8xJASl664pkYLeqKhC3Mg0igOn27VGlInwSCjSH1HyvUtS8quzrAhxmBVxbTGGonjiEVwSZLuDLK4QeGQSiBMXKh5Ykeosce2OhZNZytWYxGeOxZN0Y5gxlslpu7AvpCCc8ZySOnKBvH7poo_qcYJpeROyS6hxv7t3YY6EPHXB9NjuiOBxl9ro-R0LQluHCBeIIDYs8weOO7i_z72UrkLt2hAAiMsDIotT6og_QiBa_-pTrina7"
  },
  {
    id: 2,
    title: (
      <>
        Create audio that <br/><span className="text-primary text-glow">brains remember.</span>
      </>
    ),
    description: "Leverage neuro-data to synthesize high-conversion audio variants in seconds.",
    bgImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuBAwy1qTJq5IoSIxJjSay1R2k8Al8xJASl664pkYLeqKhC3Mg0igOn27VGlInwSCjSH1HyvUtS8quzrAhxmBVxbTGGonjiEVwSZLuDLK4QeGQSiBMXKh5Ykeosce2OhZNZytWYxGeOxZN0Y5gxlslpu7AvpCCc8ZySOnKBvH7poo_qcYJpeROyS6hxv7t3YY6EPHXB9NjuiOBxl9ro-R0LQluHCBeIIDYs8weOO7i_z72UrkLt2hAAiMsDIotT6og_QiBa_-pTrina7"
  }
];

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-72 rounded-xl overflow-hidden group border border-outline/10 shadow-2xl bg-surface-container-lowest">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 flex items-center px-12"
        >
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
            style={{backgroundImage: `url('${slides[currentSlide].bgImage}')`}}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent"></div>
          <div className="relative z-10 max-w-lg">
            <h2 className="text-4xl font-headline font-extrabold tracking-tighter text-on-surface mb-4 leading-tight">
              {slides[currentSlide].title}
            </h2>
            <p className="text-on-surface-variant text-base max-w-sm">
              {slides[currentSlide].description}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
      
      <div className="absolute bottom-6 left-12 flex gap-2 z-20">
        {slides?.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-8 bg-primary' : 'w-2 bg-on-surface-variant/40 hover:bg-on-surface-variant'}`}
          />
        ))}
      </div>
    </section>
  );
};

const Controls = ({ onGenerate, onAnalyzeAll, variants, isAnalyzing }: { onGenerate: () => void, onAnalyzeAll: () => void, variants: any[], isAnalyzing: boolean }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateClick = async () => {
    setIsGenerating(true);
    await onGenerate();
    setIsGenerating(false);
  };

  return (
  <section className="space-y-4">
    <div className="flex flex-wrap items-center gap-4">
      <button 
        onClick={handleGenerateClick}
        disabled={isGenerating}
        className="bg-primary text-on-primary px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-lg shadow-primary/20"
      >
        {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
        {isGenerating ? 'Generating...' : 'Generate Audio Variants'}
      </button>
      {variants.length > 0 && (
        <button 
          onClick={onAnalyzeAll}
          disabled={isAnalyzing}
          className="bg-tertiary/10 text-tertiary px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-tertiary/20 transition-colors flex items-center gap-2 border border-tertiary/20"
        >
          {isAnalyzing ? <Loader2 size={14} className="animate-spin" /> : <Brain size={14} />}
          {isAnalyzing ? 'Analyzing...' : 'Analyze All with TRIBE v2'}
        </button>
      )}
    </div>
  </section>
  );
};

const VariantCard = ({ 
  variant, 
  rank, 
  isSelected, 
  onToggleSelect, 
  onDelete, 
  onAnalyze, 
  isAnalyzing,
  showProject = false,
  isBenchmarking = false,
  onBenchmark,
  onFinalize
}: { 
  variant: any, 
  rank: number, 
  isSelected: boolean, 
  onToggleSelect: (id: string) => void, 
  onDelete: (id: string) => void, 
  onAnalyze: (variant: any) => void, 
  isAnalyzing: boolean,
  showProject?: boolean,
  isBenchmarking?: boolean,
  onBenchmark?: (variant: any) => void,
  onFinalize?: (variant: any) => void
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const { showToast } = useToast();

  const handlePlayToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      showToast(`Playing ${variant.name}...`);
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = variant.audioUrl;
    const mimeType = variant.audioUrl.split(';')[0]?.split(':')[1] || 'audio/wav';
    const extension = mimeType.split('/')[1] || 'wav';
    link.download = `${variant.name.replace(/\s+/g, '_')}_${variant.variantId || 'audio'}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Downloading ${variant.name}...`);
  };


  return (
    <div className={`p-6 rounded-2xl flex flex-col gap-5 transition-all duration-300 border ${isSelected ? 'bg-primary/5 border-primary/30 shadow-[0_0_30px_rgba(var(--color-primary),0.15)]' : 'bg-surface-container-low/20 border-outline/10 hover:border-primary/30 hover:bg-surface-bright/40'}`}>
      <div className="flex justify-between items-start cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-start gap-4">
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleSelect(variant.id); }}
            className={`mt-1 w-5 h-5 rounded border flex items-center justify-center transition-all ${isSelected ? 'bg-primary border-primary text-on-primary' : 'border-outline/30 text-transparent hover:border-primary/50'}`}
          >
            <BadgeCheck size={14} className={isSelected ? "opacity-100" : "opacity-0"} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${rank === 1 ? 'bg-tertiary/20 text-tertiary' : rank === 2 ? 'bg-secondary/20 text-secondary' : 'bg-surface-variant text-on-surface-variant'}`}>
                #{rank}
              </span>
              <span className={`text-[9px] ${variant.typeColor} uppercase tracking-widest font-bold block`}>{variant.type}</span>
              {variant.isFinalized && (
                <span className="text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded uppercase font-bold tracking-widest flex items-center gap-1">
                  <Star size={8} fill="currentColor" /> Finalized
                </span>
              )}
            </div>
            <h4 className="font-headline font-semibold text-base tracking-tight text-on-surface flex items-center gap-2">
              {variant.name}
              {showProject && (
                <span className="text-[10px] bg-white/5 border border-outline/10 px-2 py-0.5 rounded text-on-surface-variant font-normal">
                  {variant.projectName}
                </span>
              )}
            </h4>
            <p className="text-[9px] text-on-surface-variant/50 uppercase tracking-widest mt-1">{variant.timeAgo} • {variant.sampleRate} {variant.quality}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Analyze Button */}
          <div className="relative group flex items-center justify-center">
            <button 
              onClick={(e) => { e.stopPropagation(); onAnalyze(variant); }} 
              disabled={isAnalyzing}
              className={`text-on-surface-variant/40 hover:text-tertiary transition-colors p-1 ${isAnalyzing ? 'animate-pulse' : ''}`}
            >
              {isAnalyzing ? <Loader2 size={16} className="animate-spin text-tertiary" /> : <Brain size={16} />}
            </button>
            <span className="absolute -top-8 scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all bg-surface-container-high text-on-surface text-[10px] px-2 py-1 rounded whitespace-nowrap pointer-events-none border border-outline/10 z-10">Analyze with TRIBE v2</span>
          </div>
          <div className="relative group flex items-center justify-center">
            <button 
              onClick={handleDownload}
              className="text-on-surface-variant/40 hover:text-primary transition-colors p-1"
            >
              <Download size={16} />
            </button>
            <span className="absolute -top-8 scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all bg-surface-container-high text-on-surface text-[10px] px-2 py-1 rounded whitespace-nowrap pointer-events-none border border-outline/10 z-10">Download Audio</span>
          </div>
          <div className="relative group flex items-center justify-center">
            <button onClick={(e) => { e.stopPropagation(); setIsShareOpen(true); }} className="text-on-surface-variant/40 hover:text-primary transition-colors p-1">
              <Share2 size={16} />
            </button>
            <span className="absolute -top-8 scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all bg-surface-container-high text-on-surface text-[10px] px-2 py-1 rounded whitespace-nowrap pointer-events-none border border-outline/10 z-10">Share</span>
          </div>
          <div className="relative group flex items-center justify-center">
            <button onClick={(e) => { e.stopPropagation(); setIsDeleteOpen(true); }} className="text-on-surface-variant/40 hover:text-error transition-colors p-1">
              <Trash2 size={16} />
            </button>
            <span className="absolute -top-8 scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all bg-surface-container-high text-on-surface text-[10px] px-2 py-1 rounded whitespace-nowrap pointer-events-none border border-outline/10 z-10">Delete</span>
          </div>
          <div className="relative group flex items-center justify-center">
            <button 
              onClick={(e) => { e.stopPropagation(); if (onBenchmark) onBenchmark(variant); }} 
              className={`transition-colors p-1 ${isBenchmarking ? 'text-primary' : 'text-on-surface-variant/40 hover:text-primary'}`}
            >
              <BarChart3 size={16} />
            </button>
            <span className="absolute -top-8 scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all bg-surface-container-high text-on-surface text-[10px] px-2 py-1 rounded whitespace-nowrap pointer-events-none border border-outline/10 z-10">
              {isBenchmarking ? 'Remove from Benchmark' : 'Add to Benchmark'}
            </span>
          </div>
          <div className="relative group flex items-center justify-center">
            <button 
              onClick={(e) => { e.stopPropagation(); if (onFinalize) onFinalize(variant); }} 
              className={`transition-colors p-1 ${variant.isFinalized ? 'text-primary' : 'text-on-surface-variant/40 hover:text-primary'}`}
            >
              <Star size={16} fill={variant.isFinalized ? "currentColor" : "none"} />
            </button>
            <span className="absolute -top-8 scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all bg-surface-container-high text-on-surface text-[10px] px-2 py-1 rounded whitespace-nowrap pointer-events-none border border-outline/10 z-10">
              {variant.isFinalized ? 'Unfinalize Asset' : 'Mark as Finalized'}
            </span>
          </div>
          <div className="relative group flex items-center justify-center">
            <button className="text-on-surface-variant/40 hover:text-on-surface transition-colors p-1">
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            <span className="absolute -top-8 scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all bg-surface-container-high text-on-surface text-[10px] px-2 py-1 rounded whitespace-nowrap pointer-events-none border border-outline/10 z-10">{isExpanded ? 'Collapse' : 'Expand'}</span>
          </div>
        </div>
      </div>
      
      <div className="flex gap-2">
        <div className="bg-surface-container/40 px-2 py-1 rounded text-[9px] font-bold text-tertiary border border-outline/5">Score {variant.score}</div>
        <div className="bg-surface-container/40 px-2 py-1 rounded text-[9px] font-bold text-secondary border border-outline/5">Mem {variant.memoryRetention}</div>
        <div className="bg-surface-container/40 px-2 py-1 rounded text-[9px] font-bold text-primary border border-outline/5">Aff {variant.brandAffinity}</div>
      </div>

      <div className="h-12 w-full bg-black/20 rounded-lg flex items-center px-4 relative overflow-hidden group">
        <WaveformVisualizer 
          audioUrl={variant.audioUrl} 
          isPlaying={isPlaying} 
          onPlayPause={setIsPlaying}
          progressColor="#e7ffc4" 
          waveColor="rgba(59, 66, 112, 0.4)"
          height={40}
        />
      </div>
      
      <div className="flex justify-between items-center">
        <div className="relative group flex items-center justify-center">
          <button onClick={handlePlayToggle} className="flex items-center gap-2 text-[11px] font-bold text-on-surface bg-white/5 py-2 px-5 rounded-lg border border-outline/10 hover:bg-white/10 transition-all uppercase tracking-widest">
            {isPlaying ? <Square size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
            {isPlaying ? 'Stop' : 'Preview'}
          </button>
          <button onClick={handleDownload} className="flex items-center gap-2 text-[11px] font-bold text-on-surface bg-white/5 py-2 px-5 rounded-lg border border-outline/10 hover:bg-white/10 transition-all uppercase tracking-widest ml-2">
            <Download size={16} />
            Download
          </button>
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all bg-surface-container-high text-on-surface text-[10px] px-2 py-1 rounded whitespace-nowrap pointer-events-none border border-outline/10 z-10">{isPlaying ? 'Stop Audio' : 'Play Audio'}</span>
        </div>
        <span className="text-[10px] text-on-surface-variant font-medium">{variant.duration}</span>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-outline/10 pt-4 mt-2"
          >
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-surface-container/30 p-3 rounded-lg border border-outline/5">
                <p className="text-[9px] uppercase tracking-widest text-on-surface-variant mb-1">Score</p>
                <p className="text-lg font-headline font-bold text-tertiary">{variant.score}</p>
              </div>
              <div className="bg-surface-container/30 p-3 rounded-lg border border-outline/5">
                <p className="text-[9px] uppercase tracking-widest text-on-surface-variant mb-1">Memory</p>
                <p className="text-lg font-headline font-bold text-secondary">{variant.memoryRetention}</p>
              </div>
              <div className="bg-surface-container/30 p-3 rounded-lg border border-outline/5">
                <p className="text-[9px] uppercase tracking-widest text-on-surface-variant mb-1">Affinity</p>
                <p className="text-lg font-headline font-bold text-primary">{variant.brandAffinity}</p>
              </div>
            </div>
            {/* Script display */}
            {variant.script && (
              <div className="bg-black/20 p-4 rounded-xl border border-outline/5">
                <p className="text-[9px] uppercase tracking-widest text-on-surface-variant font-bold mb-2">Script</p>
                <p className="text-xs text-on-surface/80 leading-relaxed italic">{variant.script}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isShareOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface-container-high border border-outline/20 p-6 rounded-2xl w-80 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-headline font-bold text-lg">Share Variant</h3>
                <button onClick={() => setIsShareOpen(false)} className="text-on-surface-variant hover:text-on-surface"><X size={20} /></button>
              </div>
              <div className="space-y-3">
                <button onClick={() => { showToast("Link copied to clipboard"); setIsShareOpen(false); }} className="w-full flex items-center gap-3 bg-surface-container-low hover:bg-surface-variant p-3 rounded-xl border border-outline/10 transition-colors">
                  <LinkIcon size={18} className="text-primary" />
                  <span className="text-sm font-medium">Copy Link</span>
                </button>
                <button onClick={() => { showToast("Opening Twitter..."); setIsShareOpen(false); }} className="w-full flex items-center gap-3 bg-surface-container-low hover:bg-surface-variant p-3 rounded-xl border border-outline/10 transition-colors">
                  <Twitter size={18} className="text-[#1DA1F2]" />
                  <span className="text-sm font-medium">Share to Twitter</span>
                </button>
                <button onClick={() => { showToast("Opening Facebook..."); setIsShareOpen(false); }} className="w-full flex items-center gap-3 bg-surface-container-low hover:bg-surface-variant p-3 rounded-xl border border-outline/10 transition-colors">
                  <Facebook size={18} className="text-[#4267B2]" />
                  <span className="text-sm font-medium">Share to Facebook</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDeleteOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface-container-high border border-outline/20 p-6 rounded-2xl w-80 shadow-2xl"
            >
              <h3 className="font-headline font-bold text-lg mb-2 text-error">Delete Variant?</h3>
              <p className="text-sm text-on-surface-variant mb-6">Are you sure you want to delete "{variant.name}"? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setIsDeleteOpen(false)} className="flex-1 bg-surface-container-low hover:bg-surface-variant py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors">Cancel</button>
                <button onClick={() => { onDelete(variant.id); setIsDeleteOpen(false); }} className="flex-1 bg-error/20 text-error hover:bg-error/30 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ActiveVariants = ({ variants, setVariants, onAnalyzeVariant, analyzingVariantId }: { variants: any[], setVariants: React.Dispatch<React.SetStateAction<any[]>>, onAnalyzeVariant: (variant: any) => void, analyzingVariantId: string | null }) => {
  const [sortBy, setSortBy] = useState('score');
  const [filterQuality, setFilterQuality] = useState('All');
  const [selectedVariants, setSelectedVariants] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleDelete = (id: string) => {
    setVariants(variants.filter(v => v.id !== id));
    setSelectedVariants(selectedVariants.filter(vId => vId !== id));
  };

  const handleToggleSelect = (id: string) => {
    setSelectedVariants(prev => 
      prev.includes(id) ? prev.filter(vId => vId !== id) : [...prev, id]
    );
  };

  const filteredAndSortedVariants = (variants || [])
    .filter(v => filterQuality === 'All' || v?.quality === filterQuality)
    .sort((a, b) => {
      if (sortBy === 'date') return (b?.timestamp || 0) - (a?.timestamp || 0);
      if (sortBy === 'score') return (b?.score || 0) - (a?.score || 0);
      if (sortBy === 'name') return (a?.name || '').localeCompare(b?.name || '');
      return 0;
    });

  if (!variants || variants.length === 0) {
    return (
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="font-headline text-[11px] uppercase tracking-[0.25em] font-bold text-on-surface-variant">Active Variants</h3>
        </div>
        <div className="bg-surface-container-low/20 border border-outline/5 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-surface-variant/30 flex items-center justify-center mb-4">
            <Sparkles size={24} className="text-on-surface-variant/50" />
          </div>
          <h4 className="text-sm font-headline font-bold text-on-surface mb-2">No variants generated yet</h4>
          <p className="text-xs text-on-surface-variant/60 max-w-sm">
            Upload your creative inputs, search your memory, and generate premium audio variants to see them here.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-headline text-[11px] uppercase tracking-[0.25em] font-bold text-on-surface-variant">Active Variants</h3>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-surface-container-low/40 rounded-lg border border-outline/5 p-1">
            <Filter size={14} className="text-on-surface-variant ml-2" />
            <select 
              value={filterQuality} 
              onChange={(e) => setFilterQuality(e.target.value)}
              className="bg-transparent border-none text-[10px] uppercase tracking-widest text-on-surface-variant focus:outline-none focus:ring-0 cursor-pointer py-1 pr-6"
            >
              <option value="All">All Quality</option>
              <option value="Lossless">Lossless</option>
              <option value="High">High</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-surface-container-low/40 rounded-lg border border-outline/5 p-1">
            <ArrowDownWideNarrow size={14} className="text-on-surface-variant ml-2" />
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border-none text-[10px] uppercase tracking-widest text-on-surface-variant focus:outline-none focus:ring-0 cursor-pointer py-1 pr-6"
            >
              <option value="date">Latest</option>
              <option value="score">Top Score</option>
              <option value="name">Name</option>
            </select>
          </div>

          <div className="flex gap-1.5 p-1 bg-surface-container-low/40 rounded-lg border border-outline/5 ml-2">
            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-surface-variant/60 text-primary' : 'text-on-surface-variant/40 hover:text-on-surface'}`}>
              <LayoutGrid size={16} strokeWidth={1.5} />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-surface-variant/60 text-primary' : 'text-on-surface-variant/40 hover:text-on-surface'}`}>
              <List size={16} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>

      <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1'}`}>
        <AnimatePresence>
          {filteredAndSortedVariants.map((variant, index) => (
            <motion.div
              key={variant.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <VariantCard 
                variant={variant} 
                rank={index + 1}
                isSelected={selectedVariants.includes(variant.id)}
                onToggleSelect={handleToggleSelect}
                onDelete={handleDelete}
                onAnalyze={onAnalyzeVariant}
                isAnalyzing={analyzingVariantId === variant.id}
              />
            </motion.div>
          ))}
        </AnimatePresence>
        {filteredAndSortedVariants.length === 0 && (
          <div className="col-span-full py-12 text-center text-on-surface-variant">
            No variants match the selected filters.
          </div>
        )}
      </div>
    </section>
  );
};

const BrainSimulation = () => {
  return (
    <section className="mb-2">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant">Neural Stimulus</h3>
        <div className="flex gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" style={{ animationDelay: '300ms' }}></span>
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: '600ms' }}></span>
        </div>
      </div>
      <div className="relative w-full aspect-square bg-[#050505] rounded-2xl border border-outline/10 overflow-hidden flex items-center justify-center group">
        {/* Brain Image Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-50 mix-blend-screen transition-transform duration-700 group-hover:scale-105"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=800&auto=format&fit=crop')` }}
        ></div>
        
        {/* Animated glowing regions representing brain activity */}
        <motion.div 
          animate={{ opacity: [0.3, 0.8, 0.3], scale: [1, 1.2, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] right-[20%] w-24 h-24 bg-error/70 rounded-full blur-[30px] mix-blend-screen"
        ></motion.div>
        
        <motion.div 
          animate={{ opacity: [0.2, 0.9, 0.2], scale: [0.9, 1.3, 0.9] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-[35%] right-[10%] w-28 h-28 bg-yellow-500/60 rounded-full blur-[30px] mix-blend-screen"
        ></motion.div>

        <motion.div 
          animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.1, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute top-[25%] right-[35%] w-16 h-16 bg-orange-500/50 rounded-full blur-[20px] mix-blend-screen"
        ></motion.div>
        
        {/* Overlay Text */}
        <div className="relative z-10 text-center pointer-events-none flex flex-col items-center justify-center w-full h-full">
           <h4 className="font-headline text-5xl font-medium tracking-tight text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">TRIBE v2</h4>
        </div>

        {/* Side Texts */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col items-end pr-4 text-[9px] uppercase tracking-[0.3em] text-white/50 font-bold leading-relaxed">
          <span>Simulation</span>
          <span>Activity</span>
        </div>
        
        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col items-start pl-4 text-[9px] uppercase tracking-[0.3em] text-white/50 font-bold leading-relaxed">
          <span>Active</span>
          <span>Cortex</span>
        </div>

        {/* Scanning line effect */}
        <motion.div 
          animate={{ top: ['-10%', '110%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute left-0 right-0 h-[2px] bg-tertiary/20 blur-[1px] z-20"
        ></motion.div>
      </div>
    </section>
  );
};



const AnalyticsPanel = ({ className = "", onClose, neuralInsights, isNeuralLoading }: { className?: string, onClose?: () => void, neuralInsights: NeuralInsights | null, isNeuralLoading: boolean }) => {
  return (
  <aside className={`overflow-y-auto custom-scrollbar glass-panel flex flex-col gap-12 ${className}`}>
    {onClose && (
      <div className="flex justify-end xl:hidden mb-[-2rem]">
        <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface p-2">
          <X size={24} />
        </button>
      </div>
    )}

    {/* Neural Insights — or empty state */}
    {(neuralInsights || isNeuralLoading) ? (
      <NeuralInsightsPanel insights={neuralInsights} isLoading={isNeuralLoading} />
    ) : (
      <section className="flex flex-col items-center text-center py-8 px-4">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
          <Brain className="text-primary/60" size={26} />
        </div>
        <h3 className="text-xs font-headline font-bold text-on-surface mb-2">No Analysis Yet</h3>
        <p className="text-[11px] text-on-surface-variant/60 leading-relaxed max-w-[220px]">
          Generate audio variants, then click the <span className="inline-flex items-center gap-1 text-primary font-medium">🧠 analyze</span> button on any variant to see neural insights here.
        </p>
      </section>
    )}

    <BrainSimulation />
  </aside>
  );
};

const ProjectContextBar = ({ project }: { project: any }) => {
  if (!project) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface-container-low/30 border border-outline/10 rounded-2xl p-4 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4"
    >
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[9px] bg-primary/20 text-primary px-2 py-0.5 rounded uppercase tracking-widest font-bold">Active Project</span>
          <h2 className="text-lg font-headline font-bold text-on-surface">{project.projectName || 'Untitled Project'}</h2>
        </div>
        <p className="text-xs text-on-surface-variant">{project.goal || 'No specific goal set'}</p>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end">
          <span className="text-[9px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Attached Sources</span>
          <div className="flex -space-x-2">
            {project.uploadedFiles?.map((file: any, i: number) => (
              <div key={i} className="w-8 h-8 rounded-full bg-surface-container-high border-2 border-background flex items-center justify-center text-primary relative group cursor-pointer">
                {file.name?.endsWith('.pdf') ? <FileText size={12} /> : <FileAudio size={12} />}
                <span className="absolute -bottom-8 scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all bg-surface-container-highest text-on-surface text-[10px] px-2 py-1 rounded whitespace-nowrap pointer-events-none border border-outline/10 z-10">
                  {file.name}
                </span>
              </div>
            ))}
            {(!project.uploadedFiles || project.uploadedFiles.length === 0) && (
              <span className="text-xs text-on-surface-variant italic">No files attached</span>
            )}
          </div>
        </div>
        <button className="bg-surface-container hover:bg-surface-variant p-2 rounded-lg border border-outline/10 text-on-surface-variant hover:text-on-surface transition-colors">
          <Settings size={16} />
        </button>
      </div>
    </motion.div>
  );
};

const MemoryCategory = ({ title, tags, color, bg, border }: { title: string, tags: string[], color: string, bg: string, border: string }) => (
  <div className={`p-4 rounded-2xl border ${border} ${bg} flex flex-col justify-between`}>
    <h4 className={`text-[9px] uppercase tracking-widest font-bold mb-3 ${color}`}>{title}</h4>
    <div className="flex flex-wrap gap-1.5">
      {tags?.map(t => (
        <span key={t} className="text-[10px] bg-black/20 px-2 py-1 rounded-md text-on-surface/80 border border-white/5">{t}</span>
      ))}
    </div>
  </div>
);

const CreativeMemoryBase = ({ isIngesting, project }: { isIngesting: boolean, project: any }) => {
  if (!project) return null;

  if (isIngesting) {
    return (
      <motion.div 
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        className="bg-surface-container-low/30 border border-primary/20 rounded-2xl p-6 mb-8 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-[shimmer_2s_infinite] w-[200%] -translate-x-1/2"></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="bg-primary/20 p-3 rounded-xl text-primary">
            <Loader2 className="animate-spin" size={24} />
          </div>
          <div>
            <h3 className="text-sm font-headline font-bold text-primary">Ingesting Creative Inputs...</h3>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">Extracting brand language, emotional cues, and tone patterns</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="bg-surface-container-low/30 border border-outline/10 rounded-2xl p-6 mb-8"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg text-primary">
            <Database size={18} />
          </div>
          <div>
            <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-on-surface">Extracted Intelligence Base</h3>
            <p className="text-[10px] text-on-surface-variant mt-0.5">Turbopuffer memory ready for semantic search</p>
          </div>
        </div>
        <div className="text-[10px] bg-surface-variant/50 text-on-surface-variant px-3 py-1 rounded-full flex items-center gap-1.5">
          <Sparkles size={12} className="text-tertiary" />
          <span>{project.uploadedFiles?.length || 0} Sources Indexed</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <MemoryCategory title="Brand Language" tags={["Premium", "Clinical", "Effortless"]} color="text-primary" bg="bg-primary/5" border="border-primary/20" />
        <MemoryCategory title="Customer Phrases" tags={["Glowing skin", "Finally found it", "Holy grail"]} color="text-on-surface" bg="bg-surface-container-high" border="border-outline/10" />
        <MemoryCategory title="Emotional Cues" tags={["Confidence", "Relief", "Aspirational"]} color="text-tertiary" bg="bg-tertiary/5" border="border-tertiary/20" />
        <MemoryCategory title="Product Benefits" tags={["Deep Hydration", "Anti-aging", "Fast absorbing"]} color="text-on-surface" bg="bg-surface-container-high" border="border-outline/10" />
        <MemoryCategory title="Past References" tags={["Summer '23", "Competitor X"]} color="text-on-surface" bg="bg-surface-container-high" border="border-outline/10" />
        <MemoryCategory title="Tone Patterns" tags={["Upbeat", "Authoritative", "Warm"]} color="text-secondary" bg="bg-secondary/5" border="border-secondary/20" />
      </div>
    </motion.div>
  );
};

const NewProjectModal = ({ isOpen, onClose, onCreate }: { isOpen: boolean, onClose: () => void, onCreate: (data: any) => void }) => {
  const [projectName, setProjectName] = useState('');
  const [campaignType, setCampaignType] = useState('audio-ad');
  const [goal, setGoal] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setUploadedFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const handleCreate = () => {
    onCreate({ projectName, campaignType, goal, uploadedFiles });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-surface-container-low border border-outline/20 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-outline/10 flex justify-between items-center bg-surface-container-lowest">
          <div>
            <h2 className="text-xl font-headline font-bold text-on-surface">New Project</h2>
            <p className="text-xs text-on-surface-variant mt-1">Initialize a new creative workspace</p>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface p-2 rounded-full hover:bg-white/5 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar space-y-8">
          {/* Project Details */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Project Name</label>
                <input 
                  type="text" 
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g., Summer Skincare Campaign"
                  className="w-full bg-surface-container/50 border border-outline/10 rounded-xl px-4 py-3 text-sm text-on-surface focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all placeholder:text-on-surface-variant/30"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Campaign Type</label>
                <select 
                  value={campaignType}
                  onChange={(e) => setCampaignType(e.target.value)}
                  className="w-full bg-surface-container/50 border border-outline/10 rounded-xl px-4 py-3 text-sm text-on-surface focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all appearance-none"
                >
                  <option value="audio-ad">Audio Ad</option>
                  <option value="ugc-trailer">UGC Trailer</option>
                  <option value="podcast-promo">Podcast Promo</option>
                  <option value="sonic-branding">Sonic Branding</option>
                </select>
              </div>
            </div>
          </div>

          {/* Creative Inputs */}
          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant flex items-center justify-between">
              Creative Inputs
              <span className="text-on-surface-variant/50 font-normal normal-case tracking-normal">Briefs, scripts, references</span>
            </label>
            
            <div 
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${isDragging ? 'border-primary bg-primary/5' : 'border-outline/20 bg-surface-container/30 hover:bg-surface-container/50 hover:border-outline/30'}`}
            >
              <div className="w-12 h-12 bg-surface-variant rounded-full flex items-center justify-center mx-auto mb-4 text-on-surface-variant">
                <UploadCloud size={24} />
              </div>
              <p className="text-sm font-medium text-on-surface mb-1">Drag and drop files here</p>
              <p className="text-xs text-on-surface-variant mb-4">PDF, Audio, Images, Text, or Video up to 50MB</p>
              <input 
                type="file" 
                multiple 
                accept=".pdf,.mp3,.wav,.m4a,.jpg,.jpeg,.png,.webp,.txt,.mp4,.mov,.webm"
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-surface-container-high hover:bg-surface-variant text-on-surface text-xs font-medium px-4 py-2 rounded-lg transition-colors border border-outline/10"
              >
                Browse Files
              </button>
            </div>

            {/* Uploaded Files List */}
            {uploadedFiles?.length > 0 && (
              <div className="space-y-2 mt-4">
                {uploadedFiles?.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-surface-container/40 border border-outline/10 rounded-xl p-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 text-primary rounded-lg overflow-hidden flex items-center justify-center">
                        {file.name.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                          <Eye size={16} />
                        ) : file.name.match(/\.(mp4|mov|webm)$/i) ? (
                          <Video size={16} />
                        ) : file.name.endsWith('.pdf') || file.name.endsWith('.txt') ? (
                          <FileText size={16} />
                        ) : (
                          <FileAudio size={16} />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-on-surface">{file.name}</p>
                        <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">
                          {file.size < 1024 
                            ? `${file.size} B` 
                            : file.size < 1024 * 1024 
                              ? `${(file.size / 1024).toFixed(1)} KB` 
                              : `${(file.size / 1024 / 1024).toFixed(2)} MB`}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== idx))}
                      className="text-on-surface-variant hover:text-error p-2 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Goal */}
          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Objective / Goal (Optional)</label>
            <textarea 
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="What are we trying to achieve?"
              className="w-full bg-surface-container/50 border border-outline/10 rounded-xl px-4 py-3 text-sm text-on-surface focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all placeholder:text-on-surface-variant/30 min-h-[80px] resize-none"
            />
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setGoal("Generate premium skincare audio ad")} className="text-[10px] bg-surface-container hover:bg-surface-variant border border-outline/10 px-3 py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface transition-colors">"Generate premium skincare audio ad"</button>
              <button onClick={() => setGoal("Create Gen Z UGC trailer variants")} className="text-[10px] bg-surface-container hover:bg-surface-variant border border-outline/10 px-3 py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface transition-colors">"Create Gen Z UGC trailer variants"</button>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-outline/10 bg-surface-container-lowest flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:bg-white/5 transition-colors">
            Cancel
          </button>
          <button 
            onClick={handleCreate}
            disabled={!projectName && (uploadedFiles?.length || 0) === 0}
            className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest bg-primary text-on-primary hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Plus size={16} /> Create Project
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Benchmarking & Comparison ───────────────────────────────────────────

const ComparisonChart = ({ variants }: { variants: any[] }) => {
  const metrics = [
    { key: 'score', label: 'Overall', color: 'text-tertiary', bg: 'bg-tertiary' },
    { key: 'memoryRetention', label: 'Memory', color: 'text-secondary', bg: 'bg-secondary' },
    { key: 'brandAffinity', label: 'Affinity', color: 'text-primary', bg: 'bg-primary' },
  ];

  return (
    <div className="space-y-8 py-6">
      {metrics?.map(metric => (
        <div key={metric.key} className="space-y-3">
          <div className="flex justify-between items-center">
            <h5 className={`text-[10px] uppercase tracking-widest font-bold ${metric.color}`}>{metric.label}</h5>
          </div>
          <div className="space-y-4">
            {variants?.map((v, i) => {
              const val = parseFloat(String(v[metric.key]).replace('%', '')) || 0;
              const max = 10; // Assuming scores are out of 10 or 100%
              const width = Math.min((val / max) * 100, 100);
              
              return (
                <div key={v.id} className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] text-on-surface-variant font-medium">
                    <span>{v.name}</span>
                    <span className="text-on-surface">{v[metric.key]}</span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden border border-outline/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${width}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className={`h-full ${metric.bg} shadow-[0_0_10px_rgba(var(--color-${metric.key}),0.3)]`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

const ComparisonDrawer = ({ variants, onClose }: { variants: any[], onClose: () => void }) => {
  return (
    <motion.aside 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="fixed inset-y-0 right-0 z-[100] w-full max-w-lg bg-surface-container-lowest border-l border-outline/10 shadow-2xl flex flex-col"
    >
      <div className="p-6 border-b border-outline/10 flex justify-between items-center bg-surface-container-low">
        <div>
          <h3 className="text-lg font-headline font-bold text-on-surface">Neural Benchmarking</h3>
          <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">Side-by-side performance comparison</p>
        </div>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 text-on-surface-variant transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <div className="flex gap-4 mb-10 overflow-x-auto pb-4 no-scrollbar">
          {variants?.map(v => (
            <div key={v.id} className="min-w-[160px] p-4 rounded-2xl bg-surface-container border border-outline/5 relative group">
              <span className="text-[8px] uppercase tracking-tighter text-on-surface-variant mb-1 block truncate">{v.projectName}</span>
              <h4 className="text-xs font-bold text-primary truncate mb-3">{v.name}</h4>
              <div className="flex gap-2">
                <div className="text-[10px] font-bold text-tertiary">{v.score}</div>
                <div className="text-[10px] font-bold text-secondary">{v.memoryRetention}</div>
                <div className="text-[10px] font-bold text-primary">{v.brandAffinity}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="glass-panel p-6 rounded-3xl border-primary/10">
          <div className="flex items-center gap-2 mb-6">
            <Activity size={18} className="text-primary" />
            <h4 className="text-xs uppercase tracking-widest font-bold text-on-surface">Cross-Variant Analytics</h4>
          </div>
          <ComparisonChart variants={variants} />
        </div>
      </div>

      <div className="p-6 border-t border-outline/10 bg-surface-container-low flex gap-3">
        <button onClick={onClose} className="flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest border border-outline/10 hover:bg-white/5 transition-all">Clear Selection</button>
        <button className="flex-1 py-3 bg-primary text-on-primary rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">Export Report</button>
      </div>
    </motion.aside>
  );
};

// ─── Library Page ────────────────────────────────────────────────────────

const LibraryPage = ({ 
  variants, 
  loading, 
  onBenchmark, 
  selectedBenchmarkIds 
}: { 
  variants: any[], 
  loading: boolean, 
  onBenchmark: (v: any) => void,
  selectedBenchmarkIds: string[]
}) => {
  const [search, setSearch] = useState('');
  const [minAffinity, setMinAffinity] = useState(0);
  const [onlyFinalized, setOnlyFinalized] = useState(false);
  const { showToast } = useToast();

  const filtered = variants?.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(search.toLowerCase()) || 
                         v.projectName.toLowerCase().includes(search.toLowerCase());
    const val = parseFloat(String(v.brandAffinity).replace('%', '')) || 0;
    const matchesAffinity = val >= minAffinity;
    const matchesFinalized = onlyFinalized ? v.isFinalized : true;
    return matchesSearch && matchesAffinity && matchesFinalized;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-on-surface-variant">
        <Loader2 size={48} className="animate-spin mb-4 text-primary/40" />
        <p className="text-sm font-medium animate-pulse">Scanning the Vault...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
              <Archive size={20} />
            </div>
            <h2 className="text-3xl font-headline font-extrabold tracking-tight text-on-surface">The Vault</h2>
          </div>
          <p className="text-on-surface-variant text-sm max-w-md">Global creative intelligence and finalized asset management across all your projects.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 bg-surface-container-low/40 p-4 rounded-2xl border border-outline/5 backdrop-blur-md">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40" />
            <input 
              type="text" 
              placeholder="Search assets or projects..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-surface-container/50 border border-outline/10 rounded-xl pl-10 pr-4 py-2 text-xs text-on-surface focus:border-primary/50 outline-none w-64 transition-all"
            />
          </div>
          
          <div className="h-8 w-[1px] bg-outline/10 mx-1" />

          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Min Affinity: {minAffinity}%</span>
            <input 
              type="range" 
              min="0" 
              max="10" 
              step="0.5" 
              value={minAffinity}
              onChange={(e) => setMinAffinity(parseFloat(e.target.value))}
              className="w-24 accent-primary" 
            />
          </div>

          <div className="h-8 w-[1px] bg-outline/10 mx-1" />

          <button 
            onClick={() => setOnlyFinalized(!onlyFinalized)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all text-[10px] font-bold uppercase tracking-widest ${onlyFinalized ? 'bg-primary/20 border-primary/40 text-primary' : 'bg-surface-container border-outline/10 text-on-surface-variant'}`}
          >
            <Star size={14} fill={onlyFinalized ? "currentColor" : "none"} />
            Only Finalized
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-20">
        <AnimatePresence>
          {filtered?.map((variant, index) => (
            <motion.div
              key={variant.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <VariantCard 
                variant={variant} 
                rank={index + 1}
                isSelected={false}
                onToggleSelect={() => {}}
                onDelete={() => {}} 
                onAnalyze={() => {}} 
                isAnalyzing={false}
                showProject={true}
                isBenchmarking={selectedBenchmarkIds.includes(variant.variantId)}
                onBenchmark={() => onBenchmark(variant)}
                onFinalize={async (v) => {
                  const updated = !v.isFinalized;
                  await db.variants.update(v.id, { isFinalized: updated });
                  showToast(updated ? "Asset finalized for distribution" : "Asset removed from finalized list");
                  window.dispatchEvent(new CustomEvent('variant-updated'));
                }}
              />
            </motion.div>
          ))}
        </AnimatePresence>
        {filtered?.length === 0 && (
          <div className="col-span-full py-20 text-center space-y-4">
            <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mx-auto text-on-surface-variant/40">
              <Search size={32} />
            </div>
            <p className="text-on-surface-variant text-sm font-medium">No assets found matching your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const DeleteConfirmationModal = ({ isOpen, projectName, onClose, onConfirm }: { isOpen: boolean, projectName: string, onClose: () => void, onConfirm: () => void }) => {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative glass-panel w-full max-w-md overflow-hidden shadow-2xl border border-outline/10 flex flex-col"
      >
        <div className="p-8 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-3xl bg-error/10 border border-error/20 flex items-center justify-center text-error mb-6">
            <AlertTriangle size={32} />
          </div>
          <h3 className="font-headline text-2xl font-bold text-on-surface mb-3 tracking-tight">Confirm Deletion</h3>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Are you sure you want to delete <span className="text-on-surface font-bold">"{projectName}"</span>?
          </p>
          <div className="mt-4 p-4 bg-error/5 border border-error/10 rounded-2xl w-full">
            <p className="text-[10px] text-error font-bold uppercase tracking-widest text-center">Warning: This action is permanent and will remove all associated variants and creative data.</p>
          </div>
        </div>

        <div className="p-6 border-t border-outline/10 bg-white/5 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:bg-white/5 transition-all border border-outline/10"
          >
            Go Back
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest bg-error text-white hover:bg-error/90 transition-all shadow-lg shadow-error/20"
          >
            Delete Everything
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default function App() {
  const [isLeftMenuOpen, setIsLeftMenuOpen] = useState(false);
  const [isRightMenuOpen, setIsRightMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<any>(null);
  const [isIngesting, setIsIngesting] = useState(false);
  const [variants, setVariants] = useState<any[]>([]);
  
  // Neural analysis state
  const [neuralInsights, setNeuralInsights] = useState<NeuralInsights | null>(null);
  const [isNeuralLoading, setIsNeuralLoading] = useState(false);
  const [analyzingVariantId, setAnalyzingVariantId] = useState<string | null>(null);
  
  // Library State
  const [activeView, setActiveView] = useState<'dashboard' | 'library'>('dashboard');
  const [globalVariants, setGlobalVariants] = useState<any[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [benchmarkingVariants, setBenchmarkingVariants] = useState<any[]>([]);


  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<any>(null);

  // Load projects list on mount
  useEffect(() => {
    const loadProjects = async () => {
      const projects = await db.projects.orderBy('lastModified').reverse().toArray();
      setProjectsList(projects);
    };
    loadProjects();
  }, []);

  // Load variants when project changes
  useEffect(() => {
    if (activeView === 'dashboard' && currentProject) {
      const loadVariants = async () => {
        const savedVariants = await db.variants
          .where('projectId')
          .equals(currentProject.projectId)
          .reverse()
          .toArray();
        setVariants(savedVariants);
      };
      loadVariants();
    } else if (activeView === 'library') {
      const loadGlobalVariants = async () => {
        setLibraryLoading(true);
        const allVariants = await db.variants.reverse().toArray();
        // Enrich with project names
        const enriched = await Promise.all(allVariants.map(async (v) => {
          const proj = await db.projects.where('projectId').equals(v.projectId).first();
          return { ...v, projectName: proj?.projectName || 'Deleted Project' };
        }));
        setGlobalVariants(enriched);
        setLibraryLoading(false);
      };
      loadGlobalVariants();
    }
  }, [currentProject, activeView]);

  // Refresh triggered by Library's finalize action
  useEffect(() => {
    const handleRefresh = async () => {
      if (activeView === 'library') {
        const allVariants = await db.variants.reverse().toArray();
        const enriched = await Promise.all(allVariants.map(async (v) => {
          const proj = await db.projects.where('projectId').equals(v.projectId).first();
          return { ...v, projectName: proj?.projectName || 'Deleted Project' };
        }));
        setGlobalVariants(enriched);
      }
    };

    window.addEventListener('variant-updated', handleRefresh);
    return () => window.removeEventListener('variant-updated', handleRefresh);
  }, [activeView]);

  const handleCreateProject = async (projectData: any) => {
    const projectId = `proj_${Date.now()}`;
    const projectWithId = { ...projectData, projectId };
    setCurrentProject(projectWithId);
    setIsIngesting(true);
    showToast(`Project "${projectData.projectName || 'Untitled'}" created successfully`);
    
    try {
      // Save to Dexie
      await db.projects.add({
        projectId,
        projectName: projectData.projectName,
        campaignType: projectData.campaignType,
        goal: projectData.goal,
        createdAt: new Date(),
        lastModified: new Date()
      });

      for (const file of projectData.uploadedFiles) {
        await db.files.add({
          projectId,
          name: file.name,
          type: file.type,
          size: file.size,
          data: file
        });
      }

      const formData = new FormData();
      formData.append('projectId', projectId);
      formData.append('projectName', projectData.projectName);
      formData.append('campaignType', projectData.campaignType);
      formData.append('goal', projectData.goal);
      
      projectData.uploadedFiles.forEach((f: File) => {
        formData.append('files', f);
      });

      const response = await fetch('/api/projects/ingest', {
        method: 'POST',
        body: formData,
      });

      let errorMessage = 'Ingestion failed';
      let result = null;

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        result = await response.json();
        // If the server returned a structured error, use the details for better debugging
        if (result && result.error) {
          errorMessage = result.details ? `${result.error}: ${result.details}` : result.error;
        }
      } else {
        errorMessage = `Server Error (${response.status}): The server encountered an error and could not return a valid response.`;
      }
      
      if (!response.ok) {
        throw new Error(errorMessage);
      }
      
      console.log('Ingestion result:', result);
      setIsIngesting(false);
      showToast("Creative inputs ingested and indexed.");
    } catch (error) {
      console.error(error);
      setIsIngesting(false);
      showToast(`Ingestion failed: ${(error as Error).message}`);
    }
  };

  const handleGenerateVariants = async () => {
    if (!currentProject) {
      showToast("Please create a project first.");
      return;
    }
    
    showToast("Generating creative directions and audio...");
    try {
      const response = await fetch('/api/generate-music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: currentProject.projectId,
          prompt: currentProject.goal || "Create an engaging audio ad",
          count: 2
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.details || errData.error || "Generation failed");
      }
      
      const { variants: newVariants } = await response.json();
      const newVariantsArray = Array.isArray(newVariants) ? newVariants : [];
      const processedVariants = newVariantsArray.map((v: any) => ({
        ...v,
        name: v.name || 'AI Variant',
        type: 'AI Generated',
        typeColor: 'text-tertiary',
        bgType: 'bg-tertiary',
        timeAgo: 'Just now',
        timestamp: Date.now(),
        quality: 'High',
        sampleRate: '48kHz',
        duration: '0:15.00',
        score: v.score || Math.floor(Math.random() * 15) + 85,
        memoryRetention: `+${(Math.random() * 10 + 5).toFixed(1)}%`,
        brandAffinity: `+${(Math.random() * 5 + 2).toFixed(1)}%`,
        audioUrl: v.audio, // Backend returns base64 data URL
        script: v.prompt
      }));

      // Persist to Dexie
      for (const v of processedVariants) {
        await db.variants.add({
          projectId: currentProject.projectId,
          variantId: `var_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ...v
        });
      }

      setVariants(prev => [...processedVariants, ...prev]);
      showToast(`Generated ${processedVariants.length} audio variants!`);
    } catch (error) {
      console.error(error);
      showToast("Failed to generate audio variant.");
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await db.projects.where('projectId').equals(projectId).delete();
      await db.variants.where('projectId').equals(projectId).delete();
      await db.files.where('projectId').equals(projectId).delete();
      
      setProjectsList(prev => prev.filter(p => p.projectId !== projectId));
      
      if (currentProject?.projectId === projectId) {
        setCurrentProject(null);
        setVariants([]);
        setNeuralInsights(null);
      }
      
      showToast("Project deleted successfully");
    } catch (error) {
      console.error(error);
      showToast("Failed to delete project");
    }
  };

  // ─── Neural Analysis Handlers ───────────────────────────────────────────

  const handleAnalyzeVariant = async (variant: any) => {
    if (!variant.script) {
      showToast("No script available for this variant.");
      return;
    }

    setAnalyzingVariantId(variant.id);
    setIsNeuralLoading(true);
    setNeuralInsights(null);
    showToast(`Analyzing "${variant.name}" with TRIBE v2...`);

    try {
      const response = await fetch('/api/analyze-neural', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variants: [{ name: variant.name, script: variant.script }],
          projectGoal: currentProject?.goal,
        }),
      });

      if (!response.ok) throw new Error('Neural analysis failed');

      const data = await response.json();
      setNeuralInsights(data.insights);
      showToast(`Neural analysis complete for "${variant.name}"`);
    } catch (error) {
      console.error('Neural analysis error:', error);
      showToast('Neural analysis failed. Check console for details.');
    } finally {
      setIsNeuralLoading(false);
      setAnalyzingVariantId(null);
    }
  };

  const handleAnalyzeAll = async () => {
    const variantsWithScripts = variants.filter((v) => v.script);
    if (variantsWithScripts.length === 0) {
      showToast('No variants with scripts to analyze.');
      return;
    }

    setIsNeuralLoading(true);
    setNeuralInsights(null);
    showToast(`Analyzing ${variantsWithScripts.length} variant(s) with TRIBE v2...`);

    try {
      const response = await fetch('/api/analyze-neural', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variants: variantsWithScripts.map((v) => ({
            name: v.name,
            script: v.script,
          })),
          projectGoal: currentProject?.goal,
        }),
      });

      if (!response.ok) throw new Error('Neural analysis failed');

      const data = await response.json();
      setNeuralInsights(data.insights);
      showToast('Multi-variant neural analysis complete!');
    } catch (error) {
      console.error('Neural analysis error:', error);
      showToast('Neural analysis failed. Check console for details.');
    } finally {
      setIsNeuralLoading(false);
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
    <div className="flex h-screen overflow-hidden bg-background text-on-surface selection:bg-primary/30 selection:text-on-surface antialiased">
      {/* Desktop Sidebar */}
      <Sidebar 
        onNewProject={() => setIsNewProjectModalOpen(true)} 
        projects={projectsList}
        onSelectProject={(p) => {
          setCurrentProject(p);
          setActiveView('dashboard');
        }}
        onDeleteProject={(p) => {
          setProjectToDelete(p);
          setIsDeleteModalOpen(true);
        }}
        currentProjectId={currentProject?.projectId}
        activeView={activeView}
        onViewChange={setActiveView}
        className="hidden lg:flex fixed left-0 top-0 h-full w-60 border-r border-outline/10" 
      />
      
      {/* Left Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isLeftMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-[60] lg:hidden"
              onClick={() => setIsLeftMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              className="fixed inset-y-0 left-0 z-[70] w-64 bg-background border-r border-outline/10 shadow-2xl lg:hidden"
            >
              <Sidebar 
                onNewProject={() => setIsNewProjectModalOpen(true)} 
                projects={projectsList}
                onSelectProject={(p) => {
                  setCurrentProject(p);
                  setActiveView('dashboard');
                }}
                onDeleteProject={(p) => {
                  setProjectToDelete(p);
                  setIsDeleteModalOpen(true);
                }}
                currentProjectId={currentProject?.projectId}
                activeView={activeView}
                onViewChange={setActiveView}
                className="h-full w-full border-none" 
                onClose={() => setIsLeftMenuOpen(false)} 
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Right Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isRightMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-[60] xl:hidden"
              onClick={() => setIsRightMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              className="fixed inset-y-0 right-0 z-[70] w-80 sm:w-96 bg-background border-l border-outline/10 shadow-2xl xl:hidden"
            >
              <AnalyticsPanel className="h-full w-full border-none p-6 sm:p-10" onClose={() => setIsRightMenuOpen(false)} neuralInsights={neuralInsights} isNeuralLoading={isNeuralLoading} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="lg:ml-60 flex flex-col xl:flex-row h-screen w-full relative">
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-background w-full">
          <Header onLeftMenuClick={() => setIsLeftMenuOpen(true)} onRightMenuClick={() => setIsRightMenuOpen(true)} />
          
          <AnimatePresence mode="wait">
            {activeView === 'dashboard' ? (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <div className="px-4 md:px-10"><Hero /></div>
                <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-6 md:space-y-8">
                  <div>
                    <ProjectContextBar project={currentProject} />
                    <CreativeMemoryBase isIngesting={isIngesting} project={currentProject} />
                  </div>
                  <Controls onGenerate={handleGenerateVariants} onAnalyzeAll={handleAnalyzeAll} variants={variants} isAnalyzing={isNeuralLoading} />
                  <ActiveVariants variants={variants} setVariants={setVariants} onAnalyzeVariant={handleAnalyzeVariant} analyzingVariantId={analyzingVariantId} />
                  
                  {/* Inline Neural Insights (mobile) */}
                  {(neuralInsights || isNeuralLoading) && (
                    <div className="xl:hidden">
                      <NeuralInsightsPanel 
                        insights={neuralInsights} 
                        isLoading={isNeuralLoading} 
                        onClose={() => { setNeuralInsights(null); setIsNeuralLoading(false); }} 
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="library"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <LibraryPage 
                  variants={globalVariants} 
                  loading={libraryLoading} 
                  onBenchmark={(v) => {
                    if (benchmarkingVariants.find(bv => bv.id === v.id)) {
                      setBenchmarkingVariants(prev => prev.filter(bv => bv.id !== v.id));
                    } else {
                      setBenchmarkingVariants(prev => [...prev, v]);
                    }
                  }}
                  selectedBenchmarkIds={benchmarkingVariants.map(v => v.id)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Desktop Analytics Panel (Dashboard View Only) */}
        {activeView === 'dashboard' && (
          <AnalyticsPanel 
            className="hidden xl:flex w-96 border-l border-outline/10 p-10 overflow-y-auto" 
            neuralInsights={neuralInsights} 
            isNeuralLoading={isNeuralLoading} 
            onClose={() => setNeuralInsights(null)} 
          />
        )}
        
        {/* Comparison Drawer (Library View) */}
        <AnimatePresence>
          {activeView === 'library' && benchmarkingVariants.length > 0 && (
            <ComparisonDrawer 
              variants={benchmarkingVariants} 
              onClose={() => setBenchmarkingVariants([])} 
            />
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {isDeleteModalOpen && projectToDelete && (
          <DeleteConfirmationModal
            isOpen={isDeleteModalOpen}
            projectName={projectToDelete.projectName}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setProjectToDelete(null);
            }}
            onConfirm={() => {
              handleDeleteProject(projectToDelete.projectId);
              setIsDeleteModalOpen(false);
              setProjectToDelete(null);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isNewProjectModalOpen && (
          <NewProjectModal 
            isOpen={isNewProjectModalOpen} 
            onClose={() => setIsNewProjectModalOpen(false)} 
            onCreate={handleCreateProject} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-6 left-1/2 z-[200] bg-surface-container-highest text-on-surface px-6 py-3 rounded-full shadow-2xl border border-outline/10 text-sm font-medium flex items-center gap-3"
          >
            <CheckCircle size={16} className="text-primary" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </ToastContext.Provider>
  );
}
