import { motion } from 'motion/react';
import { cn } from './utils';

interface PageLoaderProps {
  className?: string;
  message?: string;
}

export function PageLoader({ className, message }: PageLoaderProps) {
  return (
    <div className={cn(
      "fixed inset-0 bg-white z-50 flex flex-col items-center justify-center",
      className
    )}>
      {/* Animated Logo Container */}
      <div className="relative w-24 h-24">
        {/* Pulsing background rings */}
        <motion.div
          className="absolute inset-0 rounded-full bg-primary/10"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 0.2, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute inset-2 rounded-full bg-primary/5"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.1, 0.3],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.2,
          }}
        />

        {/* Access Bank Logo SVG - Animated */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <svg
            viewBox="0 0 100 100"
            className="w-16 h-16"
            fill="none"
          >
            {/* Outer diamond - draws in */}
            <motion.path
              d="M50 5 L95 50 L50 95 L5 50 Z"
              stroke="#F37021"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                repeatType: "loop",
                ease: "easeInOut",
              }}
            />

            {/* Middle diamond */}
            <motion.path
              d="M50 20 L80 50 L50 80 L20 50 Z"
              stroke="#F37021"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                repeatType: "loop",
                ease: "easeInOut",
                delay: 0.2,
              }}
            />

            {/* Inner diamond */}
            <motion.path
              d="M50 35 L65 50 L50 65 L35 50 Z"
              stroke="#F37021"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                repeatType: "loop",
                ease: "easeInOut",
                delay: 0.4,
              }}
            />

            {/* Flame/spark on top */}
            <motion.path
              d="M50 5 L50 -5 M55 0 L50 5 L45 0"
              stroke="#F37021"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: [0, 1, 0], y: [5, 0, -5] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
          </svg>
        </motion.div>
      </div>

      {/* Loading text */}
      <motion.p
        className="mt-6 text-gray-600 text-sm font-medium"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {message || "Loading..."}
      </motion.p>

      {/* Loading dots */}
      <div className="flex space-x-1 mt-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-primary rounded-full"
            animate={{
              y: [0, -8, 0],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// Smaller inline loader for buttons or sections
export function InlineLoader({ className }: { className?: string }) {
  return (
    <motion.div
      className={cn("flex items-center justify-center", className)}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-6 h-6"
        fill="none"
      >
        <motion.path
          d="M50 15 L85 50 L50 85 L15 50 Z"
          stroke="#F37021"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={{ pathLength: 0.3 }}
          animate={{ pathLength: [0.3, 1, 0.3] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </svg>
    </motion.div>
  );
}
