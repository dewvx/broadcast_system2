import { motion, useReducedMotion } from 'framer-motion';

const EASE_ENTER = [0.16, 1, 0.3, 1];

export const staggerContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.04 },
  },
};

export const fadeUpItem = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: EASE_ENTER },
  },
};

export function FadeStagger({ children, className = '', as = 'div', ...props }) {
  const reduced = useReducedMotion();
  const Component = motion[as] || motion.div;

  return (
    <Component
      className={className}
      variants={
        reduced
          ? { hidden: {}, show: {} }
          : staggerContainer
      }
      initial="hidden"
      animate="show"
      {...props}
    >
      {children}
    </Component>
  );
}

export function FadeItem({ children, className = '', as = 'div', ...props }) {
  const reduced = useReducedMotion();
  const Component = motion[as] || motion.div;

  return (
    <Component
      className={className}
      variants={reduced ? {} : fadeUpItem}
      {...props}
    >
      {children}
    </Component>
  );
}

export function PageTransition({ children, className = '' }) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
      animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: EASE_ENTER }}
    >
      {children}
    </motion.div>
  );
}

export default { FadeStagger, FadeItem, PageTransition };
