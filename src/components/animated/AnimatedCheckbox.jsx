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
  const handleTouchStart = () => {
    if (disabled) return;
    // Don't prevent default - let natural scrolling work
    setIsPressed(true);
  };

  const handleTouchEnd = e => {
    if (disabled) return;
    // Only prevent default and handle toggle if this was a tap, not a scroll
    // Check if the touch moved significantly (indicating a scroll gesture)
    const touch = e.changedTouches[0];
    const startTouch = e.target._startTouch;
    
    if (startTouch) {
      const deltaX = Math.abs(touch.clientX - startTouch.clientX);
      const deltaY = Math.abs(touch.clientY - startTouch.clientY);
      const threshold = 10; // 10px threshold for scroll vs tap
      
      if (deltaX < threshold && deltaY < threshold) {
        // This was a tap, not a scroll
        e.preventDefault();
        handleToggle();
      }
    }
    
    setIsPressed(false);
    delete e.target._startTouch;
  };

  // Store touch start position for comparison
  const handleTouchStartWithPosition = e => {
    if (disabled) return;
    const touch = e.touches[0];
    e.target._startTouch = {
      clientX: touch.clientX,
      clientY: touch.clientY,
    };
    handleTouchStart();
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
        pathLength: { type: 'spring', duration: 0.3, bounce: 0 },
        opacity: { duration: 0.15 },
      },
    },
    unchecked: {
      pathLength: 0,
      opacity: 0,
      transition: {
        pathLength: { duration: 0.2 },
        opacity: { duration: 0.15 },
      },
    },
  };

  return (
    <motion.div
      className={cn(
        'relative w-5 h-5 border-2 rounded-md flex items-center justify-center select-none',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
    isChecked ? 'border-primary bg-primary' : 'border-input bg-background',
        className,
      )}
      onClick={handleToggle}
      onTouchStart={handleTouchStartWithPosition}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      whileTap={disabled ? {} : { scale: 0.9 }}
      animate={{
        backgroundColor: isChecked ? '#3b82f6' : '#ffffff',
        borderColor: isChecked ? '#3b82f6' : '#d1d5db',
        scale: isPressed && !disabled ? 0.95 : 1,
        transition: { duration: 0.15 },
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
