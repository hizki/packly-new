import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generateEmojiForItem } from '@/utils/emojiGenerator';
import { openaiEmojiService } from '@/services/openaiEmojiService';

export const EmojiGenerationDemo = () => {
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('essentials');
  const [activities, setActivities] = useState('');
  const [generatedEmoji, setGeneratedEmoji] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState('');

  const handleGenerateEmoji = async () => {
    if (!itemName.trim()) return;
    
    setIsLoading(true);
    setApiStatus('');
    
    try {
      const activitiesArray = activities.split(',').map(a => a.trim()).filter(Boolean);
      const emoji = await generateEmojiForItem(itemName, category, activitiesArray);
      setGeneratedEmoji(emoji);
      
      if (openaiEmojiService.isAvailable()) {
        setApiStatus('✅ OpenAI API used');
      } else {
        setApiStatus('⚠️ Fallback logic used (no API key)');
      }
    } catch (error) {
      console.error('Emoji generation failed:', error);
      setApiStatus('❌ Generation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const testItems = [
    { name: 'sunscreen', category: 'toiletries', activities: 'beach' },
    { name: 'hiking boots', category: 'clothing', activities: 'hiking' },
    { name: 'phone charger', category: 'tech', activities: '' },
    { name: 'tent', category: 'gear', activities: 'camping' },
    { name: 'passport', category: 'essentials', activities: 'travel' },
  ];

  const runBatchTest = async () => {
    setIsLoading(true);
    const results = [];
    
    for (const item of testItems) {
      const activitiesArray = item.activities ? [item.activities] : [];
      const emoji = await generateEmojiForItem(item.name, item.category, activitiesArray);
      results.push({ ...item, emoji });
    }
    
    console.log('Batch test results:', results);
    setIsLoading(false);
    alert('Batch test completed! Check console for results.');
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>🤖 OpenAI Emoji Generation Demo</CardTitle>
        <p className="text-sm text-gray-600">
          Test the AI-powered emoji generation for packing items
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Item Name</label>
            <Input
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="e.g., sunscreen, hiking boots"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="clothing">Clothing</option>
              <option value="toiletries">Toiletries</option>
              <option value="tech">Tech</option>
              <option value="gear">Gear</option>
              <option value="essentials">Essentials</option>
              <option value="additional">Additional</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Activities (comma-separated)
          </label>
          <Input
            value={activities}
            onChange={(e) => setActivities(e.target.value)}
            placeholder="e.g., beach, hiking, camping"
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleGenerateEmoji}
            disabled={isLoading || !itemName.trim()}
            className="flex-1"
          >
            {isLoading ? 'Generating...' : 'Generate Emoji'}
          </Button>
          
          <Button
            onClick={runBatchTest}
            disabled={isLoading}
            variant="outline"
          >
            Batch Test
          </Button>
        </div>

        {generatedEmoji && (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <div className="text-6xl mb-2">{generatedEmoji}</div>
            <p className="text-lg font-medium">{itemName}</p>
            <p className="text-sm text-gray-600">{apiStatus}</p>
          </div>
        )}

        <div className="space-y-2">
          <h4 className="font-medium">API Status:</h4>
          <div className="text-sm space-y-1">
            <p>
              OpenAI Service: {openaiEmojiService.isAvailable() ? '✅ Available' : '❌ Not configured'}
            </p>
            {openaiEmojiService.isAvailable() && (
              <p>
                Cache: {openaiEmojiService.getCacheStats().size} items cached
              </p>
            )}
          </div>
        </div>

        <div className="bg-secondary p-4 rounded-lg">
          <h4 className="font-medium text-foreground mb-2">How it works:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Sends item name + context to OpenAI GPT-3.5-turbo</li>
            <li>• Uses intelligent prompt for physical object preference</li>
            <li>• Falls back to mock logic if API fails</li>
            <li>• Caches results to avoid duplicate API calls</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}; 