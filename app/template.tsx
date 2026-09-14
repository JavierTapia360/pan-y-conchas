'use client';

import { motion, useReducedMotion } from 'motion/react';
import { pageTransition } from '@/motion/variants';

export default function Template({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  return <motion.div {...(reduced ? { initial: { opacity: 0 }, animate: { opacity: 1 } } : pageTransition)}>{children}</motion.div>;
}
