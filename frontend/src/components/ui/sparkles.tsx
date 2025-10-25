import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

interface SparklesProps {
  className?: string;
  size?: number;
  minSize?: number;
  density?: number;
  speed?: number;
  opacity?: number;
  direction?: "top" | "bottom" | "left" | "right";
  children?: React.ReactNode;
}

export const Sparkles: React.FC<SparklesProps> = ({
  className,
  size = 2,
  minSize = 1,
  density = 50,
  speed = 1.5,
  opacity = 0.6,
  children,
}) => {
  const [sparkles, setSparkles] = useState<
    Array<{ id: number; x: number; y: number; size: number }>
  >([]);

  useEffect(() => {
    const generateSparkles = () => {
      const newSparkles = Array.from({ length: density }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * (size - minSize) + minSize,
      }));
      setSparkles(newSparkles);
    };

    generateSparkles();
    const interval = setInterval(generateSparkles, speed * 3000);

    return () => clearInterval(interval);
  }, [density, size, minSize, speed]);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {sparkles.map((sparkle) => (
        <motion.div
          key={sparkle.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            width: sparkle.size,
            height: sparkle.size,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, opacity, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: speed,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
      {children}
    </div>
  );
};
