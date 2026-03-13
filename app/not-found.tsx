'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { fadeUp, stagger, glacialEase } from '@/lib/motion';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-void-950 flex items-center justify-center px-6">
      <motion.div
        className="text-center max-w-lg"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={fadeUp}>
          <span className="font-display text-display-xl text-amber/20 block mb-4">
            404
          </span>
        </motion.div>
        <motion.h1
          variants={fadeUp}
          className="font-display text-display-md text-ivory-50 mb-4"
        >
          Gallery Wing Not Found
        </motion.h1>
        <motion.p
          variants={fadeUp}
          className="text-body-md text-ivory-400 mb-8"
        >
          The room you&apos;re looking for doesn&apos;t exist in this wing of the gallery.
          Perhaps it was moved to a different exhibition.
        </motion.p>
        <motion.div variants={fadeUp}>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 border border-amber text-amber font-display italic
              hover:bg-amber hover:text-void-950 transition-colors duration-700 ease-glacial"
          >
            Return to Gallery
          </Link>
        </motion.div>
      </motion.div>

      {/* Ambient floating particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-amber/10"
            initial={{
              x: `${Math.random() * 100}vw`,
              y: `${Math.random() * 100}vh`,
            }}
            animate={{
              y: [null, `${Math.random() * 100}vh`],
              x: [null, `${Math.random() * 100}vw`],
              opacity: [0, 0.3, 0],
            }}
            transition={{
              duration: 10 + Math.random() * 20,
              repeat: Infinity,
              ease: glacialEase,
            }}
          />
        ))}
      </div>
    </main>
  );
}
