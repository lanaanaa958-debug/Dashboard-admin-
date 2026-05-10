import { motion } from 'framer-motion';
import {
  Lightbulb,
  FolderKanban,
  Images,
  Code2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { TabType } from '../types';

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const navItems: { id: TabType; label: string; icon: React.ReactNode; badge?: string }[] = [
  { id: 'ideas', label: 'Idea Board', icon: <Lightbulb size={20} />, badge: 'NEW' },
  { id: 'projects', label: 'Projects', icon: <FolderKanban size={20} /> },
  { id: 'gallery', label: 'Gallery', icon: <Images size={20} /> },
];

export default function Sidebar({ activeTab, onTabChange, collapsed, onToggleCollapse }: SidebarProps) {
  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-screen z-50 flex flex-col border-r border-cyan-500/10"
      style={{ background: 'linear-gradient(180deg, #060b18 0%, #0a1628 50%, #060b18 100%)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-cyan-500/10">
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-emerald-400 flex items-center justify-center shadow-lg shadow-cyan-500/25">
            <Code2 size={22} className="text-gray-900" />
          </div>
          <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#060b18] animate-pulse" />
        </div>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
          >
            <h1 className="font-bold text-lg tracking-tight">
              <span className="text-cyan-400">Code</span>
              <span className="text-white">Craft</span>
            </h1>
            <p className="text-[10px] text-cyan-500/50 font-mono tracking-widest uppercase">Admin Panel</p>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.97 }}
              className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(6,182,212,0.15) 0%, rgba(16,185,129,0.1) 100%)',
                    border: '1px solid rgba(6,182,212,0.2)',
                    boxShadow: '0 0 20px rgba(6,182,212,0.1)',
                  }}
                  transition={{ duration: 0.3 }}
                />
              )}
              <span className={`relative z-10 ${isActive ? 'text-cyan-400' : ''}`}>{item.icon}</span>
              {!collapsed && (
                <>
                  <span className="relative z-10 flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span className="relative z-10 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* AI Status */}
      {!collapsed && (
        <div className="mx-3 mb-3 p-3 rounded-xl bg-gradient-to-br from-cyan-500/5 to-emerald-500/5 border border-cyan-500/10">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={14} className="text-cyan-400" />
            <span className="text-xs font-mono text-cyan-400">Gemini AI</span>
          </div>
          <p className="text-[10px] text-gray-500">Connected & Ready</p>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-emerald-400 font-mono">Online</span>
          </div>
        </div>
      )}

      {/* Collapse Toggle */}
      <button
        onClick={onToggleCollapse}
        className="flex items-center justify-center h-12 border-t border-cyan-500/10 text-gray-500 hover:text-cyan-400 transition-colors"
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>
    </motion.aside>
  );
}
