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
  Facebook
} from 'lucide-react';

const Sidebar = () => (
  <aside className="fixed left-0 top-0 h-full w-60 flex flex-col py-10 px-6 glass-panel border-r border-outline/10 z-50">
    <div className="mb-12">
      <h1 className="text-lg font-headline font-bold tracking-tight text-[#dee5ff]">Oumi Audio</h1>
      <p className="font-headline font-normal text-[9px] uppercase tracking-[0.2em] text-on-surface-variant/70">Creative Intelligence</p>
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

const Header = () => {
  return (
    <header className="sticky top-0 right-0 w-full h-14 flex justify-end items-center px-10 z-40 glass-nav border-b border-outline/5">
      <div className="relative flex items-center group">
        <Search className="absolute left-3 text-on-surface-variant/50" size={18} strokeWidth={1.5} />
        <input 
          className="bg-surface-container-low/40 border-none rounded-md py-1.5 pl-9 pr-4 text-[9px] font-headline tracking-[0.1em] text-on-surface focus:ring-1 focus:ring-primary/30 focus:outline-none w-52 transition-all placeholder:text-on-surface-variant/40" 
          placeholder="SEARCH PROJECTS..." 
          type="text" 
        />
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
  <section className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
    <div className="md:col-span-7 space-y-3">
      <div className="flex justify-between items-center px-1">
        <label className="text-[9px] uppercase tracking-[0.2em] text-on-surface-variant/80 font-bold">Semantic Search</label>
        <span className="text-[9px] text-on-surface-variant/40 font-light italic">Refining with Creative Memory</span>
      </div>
      <div className="relative">
        <input 
          className="w-full bg-surface-container-low/40 border border-outline/10 rounded-xl py-3.5 pl-12 text-xs text-on-surface focus:ring-1 focus:ring-primary/30 focus:outline-none transition-all placeholder:text-on-surface-variant/30" 
          placeholder="Describe the sonic character..." 
          type="text" 
        />
        <Brain className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/60" size={20} strokeWidth={1.5} />
      </div>
    </div>
    <div className="md:col-span-5 grid grid-cols-2 gap-8">
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
  </section>
);

const VariantCard = ({ variant, onDelete }: { variant: any, onDelete: (id: string) => void }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  return (
    <div className="variant-card p-6 rounded-2xl bg-surface-container-low/20 flex flex-col gap-6 transition-all duration-300">
      <div className="flex justify-between items-start cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div>
          <span className={`text-[9px] ${variant.typeColor} uppercase tracking-widest font-bold mb-1 block`}>{variant.type}</span>
          <h4 className="font-headline font-semibold text-base tracking-tight text-on-surface">{variant.name}</h4>
          <p className="text-[9px] text-on-surface-variant/50 uppercase tracking-widest mt-0.5">{variant.timeAgo} • {variant.sampleRate} {variant.quality}</p>
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
      
      <div className="h-14 w-full bg-black/20 rounded-lg flex items-center px-4">
        <div className="flex items-end gap-[3px] h-6 w-full">
           {[40, 70, 90, 50, 100, 60, 40, 80, 95, 50].map((h, i) => (
             <div key={i} className={`flex-1 ${variant.bgType} ${h < 80 ? '/40' : ''} rounded-full`} style={{ height: `${h}%` }}></div>
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
  const [sortBy, setSortBy] = useState('date');
  const [filterQuality, setFilterQuality] = useState('All');

  const handleDelete = (id: string) => {
    setVariants(variants.filter(v => v.id !== id));
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
          {filteredAndSortedVariants.map(variant => (
            <motion.div
              key={variant.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <VariantCard variant={variant} onDelete={handleDelete} />
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

const AnalyticsPanel = () => (
  <aside className="w-96 overflow-y-auto custom-scrollbar glass-panel border-l border-outline/5 p-10 flex flex-col gap-12">
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
  return (
    <div className="flex h-screen overflow-hidden bg-background text-on-surface selection:bg-primary/30 selection:text-on-surface antialiased">
      <Sidebar />
      <main className="ml-60 flex flex-row h-screen w-full">
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-background">
          <Header />
          <div className="p-10 max-w-7xl mx-auto space-y-16">
            <Hero />
            <Controls />
            <ActiveVariants />
          </div>
        </div>
        <AnalyticsPanel />
      </main>
    </div>
  );
}
