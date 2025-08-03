import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { List, ListType } from '@/api/entities';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import {
  ArrowLeft,
  Trash2,
  Plus,
  Tag,
  Loader2,
} from 'lucide-react';
import { EmojiPicker } from '@/components/ui/emoji-picker';
import { generateEmojiForItem } from '@/utils/emojiGenerator';
import { createPageUrl } from '@/utils';
import { withRetry } from '../components/utils/api-helpers';

export default function ListEditorPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const listType = searchParams.get('type');
  const listName = searchParams.get('list'); // Changed from 'category' to 'list'

  const [loading, setLoading] = useState(true);
  const [list, setList] = useState(null);
  const [items, setItems] = useState([]);
  const [editingName, setEditingName] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [listDisplayName, setListDisplayName] = useState('');
  const [selectedListType, setSelectedListType] = useState(null);

  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('essentials');
  const nameInputRef = useRef(null);

  const itemCategories = [
    { value: 'clothing', label: 'Clothing' },
    { value: 'toiletries', label: 'Toiletries' },
    { value: 'tech', label: 'Tech' },
    { value: 'gear', label: 'Gear' },
    { value: 'essentials', label: 'Essentials' },
  ];

  // Get default icon for the list type
  const getDefaultIcon = () => {
    return selectedListType?.icon || '📋';
  };

  useEffect(() => {
    if (listType && listName) {
      loadList();
    } else {
      navigate(createPageUrl('ListManager'));
    }
  }, [listType, listName]);

  useEffect(() => {
    if (editingName && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [editingName]);

  // Escape key navigation
  useEffect(() => {
    const handleEscapeKey = event => {
      if (event.key === 'Escape') {
        navigate(createPageUrl('ListManager'));
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [navigate]);

  const loadList = async () => {
    setLoading(true);
    try {
      // Load list types from database
      const types = await ListType.getByTypeGroup(listType);
      
      const foundListType = types.find(t => t.list_name === listName);
      setSelectedListType(foundListType);

      const user = await withRetry(() => User.me());
      const lists = await withRetry(() =>
        List.filter({
          owner_id: user.id,
          list_type: listType,
        }),
      );

      const existingList = lists.find(l => l.list_name === listName);

      if (existingList) {
        setList(existingList);
        setItems(existingList.items || []);
        setListDisplayName(existingList.name || foundListType?.display_name);
        setSelectedIcon(existingList.icon || foundListType?.icon);
      } else {
        const newList = {
          list_type: listType,
          list_name: listName,
          items: [],
          owner_id: user.id,
          name: foundListType?.display_name,
        };
        setList(newList);
        setItems([]);
        setListDisplayName(foundListType?.display_name || '');
        setSelectedIcon(foundListType?.icon || '📋');
      }
    } catch (error) {
      console.error('Error loading list:', error);
      toast({
        title: 'Error',
        description: 'Failed to load list. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const autoSave = async updatedItems => {
    try {
      if (list?.id) {
        await List.update(list.id, {
          items: updatedItems,
        });
      } else {
        const newList = await List.create({
          list_type: listType,
          list_name: listName,
          name: listDisplayName,
          items: updatedItems,
          owner_id: list.owner_id,
          is_default: false,
        });
        setList(newList);
      }
    } catch (error) {
      console.error('Error auto-saving list:', error);
      toast({
        title: 'Auto-save failed',
        description: 'Your changes may not be saved. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleAddItem = async () => {
    if (!newItemName.trim()) return;

    const emoji = await generateEmojiForItem(newItemName, newItemCategory);
    const newItem = {
      name: newItemName,
      category: newItemCategory,
      quantity: 1,
      weather_dependent: false,
      weather_type: 'any',
      emoji,
    };

    const updatedItems = [...items, newItem];
    setItems(updatedItems);
    setNewItemName('');
    await autoSave(updatedItems);
  };

  const handleRemoveItem = async index => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
    await autoSave(updatedItems);
  };

  const handleUpdateItemEmoji = async (index, newEmoji) => {
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      emoji: newEmoji,
    };
    setItems(updatedItems);
    await autoSave(updatedItems);
  };

  const handleDeleteList = async () => {
    try {
      if (list?.id) {
        await List.delete(list.id);
        toast({
          title: 'List deleted',
          description: 'Your list has been deleted successfully',
        });
        navigate(createPageUrl('ListManager'));
      }
    } catch (error) {
      console.error('Error deleting list:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete list',
        variant: 'destructive',
      });
    }
  };

  const handleNameChange = async newName => {
    try {
      if (!newName.trim()) return;

      if (list?.id) {
        // Update the list in the database with retry
        await withRetry(() => List.update(list.id, { name: newName }));

        // Update states
        setList(prev => ({
          ...prev,
          name: newName,
        }));
        setListDisplayName(newName);

        toast({
          title: 'Success',
          description: 'List name updated',
        });
      } else {
        setListDisplayName(newName);
      }
    } catch (error) {
      console.error('Error updating list name:', error);
      toast({
        title: 'Error',
        description: 'Failed to update list name. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleNameBlur = () => {
    if (nameInputRef.current && nameInputRef.current.value.trim()) {
      handleNameChange(nameInputRef.current.value);
    }
    setEditingName(false);
  };

  const handleNameKeyDown = e => {
    if (e.key === 'Enter') {
      if (nameInputRef.current && nameInputRef.current.value.trim()) {
        handleNameChange(nameInputRef.current.value);
      }
      setEditingName(false);
    }
  };

  const handleItemNameKeyDown = e => {
    if (e.key === 'Enter') {
      handleAddItem();
    }
  };

  const handleEmojiSelect = async emoji => {
    setSelectedIcon(emoji);

    // Update the icon in the database if the list exists
    if (list?.id) {
      try {
        await List.update(list.id, {
          icon: emoji,
        });

        toast({
          title: 'Success',
          description: 'List icon updated',
        });
      } catch (error) {
        console.error('Error updating list icon:', error);
        toast({
          title: 'Error',
          description: 'Failed to update list icon',
          variant: 'destructive',
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p>Loading list details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(createPageUrl('ListManager'))}
                className="mr-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <EmojiPicker
                    value={selectedIcon || getDefaultIcon()}
                    onChange={handleEmojiSelect}
                    className="text-2xl"
                  />

                  {editingName ? (
                    <Input
                      ref={nameInputRef}
                      defaultValue={listDisplayName}
                      onBlur={handleNameBlur}
                      onKeyDown={handleNameKeyDown}
                      className="text-xl font-bold h-8 py-0"
                      autoFocus
                    />
                  ) : (
                    <h1
                      className="text-xl font-bold cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                      onClick={() => setEditingName(true)}
                    >
                      {listDisplayName}
                    </h1>
                  )}
                </div>
                <p className="text-gray-500">Edit packing list items</p>
              </div>
            </div>

            {/* Delete Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeleteDialogOpen(true)}
              className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Add new item */}
        <Card>
          <CardHeader>
            <CardTitle>Add New Item</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="Item name"
                value={newItemName}
                onChange={e => setNewItemName(e.target.value)}
                onKeyDown={handleItemNameKeyDown}
                className="flex-1"
              />
              <Select
                value={newItemCategory}
                onValueChange={setNewItemCategory}
              >
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {itemCategories.map(cat => (
                    <SelectItem
                      key={cat.value}
                      value={cat.value}
                    >
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleAddItem}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </CardContent>
        </Card>

        {/* Items list */}
        <Card>
          <CardHeader>
            <CardTitle>List Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-white rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <EmojiPicker
                      value={item.emoji || '📦'}
                      onChange={(emoji) => handleUpdateItemEmoji(index, emoji)}
                      className="flex-shrink-0"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Tag className="w-3 h-3 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        {itemCategories.find(cat => cat.value === item.category)?.label}
                      </span>
                      <span className="text-sm text-gray-500">× {item.quantity}</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveItem(index)}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            ))}

            {items.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No items added yet. Add some items to your list.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete List</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this list? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDeleteList}
            >
              Delete List
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
