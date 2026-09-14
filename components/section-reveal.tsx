'use client';

import { motion, useReducedMotion } from 'motion/react';
import { fadeUp } from '@/motion/variants';

export function SectionReveal({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={reduced ? undefined : fadeUp}
      initial={reduced ? undefined : 'hidden'}
      whileInView={reduced ? undefined : 'visible'}
      viewport={{ once: true, amount: 0.14 }}
    >
      {children}
    </motion.div>
  );
}
