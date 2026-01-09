'use client';

import React, { useState, useRef, useEffect } from 'react';
import { db } from '@/lib/db';
import { Camera, X, ArrowLeft } from 'lucide-react';
import { VideoList } from './VideoList';

export default function VideoRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chunksRef = useRef<Blob[]>([]);
  const requestRef = useRef<number>(null);

  // --- TIMESTAMP LOGIC ---
  // We draw the video frame + text to a hidden canvas 30 times per second
  const drawToCanvas = () => {
    if (canvasRef.current && videoRef.current && stream) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        // Draw the raw video frame
        ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);

        // Styling the Timestamp
        const now = new Date();
        const timeStr = now.toLocaleString();
        ctx.font = 'bold 28px monospace';
        ctx.fillStyle = '#3b82f6'; // Blue-500
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        
        // Draw shadow/outline for readability
        ctx.strokeText(timeStr, 30, canvasRef.current.height - 50);
        ctx.fillText(timeStr, 30, canvasRef.current.height - 50);
      }
    }
    requestRef.current = requestAnimationFrame(drawToCanvas);
  };

  useEffect(() => {
    if (stream) {
      requestRef.current = requestAnimationFrame(drawToCanvas);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [stream]);

  // --- CAMERA CONNECTION ---
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(console.error);
    }
  }, [stream]);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 720, height: 1280 }, 
        audio: true 
      });
      setStream(s);
    } catch (err) {
      alert("Camera access denied. Please check site permissions.");
    }
  };

  const stopCamera = () => {
    stream?.getTracks().forEach(track => track.stop());
    setStream(null);
  };

  // --- RECORDING LOGIC ---
  const startRecording = () => {
    if (!canvasRef.current || !stream) return;

    // Capture stream from the CANVAS (with timestamp) instead of raw video
    const canvasStream = canvasRef.current.captureStream(30); 
    
    // Add audio from the microphone to the new canvas stream
    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length > 0) {
      canvasStream.addTrack(audioTracks[0]);
    }

    const mimeType = MediaRecorder.isTypeSupported('video/mp4') ? 'video/mp4' : 'video/webm';
    const recorder = new MediaRecorder(canvasStream, { mimeType });
    
    chunksRef.current = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      const previewUrl = URL.createObjectURL(blob);
      
      // Save locally to IndexedDB immediately
      await db.videos.add({
        blob,
        previewUrl,
        timestamp: Date.now(),
        status: 'pending'
      });
    };

    recorder.start();
    mediaRecorderRef.current = recorder;
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const uploadVideo = async (id: number, blob: Blob) => {
    setUploadingId(id);
    await db.videos.update(id, { status: 'uploading' });
    
    // Mock upload behavior
    setTimeout(async () => {
    const success = Math.random() > 0.4; // Simulate 40% failure rate
    await db.videos.update(id, { status: success ? 'synced' : 'failed' });
      setUploadingId(null);
    }, 2000);
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-950 text-white p-6 pb-24 relative">
      <header className="mb-6 text-center">
        <h1 className="text-2xl font-black italic text-blue-500 tracking-tighter">VIDEO_VAULT</h1>
        <p className="text-slate-500 text-xs uppercase tracking-widest">Local-First Persistence</p>
      </header>

      {/* Main Preview Container */}
      <div className="relative rounded-[2rem] overflow-hidden bg-slate-900 aspect-[9/16] shadow-2xl border border-slate-800 ring-1 ring-slate-700">
        
        {/* The hidden processing canvas that adds the timestamp */}
        <canvas ref={canvasRef} width={720} height={1280} className="hidden" />

        {!stream ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800 to-slate-950">
            <div className="p-5 bg-slate-900 rounded-full border border-slate-700">
              <Camera size={40} className="text-blue-500 animate-pulse" />
            </div>
            <button 
              onClick={startCamera} 
              className="px-10 py-3 bg-blue-600 rounded-full font-bold shadow-[0_0_20px_rgba(37,99,235,0.4)] active:scale-95 transition-transform"
            >
              Start Lens
            </button>
          </div>
        ) : (
          <>
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            
            {/* Playback Overlay - Appears when a list item is clicked */}
            {playbackUrl && (
              <div className="absolute inset-0 z-50 bg-black flex flex-col animate-in fade-in zoom-in duration-300">
                <div className="absolute top-6 left-6 z-[60] flex items-center gap-3">
                   <button 
                    onClick={() => setPlaybackUrl(null)} 
                    className="bg-white/10 p-3 rounded-full backdrop-blur-xl border border-white/20 hover:bg-white/20 transition-colors"
                  >
                    <ArrowLeft size={24} />
                  </button>
                  <span className="text-xs font-bold uppercase tracking-widest bg-black/40 px-3 py-1 rounded-full backdrop-blur-md">Local Playback</span>
                </div>
                <video src={playbackUrl} controls autoPlay className="w-full h-full object-contain" />
              </div>
            )}

            {!isRecording && !playbackUrl && (
              <button 
                onClick={stopCamera} 
                className="absolute top-6 right-6 p-2 bg-black/40 hover:bg-black/60 rounded-full backdrop-blur-md border border-white/10 transition-colors"
              >
                <X size={20} />
              </button>
            )}
          </>
        )}

        {/* Live Status Indicator */}
        {isRecording && (
          <div className="absolute top-6 left-6 flex items-center space-x-2 bg-red-600/90 px-4 py-1.5 rounded-full backdrop-blur-md border border-red-400/50 shadow-lg">
            <div className="w-2 h-2 bg-white rounded-full animate-ping" />
            <span className="text-[10px] font-black uppercase tracking-widest">Recording</span>
          </div>
        )}

        {/* Bottom Control Bar */}
        {!playbackUrl && stream && (
          <div className="absolute bottom-10 inset-x-0 flex justify-center items-center">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`group p-1 rounded-full border-4 transition-all duration-500 ${
                isRecording ? 'border-white bg-white' : 'border-white/20 bg-transparent'
              }`}
            >
              <div className={`rounded-full transition-all duration-300 ${
                isRecording 
                  ? 'h-10 w-10 bg-red-600 rounded-sm' 
                  : 'h-16 w-16 bg-red-600 group-hover:scale-105 shadow-[0_0_30px_rgba(220,38,38,0.6)]'
              }`} />
            </button>
          </div>
        )}
      </div>

      {/* Persistence Gallery Component */}
      <VideoList 
        onUpload={uploadVideo} 
        uploadingId={uploadingId} 
        onSelectVideo={(url: string) => setPlaybackUrl(url)} 
      />
    </div>
  );
}