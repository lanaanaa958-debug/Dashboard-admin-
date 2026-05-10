import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lightbulb,
  Plus,
  Trash2,
  ArrowRight,
  Sparkles,
  Search,
  Filter,
  X,
  Zap,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { Idea, IdeaStatus } from '../types';
import { getIdeas, addIdea, updateIdeaStatus, deleteIdea } from '../lib/storage';
import { generateIdeaCategory } from '../lib/gemini';
import toast from 'react-hot-toast';

const statusConfig: Record<IdeaStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  new: {
    label: 'New',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10 border-cyan-500/30',
    icon: <Zap size={12} />,
  },
  reviewed: {
    label: 'Reviewed',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/30',
    icon: <Clock size={12} />,
  },
  implemented: {
    label: 'Implemented',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/30',
    icon: <CheckCircle2 size={12} />,
  },
};

export default function IdeaBoard() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<IdeaStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({ author: '', title: '', description: '' });
  const [aiCategory, setAiCategory] = useState<string>('');
  const [categorizing, setCategorizing] = useState(false);

  useEffect(() => {
    setIdeas(getIdeas());
  }, []);

  const filteredIdeas = ideas.filter((idea) => {
    const matchesStatus = filterStatus === 'all' || idea.status === filterStatus;
    const matchesSearch =
      idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statusCounts = {
    new: ideas.filter((i) => i.status === 'new').length,
    reviewed: ideas.filter((i) => i.status === 'reviewed').length,
    implemented: ideas.filter((i) => i.status === 'implemented').length,
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.author) {
      toast.error('Judul dan nama author wajib diisi!');
      return;
    }

    setCategorizing(true);
    let category = '';
    try {
      category = await generateIdeaCategory(formData.title, formData.description);
      setAiCategory(category);
      toast.success(`AI mengkategorikan: ${category}`, { icon: '🤖' });
    } catch {
      // silently fail
    }
    setCategorizing(false);

    const newIdea = addIdea({
      ...formData,
      status: 'new',
    });
    setIdeas([newIdea, ...ideas]);
    setFormData({ author: '', title: '', description: '' });
    setAiCategory('');
    setShowForm(false);
    toast.success('Ide baru berhasil ditambahkan! 💡');
  };

  const handleStatusChange = (id: string, status: IdeaStatus) => {
    updateIdeaStatus(id, status);
    setIdeas(getIdeas());
    toast.success(`Status diubah ke "${statusConfig[status].label}"`);
  };

  const handleDelete = (id: string) => {
    deleteIdea(id);
    setIdeas(getIdeas());
    toast.success('Ide dihapus!');
  };

  const handleConvertToProject = (idea: Idea) => {
    // Store in localStorage for ProjectManager to pick up
    const draftProject = {
      name: idea.title,
      description: idea.description,
      thumbnail: '',
      projectUrl: '',
    };
    localStorage.setItem('codecraft_draft_project', JSON.stringify(draftProject));
    updateIdeaStatus(idea.id, 'implemented');
    setIdeas(getIdeas());
    toast.success('Ide dikonversi ke draft project! Cek tab Projects 🚀', { duration: 4000 });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Lightbulb className="text-cyan-400" size={28} />
            Idea Board
          </h2>
          <p className="text-gray-500 text-sm mt-1 font-mono">
            {ideas.length} ideas &middot; {statusCounts.new} pending review
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-gray-900 font-semibold text-sm shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-shadow"
        >
          <Plus size={18} />
          Submit Idea
        </motion.button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        {(['new', 'reviewed', 'implemented'] as IdeaStatus[]).map((status) => {
          const config = statusConfig[status];
          return (
            <button
              key={status}
              onClick={() => setFilterStatus(filterStatus === status ? 'all' : status)}
              className={`p-3 rounded-xl border transition-all duration-200 ${
                filterStatus === status
                  ? `${config.bg} ${config.color}`
                  : 'bg-white/[0.02] border-white/5 text-gray-400 hover:border-white/10'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {config.icon}
                <span className="text-xs font-mono uppercase tracking-wider">{config.label}</span>
              </div>
              <p className="text-2xl font-bold">{statusCounts[status]}</p>
            </button>
          );
        })}
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search ideas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500/30 focus:ring-1 focus:ring-cyan-500/20 transition-all font-mono"
          />
        </div>
        <div className="flex items-center gap-1 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-gray-400 text-sm">
          <Filter size={14} />
          <span className="font-mono text-xs">
            {filterStatus === 'all' ? 'All' : statusConfig[filterStatus].label}
          </span>
        </div>
      </div>

      {/* Ideas Grid */}
      <div className="grid gap-3">
        <AnimatePresence mode="popLayout">
          {filteredIdeas.map((idea, index) => {
            const config = statusConfig[idea.status];
            return (
              <motion.div
                key={idea.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05 }}
                className="group p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/20 transition-all duration-300 hover:bg-white/[0.04]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${config.bg} ${config.color}`}
                      >
                        {config.icon}
                        {config.label}
                      </span>
                      <span className="text-[10px] text-gray-600 font-mono">
                        {new Date(idea.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <h3 className="text-white font-semibold text-sm mb-1 group-hover:text-cyan-400 transition-colors">
                      {idea.title}
                    </h3>
                    <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">
                      {idea.description}
                    </p>
                    <p className="text-gray-600 text-[11px] mt-2 font-mono">
                      by <span className="text-cyan-400/70">{idea.author}</span>
                    </p>
                  </div>
                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {idea.status !== 'implemented' && (
                      <>
                        {idea.status === 'new' && (
                          <button
                            onClick={() => handleStatusChange(idea.id, 'reviewed')}
                            className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors"
                            title="Mark as Reviewed"
                          >
                            <Clock size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => handleConvertToProject(idea)}
                          className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                          title="Convert to Project"
                        >
                          <ArrowRight size={14} />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(idea.id)}
                      className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {filteredIdeas.length === 0 && (
          <div className="text-center py-12 text-gray-600">
            <Lightbulb size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-mono text-sm">No ideas found</p>
          </div>
        )}
      </div>

      {/* Add Idea Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl border border-cyan-500/20 p-6"
              style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0d1f3c 100%)' }}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-white font-bold flex items-center gap-2">
                  <Sparkles size={18} className="text-cyan-400" />
                  Submit New Idea
                </h3>
                <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white">
                  <X size={18} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-mono text-gray-400 mb-1 block">Author Name</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/40 transition-colors"
                    placeholder="Nama kamu..."
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-gray-400 mb-1 block">Idea Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/40 transition-colors"
                    placeholder="Judul ide kamu..."
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-gray-400 mb-1 block">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/40 transition-colors resize-none"
                    placeholder="Jelaskan ide kamu..."
                  />
                </div>
                {aiCategory && (
                  <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 bg-cyan-500/10 px-3 py-2 rounded-lg">
                    <Sparkles size={12} />
                    AI Category: {aiCategory}
                  </div>
                )}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  disabled={categorizing}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-gray-900 font-semibold text-sm disabled:opacity-50"
                >
                  {categorizing ? (
                    <span className="flex items-center justify-center gap-2">
                      <Sparkles size={14} className="animate-spin" />
                      AI Categorizing...
                    </span>
                  ) : (
                    'Submit Idea'
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
