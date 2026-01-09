'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db, VideoRecord } from '@/lib/db';
import { AlertCircle, CheckCircle, RefreshCw, Trash2, CloudUpload, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// 1. Explicitly define the props to fix the TypeScript deployment error
interface VideoListProps {
  onUpload: (id: number, blob: Blob) => Promise<void>;
  uploadingId: number | null;
  onSelectVideo: (url: string) => void;
}

export function VideoList({ onUpload, uploadingId, onSelectVideo }: VideoListProps) {
  const videos = useLiveQuery(() => db.videos.orderBy('timestamp').reverse().toArray());

  if (!videos?.length) return null;

  return (
    <div className="mt-12 space-y-4">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider px-2">
        Local Storage ({videos.length})
      </h3>
      
      <AnimatePresence>
        {videos.map((video: VideoRecord) => (
          <motion.div 
            key={video.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl flex items-center space-x-4 backdrop-blur-sm"
          >
            {/* 2. Interactive Thumbnail: Clicking this triggers the Playback Overlay */}
            <div 
              onClick={() => onSelectVideo(video.previewUrl)}
              className="relative w-16 h-16 rounded-lg overflow-hidden bg-black shrink-0 cursor-pointer group active:scale-95 transition-transform"
            >
              <video src={video.previewUrl} className="w-full h-full object-cover opacity-60" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Play size={16} className="text-white group-hover:scale-125 transition-transform" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-slate-500 font-mono">
                {new Date(video.timestamp).toLocaleTimeString()}
              </p>
              <StatusBadge status={video.status} />
            </div>

            <div className="flex items-center space-x-2">
              {video.status !== 'synced' && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation(); // Prevents opening the video player when clicking upload
                    onUpload(video.id!, video.blob);
                  }}
                  disabled={uploadingId === video.id}
                  className="p-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-xl transition-all active:scale-90 disabled:opacity-50"
                >
                  {video.status === 'failed' ? (
                    <RefreshCw size={20} className={uploadingId === video.id ? 'animate-spin' : ''} />
                  ) : (
                    <CloudUpload size={20} />
                  )}
                </button>
              )}
              
              <button 
                onClick={(e) => {
                  e.stopPropagation(); // Prevents opening the video player when clicking delete
                  db.videos.delete(video.id!);
                }} 
                className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function StatusBadge({ status }: { status: VideoRecord['status'] }) {
  const configs = {
    pending: { color: 'text-amber-500', icon: AlertCircle, label: 'Ready to Sync' },
    uploading: { color: 'text-blue-400', icon: RefreshCw, label: 'Uploading...' },
    synced: { color: 'text-emerald-500', icon: CheckCircle, label: 'Cloud Secured' },
    failed: { color: 'text-red-500', icon: AlertCircle, label: 'Upload Failed' },
  };
  
  const Config = configs[status];
  
  return (
    <div className={`flex items-center space-x-1 mt-1 ${Config.color}`}>
      <Config.icon size={14} className={status === 'uploading' ? 'animate-spin' : ''} />
      <span className="text-[10px] font-bold uppercase tracking-tight truncate">
        {Config.label}
      </span>
    </div>
  );
}