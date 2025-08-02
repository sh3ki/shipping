import React, { useState, useRef } from 'react';

export type Cell = {
  cell_id: string;
  status: string;
  category_id?: number;
  name?: string;
};

export type SelectCellsModalProps = {
  open: boolean;
  onClose: () => void;
  cells: Cell[];
  categories: { primary_id: number; color: string }[];
  onSave: (selectedCellIds: string[]) => void;
  mapLength: number;
  mapWidth: number;
  preSelectedCells?: string[];
  allowToggleSelected?: boolean;
  toggleCategoryId?: number;
};


export default function SelectCellsModal({ open, onClose, cells, categories, onSave, mapLength, mapWidth, preSelectedCells = [], allowToggleSelected = false, toggleCategoryId }: SelectCellsModalProps) {
  const [highlighted, setHighlighted] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStarted, setDragStarted] = useState(false);
  const dragStartRef = useRef<string | null>(null);

  // Initialize highlighted cells with preSelectedCells when modal opens
  React.useEffect(() => {
    if (open) {
      setHighlighted(preSelectedCells);
    }
  }, [open, preSelectedCells]);

  // Add mouseup event to document for drag end (always called)
  React.useEffect(() => {
    if (!isDragging) return;
    const handleUp = () => handleMouseUp();
    document.addEventListener('mouseup', handleUp);
    return () => document.removeEventListener('mouseup', handleUp);
  }, [isDragging]);

  function handleCellClick(cell_id: string, isSelected: boolean) {
    if (dragStarted) return;
    // Find the cell object
    const cell = cells.find(c => c.cell_id === cell_id);
    // If cell is already selected (belongs to a category)
    if (isSelected) {
      // If toggleCategoryId is set, only allow toggling if cell belongs to that category
      if (toggleCategoryId !== undefined) {
        if (cell?.category_id !== toggleCategoryId) return;
      } else {
        if (!allowToggleSelected) return;
      }
    }
    if (highlighted.includes(cell_id)) {
      setHighlighted(prev => prev.filter(id => id !== cell_id));
    } else {
      setHighlighted(prev => [...prev, cell_id]);
    }
  }

  function handleMouseDown(cell_id: string, isSelected: boolean) {
    const cell = cells.find(c => c.cell_id === cell_id);
    if (isSelected) {
      if (toggleCategoryId !== undefined) {
        if (cell?.category_id !== toggleCategoryId) return;
      } else {
        if (!allowToggleSelected) return;
      }
    }
    setIsDragging(true);
    setDragStarted(false);
    dragStartRef.current = cell_id;
    document.body.style.userSelect = 'none';
  }

  function handleMouseUp() {
    setIsDragging(false);
    dragStartRef.current = null;
    document.body.style.userSelect = '';
    // Reset drag started after a short delay to allow click event to process
    setTimeout(() => setDragStarted(false), 0);
  }

  function handleMouseEnter(cell_id: string, isSelected: boolean) {
    if (!isDragging) return;
    const cell = cells.find(c => c.cell_id === cell_id);
    if (isSelected) {
      if (toggleCategoryId !== undefined) {
        if (cell?.category_id !== toggleCategoryId) return;
      } else {
        if (!allowToggleSelected) return;
      }
    }
    setDragStarted(true);
    if (!highlighted.includes(cell_id)) {
      setHighlighted(prev => [...prev, cell_id]);
    }
  }

  function handleSave() {
    // Sort the highlighted cells in L_W order (1_1, 1_2, 1_3, 2_1, 2_2, etc.)
    const sortedCells = [...highlighted].sort((a, b) => {
      const [l1, w1] = a.split('_').map(Number);
      const [l2, w2] = b.split('_').map(Number);
      
      // Sort by L first, then by W
      if (l1 !== l2) {
        return l1 - l2;
      }
      return w1 - w2;
    });
    
    onSave(sortedCells);
    setHighlighted([]);
    onClose();
  }

  // Helper: get color for a cell based on its category_id
  function getCellColor(cell: Cell | undefined): string | undefined {
    if (!cell || !cell.category_id) return undefined;
    const category = categories.find(cat => cat.primary_id === cell.category_id);
    if (category && category.color) return category.color;
    return undefined;
  }

  // Build grid
  const gridCells = open
    ? Array.from({ length: mapLength * mapWidth }).map((_, idx) => {
        const l = (idx % mapLength) + 1;
        const w = Math.floor(idx / mapLength) + 1;
        const cell_id = `${l}_${w}`;
        const cell = cells.find(c => c.cell_id === cell_id);
        const isSelected = cell?.status === 'selected';
        const isHighlighted = highlighted.includes(cell_id);
        // Get color from category if selected
        const cellColor = isSelected ? getCellColor(cell) : undefined;
        return (
          <div
            key={cell_id}
            className="border cursor-pointer"
            style={{
              borderWidth: isHighlighted ? '2px' : '1px',
              borderColor: isHighlighted ? '#2563eb' : 'var(--box-border)',
              background: isSelected && cellColor ? cellColor : isHighlighted ? '#dbeafe' : 'transparent',
              boxShadow: isHighlighted ? '0 0 0 2px #2563eb' : undefined,
              minWidth: 0,
              minHeight: 0,
            }}
            onClick={() => handleCellClick(cell_id, isSelected)}
            onMouseDown={e => {
              e.preventDefault();
              handleMouseDown(cell_id, isSelected);
            }}
            onMouseEnter={e => handleMouseEnter(cell_id, isSelected)}
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
        <h2 className="text-lg font-semibold mb-2 text-center text-foreground">Select Cells</h2>
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
        <div className="flex justify-center">
          <button
            type="button"
            className="px-10   py-1.5 text-sm font-semibold rounded-md border border-muted-foreground bg-primary-foreground text-primary shadow hover:bg-primary hover:text-primary-foreground transition-colors"
            onClick={handleSave}
          >
            Save Cells
          </button>
        </div>
      </div>
    </div>
  );
}
