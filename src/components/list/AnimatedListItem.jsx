import { useState } from 'react';
import { motion } from 'framer-motion';
import AnimatedCheckbox from '../animated/AnimatedCheckbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmojiPicker } from '@/components/ui/emoji-picker';
import { Minus, Plus, Trash2 } from 'lucide-react';

const AnimatedListItem = ({
  item,
  onToggle,
  onUpdateQuantity,
  onUpdateEmoji,
  onDelete,
  isEditMode = false,
  isPending = false,
}) => {
  const [quantity, setQuantity] = useState(item.quantity);

  const handleQuantityChange = newQuantity => {
    if (newQuantity < 1) newQuantity = 1;
    setQuantity(newQuantity);

    if (onUpdateQuantity) {
      onUpdateQuantity(newQuantity);
    }
  };

  return (
    <div
      className={`flex items-center py-2 border-b last:border-b-0 ${isPending ? 'opacity-60 pointer-events-none' : ''}`}
    >
      <AnimatedCheckbox
        checked={item.is_packed}
        onChange={onToggle}
        disabled={isPending}
        className="mr-3 flex-shrink-0"
      />

      <div className="flex items-center gap-2 mr-2">
        <EmojiPicker
          value={item.emoji || '📦'}
          onChange={onUpdateEmoji}
          className="flex-shrink-0"
        />
      </div>

      <div className="flex-1">
        <motion.span
          className={`text-md ${item.is_packed ? 'line-through text-gray-500' : 'text-gray-900'}`}
          animate={{
            color: item.is_packed ? 'rgb(107, 114, 128)' : 'rgb(17, 24, 39)',
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
        <div className="text-sm font-medium text-gray-500 ml-2">
          {item.quantity > 1 && `×${item.quantity}`}
        </div>
      )}
    </div>
  );
};

export default AnimatedListItem;
