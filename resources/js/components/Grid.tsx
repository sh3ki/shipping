import React from 'react';

export type Category = {
  primary_id: number;
  name: string;
  color: string;
  direction: string;
  description?: string;
  cells_count?: number;
};

export type Cell = {
  cell_id: string;
  status: string;
  category_id?: number;
  name?: string;
};

type CellInfo = {
  cell_id: string;
  shipping_line?: string;
  size?: string;
  type?: string;
  cell_status?: string;
};

type GridProps = {
  mapLength: number;
  mapWidth: number;
  categories: Category[];
  cells: Cell[];
  cellsInfo?: CellInfo[];
  onCellMouseEnter?: (cell_id: string, cell: Cell | undefined, e: React.MouseEvent) => void;
  onCellMouseLeave?: () => void;
  onCellClick?: (cell_id: string, cell: Cell | undefined, e: React.MouseEvent) => void;
  highlightedCell?: string;
  borderColor?: string; // 'input' | 'ring' (CSS var)
  moveModeHighlightCell?: (cell: Cell) => boolean;
};

export const Grid: React.FC<GridProps> = ({
  mapLength,
  mapWidth,
  categories,
  cells,
  cellsInfo = [],
  onCellMouseEnter,
  onCellMouseLeave,
  onCellClick,
  highlightedCell,
  borderColor = 'ring',
  moveModeHighlightCell,
}) => {
  const borderVar = borderColor === 'input' ? 'var(--input)' : 'var(--ring)';
  const [hoveredCellId, setHoveredCellId] = React.useState<string | null>(null);
  return (
    <div
      className="grid gap-0.5 w-full h-full"
      style={{
        gridTemplateColumns: `repeat(${mapLength}, 1fr)`,
        gridTemplateRows: `repeat(${mapWidth}, 1fr)`,
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
      }}
    >
      {(() => {
        // Precompute maps for O(1) lookup
        const cellMap = new Map(cells.map(c => [c.cell_id, c]));
        const categoryMap = new Map(categories.map(cat => [cat.primary_id, cat]));
        const infoSet = new Set(cellsInfo.map(info => info.cell_id));
        const cellsArr = Array.from({ length: mapLength * mapWidth });
        return cellsArr.map((_, idx) => {
          const l = (idx % mapLength) + 1;
          const w = Math.floor(idx / mapLength) + 1;
          const cell_id = `${l}_${w}`;
          const cell = cellMap.get(cell_id);
          const category = cell && cell.category_id ? categoryMap.get(cell.category_id) : undefined;
          const isHighlighted = highlightedCell === cell_id;
          const hasInfo = infoSet.has(cell_id);
          const isSelected = cell?.status === 'selected';
          const dimmed = hasInfo && isSelected;
          const isHovered = hoveredCellId === cell_id;

          // Move mode highlight logic
          const isMoveHighlight = moveModeHighlightCell && cell && moveModeHighlightCell(cell);

          // Border logic
          let borderColorStyle = borderVar;
          let borderWidthStyle = '1px';
          if (isHighlighted || (isSelected && isHovered)) {
            borderColorStyle = 'var(--primary)';
            borderWidthStyle = '2px';
          }
          if (isMoveHighlight) {
            borderColorStyle = '#2563eb';
            borderWidthStyle = '2.5px';
          }

          // Outer cell classes
          const outerClass = [
            'border',
            'relative',
            isSelected ? 'cursor-pointer z-10' : '',
            isMoveHighlight ? 'cursor-pointer ring-2 ring-blue-500 z-20' : '',
            !isSelected && !isMoveHighlight ? 'cursor-default' : '',
            dimmed ? 'border-primary border-2' : '',
          ].filter(Boolean).join(' ');

          // Inner cell classes
          const innerClass = isSelected
            ? [
                'w-full h-full',
                dimmed ? 'brightness-50' : '',
                'hover:brightness-50 hover:scale-[1.08] hover:shadow-xl',
              ].filter(Boolean).join(' ')
            : isMoveHighlight
            ? 'w-full h-full bg-blue-100 animate-pulse'
            : '';

          return (
            <div
              key={cell_id}
              className={outerClass}
              style={{
                borderWidth: borderWidthStyle,
                borderStyle: 'solid',
                borderColor: borderColorStyle,
                width: '100%',
                height: '100%',
                minWidth: 0,
                minHeight: 0,
                boxShadow: isHighlighted ? '0 0 0 2px var(--primary)' : undefined,
                transform: isHighlighted ? 'scale(1.02)' : 'scale(1)',
                zIndex: isHighlighted ? 10 : isMoveHighlight ? 20 : 1,
                padding: 0,
              }}
              onMouseEnter={e => {
                setHoveredCellId(cell_id);
                onCellMouseEnter?.(cell_id, cell, e);
              }}
              onMouseLeave={() => {
                setHoveredCellId(null);
                onCellMouseLeave?.();
              }}
              onClick={onCellClick ? (e) => onCellClick(cell_id, cell, e) : undefined}
            >
              <div
                className={innerClass}
                style={{
                  width: '100%',
                  height: '100%',
                  background: isSelected && category ? category.color : isMoveHighlight ? '#dbeafe' : 'transparent',
                  borderRadius: 'inherit',
                }}
              />
            </div>
          );
        });
      })()}
    </div>
  );
};
