import React, { useState, useEffect } from 'react';
import { TipList } from '@/api/entities';
import { User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical, Plus, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const DEFAULT_DAY_BEFORE_TIPS = [
  "Check flight/travel times",
  "Charge all electronic devices",
  "Download offline maps and entertainment",
  "Set out-of-office email response",
  "Check weather forecast",
  "Empty fridge of perishables",
  "Do laundry if needed",
  "Prepare documents and tickets"
];

const DEFAULT_BEFORE_LEAVING_TIPS = [
  "Check all windows are closed",
  "Unplug non-essential appliances",
  "Adjust thermostat",
  "Lock all doors",
  "Take out trash",
  "Check you have your passport/ID",
  "Check you have your wallet/money",
  "Turn off water main if needed"
];

export default function TipListManager() {
  const [dayBeforeTips, setDayBeforeTips] = useState([]);
  const [beforeLeavingTips, setBeforeLeavingTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTip, setNewTip] = useState({ dayBefore: '', beforeLeaving: '' });

  useEffect(() => {
    loadTipLists();
  }, []);

  const loadTipLists = async () => {
    try {
      const currentUser = await User.me();
      const lists = await TipList.filter({ owner_id: currentUser.id });
      
      const dayBefore = lists.find(list => list.list_type === 'day_before');
      const beforeLeaving = lists.find(list => list.list_type === 'before_leaving');

      if (!dayBefore) {
        await initializeDefaultList('day_before', DEFAULT_DAY_BEFORE_TIPS);
      }
      if (!beforeLeaving) {
        await initializeDefaultList('before_leaving', DEFAULT_BEFORE_LEAVING_TIPS);
      }

      const updatedLists = await TipList.filter({ owner_id: currentUser.id });
      setDayBeforeTips(updatedLists.find(list => list.list_type === 'day_before')?.tips || []);
      setBeforeLeavingTips(updatedLists.find(list => list.list_type === 'before_leaving')?.tips || []);
    } catch (error) {
      console.error('Error loading tip lists:', error);
      toast({
        title: "Error",
        description: "Failed to load tip lists",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaultList = async (listType, defaultTips) => {
    const currentUser = await User.me();
    await TipList.create({
      list_type: listType,
      owner_id: currentUser.id,
      tips: defaultTips.map((content, index) => ({
        id: `${listType}_${index}`,
        content,
        is_default: true,
        order: index
      }))
    });
  };

  const handleDragEnd = async (result, listType) => {
    if (!result.destination) return;

    const items = listType === 'day_before' ? [...dayBeforeTips] : [...beforeLeavingTips];
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order numbers
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index
    }));

    if (listType === 'day_before') {
      setDayBeforeTips(updatedItems);
    } else {
      setBeforeLeavingTips(updatedItems);
    }

    try {
      const currentUser = await User.me();
      const lists = await TipList.filter({ 
        owner_id: currentUser.id,
        list_type: listType 
      });

      const list = lists[0];
      if (list) {
        await TipList.update(list.id, {
          ...list,
          tips: updatedItems
        });
      }
    } catch (error) {
      console.error('Error updating tip order:', error);
      toast({
        title: "Error",
        description: "Failed to update tip order",
        variant: "destructive"
      });
    }
  };

  const addTip = async (listType) => {
    const tipContent = newTip[listType === 'day_before' ? 'dayBefore' : 'beforeLeaving'].trim();
    if (!tipContent) return;

    try {
      const currentUser = await User.me();
      const lists = await TipList.filter({ 
        owner_id: currentUser.id,
        list_type: listType 
      });

      const list = lists[0];
      if (list) {
        const newTips = [...(listType === 'day_before' ? dayBeforeTips : beforeLeavingTips)];
        const newTipItem = {
          id: `${listType}_${Date.now()}`,
          content: tipContent,
          is_default: false,
          order: newTips.length
        };
        newTips.push(newTipItem);

        await TipList.update(list.id, {
          ...list,
          tips: newTips
        });

        if (listType === 'day_before') {
          setDayBeforeTips(newTips);
          setNewTip({ ...newTip, dayBefore: '' });
        } else {
          setBeforeLeavingTips(newTips);
          setNewTip({ ...newTip, beforeLeaving: '' });
        }
      }
    } catch (error) {
      console.error('Error adding tip:', error);
      toast({
        title: "Error",
        description: "Failed to add tip",
        variant: "destructive"
      });
    }
  };

  const deleteTip = async (listType, tipId) => {
    try {
      const currentUser = await User.me();
      const lists = await TipList.filter({ 
        owner_id: currentUser.id,
        list_type: listType 
      });

      const list = lists[0];
      if (list) {
        const updatedTips = (listType === 'day_before' ? dayBeforeTips : beforeLeavingTips)
          .filter(tip => tip.id !== tipId)
          .map((tip, index) => ({ ...tip, order: index }));

        await TipList.update(list.id, {
          ...list,
          tips: updatedTips
        });

        if (listType === 'day_before') {
          setDayBeforeTips(updatedTips);
        } else {
          setBeforeLeavingTips(updatedTips);
        }
      }
    } catch (error) {
      console.error('Error deleting tip:', error);
      toast({
        title: "Error",
        description: "Failed to delete tip",
        variant: "destructive"
      });
    }
  };

  const renderTipList = (tips, listType) => (
    <DragDropContext onDragEnd={(result) => handleDragEnd(result, listType)}>
      <Droppable droppableId={`droppable-${listType}`}>
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-2"
          >
            {tips.map((tip, index) => (
              <Draggable key={tip.id} draggableId={tip.id} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className="flex items-center gap-2 bg-white p-2 rounded-lg border"
                  >
                    <div {...provided.dragHandleProps} className="cursor-move">
                      <GripVertical className="h-4 w-4 text-gray-400" />
                    </div>
                    <span className="flex-1">{tip.content}</span>
                    {!tip.is_default && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTip(listType, tip.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Day Before Departure Tips</CardTitle>
        </CardHeader>
        <CardContent>
          {renderTipList(dayBeforeTips, 'day_before')}
          <div className="flex gap-2 mt-4">
            <Input
              placeholder="Add new tip"
              value={newTip.dayBefore}
              onChange={(e) => setNewTip({ ...newTip, dayBefore: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && addTip('day_before')}
            />
            <Button onClick={() => addTip('day_before')}>
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Before Leaving Home Tips</CardTitle>
        </CardHeader>
        <CardContent>
          {renderTipList(beforeLeavingTips, 'before_leaving')}
          <div className="flex gap-2 mt-4">
            <Input
              placeholder="Add new tip"
              value={newTip.beforeLeaving}
              onChange={(e) => setNewTip({ ...newTip, beforeLeaving: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && addTip('before_leaving')}
            />
            <Button onClick={() => addTip('before_leaving')}>
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}