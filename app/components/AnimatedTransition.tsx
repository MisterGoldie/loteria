"use client";

import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type AnimatedTransitionProps = {
  children: ReactNode;
  isVisible: boolean;
  duration?: number;
  delay?: number;
  className?: string;
};

/**
 * A component that provides smooth enter/exit animations
 * Uses Framer Motion for reliable animations with proper cleanup
 */
export function AnimatedTransition({
  children,
  isVisible,
  duration = 0.3,
  delay = 0,
  className = '',
}: AnimatedTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          className={className}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{
            duration,
            delay,
            ease: "easeInOut",
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * A component that provides a staggered animation for background and content
 * Similar to the notification system mentioned in requirements
 */
export function StaggeredTransition({
  children,
  isVisible,
  backgroundDuration = 0.7,
  contentDuration = 0.7,
  contentDelay = 0.2,
  className = '',
}: AnimatedTransitionProps & {
  backgroundDuration?: number;
  contentDuration?: number;
  contentDelay?: number;
}) {
  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          className={`relative ${className}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: backgroundDuration,
          }}
        >
          <motion.div
            initial={{ opacity: 0, transform: 'translateY(10px)' }}
            animate={{ opacity: 1, transform: 'translateY(0px)' }}
            exit={{ opacity: 0, transform: 'translateY(-10px)' }}
            transition={{
              duration: contentDuration,
              delay: contentDelay,
              ease: "easeInOut",
            }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
