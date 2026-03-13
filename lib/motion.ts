import { Variants, Transition } from 'framer-motion';

export const glacialEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const glacialTransition: Transition = {
  duration: 0.9,
  ease: glacialEase,
};

export const stagger: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.9, ease: glacialEase },
  },
};

export const cardReveal: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.7, ease: glacialEase },
  },
};

export const artworkZoom: Variants = {
  initial: { scale: 1.08, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: { duration: 1.4, ease: glacialEase },
  },
};

export const panelSlide: Variants = {
  hidden: { x: '100%', opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: 'spring', damping: 30, stiffness: 200 },
  },
  exit: {
    x: '100%',
    opacity: 0,
    transition: { duration: 0.4, ease: glacialEase },
  },
};

export const glowPulse = {
  animate: {
    boxShadow: [
      '0 0 60px 0px var(--glow-color)',
      '0 0 120px 10px var(--glow-color)',
      '0 0 60px 0px var(--glow-color)',
    ],
    transition: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6, ease: glacialEase },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: glacialEase },
  },
};
