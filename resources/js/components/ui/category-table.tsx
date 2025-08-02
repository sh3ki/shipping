import React from 'react';

export type Category = {
  primary_id: number;
  name: string;
  color: string;
  direction: string;
  description?: string;
  quantity: number;
};

export type CategoryTableProps = {
  categories: Category[];
  onAddCategory: () => void;
};

export default function CategoryTable({ categories, onAddCategory }: CategoryTableProps) {
  return (
    <div className="w-full">
      <table className="w-full text-sm border rounded-md overflow-hidden">
        <thead className="bg-muted-foreground text-primary-foreground">
          <tr>
            <th className="px-2 py-2">Name</th>
            <th className="px-2 py-2">Color</th>
            <th className="px-2 py-2">Direction</th>
            <th className="px-2 py-2">Quantity</th>
          </tr>
        </thead>
        <tbody>
          {categories.map(cat => (
            <tr key={cat.primary_id} className="border-b">
              <td className="px-2 py-2 font-semibold">{cat.name}</td>
              <td className="px-2 py-2">
                <span className="inline-block w-5 h-5 rounded-full mr-2" style={{ background: cat.color, border: '1px solid #ccc' }} />
                <span className="text-xs">{cat.color}</span>
              </td>
              <td className="px-2 py-2">{cat.direction}</td>
              <td className="px-2 py-2">{cat.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-end mt-4">
        <button
          type="button"
          onClick={onAddCategory}
          className="px-3 py-1.5 text-xs font-semibold rounded-md border border-muted-foreground bg-primary-foreground text-primary shadow hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          Add Category
        </button>
      </div>
    </div>
  );
}
