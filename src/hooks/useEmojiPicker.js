import { useState, useCallback } from 'react';

/**
 * Custom hook for managing emoji picker interactions
 * Provides consistent state management and behavior across the app
 */
export const useEmojiPicker = (initialEmoji = null, onEmojiChange = null) => {
  const [selectedEmoji, setSelectedEmoji] = useState(initialEmoji);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const handleEmojiSelect = useCallback((emoji) => {
    setSelectedEmoji(emoji);
    onEmojiChange?.(emoji);
    setIsPickerOpen(false);
  }, [onEmojiChange]);

  const openPicker = useCallback(() => {
    setIsPickerOpen(true);
  }, []);

  const closePicker = useCallback(() => {
    setIsPickerOpen(false);
  }, []);

  const resetEmoji = useCallback(() => {
    setSelectedEmoji(null);
    onEmojiChange?.(null);
  }, [onEmojiChange]);

  return {
    selectedEmoji,
    isPickerOpen,
    handleEmojiSelect,
    openPicker,
    closePicker,
    resetEmoji,
    setSelectedEmoji,
  };
};

/**
 * Hook for managing emoji preferences and frequently used emojis
 */
export const useEmojiPreferences = () => {
  const [frequentEmojis, setFrequentEmojis] = useState(() => {
    try {
      const stored = localStorage.getItem('packly-frequent-emojis');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const addToFrequent = useCallback((emoji) => {
    setFrequentEmojis(prev => {
      const existing = prev.find(item => item.emoji === emoji);
      let updated;
      
      if (existing) {
        // Increment count for existing emoji
        updated = prev.map(item => 
          item.emoji === emoji 
                         ? { ...item, count: item.count + 1, lastUsed: Date.now() }
             : item,
         );
      } else {
        // Add new emoji
        updated = [...prev, { emoji, count: 1, lastUsed: Date.now() }];
      }

      // Keep only top 20 most used emojis
      updated = updated
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);

      try {
        localStorage.setItem('packly-frequent-emojis', JSON.stringify(updated));
      } catch {
        // Silent fail if localStorage is not available
      }

      return updated;
    });
  }, []);

  const getFrequentEmojis = useCallback(() => {
    return frequentEmojis
      .sort((a, b) => b.count - a.count)
      .map(item => item.emoji);
  }, [frequentEmojis]);

  return {
    addToFrequent,
    getFrequentEmojis,
    frequentEmojis,
  };
}; 