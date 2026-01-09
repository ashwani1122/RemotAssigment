import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'VideoVault Pro',
    short_name: 'VideoVault',
    description: 'Resilient Local-First Video Recorder',
    start_url: '/',
    display: 'standalone',
    background_color: '#020617', // match your tailwind slate-950
    theme_color: '#3b82f6',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}