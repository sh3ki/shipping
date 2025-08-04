import React from 'react';

export type Cell = {
  cell_id: string;
  status: string;
  category_id?: number;
  name?: string;
};

export type ViewCellsModalProps = {
  open: boolean;
  onClose: () => void;
  cells: Cell[];
  categories: { primary_id: number; color: string }[];
  mapLength: number;
  mapWidth: number;
  cellIds: string[];
  title: string;
};

export default function ViewCellsModal({ open, onClose, cells, categories, mapLength, mapWidth, cellIds, title }: ViewCellsModalProps) {
  // Helper: get color for a cell based on its category_id
  function getCellColor(cell: Cell | undefined): string | undefined {
    if (!cell || !cell.category_id) return undefined;
    const category = categories.find(cat => cat.primary_id === cell.category_id);
    if (category && category.color) return category.color;
    return undefined;
  }

  // Helper: check if adjacent cell is in the selected group
  function isAdjacent(l: number, w: number, direction: 'top' | 'right' | 'bottom' | 'left') {
    let adjL = l, adjW = w;
    if (direction === 'top') adjW -= 1;
    if (direction === 'bottom') adjW += 1;
    if (direction === 'left') adjL -= 1;
    if (direction === 'right') adjL += 1;
    // Out of bounds
    if (adjL < 1 || adjL > mapLength || adjW < 1 || adjW > mapWidth) return false;
    return cellIds.includes(`${adjL}_${adjW}`);
  }

  // Build grid
  const gridCells = open
    ? Array.from({ length: mapLength * mapWidth }).map((_, idx) => {
        const l = (idx % mapLength) + 1;
        const w = Math.floor(idx / mapLength) + 1;
        const cell_id = `${l}_${w}`;
        const cell = cells.find(c => c.cell_id === cell_id);
        const isHighlighted = cellIds.includes(cell_id);
        const cellColor = isHighlighted ? getCellColor(cell) : undefined;

        // Only draw polygonal outline for selected category cells
        const borderColor = 'var(--color-foreground)';
        const borderWidth = '3px';
        const style: React.CSSProperties = (() => {
          if (isHighlighted) {
            const s: React.CSSProperties = {
              minWidth: 0,
              minHeight: 0,
              background: cellColor ? cellColor : 'transparent',
            };
            if (!isAdjacent(l, w, 'top')) s.borderTop = `${borderWidth} solid ${borderColor}`;
            if (!isAdjacent(l, w, 'right')) s.borderRight = `${borderWidth} solid ${borderColor}`;
            if (!isAdjacent(l, w, 'bottom')) s.borderBottom = `${borderWidth} solid ${borderColor}`;
            if (!isAdjacent(l, w, 'left')) s.borderLeft = `${borderWidth} solid ${borderColor}`;
            return s;
          } else {
            return {
              minWidth: 0,
              minHeight: 0,
              border: '1px solid var(--box-border)',
              background: 'transparent',
            };
          }
        })();
        return (
          <div
            key={cell_id}
            className="border"
            style={style}
          />
        );
      })
    : [];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full h-full max-w-11/12 mx-auto bg-background rounded-2xl shadow-2xl border border-border p-6 sm:p-8 sm:pb-4 flex flex-col items-stretch min-w-[350px] max-h-[90vh] overflow-y-auto animate-in fade-in-0 zoom-in-95">
        {/* Close button top right */}
        <button
          className="absolute top-4 right-4 text-xl text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
          onClick={onClose}
          aria-label="Close"
        >
          <span aria-hidden>×</span>
        </button>
        <h2 className="text-lg font-semibold mb-2 text-center text-foreground">
          {Array.isArray(title) ? title.join(' ') : title}
        </h2>
        <div
          className="grid gap-0.5 w-full h-full mb-2"
          style={{
            gridTemplateColumns: `repeat(${mapLength}, 1fr)`,
            gridTemplateRows: `repeat(${mapWidth}, 1fr)`,
            width: '100%',
            height: '100%',
            boxSizing: 'border-box',
            overflow: 'auto',
            background: 'var(--color-muted, #f3f4f6)',
            borderRadius: '0.75rem',
            border: '1px solid var(--color-border, #e5e7eb)',
            padding: '0.5rem',
          }}
        >
          {gridCells}
        </div>
      </div>
    </div>
  );
}
