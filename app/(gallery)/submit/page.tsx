'use client';

import { motion } from 'framer-motion';
import { fadeUp, stagger } from '@/lib/motion';
import SubmissionForm from '@/components/submit/SubmissionForm';

export default function SubmitPage() {
  return (
    <section className="px-6 py-20 md:px-12 lg:px-20">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-2xl"
      >
        <motion.header variants={fadeUp} className="mb-12">
          <h1 className="font-display text-display-lg text-ivory-50">
            Submit Your Work
          </h1>
          <p className="mt-4 font-body text-body-lg text-ivory-300">
            Share your AI-generated art with the Aether community. All
            submissions are reviewed before appearing in the gallery.
          </p>
        </motion.header>

        <SubmissionForm />
      </motion.div>
    </section>
  );
}
