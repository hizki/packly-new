import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import styles from './emoji-picker.module.css';

export const EmojiPicker = ({ value, onChange, className, disabled = false }) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);

  const handleEmojiSelect = (emoji) => {
    onChange(emoji.native);
    setOpen(false);
  };

  const handleKeyDown = (e) => {
    if (disabled) return;
    
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen(true);
    } else if (e.key === 'Escape' && open) {
      e.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    }
  };

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && open) {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          variant="ghost"
          size="sm"
          disabled={disabled}
          className={`h-8 w-8 p-0 hover:bg-gray-100 rounded transition-colors ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          } ${className}`}
          onKeyDown={handleKeyDown}
          aria-label={`${value ? `Current emoji: ${value}. ` : ''}Click to select emoji`}
          aria-expanded={open}
          aria-haspopup="dialog"
        >
          <span className="text-lg" aria-hidden="true">
            {value || '📦'}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-0 border-0 shadow-lg" 
        align="start"
        role="dialog"
        aria-label="Emoji picker"
      >
        <div className={`rounded-lg overflow-hidden border border-gray-200 ${styles.emojiPicker}`}>
          <Picker
            data={data}
            onEmojiSelect={handleEmojiSelect}
            theme="light"
            set="native"
            showPreview={false}
            showSkinTones={false}
            emojiSize={20}
            emojiButtonSize={28}
            maxFrequentRows={2}
            perLine={8}
            categories={[
              'frequent',
              'people',
              'nature',
              'foods',
              'activity',
              'places',
              'objects',
              'symbols',
            ]}
            icons="solid"
            searchPosition="sticky"
            autoFocus={true}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}; 