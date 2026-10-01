import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
export const projects = [
  {
    id: '1',
    title: 'EmoSync',
    description: 'A high-fidelity IoT biometric telemetry platform and medical data visualization dashboard with real-time analytics.',
    technologies: ['React', 'Node.js', 'Socket.io', 'MongoDB', 'Tailwind CSS', 'ESP32'],
    image: '/cover.png',
    featured: true,
    github: 'https://github.com/biswa16-dev/EmoSync',
    live: 'https://emo-sync-mu.vercel.app'
  },
  {
    id: '2',
    title: 'StockSense',
    description: 'An immersive Inventory Management System with a beautiful glassmorphism UI, real-time analytics, and seamless stock operations.',
    technologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Prisma', 'Tailwind CSS', 'Socket.io', 'Firebase'],
    image: '/stocksense.png',
    github: 'https://github.com/biswa16-dev/StockSense',
    live: 'https://stocksenseims.web.app/'
  },
  {
    id: '3',
    title: 'Truvix',
    description: 'Decentralized News Verification Portal.',
    technologies: ['JavaScript', 'Node.js', 'HTML', 'Vanilla CSS'],
    image: '/truvix_cover.png',
    github: 'https://github.com/biswa16-dev/Truvix',
    live: 'https://truvix-pi.vercel.app/'
  }
];
