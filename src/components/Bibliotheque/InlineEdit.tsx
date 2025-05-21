
import React, { useState, useEffect, useRef } from 'react';
import { Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { ItemUnit } from '@/types/library';

interface InlineEditProps {
  value: string | number;
  field: string;
  onSave: (value: string | number) => void;
  onCancel: () => void;
  options?: { value: string, label: string }[];
}

const InlineEdit: React.FC<InlineEditProps> = ({
  value,
  field,
  onSave,
  onCancel,
  options
}) => {
  const [editedValue, setEditedValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLButtonElement>(null);
  
  useEffect(() => {
    // Focus the input when component mounts
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
    if (selectRef.current) {
      selectRef.current.focus();
    }
  }, []);
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };
  
  const handleSave = () => {
    if (field === 'prix_unitaire') {
      const numValue = parseFloat(editedValue as string);
      if (isNaN(numValue)) {
        return;
      }
      onSave(numValue);
    } else {
      onSave(editedValue);
    }
  };

  if (options) {
    return (
      <div className="flex items-center space-x-1">
        <Select 
          value={editedValue as string} 
          onValueChange={setEditedValue as (value: string) => void}
        >
          <SelectTrigger ref={selectRef} className="h-8 w-full">
            <SelectValue placeholder="Sélectionner..." />
          </SelectTrigger>
          <SelectContent>
            {options.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleSave}>
          <Check className="h-4 w-4 text-green-500" />
        </Button>
        
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onCancel}>
          <X className="h-4 w-4 text-red-500" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-1">
      <Input
        ref={inputRef}
        value={editedValue}
        onChange={(e) => setEditedValue(field === 'prix_unitaire' ? e.target.value : e.target.value)}
        onKeyDown={handleKeyDown}
        type={field === 'prix_unitaire' ? 'number' : 'text'}
        className="h-8"
      />
      
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleSave}>
        <Check className="h-4 w-4 text-green-500" />
      </Button>
      
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onCancel}>
        <X className="h-4 w-4 text-red-500" />
      </Button>
    </div>
  );
};

export default InlineEdit;
