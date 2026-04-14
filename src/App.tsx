import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FolderOpen,
  Music,
  Brain,
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
  History
} from 'lucide-react';

const Sidebar = ({ className = "", onClose }: { className?: string, onClose?: () => void }) => (
  <aside className={`flex flex-col py-10 px-6 glass-panel z-50 ${className}`}>
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
    <button className="mb-10 w-full py-2.5 px-4 rounded-lg bg-primary/10 border border-primary/20 text-primary font-headline font-medium text-[11px] uppercase tracking-widest hover:bg-primary/20 transition-all duration-300">
      New Project
    </button>
    <nav className="flex-1 space-y-1">
      <a className="flex items-center gap-3 py-2.5 px-4 rounded-lg text-primary bg-primary/5 font-medium transition-all" href="#">
        <FolderOpen size={20} strokeWidth={1.5} />
        <span className="font-headline text-[11px] uppercase tracking-widest">Projects</span>
      </a>
      <a className="flex items-center gap-3 py-2.5 px-4 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all" href="#">
        <Music size={20} strokeWidth={1.5} />
        <span className="font-headline text-[11px] uppercase tracking-widest">Library</span>
      </a>
      <a className="flex items-center gap-3 py-2.5 px-4 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all" href="#">
        <Brain size={20} strokeWidth={1.5} />
        <span className="font-headline text-[11px] uppercase tracking-widest">Creative Memory</span>
      </a>
      <a className="flex items-center gap-3 py-2.5 px-4 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all" href="#">
        <Settings size={20} strokeWidth={1.5} />
        <span className="font-headline text-[11px] uppercase tracking-widest">Settings</span>
      </a>
    </nav>
    <div className="mt-auto pt-6 border-t border-outline/5">
      <a className="flex items-center gap-3 py-2 px-4 rounded-lg text-on-surface-variant/60 hover:text-on-surface transition-colors" href="#">
        <HelpCircle size={18} strokeWidth={1.5} />
        <span className="font-headline text-[10px] uppercase tracking-widest">Help Center</span>
      </a>
    </div>
  </aside>
);

