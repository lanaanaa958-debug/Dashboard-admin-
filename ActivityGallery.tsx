import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import {
  Images,
  Upload,
  Trash2,
  Edit3,
  X,
  Check,
  GripVertical,
  Camera,
  Sparkles,
} from 'lucide-react';
import { Activity } from '../types';
import { getActivities, addActivity, deleteActivity, updateActivity } from '../lib/storage';
import { generateCaption } from '../lib/gemini';
import toast from 'react-hot-toast';

export default function ActivityGallery() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCaption, setEditCaption] = useState('');
  const [generatingCaption, setGeneratingCaption] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  useEffect(() => {
    setActivities(getActivities());
  }, []);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      for (const file of acceptedFiles) {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const imageUrl = reader.result as string;
          let caption = file.name.replace(/\.[^/.]+$/, '');
          
          // Try AI caption
          try {
            setGeneratingCaption(true);
            const aiCaption = await generateCaption(caption);
            caption = aiCaption;
          } catch {
            // Use filename as fallback
          }
          setGeneratingCaption(false);
          
          const newActivity = addActivity({ imageUrl, caption });
          setActivities((prev) => [newActivity, ...prev]);
          toast.success('Foto berhasil diupload! 📸');
        };
        reader.readAsDataURL(file);
      }
    },
    []
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: true,
  });

  const handleDelete = (id: string) => {
    deleteActivity(id);
    setActivities(getActivities());
    toast.success('Foto dihapus!');
  };

  const handleStartEdit = (activity: Activity) => {
    setEditingId(activity.id);
    setEditCaption(activity.caption);
  };

  const handleSaveEdit = (id: string) => {
    updateActivity(id, { caption: editCaption });
    setActivities(getActivities());
    setEditingId(null);
    toast.success('Caption diperbarui!');
  };

  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    setDragOverId(id);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const draggedIndex = activities.findIndex((a) => a.id === draggedId);
    const targetIndex = activities.findIndex((a) => a.id === targetId);

    const newActivities = [...activities];
    const [removed] = newActivities.splice(draggedIndex, 1);
    newActivities.splice(targetIndex, 0, removed);

    setActivities(newActivities);
    // Save the new order
    localStorage.setItem('codecraft_activities', JSON.stringify(newActivities));
    setDraggedId(null);
    setDragOverId(null);
    toast.success('Foto dipindahkan!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Images className="text-purple-400" size={28} />
            Activity Gallery
          </h2>
          <p className="text-gray-500 text-sm mt-1 font-mono">
            {activities.length} photos &middot; Drag to reorder
          </p>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`relative rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragActive
            ? 'border-purple-400 bg-purple-500/10 scale-[1.02]'
            : 'border-white/10 hover:border-purple-500/30 bg-white/[0.01]'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center">
            {isDragActive ? (
              <Upload size={24} className="text-purple-400 animate-bounce" />
            ) : (
              <Camera size={24} className="text-purple-400" />
            )}
          </div>
          <div>
            <p className="text-white font-semibold text-sm">
              {isDragActive ? 'Drop photos here...' : 'Upload Activity Photos'}
            </p>
            <p className="text-gray-500 text-xs font-mono mt-1">
              Drag & drop atau klik untuk browse &middot; AI auto-caption
            </p>
          </div>
          {generatingCaption && (
            <div className="flex items-center gap-2 text-xs font-mono text-purple-400">
              <Sparkles size={12} className="animate-spin" />
              Generating caption...
            </div>
          )}
        </div>
        {/* Decorative corners */}
        <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-purple-500/20 rounded-tl-lg" />
        <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-purple-500/20 rounded-tr-lg" />
        <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-purple-500/20 rounded-bl-lg" />
        <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-purple-500/20 rounded-br-lg" />
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: index * 0.05 }}
              draggable
              onDragStart={() => handleDragStart(activity.id)}
              onDragOver={(e) => handleDragOver(e, activity.id)}
              onDrop={(e) => handleDrop(e, activity.id)}
              onDragEnd={() => {
                setDraggedId(null);
                setDragOverId(null);
              }}
              className={`group relative rounded-xl overflow-hidden border transition-all duration-300 cursor-grab active:cursor-grabbing ${
                dragOverId === activity.id
                  ? 'border-purple-400 scale-105 shadow-lg shadow-purple-500/20'
                  : draggedId === activity.id
                  ? 'border-white/20 opacity-50 scale-95'
                  : 'border-white/5 hover:border-purple-500/20'
              }`}
              style={{ background: 'rgba(255,255,255,0.02)' }}
            >
              {/* Image */}
              <div className="relative aspect-square">
                {activity.imageUrl ? (
                  <img
                    src={activity.imageUrl}
                    alt={activity.caption}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-500/5 to-cyan-500/5 flex items-center justify-center">
                    <Camera size={32} className="text-gray-700" />
                  </div>
                )}
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-3 flex items-end justify-between">
                    <div className="flex items-center gap-1">
                      <GripVertical size={12} className="text-gray-400" />
                      <span className="text-[10px] text-gray-400 font-mono">Drag</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleStartEdit(activity)}
                        className="p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                      >
                        <Edit3 size={12} />
                      </button>
                      <button
                        onClick={() => handleDelete(activity.id)}
                        className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              {/* Caption */}
              <div className="p-2.5">
                {editingId === activity.id ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={editCaption}
                      onChange={(e) => setEditCaption(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(activity.id)}
                      className="flex-1 px-2 py-1 rounded-md bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500/40"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveEdit(activity.id)}
                      className="p-1 rounded-md bg-emerald-500/20 text-emerald-400"
                    >
                      <Check size={12} />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1 rounded-md bg-white/5 text-gray-400"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <p className="text-gray-400 text-xs font-mono truncate">{activity.caption}</p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {activities.length === 0 && (
        <div className="text-center py-12 text-gray-600">
          <Images size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-mono text-sm">No activity photos yet</p>
          <p className="font-mono text-xs text-gray-700 mt-1">Upload your first photo above</p>
        </div>
      )}
    </div>
  );
}
