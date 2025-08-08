import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AnimatedCheckbox from '../animated/AnimatedCheckbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmojiPicker } from '@/components/ui/emoji-picker';
import { Minus, Plus, Trash2 } from 'lucide-react';

const AnimatedListItem = React.forwardRef(({
  item,
  onToggle,
  onUpdateQuantity,
  onUpdateEmoji,
  onDelete,
  isEditMode = false,
  isSelected = false,
  onSelectToggle,
  isPending = false,
}, ref) => {
  const [quantity, setQuantity] = useState(item.quantity);

  const handleQuantityChange = newQuantity => {
    if (newQuantity < 1) newQuantity = 1;
    setQuantity(newQuantity);

    if (onUpdateQuantity) {
      onUpdateQuantity(newQuantity);
    }
  };

  const handleRowClick = e => {
    if (!isEditMode || !onSelectToggle) return;
    const target = e.target;
    if (
      target.closest('button') ||
      target.closest('input') ||
      target.closest('[role="checkbox"]') ||
      target.closest('[data-emoji-picker]')
    ) {
      return;
    }
    onSelectToggle();
  };

  return (
    <div
      className={`flex items-center py-2 border-b last:border-b-0 ${isPending ? 'opacity-60 pointer-events-none' : ''} ${isEditMode && isSelected ? 'bg-muted/40 ring-1 ring-primary/20' : ''}`}
      role={isEditMode ? 'listitem' : undefined}
      aria-selected={isEditMode ? isSelected : undefined}
      onClick={handleRowClick}
      ref={ref}
    >
      <AnimatedCheckbox
        checked={item.is_packed}
        onChange={onToggle}
        disabled={isPending}
        className="mr-3 flex-shrink-0"
      />

      <div className={`flex items-center gap-2 mr-2 ${isEditMode ? 'cursor-pointer' : ''}`} data-emoji-picker>
        <EmojiPicker
          value={item.emoji || '📦'}
          onChange={onUpdateEmoji}
          className="flex-shrink-0"
        />
      </div>

      <div className="flex-1">
        <motion.span
          className={`text-md ${item.is_packed ? 'line-through text-muted-foreground' : 'text-foreground'}`}
          animate={{
            color: item.is_packed ? 'hsl(var(--muted-foreground))' : 'hsl(var(--foreground))',
          }}
          transition={{ duration: 0.2 }}
        >
          {item.name}
        </motion.span>

        {item.weather_dependent && (
          <span className="ml-2 text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5">
            Weather
          </span>
        )}
      </div>

      {isEditMode ? (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleQuantityChange(quantity - 1)}
          >
            <Minus className="h-4 w-4" />
          </Button>

          <Input
            type="number"
            min="1"
            value={quantity}
            onChange={e => handleQuantityChange(parseInt(e.target.value, 10))}
            className="w-14 h-8 text-center"
          />

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleQuantityChange(quantity + 1)}
          >
            <Plus className="h-4 w-4" />
          </Button>

          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-500 hover:text-red-700"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        <div className={`text-sm font-medium ml-2 ${isEditMode ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
          {item.quantity > 1 && `×${item.quantity}`}
        </div>
      )}
    </div>
  );
});

AnimatedListItem.displayName = 'AnimatedListItem';

export default AnimatedListItem;
