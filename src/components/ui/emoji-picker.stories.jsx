import { useState } from 'react';
import { EmojiPicker } from './emoji-picker';
import { useEmojiPicker, useEmojiPreferences } from '../../hooks/useEmojiPicker';

export default {
  title: 'UI/EmojiPicker',
  component: EmojiPicker,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

// Basic usage
export const Default = () => {
  const [emoji, setEmoji] = useState('😀');
  
  return (
    <div className="p-4">
      <h3 className="text-lg font-medium mb-4">Basic Emoji Picker</h3>
      <div className="flex items-center gap-2">
        <EmojiPicker value={emoji} onChange={setEmoji} />
        <span>Current emoji: {emoji}</span>
      </div>
    </div>
  );
};

// With custom hook
export const WithHook = () => {
  const { selectedEmoji, handleEmojiSelect } = useEmojiPicker('🎯');
  
  return (
    <div className="p-4">
      <h3 className="text-lg font-medium mb-4">Using useEmojiPicker Hook</h3>
      <div className="flex items-center gap-2">
        <EmojiPicker value={selectedEmoji} onChange={handleEmojiSelect} />
        <span>Selected: {selectedEmoji || 'None'}</span>
      </div>
    </div>
  );
};

// Disabled state
export const Disabled = () => {
  return (
    <div className="p-4">
      <h3 className="text-lg font-medium mb-4">Disabled State</h3>
      <div className="flex items-center gap-2">
        <EmojiPicker value="🔒" onChange={() => {}} disabled={true} />
        <span>This picker is disabled</span>
      </div>
    </div>
  );
};

// Multiple pickers with preferences
export const WithPreferences = () => {
  const { addToFrequent, getFrequentEmojis } = useEmojiPreferences();
  const [item1Emoji, setItem1Emoji] = useState('📱');
  const [item2Emoji, setItem2Emoji] = useState('👕');
  const [item3Emoji, setItem3Emoji] = useState('🧴');

  const handleEmojiChange = (setter) => (emoji) => {
    setter(emoji);
    addToFrequent(emoji);
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-medium mb-4">Multiple Items with Preferences</h3>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <EmojiPicker 
            value={item1Emoji} 
            onChange={handleEmojiChange(setItem1Emoji)} 
          />
          <span>Phone Charger</span>
        </div>
        <div className="flex items-center gap-2">
          <EmojiPicker 
            value={item2Emoji} 
            onChange={handleEmojiChange(setItem2Emoji)} 
          />
          <span>T-Shirt</span>
        </div>
        <div className="flex items-center gap-2">
          <EmojiPicker 
            value={item3Emoji} 
            onChange={handleEmojiChange(setItem3Emoji)} 
          />
          <span>Shampoo</span>
        </div>
      </div>
      
      <div className="mt-4 p-2 bg-gray-50 rounded">
        <p className="text-sm text-gray-600">
          Frequent emojis: {getFrequentEmojis().join(' ')}
        </p>
      </div>
    </div>
  );
};

// List item simulation
export const ListItemDemo = () => {
  const [items, setItems] = useState([
    { id: 1, name: 'Sunscreen', emoji: '☀️', category: 'essentials' },
    { id: 2, name: 'T-Shirt', emoji: '👕', category: 'clothing' },
    { id: 3, name: 'Phone Charger', emoji: '📱', category: 'tech' },
    { id: 4, name: 'Toothbrush', emoji: '🪥', category: 'toiletries' },
  ]);

  const updateItemEmoji = (id, emoji) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, emoji } : item
    ));
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-medium mb-4">Packing List Items</h3>
      <div className="space-y-2">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border">
            <EmojiPicker 
              value={item.emoji} 
              onChange={(emoji) => updateItemEmoji(item.id, emoji)}
            />
            <div className="flex-1">
              <span className="font-medium">{item.name}</span>
              <div className="text-sm text-gray-500 capitalize">{item.category}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 