const Header = ({ onLeftMenuClick, onRightMenuClick }: { onLeftMenuClick: () => void, onRightMenuClick: () => void }) => {
  return (
    <header className="sticky top-0 right-0 w-full h-14 flex items-center justify-between px-4 md:px-10 z-40 glass-nav border-b border-outline/5">
      <div className="flex-1 flex justify-start">
        <button className="lg:hidden text-on-surface-variant hover:text-on-surface" onClick={onLeftMenuClick}>
          <Menu size={24} />
        </button>
      </div>
      <div className="flex-1 flex justify-center xl:justify-end">
        <div className="relative flex items-center group">
          <Search className="absolute left-3 text-on-surface-variant/50" size={18} strokeWidth={1.5} />
          <input 
            className="bg-surface-container-low/40 border-none rounded-md py-1.5 pl-9 pr-4 text-[9px] font-headline tracking-[0.1em] text-on-surface focus:ring-1 focus:ring-primary/30 focus:outline-none w-40 md:w-52 transition-all placeholder:text-on-surface-variant/40" 
            placeholder="SEARCH PROJECTS..." 
            type="text" 
          />
        </div>
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
        {slides.map((_, idx) => (
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

const Controls = () => (
  <section className="space-y-8">
    {/* Search Bar Area */}
    <div className="space-y-4">
      <div className="flex justify-between items-center px-1">
        <label className="text-xs uppercase tracking-[0.2em] text-primary font-bold flex items-center gap-2">
          <Brain size={16} /> Semantic Search
        </label>
        <span className="text-[10px] text-on-surface-variant/60 font-light uppercase tracking-widest">Creative Memory Engine</span>
      </div>
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <input 
          className="relative w-full bg-surface-container-low/80 border border-outline/20 rounded-2xl py-5 pl-14 pr-24 text-sm text-on-surface focus:ring-2 focus:ring-primary/50 focus:border-primary/50 focus:outline-none transition-all placeholder:text-on-surface-variant/50 shadow-lg" 
          placeholder="Search creative memory for sonic profiles, pacing, or emotional arcs..." 
          type="text" 
        />
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/80" size={24} strokeWidth={1.5} />
        <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2.5 rounded-xl text-[10px] uppercase tracking-widest font-bold transition-colors">
          Search
        </button>
      </div>

      {/* Suggestions & Recents */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <span className="text-[9px] uppercase tracking-widest text-on-surface-variant/60 font-bold mr-2">Suggestions:</span>
        <button className="text-[10px] bg-surface-container/50 hover:bg-surface-variant border border-outline/10 px-3 py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface transition-colors">"Upbeat Gen-Z UGC"</button>
        <button className="text-[10px] bg-surface-container/50 hover:bg-surface-variant border border-outline/10 px-3 py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface transition-colors">"Cinematic suspense build"</button>
        <button className="text-[10px] bg-surface-container/50 hover:bg-surface-variant border border-outline/10 px-3 py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface transition-colors">"Lo-fi study beats"</button>
        <div className="w-px h-4 bg-outline/20 mx-2 hidden sm:block"></div>
        <span className="text-[9px] uppercase tracking-widest text-on-surface-variant/60 font-bold mr-2 flex items-center gap-1"><History size={12}/> Recent:</span>
        <button className="text-[10px] text-on-surface-variant/60 hover:text-primary transition-colors underline decoration-outline/30 underline-offset-4">"Corporate tech promo"</button>
      </div>
    </div>

    {/* Top Memory Matches & Sliders */}
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-7 space-y-4">
        <label className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/80 font-bold flex items-center gap-2">
          Top Memory Matches
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Match Card 1 */}
          <div className="bg-surface-container-low/30 border border-outline/10 p-4 rounded-xl hover:border-primary/30 transition-colors cursor-pointer group">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[9px] text-tertiary uppercase tracking-widest font-bold bg-tertiary/10 px-2 py-0.5 rounded">98% Match</span>
              <Play size={14} className="text-on-surface-variant group-hover:text-primary transition-colors" />
            </div>
            <h5 className="text-sm font-headline font-semibold text-on-surface mb-1">Project: Neon Pulse</h5>
            <p className="text-[10px] text-on-surface-variant/60 line-clamp-2">High-BPM electronic track with aggressive synth bass and rising risers.</p>
          </div>
          {/* Match Card 2 */}
          <div className="bg-surface-container-low/30 border border-outline/10 p-4 rounded-xl hover:border-primary/30 transition-colors cursor-pointer group">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[9px] text-secondary uppercase tracking-widest font-bold bg-secondary/10 px-2 py-0.5 rounded">85% Match</span>
              <Play size={14} className="text-on-surface-variant group-hover:text-primary transition-colors" />
            </div>
            <h5 className="text-sm font-headline font-semibold text-on-surface mb-1">Asset: Cyberpunk Ad</h5>
            <p className="text-[10px] text-on-surface-variant/60 line-clamp-2">Gritty industrial soundscape with heavy percussion and distorted vocals.</p>
          </div>
        </div>
      </div>

      <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-8 bg-surface-container-low/20 p-6 rounded-2xl border border-outline/5">
        <div className="space-y-4">
          <label className="text-[9px] uppercase tracking-[0.2em] text-on-surface-variant/80 font-bold flex justify-between">
            AI Intensity <span className="text-tertiary font-medium">84%</span>
          </label>
          <div className="h-1 w-full bg-surface-container-highest rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-tertiary w-[84%]"></div>
          </div>
        </div>
        <div className="space-y-4">
          <label className="text-[9px] uppercase tracking-[0.2em] text-on-surface-variant/80 font-bold flex justify-between">
            Tone Velocity <span className="text-secondary font-medium">Mid</span>
          </label>
          <div className="h-1 w-full bg-surface-container-highest rounded-full relative overflow-hidden">
            <div className="absolute inset-0 bg-secondary/60 w-1/3 left-1/3"></div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const VariantCard = ({ variant, rank, isSelected, onToggleSelect, onDelete }: { variant: any, rank: number, isSelected: boolean, onToggleSelect: (id: string) => void, onDelete: (id: string) => void }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

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
            </div>
            <h4 className="font-headline font-semibold text-base tracking-tight text-on-surface">{variant.name}</h4>
            <p className="text-[9px] text-on-surface-variant/50 uppercase tracking-widest mt-1">{variant.timeAgo} • {variant.sampleRate} {variant.quality}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
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
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
        <div className="flex items-end gap-[3px] h-6 w-full">
           {[40, 70, 90, 50, 100, 60, 40, 80, 95, 50].map((h, i) => (
             <div key={i} className={`flex-1 ${variant.bgType} ${h < 80 ? '/40' : ''} rounded-full transition-all duration-500 hover:h-full`} style={{ height: `${h}%` }}></div>
           ))}
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="relative group flex items-center justify-center">
          <button className="flex items-center gap-2 text-[11px] font-bold text-on-surface bg-white/5 py-2 px-5 rounded-lg border border-outline/10 hover:bg-white/10 transition-all uppercase tracking-widest">
            <Play size={16} fill="currentColor" />
            Preview
          </button>
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all bg-surface-container-high text-on-surface text-[10px] px-2 py-1 rounded whitespace-nowrap pointer-events-none border border-outline/10 z-10">Play Audio</span>
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
            <div className="grid grid-cols-3 gap-4">
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
                <button className="w-full flex items-center gap-3 bg-surface-container-low hover:bg-surface-variant p-3 rounded-xl border border-outline/10 transition-colors">
                  <LinkIcon size={18} className="text-primary" />
                  <span className="text-sm font-medium">Copy Link</span>
                </button>
                <button className="w-full flex items-center gap-3 bg-surface-container-low hover:bg-surface-variant p-3 rounded-xl border border-outline/10 transition-colors">
                  <Twitter size={18} className="text-[#1DA1F2]" />
                  <span className="text-sm font-medium">Share to Twitter</span>
                </button>
                <button className="w-full flex items-center gap-3 bg-surface-container-low hover:bg-surface-variant p-3 rounded-xl border border-outline/10 transition-colors">
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

const initialVariants = [
  {
    id: 'v1',
    name: 'Urban Beat v4.2',
    type: 'High Resonance',
    typeColor: 'text-tertiary',
    bgType: 'bg-tertiary',
    timeAgo: '2m ago',
    timestamp: Date.now() - 2 * 60000,
    quality: 'Lossless',
    sampleRate: '48kHz',
    duration: '0:30.00',
    score: 92,
    memoryRetention: '+14.2%',
    brandAffinity: '+5.8%'
  },
  {
    id: 'v2',
    name: 'Morning Flow v1.0',
    type: 'Minimalist',
    typeColor: 'text-secondary',
    bgType: 'bg-secondary',
    timeAgo: '15m ago',
    timestamp: Date.now() - 15 * 60000,
    quality: 'Lossless',
    sampleRate: '48kHz',
    duration: '0:15.00',
    score: 85,
    memoryRetention: '+8.4%',
    brandAffinity: '+3.2%'
  },
  {
    id: 'v3',
    name: 'Neon Drive v2',
    type: 'Synthwave',
    typeColor: 'text-primary',
    bgType: 'bg-primary',
    timeAgo: '1h ago',
    timestamp: Date.now() - 60 * 60000,
    quality: 'High',
    sampleRate: '44.1kHz',
    duration: '0:45.00',
    score: 78,
    memoryRetention: '+5.1%',
    brandAffinity: '+2.1%'
  }
];

const ActiveVariants = () => {
  const [variants, setVariants] = useState(initialVariants);
  const [sortBy, setSortBy] = useState('score');
  const [filterQuality, setFilterQuality] = useState('All');
  const [selectedVariants, setSelectedVariants] = useState<string[]>(['v1']); // Default select the top one

  const handleDelete = (id: string) => {
    setVariants(variants.filter(v => v.id !== id));
    setSelectedVariants(selectedVariants.filter(vId => vId !== id));
  };

  const handleToggleSelect = (id: string) => {
    setSelectedVariants(prev => 
      prev.includes(id) ? prev.filter(vId => vId !== id) : [...prev, id]
    );
  };

  const filteredAndSortedVariants = variants
    .filter(v => filterQuality === 'All' || v.quality === filterQuality)
    .sort((a, b) => {
      if (sortBy === 'date') return b.timestamp - a.timestamp;
      if (sortBy === 'score') return b.score - a.score;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

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
            <button className="p-1.5 rounded-md bg-surface-variant/60 text-primary">
              <LayoutGrid size={16} strokeWidth={1.5} />
            </button>
            <button className="p-1.5 rounded-md text-on-surface-variant/40 hover:text-on-surface transition-colors">
              <List size={16} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
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



const AnalyticsPanel = ({ className = "", onClose }: { className?: string, onClose?: () => void }) => (
  <aside className={`overflow-y-auto custom-scrollbar glass-panel flex flex-col gap-12 ${className}`}>
    {onClose && (
      <div className="flex justify-end xl:hidden mb-[-2rem]">
        <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface p-2">
          <X size={24} />
        </button>
      </div>
    )}
    <section>
      <div className="flex items-center gap-2 mb-6">
        <BadgeCheck className="text-tertiary" size={18} fill="currentColor" stroke="black" />
        <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant">Recommended Asset</h3>
      </div>
      <div className="bg-gradient-to-b from-surface-container-high/40 to-surface-container-low/20 p-6 rounded-2xl border border-tertiary/10 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <span className="text-sm font-headline font-bold text-on-surface">Variant A</span>
          <span className="text-xs font-bold text-tertiary">92.4% Recall</span>
        </div>
        <div className="space-y-4 mb-6">
          <p className="text-[9px] uppercase tracking-widest text-on-surface-variant font-bold">Insights</p>
          <div className="p-4 bg-black/30 rounded-xl border border-outline/5">
            <p className="text-[11px] text-on-surface/90 leading-relaxed font-light">
              <span className="text-tertiary font-medium">Neural Match:</span> Highest subconscious recall detected at 0:08 sequence. Frequency profile matches target audience baseline for "Premium Tech" vertical.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-on-surface-variant/70">
          <TrendingUp size={16} strokeWidth={1.5} />
          <span>Confidence Score: High</span>
        </div>
      </div>
    </section>

    <BrainSimulation />

    <section className="flex-1 flex flex-col">
      <div className="flex justify-between items-center mb-10">
        <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant">Engagement Delta</h3>
        <Info className="text-on-surface-variant/40 hover:text-on-surface cursor-pointer" size={18} strokeWidth={1.5} />
      </div>
      <div className="flex-1 flex items-end justify-between px-4 min-h-[160px]">
        <div className="flex flex-col items-center gap-4 group">
          <div className="w-8 bg-surface-container-high rounded-full h-[35%] transition-all group-hover:bg-outline/30"></div>
          <span className="text-[9px] font-bold text-on-surface-variant/40">V-C</span>
        </div>
        <div className="flex flex-col items-center gap-4 group">
          <div className="w-8 bg-secondary/20 rounded-full h-[60%] transition-all group-hover:bg-secondary/40"></div>
          <span className="text-[9px] font-bold text-secondary/70">V-B</span>
        </div>
        <div className="flex flex-col items-center gap-4 group">
          <div className="w-8 bg-tertiary rounded-full h-[95%] shadow-lg shadow-tertiary/10 transition-all group-hover:scale-y-105 origin-bottom"></div>
          <span className="text-[9px] font-bold text-tertiary">V-A</span>
        </div>
      </div>
      <div className="mt-12 space-y-3">
        <div className="flex justify-between items-center p-3.5 bg-white/[0.02] rounded-xl border border-outline/5">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-tertiary"></div>
            <span className="text-[11px] font-light text-on-surface-variant">Memory Retention</span>
          </div>
          <span className="text-[11px] font-semibold text-tertiary">+14.2%</span>
        </div>
        <div className="flex justify-between items-center p-3.5 bg-white/[0.02] rounded-xl border border-outline/5">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-secondary"></div>
            <span className="text-[11px] font-light text-on-surface-variant">Brand Affinity</span>
          </div>
          <span className="text-[11px] font-semibold text-secondary">+5.8%</span>
        </div>
      </div>
    </section>

    <button className="w-full bg-surface-variant/40 hover:bg-white/5 py-3.5 rounded-xl border border-outline/10 font-headline font-bold text-[9px] uppercase tracking-[0.2em] transition-all text-on-surface-variant/80 hover:text-on-surface">
      Generate Neuro-Report
    </button>
  </aside>
);

export default function App() {
  const [isLeftMenuOpen, setIsLeftMenuOpen] = useState(false);
  const [isRightMenuOpen, setIsRightMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background text-on-surface selection:bg-primary/30 selection:text-on-surface antialiased">
      {/* Desktop Sidebar */}
      <Sidebar className="hidden lg:flex fixed left-0 top-0 h-full w-60 border-r border-outline/10" />
      
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
              <Sidebar className="h-full w-full border-none" onClose={() => setIsLeftMenuOpen(false)} />
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
              <AnalyticsPanel className="h-full w-full border-none p-6 sm:p-10" onClose={() => setIsRightMenuOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="lg:ml-60 flex flex-col xl:flex-row h-screen w-full">
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-background w-full">
          <Header onLeftMenuClick={() => setIsLeftMenuOpen(true)} onRightMenuClick={() => setIsRightMenuOpen(true)} />
          <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-10 md:space-y-16">
            <Hero />
            <Controls />
            <ActiveVariants />
          </div>
        </div>
        {/* Analytics Panel for Desktop */}
        <AnalyticsPanel className="hidden xl:flex w-96 border-l border-outline/5 p-10" />
      </main>
    </div>
  );
}
