import { useState, useEffect } from "react";
import { BaseList } from "@/api/entities";
import { User } from "@/api/entities";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function BaseListEditor({ lists, listType, categories, onUpdate }) {
  const [currentList, setCurrentList] = useState(null);
  const [items, setItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemCategory, setItemCategory] = useState("essentials");

  useEffect(() => {
    if (currentList) {
      setItems(currentList.items || []);
    }
  }, [currentList]);

  const handleCategorySelect = async (category) => {
    setSelectedCategory(category);
    const existingList = lists.find(l => l.category === category);
    if (existingList) {
      setCurrentList(existingList);
      setItems(existingList.items || []);
    } else {
      setCurrentList(null);
      setItems([]);
    }
  };

  const autoSave = async (updatedItems) => {
    try {
      const user = await User.me();
      if (!selectedCategory) return;

      if (currentList) {
        await BaseList.update(currentList.id, {
          items: updatedItems
        });
      } else {
        await BaseList.create({
          list_type: listType,
          category: selectedCategory,
          items: updatedItems,
          owner_id: user.id,
          is_sample: false
        });
      }

      onUpdate();
    } catch (error) {
      console.error("Error auto-saving base list:", error);
      toast({
        title: "Auto-save failed",
        description: "Your changes may not be saved. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAddItem = async () => {
    if (!itemName.trim()) return;

    const newItem = {
      name: itemName,
      category: itemCategory,
      quantity: 1,
      weather_dependent: false,
      weather_type: "any"
    };

    const updatedItems = [...items, newItem];
    setItems(updatedItems);
    setItemName("");
    setItemCategory("essentials");
    await autoSave(updatedItems);
  };

  const handleItemNameKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleAddItem();
    }
  };

  const handleRemoveItem = async (index) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    setItems(updatedItems);
    await autoSave(updatedItems);
  };



  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <Select value={selectedCategory} onValueChange={handleCategorySelect}>
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category.replace(/_/g, ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedCategory && (
          <>
            <div className="flex gap-2">
              <Input
                placeholder="Item name"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                onKeyDown={handleItemNameKeyDown}
              />
              <Select value={itemCategory} onValueChange={setItemCategory}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clothing">Clothing</SelectItem>
                  <SelectItem value="toiletries">Toiletries</SelectItem>
                  <SelectItem value="tech">Tech</SelectItem>
                  <SelectItem value="gear">Gear</SelectItem>
                  <SelectItem value="essentials">Essentials</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleAddItem}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <span className="text-sm text-gray-500 ml-2">
                      ({item.category}, x{item.quantity})
                    </span>
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
            </div>


          </>
        )}
      </div>
    </div>
  );
}