/**
 * Color picker component for branding customization
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Palette, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
  className?: string;
}

const PRESET_COLORS = [
  '#53B7FF', // OpsCrew Blue
  '#FF7784', // OpsCrew Red
  '#2FE6A6', // OpsCrew Green
  '#F7C948', // OpsCrew Yellow
  '#A793F8', // OpsCrew Purple
  '#181A1B', // Dark
  '#2A2E35', // Dark Gray
  '#FFFFFF', // White
  '#000000', // Black
  '#FF6B6B', // Coral
  '#4ECDC4', // Teal
  '#45B7D1', // Sky Blue
  '#96CEB4', // Mint
  '#FECA57', // Gold
  '#FF9FF3', // Pink
  '#54A0FF', // Blue
];

export function ColorPicker({ value, onChange, label, className }: ColorPickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleColorChange = (color: string) => {
    onChange(color);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    if (color.match(/^#[0-9A-Fa-f]{6}$/)) {
      onChange(color);
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && <Label className="text-sm font-medium">{label}</Label>}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start gap-2 h-10"
          >
            <div 
              className="w-4 h-4 rounded border border-border"
              style={{ backgroundColor: value }}
            />
            <span className="flex-1 text-left">{value}</span>
            <Palette className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="start">
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Preset Colors</Label>
              <div className="grid grid-cols-8 gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorChange(color)}
                    className={cn(
                      'w-8 h-8 rounded border-2 border-border hover:scale-110 transition-transform duration-200',
                      value === color && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                    )}
                    style={{ backgroundColor: color }}
                    title={color}
                  >
                    {value === color && (
                      <Check className="w-4 h-4 text-white drop-shadow-sm" />
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium mb-2 block">Custom Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={value}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  type="text"
                  value={value}
                  onChange={handleInputChange}
                  placeholder="#000000"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
