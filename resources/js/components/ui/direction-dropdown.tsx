import React from 'react';

export type DirectionDropdownProps = {
  value: string;
  onChange: (direction: string) => void;
};

const directions = [
  { value: 'upward', label: 'Upward' },
  { value: 'downward', label: 'Downward' },
  { value: 'rightward', label: 'Rightward' },
  { value: 'leftward', label: 'Leftward' },
];

export default function DirectionDropdown({ value, onChange }: DirectionDropdownProps) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="rounded-md px-3 py-2.5 w-40 border border-border bg-background shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/30 text-foreground"
    >
      {directions.map(dir => (
        <option key={dir.value} value={dir.value}>{dir.label}</option>
      ))}
    </select>
  );
}
