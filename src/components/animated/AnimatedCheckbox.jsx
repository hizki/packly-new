import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const AnimatedCheckbox = ({ checked, onChange, className, disabled = false }) => {
  const [isChecked, setIsChecked] = useState(checked);
  const [isPressed, setIsPressed] = useState(false);
  
  // Update internal state when prop changes
  useEffect(() => {
    setIsChecked(checked);
  }, [checked]);
  
  const handleToggle = () => {
    if (disabled) return;
    
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

  // Improved mobile touch handling
  const handleTouchStart = (e) => {
    if (disabled) return;
    e.preventDefault(); // Prevent double-firing with onClick
    setIsPressed(true);
  };

  const handleTouchEnd = (e) => {
    if (disabled) return;
    e.preventDefault();
    setIsPressed(false);
    handleToggle();
  };

  const handleMouseDown = () => {
    if (disabled) return;
    setIsPressed(true);
  };

  const handleMouseUp = () => {
    if (disabled) return;
    setIsPressed(false);
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
      className={cn(
        "relative w-5 h-5 border-2 rounded-md flex items-center justify-center select-none",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        isChecked ? "border-blue-500 bg-blue-500" : "border-gray-300 bg-white",
        className
      )}
      onClick={handleToggle}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      whileTap={disabled ? {} : { scale: 0.9 }}
      animate={{ 
        backgroundColor: isChecked ? "#3b82f6" : "#ffffff",
        borderColor: isChecked ? "#3b82f6" : "#d1d5db",
        scale: isPressed && !disabled ? 0.95 : 1,
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