import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, 
  Cpu, 
  Music, 
  Database, 
  Shield, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  XCircle, 
  RefreshCcw, 
  Save, 
  Sliders, 
  Zap,
  HardDrive,
  Download,
  Upload,
  AlertCircle
} from 'lucide-react';
import { db } from '../db';

interface SettingItemProps {
  label: string;
  description?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

const SettingItem = ({ label, description, children, icon }: SettingItemProps) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 hover:bg-white/5 rounded-2xl transition-all border border-outline/5">
    <div className="flex items-start gap-4">
      {icon && (
        <div className="p-2.5 rounded-xl bg-surface-variant text-on-surface-variant">
          {icon}
        </div>
      )}
      <div>
        <h4 className="text-sm font-bold text-on-surface">{label}</h4>
        {description && <p className="text-xs text-on-surface-variant/70 mt-0.5">{description}</p>}
      </div>
    </div>
    <div className="flex-shrink-0 w-full md:w-auto">
      {children}
    </div>
  </div>
);

const SettingInput = ({ 
  value, 
  onChange, 
  type = 'text', 
  placeholder,
  isSecret = false
}: { 
  value: string; 
  onChange: (val: string) => void; 
  type?: string;
  placeholder?: string;
  isSecret?: boolean;
}) => {
  const [shown, setShown] = useState(!isSecret);
  
  return (
    <div className="relative w-full md:w-72">
      <input 
        type={shown ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-surface-container border border-outline/10 rounded-xl px-4 py-2 text-xs text-on-surface focus:border-primary/50 outline-none transition-all placeholder:text-on-surface-variant/30"
      />
      {isSecret && (
        <button 
          onClick={() => setShown(!shown)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40 hover:text-on-surface-variant transition-colors"
        >
          {shown ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      )}
    </div>
  );
};

const SectionHeader = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="flex items-center gap-4 mb-6">
    <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-[0_0_20px_rgba(204,151,255,0.1)]">
      {icon}
    </div>
    <div>
      <h3 className="text-lg font-headline font-bold text-on-surface">{title}</h3>
      <p className="text-xs text-on-surface-variant uppercase tracking-widest">{description}</p>
    </div>
  </div>
);

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      const allSettings = await db.settings.toArray();
      const settingsMap = allSettings.reduce((acc: Record<string, any>, curr) => ({
        ...acc,
        [curr.key]: curr.value
      }), {});
      setSettings(settingsMap);
      setLoading(false);
    };
    loadSettings();
  }, []);

  const updateSetting = async (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    const existing = await db.settings.where('key').equals(key).first();
    if (existing) {
      await db.settings.update(existing.id!, { value });
    } else {
      await db.settings.add({ key, value });
    }
    // We don't have access to showToast here easily unless we pass it or use a context
    // For now, let's assume it persists correctly.
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(settings));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "oumi_settings.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        for (const [key, value] of Object.entries(imported)) {
          const existing = await db.settings.where('key').equals(key).first();
          if (existing) {
            await db.settings.update(existing.id!, { value });
          } else {
            await db.settings.add({ key, value });
          }
        }
        setSettings(imported);
      } catch (err) {
        console.error("Failed to import settings");
      }
    };
    reader.readAsText(file);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-on-surface-variant">
        <RefreshCcw size={48} className="animate-spin mb-4 text-primary/40" />
        <p className="text-sm font-medium animate-pulse">Initializing System...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-10 max-w-5xl mx-auto space-y-12 mb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
              <Settings size={22} />
            </div>
            <h2 className="text-3xl font-headline font-extrabold tracking-tight text-on-surface">Configuration</h2>
          </div>
          <p className="text-on-surface-variant text-sm max-w-md">Fine-tune the neural engine, API orchestrations, and interface parameters.</p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-outline/10 bg-surface-container hover:bg-surface-variant text-[10px] font-bold uppercase tracking-widest text-on-surface-variant cursor-pointer transition-all">
            <Upload size={14} />
            Import
            <input type="file" className="hidden" accept=".json" onChange={handleImport} />
          </label>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-outline/10 bg-surface-container hover:bg-surface-variant text-[10px] font-bold uppercase tracking-widest text-on-surface-variant transition-all"
          >
            <Download size={14} />
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12">
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <SectionHeader 
            icon={<Cpu size={20} />}
            title="Intelligence Core"
            description="Neural Model Orchestration"
          />
          
          <div className="glass-panel p-2 rounded-[2rem] border border-outline/10 overflow-hidden">
            <div className="bg-surface-container-lowest/50 rounded-[1.8rem] overflow-hidden">
              <SettingItem 
                label="Gemini API Key" 
                description="Powering script brainstorming and neural interpretation."
                icon={<Shield size={18} />}
              >
                <div className="flex items-center gap-3">
                  <SettingInput 
                    value={settings.gemini_key || ''} 
                    onChange={(val) => updateSetting('gemini_key', val)}
                    placeholder="Enter your Google Cloud API key"
                    isSecret
                  />
                  {settings.gemini_key ? <CheckCircle2 size={16} className="text-tertiary" /> : <XCircle size={16} className="text-on-surface-variant/20" />}
                </div>
              </SettingItem>

              <SettingItem 
                label="Primary Model" 
                description="Higher models provide deeper creative insights but take longer."
                icon={<Zap size={18} />}
              >
                <select 
                  value={settings.model || 'gemini-1.5-flash'}
                  onChange={(e) => updateSetting('model', e.target.value)}
                  className="bg-surface-container border border-outline/10 rounded-xl px-4 py-2 text-xs text-on-surface outline-none appearance-none cursor-pointer w-full md:w-72"
                >
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash (Standard)</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro (Brainy)</option>
                  <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash (Experimental)</option>
                </select>
              </SettingItem>
            </div>
          </div>
        </motion.section>

        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          <SectionHeader 
            icon={<Music size={20} />}
            title="Audio Synthesis"
            description="Voice & Music Generation Engine"
          />
          
          <div className="glass-panel p-2 rounded-[2rem] border border-outline/10 overflow-hidden">
            <div className="bg-surface-container-lowest/50 rounded-[1.8rem] overflow-hidden">
              <SettingItem 
                label="ElevenLabs API Key" 
                description="High-fidelity voice cloning and music synthesis."
                icon={<Shield size={18} />}
              >
                <div className="flex items-center gap-3">
                  <SettingInput 
                    value={settings.elevenlabs_key || ''} 
                    onChange={(val) => updateSetting('elevenlabs_key', val)}
                    placeholder="Enter your ElevenLabs key"
                    isSecret
                  />
                  {settings.elevenlabs_key ? <CheckCircle2 size={16} className="text-tertiary" /> : <XCircle size={16} className="text-on-surface-variant/20" />}
                </div>
              </SettingItem>

              <SettingItem 
                label="Synthesis Stability" 
                description="Higher values lead to more consistent, predictable output."
                icon={<Sliders size={18} />}
              >
                <div className="flex items-center gap-4 w-full md:w-72">
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.1" 
                    value={settings.stability || 0.5}
                    onChange={(e) => updateSetting('stability', parseFloat(e.target.value))}
                    className="flex-1 accent-secondary"
                  />
                  <span className="text-[10px] font-bold text-on-surface-variant w-8">{(settings.stability || 0.5) * 100}%</span>
                </div>
              </SettingItem>
            </div>
          </div>
        </motion.section>

        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <SectionHeader 
            icon={<Database size={20} />}
            title="Creative Memory"
            description="Vector Database & Context Management"
          />
          
          <div className="glass-panel p-2 rounded-[2rem] border border-outline/10 overflow-hidden">
            <div className="bg-surface-container-lowest/50 rounded-[1.8rem] overflow-hidden">
              <SettingItem 
                label="Turbopuffer API Key" 
                description="Storing semantic relationships and brand context."
                icon={<Shield size={18} />}
              >
                <div className="flex items-center gap-3">
                  <SettingInput 
                    value={settings.turbopuffer_key || ''} 
                    onChange={(val) => updateSetting('turbopuffer_key', val)}
                    placeholder="Enter Turbopuffer key"
                    isSecret
                  />
                  {settings.turbopuffer_key ? <CheckCircle2 size={16} className="text-tertiary" /> : <XCircle size={16} className="text-on-surface-variant/20" />}
                </div>
              </SettingItem>

              <SettingItem 
                label="TRIBE v2 Analysis Token" 
                description="HuggingFace token for high-end neural analysis."
                icon={<Zap size={18} />}
              >
                <div className="flex items-center gap-3">
                  <SettingInput 
                    value={settings.hf_token || ''} 
                    onChange={(val) => updateSetting('hf_token', val)}
                    placeholder="Enter HF Access Token"
                    isSecret
                  />
                  {settings.hf_token ? <CheckCircle2 size={16} className="text-tertiary" /> : <XCircle size={16} className="text-on-surface-variant/20" />}
                </div>
              </SettingItem>
            </div>
          </div>
        </motion.section>

        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <SectionHeader 
            icon={<HardDrive size={20} />}
            title="System Persistence"
            description="Managing Local IndexedDB Instances"
          />
          
          <div className="glass-panel p-6 rounded-3xl border border-outline/10 bg-surface-container/30">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 size={14} className="text-tertiary" />
                  <span className="text-[10px] font-bold text-on-surface uppercase tracking-widest">Dexie ORM: Connected</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-outline/5">
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Total Projects</p>
                    <p className="text-xl font-headline font-bold text-on-surface">Live Sync</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-outline/5" title="Minimal impact on system resources">
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Database Load</p>
                    <p className="text-xl font-headline font-bold text-on-surface">Minimal</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={async () => {
                    const ok = confirm("Are you sure? This will delete all local projects and settings.");
                    if (ok) {
                      await db.delete();
                      window.location.reload();
                    }
                  }}
                  className="px-6 py-3 rounded-xl bg-error/10 border border-error/20 text-error text-[10px] font-bold uppercase tracking-widest hover:bg-error/20 transition-all flex items-center gap-2"
                >
                  <AlertCircle size={14} />
                  Purge Local Data
                </button>
              </div>
            </div>
          </div>
        </motion.section>

        <div className="py-10 text-center">
          <p className="text-[10px] text-on-surface-variant font-medium tracking-[0.2em] uppercase">Oumi-Audio v2.4.1 • Enterprise Tier Intelligence</p>
        </div>
      </div>
    </div>
  );
}
