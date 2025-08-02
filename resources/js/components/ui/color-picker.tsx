import React from 'react';

export type ColorPickerProps = {
  value: string;
  onChange: (color: string) => void;
};

export default function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <input
      type="color"
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-8 h-8 p-0 border-none bg-transparent cursor-pointer"
      style={{ outline: 'none' }}
    />
  );
}
