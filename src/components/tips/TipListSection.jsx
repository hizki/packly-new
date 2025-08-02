import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import AnimatedCheckbox from '../animated/AnimatedCheckbox';
import { cn } from '@/lib/utils';

export default function TipListSection({ title, tips, onTipToggle, collapsed = false }) {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const [completedTips, setCompletedTips] = useState(new Set());

  const handleTipToggle = tipId => {
    const newCompleted = new Set(completedTips);
    if (newCompleted.has(tipId)) {
      newCompleted.delete(tipId);
    } else {
      newCompleted.add(tipId);
    }
    setCompletedTips(newCompleted);
    if (onTipToggle) {
      onTipToggle(tipId, !completedTips.has(tipId));
    }
  };

  const progress = tips.length > 0 ? (completedTips.size / tips.length) * 100 : 0;

  return (
    <Card className="mt-6">
      <CardHeader className="py-3">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <CardTitle className="text-lg flex items-center gap-2">
            {title}
            <div className="text-sm font-normal text-gray-500">
              ({completedTips.size}/{tips.length})
            </div>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
          >
            {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full mt-2">
          <div
            className="h-full bg-green-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </CardHeader>

      {!isCollapsed && (
        <CardContent className="pt-0">
          <div className="space-y-2">
            {tips.map(tip => (
              <div
                key={tip.id}
                className={cn(
                  'flex items-center gap-3 p-2 rounded-lg transition-colors',
                  completedTips.has(tip.id) && 'bg-gray-50',
                )}
              >
                <AnimatedCheckbox
                  checked={completedTips.has(tip.id)}
                  onChange={() => handleTipToggle(tip.id)}
                />
                <span
                  className={cn(
                    'flex-1',
                    completedTips.has(tip.id) && 'line-through text-gray-500',
                  )}
                >
                  {tip.content}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
