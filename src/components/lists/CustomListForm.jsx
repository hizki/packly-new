import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { X, Check, Plus } from "lucide-react";

export default function CustomListForm({ listType, onCancel, onSave }) {
  const [name, setName] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const formRef = useRef(null);
  const emojiPickerRef = useRef(null);
  
  // Manually implement click away detection
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showEmojiPicker &&
        emojiPickerRef.current && 
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);
  
  // Map of emojis for each list type
  const emojiMap = {
    activity: ["🏊‍♂️", "🚴‍♀️", "🧘‍♀️", "🏂", "🏃‍♂️", "🚣‍♀️", "⚽", "🎾", "🏸", "🏹", "🤿", "🎪", "🎨", "🎰", "🎲", "🧠", "🎬", "🎮", "🎧", "📸", "🔭", "🌱", "🧩", "🎭", "🍳", "🎯"],
    accommodation: ["🏡", "🛖", "🏘️", "🏚️", "🏙️", "🛏️", "🏰", "⛩️", "⛪", "🏢", "🏨", "🌄", "🏔️", "🗺️", "🏕️", "🌃", "🏦", "🏛️", "🏬", "🗼"],
    companion: ["👨‍👩‍👦", "👨‍👨‍👧‍👧", "👩‍👩‍👦‍👦", "👶", "🧒", "👴", "👵", "🐕", "🐈", "👥", "👫", "👬", "👭", "👪", "🐶", "🦮", "🐱", "🐰"]
  };
  
  // Default categories by list type
  const customCategories = {
    activity: [
      { id: "custom", label: "Custom Activity" },
      { id: "water_sports", label: "Water Sports" },
      { id: "winter_sports", label: "Winter Sports" },
      { id: "team_sports", label: "Team Sports" },
      { id: "wellness", label: "Wellness" },
      { id: "entertainment", label: "Entertainment" }
    ],
    accommodation: [
      { id: "custom", label: "Custom Accommodation" },
      { id: "resort", label: "Resort" },
      { id: "hostel", label: "Hostel" },
      { id: "vacation_rental", label: "Vacation Rental" },
      { id: "boutique_hotel", label: "Boutique Hotel" },
      { id: "cabin", label: "Cabin" }
    ],
    companion: [
      { id: "custom", label: "Custom Companion" },
      { id: "children", label: "With Children" },
      { id: "grandparents", label: "With Grandparents" },
      { id: "pet", label: "With Pet" },
      { id: "large_group", label: "Large Group" }
    ]
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for your list",
        variant: "destructive"
      });
      return;
    }
    
    if (!selectedEmoji) {
      toast({
        title: "Error",
        description: "Please select an emoji for your list",
        variant: "destructive"
      });
      return;
    }
    
    if (!selectedCategory) {
      toast({
        title: "Error",
        description: "Please select a category for your list",
        variant: "destructive"
      });
      return;
    }
    
    // Make category ID from the name if custom, otherwise use selected category
    const categoryId = selectedCategory === "custom" 
      ? name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
      : selectedCategory;
    
    onSave({
      name,
      icon: selectedEmoji,
      category: categoryId,
      list_type: listType
    });
  };
  
  return (
    <div className="p-4 bg-white rounded-lg shadow-lg animate-in fade-in zoom-in" ref={formRef}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">
          New {listType === "activity" ? "Activity" : 
               listType === "accommodation" ? "Accommodation" : 
               "Travel Companion"}
        </h3>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <Input
            placeholder="Enter a name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <div className="grid grid-cols-2 gap-2">
            {customCategories[listType].map((category) => (
              <div
                key={category.id}
                className={`p-2 border rounded-md cursor-pointer text-center ${
                  selectedCategory === category.id ? "bg-blue-50 border-blue-300" : "hover:bg-gray-50"
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.label}
                {selectedCategory === category.id && (
                  <Check className="inline-block ml-1 h-4 w-4 text-blue-500" />
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
          <div className="relative">
            <div
              className="border rounded-md p-3 flex justify-between items-center cursor-pointer"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              {selectedEmoji ? (
                <span className="text-2xl">{selectedEmoji}</span>
              ) : (
                <span className="text-gray-500">Select an emoji</span>
              )}
              <Plus className="h-4 w-4 text-gray-400" />
            </div>
            
            {showEmojiPicker && (
              <div 
                ref={emojiPickerRef}
                className="absolute top-full left-0 right-0 bg-white border rounded-md shadow-lg mt-1 p-2 z-10"
              >
                <div className="grid grid-cols-8 gap-1">
                  {emojiMap[listType].map((emoji, index) => (
                    <div
                      key={index}
                      className={`p-2 text-xl text-center cursor-pointer rounded hover:bg-gray-100 ${
                        selectedEmoji === emoji ? "bg-blue-50" : ""
                      }`}
                      onClick={() => {
                        setSelectedEmoji(emoji);
                        setShowEmojiPicker(false);
                      }}
                    >
                      {emoji}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            Create
          </Button>
        </div>
      </form>
    </div>
  );
}