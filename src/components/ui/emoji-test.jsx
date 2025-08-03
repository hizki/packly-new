import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { generateEmojiForItem } from '@/utils/emojiGenerator';
import { openaiEmojiService } from '@/services/openaiEmojiService';

export const EmojiTest = () => {
  const [itemName, setItemName] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testGeneration = async (customCategory = null) => {
    if (!itemName.trim()) return;
    
    setLoading(true);
    setResult('');
    
    try {
      // Try to auto-detect category
      const category = customCategory || detectCategory(itemName) || 'essentials';
      const emoji = await generateEmojiForItem(itemName, category, []);
      setResult(`Generated: ${emoji} for "${itemName}" (category: ${category})`);
    } catch (error) {
      setResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const detectCategory = (name) => {
    const lower = name.toLowerCase();
    if (['hat', 'shirt', 'pants', 'shoes', 'jacket', 'dress', 'socks', 'outfit', 'suit', 'blouse', 'skirt', 'tie'].some(w => lower.includes(w))) return 'clothing';
    if (['toothbrush', 'shampoo', 'soap', 'deodorant', 'sunscreen'].some(w => lower.includes(w))) return 'toiletries';
    if (['phone', 'charger', 'laptop', 'camera', 'headphones'].some(w => lower.includes(w))) return 'tech';
    if (['tent', 'sleeping bag', 'backpack', 'flashlight'].some(w => lower.includes(w))) return 'gear';
    return 'essentials';
  };

    const testCommonItems = async () => {
    setLoading(true);
    const testItems = [
      'hat', 'party outfit', 'sunscreen', 'toothbrush', 'passport', 'shoes', 
      'jacket', 'camera', 'phone charger', 'sunglasses', 'swimsuit',
    ];
    
    const results = [];
    for (const item of testItems) {
      const category = detectCategory(item);
      const emoji = await generateEmojiForItem(item, category, []);
      results.push(`${emoji} ${item} (${category})`);
    }
    
    setResult(`Batch test results:\n${results.join('\n')}`);
    setLoading(false);
  };

  const checkApiStatus = () => {
    const isAvailable = openaiEmojiService.isAvailable();
    setResult(`OpenAI API Available: ${isAvailable ? '✅ Yes' : '❌ No'}`);
  };

  return (
    <div className="p-4 border rounded-lg space-y-4">
      <h3 className="font-semibold">Emoji Generation Test</h3>
      
      <div className="flex gap-2">
        <Input
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          placeholder="Enter item name..."
          onKeyDown={(e) => e.key === 'Enter' && testGeneration()}
        />
        <Button onClick={testGeneration} disabled={loading}>
          {loading ? 'Generating...' : 'Test'}
        </Button>
        <Button variant="outline" onClick={checkApiStatus}>
          Check API
        </Button>
        <Button variant="secondary" onClick={testCommonItems} disabled={loading}>
          Batch Test
        </Button>
      </div>
      
      {result && (
        <div className="p-2 bg-gray-100 rounded text-sm whitespace-pre-line">
          {result}
        </div>
      )}
      
      <div className="text-xs text-gray-500">
        Using OpenAI o4-mini model • Open browser console to see detailed logs
      </div>
    </div>
  );
}; 
