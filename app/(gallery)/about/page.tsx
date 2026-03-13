'use client';

import { motion } from 'framer-motion';
import { fadeUp, stagger } from '@/lib/motion';

const SECTIONS = [
  {
    title: 'The Gallery',
    body: 'Aether is a digital gallery dedicated to the art emerging from the intersection of algorithms and human creativity. The permanent collection houses twelve generative artworks — each a self-contained program that transforms mathematical processes into visual experiences. Every piece is deterministic yet infinite: change the seed, and a new variation unfolds.',
  },
  {
    title: 'Generative Art',
    body: 'The twelve permanent pieces span techniques from particle physics simulations to reaction-diffusion systems, from Penrose tilings to strange attractors. Each runs in real-time in your browser, rendered frame by frame. You can adjust parameters, explore seed variations, and watch mathematics become aesthetics.',
  },
  {
    title: 'Community',
    body: 'Aether also welcomes submissions from artists working with AI tools — Midjourney, DALL·E, Stable Diffusion, and beyond. The community collection grows through contributions from creators around the world, each piece accompanied by the prompt and process that brought it into being.',
  },
  {
    title: 'The Docent',
    body: 'Every gallery deserves a guide. The AI Docent can discuss any artwork in the collection — its techniques, its visual language, and the ideas it explores. Think of it as a knowledgeable companion for your visit.',
  },
  {
    title: 'Technology',
    body: 'Aether is built with Next.js, p5.js, and the Anthropic API. The generative pieces run in instance mode with seeded randomness for reproducibility. The design system, Void Canvas, draws from museum aesthetics — dark surfaces, deliberate typography, and motion that feels glacial and inevitable.',
  },
];

export default function AboutPage() {
  return (
    <section className="px-6 py-20 md:px-12 lg:px-20">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-3xl"
      >
        <motion.header variants={fadeUp} className="mb-16">
          <h1 className="font-display text-display-lg text-ivory-50">
            About Aether
          </h1>
          <p className="mt-4 font-body text-body-lg text-ivory-300">
            A space where algorithms become art and mathematics becomes beauty.
          </p>
        </motion.header>

        <div className="flex flex-col gap-12">
          {SECTIONS.map((section) => (
            <motion.div key={section.title} variants={fadeUp}>
              <h2 className="font-display text-heading-lg text-ivory-100">
                {section.title}
              </h2>
              <p className="mt-3 font-body text-body-md leading-relaxed text-ivory-300">
                {section.body}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
