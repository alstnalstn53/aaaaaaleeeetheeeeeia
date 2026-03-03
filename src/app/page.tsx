'use client';

import dynamic from 'next/dynamic';
import { Navbar } from '@/components/shared/Navbar';
import { Hero } from '@/components/landing/Hero';

const ParticleBackground = dynamic(
  () => import('@/components/landing/ParticleBackground').then((m) => m.ParticleBackground),
  { ssr: false }
);

export default function LandingPage() {
  return (
    <main className="relative h-screen overflow-hidden">
      <ParticleBackground />
      <Navbar />
      <Hero />
    </main>
  );
}
