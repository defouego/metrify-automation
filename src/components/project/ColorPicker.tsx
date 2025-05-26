
import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface ColorPickerProps {
  currentColor: string;
  onColorChange: (color: string) => void;
}

const PREDEFINED_COLORS = [
  '#FF6B6B', // Rouge
  '#4ECDC4', // Turquoise
  '#45B7D1', // Bleu
  '#FFA07A', // Orange
  '#98D8C8', // Vert menthe
  '#F7DC6F', // Jaune
  '#BB8FCE', // Violet
  '#85C1E9', // Bleu clair
  '#F8C471', // Orange clair
  '#82E0AA'  // Vert clair
];

const ColorPicker: React.FC<ColorPickerProps> = ({ currentColor, onColorChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div
          className="w-4 h-4 rounded border border-gray-300 cursor-pointer hover:scale-110 transition-transform"
          style={{ backgroundColor: currentColor }}
          title="Cliquer pour changer la couleur"
        />
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2" align="start">
        <div className="grid grid-cols-5 gap-2">
          {PREDEFINED_COLORS.map((color) => (
            <div
              key={color}
              className={`w-6 h-6 rounded cursor-pointer border-2 hover:scale-110 transition-transform ${
                currentColor === color ? 'border-gray-800' : 'border-gray-300'
              }`}
              style={{ backgroundColor: color }}
              onClick={() => {
                onColorChange(color);
                setIsOpen(false);
              }}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ColorPicker;