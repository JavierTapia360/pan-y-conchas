export const ease = [0.22, 1, 0.36, 1] as const;
export const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease } } };
export const staggerContainer = { hidden: {}, visible: { transition: { staggerChildren: 0.09 } } };
export const imageReveal = { hidden: { opacity: 0, clipPath: 'inset(0 100% 0 0)' }, visible: { opacity: 1, clipPath: 'inset(0)', transition: { duration: 0.85, ease } } };
export const pageTransition = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease } } };
