import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { X } from 'lucide-react';
import { EmojiPicker } from '@/components/ui/emoji-picker';

export default function CustomListForm({ listType, onCancel, onSave }) {
  const [name, setName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('');
  const formRef = useRef(null);

  // Get default emoji for list type
  const getDefaultEmoji = () => {
    const defaults = {
      activity: '🏃‍♂️',
      accommodation: '🏨',
      companion: '👥',
    };
    return defaults[listType] || '📋';
  };

  const handleSubmit = e => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a name for your list',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedEmoji) {
      toast({
        title: 'Error',
        description: 'Please select an emoji for your list',
        variant: 'destructive',
      });
      return;
    }

    // Generate list_name from the name
    const listName = name
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');

    onSave({
      name,
      icon: selectedEmoji,
      list_name: listName,
      list_type: listType,
    });
  };

  return (
    <div
      className="p-4 bg-white rounded-lg shadow-lg animate-in fade-in zoom-in"
      ref={formRef}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">
          New{' '}
          {listType === 'activity'
            ? 'Activity'
            : listType === 'accommodation'
              ? 'Accommodation'
              : 'Travel Companion'}{' '}
          List
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <Input
            placeholder="Enter a name for your list"
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
          <div className="flex items-center gap-2">
            <EmojiPicker
              value={selectedEmoji || getDefaultEmoji()}
              onChange={setSelectedEmoji}
              className="text-2xl"
            />
            <span className="text-sm text-gray-500">Click to select an emoji for your list</span>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button type="submit">Create</Button>
        </div>
      </form>
    </div>
  );
}
