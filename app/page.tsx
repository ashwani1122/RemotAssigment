'use client';

// import { InstallPrompt } from "@/components/InstallPrompt";
import VideoRecorder from "@/components/Recorder";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-slate-950">
      {/* 1. Your Main Video App Logic */}
      <VideoRecorder />

      {/* 2. The Floating Install Prompt */}
      {/* <InstallPrompt /> */}
    </main>
  );
}