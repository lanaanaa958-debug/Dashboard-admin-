import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderKanban,
  Plus,
  Trash2,
  ExternalLink,
  Sparkles,
  X,
  Link,
  Image,
  Check,
  AlertCircle,
  Globe,
  Eye,
} from 'lucide-react';
import { Project } from '../types';
import { getProjects, addProject, deleteProject, updateProject } from '../lib/storage';
import { generateProjectDescription, validateProjectUrl } from '../lib/gemini';
import toast from 'react-hot-toast';

export default function ProjectManager() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [previewProject, setPreviewProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    thumbnail: '',
    projectUrl: '',
  });
  const [urlValidation, setUrlValidation] = useState<{ valid: boolean; message: string } | null>(null);
  const [validating, setValidating] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');

  useEffect(() => {
    setProjects(getProjects());
    // Check for draft from Idea Board
    const draft = localStorage.getItem('codecraft_draft_project');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setFormData({
          name: parsed.name || '',
          description: parsed.description || '',
          thumbnail: '',
          projectUrl: '',
        });
        setShowForm(true);
        localStorage.removeItem('codecraft_draft_project');
      } catch {
        // ignore
      }
    }
  }, []);

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setThumbnailPreview(result);
        setFormData({ ...formData, thumbnail: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlValidation = async () => {
    if (!formData.projectUrl) return;
    setValidating(true);
    try {
      const result = await validateProjectUrl(formData.projectUrl);
      setUrlValidation(result);
      if (result.valid) {
        toast.success('URL valid! ✅');
      } else {
        toast.error(`URL tidak valid: ${result.message}`);
      }
    } catch {
      setUrlValidation({ valid: false, message: 'Validation failed' });
    }
    setValidating(false);
  };

  const handleGenerateDescription = async () => {
    if (!formData.name) {
      toast.error('Isi nama project dulu!');
      return;
    }
    setGenerating(true);
    try {
      const desc = await generateProjectDescription(formData.name, formData.description);
      setFormData({ ...formData, description: desc });
      toast.success('Deskripsi di-generate oleh AI! 🤖');
    } catch {
      toast.error('Gagal generate deskripsi');
    }
    setGenerating(false);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.projectUrl) {
      toast.error('Nama project dan URL wajib diisi!');
      return;
    }
    const newProject = addProject(formData);
    setProjects([newProject, ...projects]);
    setFormData({ name: '', description: '', thumbnail: '', projectUrl: '' });
    setThumbnailPreview('');
    setUrlValidation(null);
    setShowForm(false);
    toast.success('Project berhasil ditambahkan! 🚀');
  };

  const handleDelete = (id: string) => {
    deleteProject(id);
    setProjects(getProjects());
    toast.success('Project dihapus!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <FolderKanban className="text-emerald-400" size={28} />
            Project Manager
          </h2>
          <p className="text-gray-500 text-sm mt-1 font-mono">
            {projects.length} projects published
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-gray-900 font-semibold text-sm shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-shadow"
        >
          <Plus size={18} />
          New Project
        </motion.button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
              className="group rounded-xl border border-white/5 overflow-hidden hover:border-emerald-500/20 transition-all duration-300"
              style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 100%)' }}
            >
              {/* Thumbnail */}
              <div className="relative h-36 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 overflow-hidden">
                {project.thumbnail ? (
                  <img
                    src={project.thumbnail}
                    alt={project.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Globe size={32} className="text-gray-700" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#060b18] to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3 gap-2">
                  <button
                    onClick={() => setPreviewProject(project)}
                    className="px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm text-white text-xs font-mono flex items-center gap-1 hover:bg-white/20 transition-colors"
                  >
                    <Eye size={12} /> Preview
                  </button>
                  <a
                    href={project.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-cyan-500/20 backdrop-blur-sm text-cyan-400 text-xs font-mono flex items-center gap-1 hover:bg-cyan-500/30 transition-colors"
                  >
                    <ExternalLink size={12} /> Open
                  </a>
                </div>
              </div>
              {/* Info */}
              <div className="p-4">
                <h3 className="text-white font-semibold text-sm mb-1 group-hover:text-emerald-400 transition-colors">
                  {project.name}
                </h3>
                <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mb-3">
                  {project.description}
                </p>
                <div className="flex items-center justify-between">
                  <a
                    href={project.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400/70 text-[11px] font-mono truncate max-w-[180px] hover:text-cyan-400 transition-colors flex items-center gap-1"
                  >
                    <Link size={10} />
                    {project.projectUrl.replace(/^https?:\/\//, '')}
                  </a>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {projects.length === 0 && (
        <div className="text-center py-12 text-gray-600">
          <FolderKanban size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-mono text-sm">No projects yet</p>
        </div>
      )}

      {/* Add Project Modal */}
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
              className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-emerald-500/20 p-6"
              style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0d1f3c 100%)' }}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-white font-bold flex items-center gap-2">
                  <Sparkles size={18} className="text-emerald-400" />
                  New Project
                </h3>
                <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white">
                  <X size={18} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-mono text-gray-400 mb-1 block">Project Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500/40 transition-colors"
                    placeholder="Nama project..."
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-mono text-gray-400">Description</label>
                    <button
                      onClick={handleGenerateDescription}
                      disabled={generating}
                      className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 disabled:opacity-50"
                    >
                      <Sparkles size={10} className={generating ? 'animate-spin' : ''} />
                      {generating ? 'Generating...' : 'AI Generate'}
                    </button>
                  </div>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500/40 transition-colors resize-none"
                    placeholder="Deskripsi singkat project..."
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-gray-400 mb-1 block">Thumbnail</label>
                  <div className="relative">
                    {thumbnailPreview ? (
                      <div className="relative rounded-xl overflow-hidden border border-white/10">
                        <img src={thumbnailPreview} alt="Preview" className="w-full h-32 object-cover" />
                        <button
                          onClick={() => {
                            setThumbnailPreview('');
                            setFormData({ ...formData, thumbnail: '' });
                          }}
                          className="absolute top-2 right-2 p-1 rounded-lg bg-black/50 text-white hover:bg-black/70"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center h-32 rounded-xl border-2 border-dashed border-white/10 hover:border-emerald-500/30 transition-colors cursor-pointer bg-white/[0.01]">
                        <Image size={24} className="text-gray-600 mb-2" />
                        <span className="text-xs text-gray-500 font-mono">Click to upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleThumbnailUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-mono text-gray-400">Direct Project URL *</label>
                    <button
                      onClick={handleUrlValidation}
                      disabled={validating || !formData.projectUrl}
                      className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 disabled:opacity-50"
                    >
                      {validating ? 'Checking...' : 'Validate URL'}
                    </button>
                  </div>
                  <div className="relative">
                    <Link size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="url"
                      value={formData.projectUrl}
                      onChange={(e) => {
                        setFormData({ ...formData, projectUrl: e.target.value });
                        setUrlValidation(null);
                      }}
                      className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500/40 transition-colors font-mono"
                      placeholder="https://..."
                    />
                    {urlValidation && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2">
                        {urlValidation.valid ? (
                          <Check size={14} className="text-emerald-400" />
                        ) : (
                          <AlertCircle size={14} className="text-red-400" />
                        )}
                      </span>
                    )}
                  </div>
                  {urlValidation && (
                    <p
                      className={`text-[10px] font-mono mt-1 ${
                        urlValidation.valid ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {urlValidation.message}
                    </p>
                  )}
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-gray-900 font-semibold text-sm"
                >
                  Publish Project
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setPreviewProject(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl border border-cyan-500/20 overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0d1f3c 100%)' }}
            >
              <div className="h-48 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 flex items-center justify-center">
                {previewProject.thumbnail ? (
                  <img
                    src={previewProject.thumbnail}
                    alt={previewProject.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Globe size={48} className="text-gray-700" />
                )}
              </div>
              <div className="p-5">
                <h3 className="text-white font-bold text-lg mb-2">{previewProject.name}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">
                  {previewProject.description}
                </p>
                <div className="flex items-center gap-3">
                  <a
                    href={previewProject.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-gray-900 font-semibold text-sm"
                  >
                    <ExternalLink size={16} />
                    Open Project
                  </a>
                  <button
                    onClick={() => setPreviewProject(null)}
                    className="px-4 py-2.5 rounded-xl border border-white/10 text-gray-400 text-sm hover:text-white transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
