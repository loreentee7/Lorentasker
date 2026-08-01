import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

// Adapted from the MIT-licensed Amicro registry by Syed Subhan.
// Source patterns: fade-up, scale-in, blur-text and card-hover.
// https://github.com/Subhan-code/Amicro--Micro-transitions-
const expo = [0.16, 1, 0.3, 1];
const springy = [0.34, 1.56, 0.64, 1];

export function FadeUp({ children, duration = 0.45, delay = 0, yOffset = 18, className = '' }) {
  const reduced = useReducedMotion();
  return <motion.div initial={reduced ? false : { opacity: 0, y: yOffset }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : duration, delay, ease: expo }} className={className}>{children}</motion.div>;
}

export function ScaleIn({ children, duration = 0.34, delay = 0, initialScale = 0.96, className = '' }) {
  const reduced = useReducedMotion();
  return <motion.div initial={reduced ? false : { opacity: 0, scale: initialScale }} animate={{ opacity: 1, scale: 1 }} exit={reduced ? undefined : { opacity: 0, scale: 0.98 }} transition={{ duration: reduced ? 0 : duration, delay, ease: springy }} className={className}>{children}</motion.div>;
}

export function BlurText({ text, duration = 0.35, staggerDelay = 0.018, className = '' }) {
  const reduced = useReducedMotion();
  if (reduced) return <span className={className}>{text}</span>;
  return <motion.span aria-label={text} initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: staggerDelay } } }} className={className}>{Array.from(text).map((char, index) => <motion.span aria-hidden="true" key={`${char}-${index}`} variants={{ hidden: { opacity: 0, filter: 'blur(7px)', y: 3 }, visible: { opacity: 1, filter: 'blur(0px)', y: 0, transition: { duration, ease: 'easeOut' } } }} className="amicro-char">{char}</motion.span>)}</motion.span>;
}

export function HoverLift({ children, className = '', delay = 0 }) {
  const reduced = useReducedMotion();
  return <motion.div initial={reduced ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : 0.4, delay, ease: expo }} whileHover={reduced ? undefined : { y: -4, scale: 1.008, transition: { duration: 0.18 } }} whileTap={reduced ? undefined : { scale: 0.99 }} className={className}>{children}</motion.div>;
}

export function ViewTransition({ children, viewKey }) {
  const reduced = useReducedMotion();
  return <motion.div key={viewKey} className="view-stage" initial={reduced ? false : { opacity: 0, x: 14, filter: 'blur(4px)' }} animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }} exit={reduced ? undefined : { opacity: 0, x: -10 }} transition={{ duration: reduced ? 0 : 0.32, ease: expo }}>{children}</motion.div>;
}
