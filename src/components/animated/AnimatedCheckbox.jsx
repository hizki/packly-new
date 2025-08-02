import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const AnimatedCheckbox = ({ checked, onChange, id, className }) => {
  const [isChecked, setIsChecked] = useState(checked);
  
  // Update internal state when prop changes
  useEffect(() => {
    setIsChecked(checked);
  }, [checked]);
  
  const handleToggle = () => {
    const newState = !isChecked;
    setIsChecked(newState);
    
    // Trigger haptic feedback on mobile devices
    if ('vibrate' in navigator) {
      navigator.vibrate(10); // subtle 10ms vibration
    }
    
    // Call parent onChange handler
    if (onChange) {
      onChange(newState);
    }
  };

  // Unified pointer events for accessibility and performance
  const handlePointerDown = (e) => {
    if (disabled) return;
    e.preventDefault();
    setIsPressed(true);
  };

  const handlePointerUp = (e) => {
    if (disabled) return;
    e.preventDefault();
    setIsPressed(false);
    handleToggle();
  };

  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      setIsPressed(true);
    }
  };

  const handleKeyUp = (e) => {
    if (disabled) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      setIsPressed(false);
      handleToggle();
    }
  };

  // Draw animation for checkmark
  const checkVariants = {
    initial: { pathLength: 0, opacity: 0 },
    checked: { 
      pathLength: 1, 
      opacity: 1,
      transition: { 
        pathLength: { type: "spring", duration: 0.3, bounce: 0 },
        opacity: { duration: 0.15 }
      }
    },
    unchecked: { 
      pathLength: 0, 
      opacity: 0,
      transition: { 
        pathLength: { duration: 0.2 },
        opacity: { duration: 0.15 }
      }
    }
  };

  return (
    <motion.div
      role="checkbox"
      aria-checked={isChecked}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      className={cn(
        "relative w-5 h-5 border-2 rounded-md flex items-center justify-center select-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        isChecked ? "border-blue-500 bg-blue-500" : "border-gray-300 bg-white",
        className
      )}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      whileTap={disabled ? {} : { scale: 0.9 }}
      animate={{ 
        backgroundColor: isChecked ? "#3b82f6" : "#ffffff",
        borderColor: isChecked ? "#3b82f6" : "#d1d5db",
        transition: { duration: 0.15 }
      }}
    >
      <AnimatePresence>
        {isChecked && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial="initial"
            animate="checked"
            exit="unchecked"
          >
            <motion.svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <motion.path
                variants={checkVariants}
                d="M2 6L4.5 8.5L10 3"
              />
            </motion.svg>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AnimatedCheckbox;