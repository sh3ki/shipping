

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import React, { useState, useRef, useEffect } from 'react';
import { Grid } from '@/components/Grid';
import CellEditModal from '@/components/ui/cell-edit-modal';
// import SelectCellsModal from '@/components/ui/select-cells-modal';
import echo from '../../lib/echo';
import { listenToCellsInformationEvents } from '../../lib/cellsInformationListener';
import { Inertia, Method } from '@inertiajs/inertia';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

type Category = {
    primary_id: number;
    name: string;
    color: string;
    direction: string;
    description?: string;
    cells_count?: number;
};

type Cell = {
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

export default function Dashboard() {
    type DashboardPageProps = {
        map_length?: number;
        map_width?: number;
        categories?: Category[];
        cells?: Cell[];
        cellsInfo?: CellInfo[];
    };
    const { props } = usePage<DashboardPageProps>();

    const [showTooltip, setShowTooltip] = useState(false);
    const [showCellModal, setShowCellModal] = useState(false);
    const [selectedCellId, setSelectedCellId] = useState<string | null>(null);
    const [cellModalPosition, setCellModalPosition] = useState({ 
        x: 0, 
        y: 0, 
        cellWidth: 0, 
        cellHeight: 0, 
        cellX: 0, 
        cellY: 0 
    });
    // Move mode state
    const [moveFromCellId, setMoveFromCellId] = useState<string | null>(null);
    const gridRef = useRef<HTMLDivElement>(null);

    // Function to calculate cell position in the grid
    function calculateCellPosition(cell_id: string) {
        if (!gridRef.current) return { x: 0, y: 0, width: 0, height: 0, centerX: 0, centerY: 0 };

        const [l, w] = cell_id.split('_').map(Number);
        const gridRect = gridRef.current.getBoundingClientRect();
        
        // Calculate cell dimensions
        const cellWidth = gridRect.width / mapLength;
        const cellHeight = gridRect.height / mapWidth;
        
        // Calculate cell position (l-1 and w-1 because grid is 1-indexed but array is 0-indexed)
        const cellX = gridRect.left + (l - 1) * cellWidth;
        const cellY = gridRect.top + (w - 1) * cellHeight;
        
        return {
            x: cellX,
            y: cellY,
            width: cellWidth,
            height: cellHeight,
            centerX: cellX + cellWidth / 2,
            centerY: cellY + cellHeight / 2
        };
    }
    
    const mapLength = props.map_length ?? 1;
    const mapWidth = props.map_width ?? 1;
    const [categories, setCategories] = useState<Category[]>(props.categories || []);
    const [cells, setCells] = useState<Cell[]>(props.cells || []);
    const [cellsInfo, setCellsInfo] = useState<CellInfo[]>(props.cellsInfo || []);
    // Listen for real-time cells information events
    useEffect(() => {
        const stopListening = listenToCellsInformationEvents(
            (cellInfo) => {
                setCellsInfo((prev) => {
                    const idx = prev.findIndex((info) => info.cell_id === cellInfo.cell_id);
                    if (idx !== -1) {
                        // Update existing cell info
                        const updated = [...prev];
                        updated[idx] = cellInfo;
                        return updated;
                    } else {
                        // Add new cell info
                        return [...prev, cellInfo];
                    }
                });
            },
            (cellId) => {
                setCellsInfo((prev) => prev.filter(info => info.cell_id !== cellId));
            }
        );
        return () => {
            stopListening();
        };
    }, []);

    // Listen for real-time dimension and category updates
    useEffect(() => {
        const mapChannel = echo.channel('map-layout');
        mapChannel.listen('.CategoryUpdated', (e: { category: Category; cells: Cell[] }) => {
            setCategories((prev) => {
                const idx = prev.findIndex((cat) => cat.primary_id === e.category.primary_id);
                if (idx !== -1) {
                    const updated = [...prev];
                    updated[idx] = e.category;
                    return updated;
                }
                return [...prev, e.category];
            });
            setCells((prev) => {
                const updatedCellIds = new Set(e.cells.map((c) => c.cell_id));
                const updatedCells = prev.map((cell) =>
                    updatedCellIds.has(cell.cell_id)
                        ? e.cells.find((c) => c.cell_id === cell.cell_id) || cell
                        : cell
                );
                e.cells.forEach((c) => {
                    if (!prev.some((cell) => cell.cell_id === c.cell_id)) {
                        updatedCells.push(c);
                    }
                });
                return updatedCells;
            });
        });
        mapChannel.listen('.DimensionsUpdated', () => {
            Inertia.visit(window.location.pathname, {
                method: Method.GET,
                only: ['map_length', 'map_width', 'categories', 'cells'],
                preserveScroll: true,
                preserveState: true,
                replace: true,
            });
        });
        mapChannel.listen('.CategoryDeleted', (e: { categoryId: number, cells: Cell[] }) => {
            setCategories((prev) => prev.filter(cat => cat.primary_id !== e.categoryId));
            setCells((prev) => {
                const affectedIds = new Set(e.cells.map(c => c.cell_id));
                return prev.map(cell => {
                    if (affectedIds.has(cell.cell_id)) {
                        // Set category_id to undefined (not null) to match Cell type
                        return { ...cell, category_id: undefined, status: 'inactive', name: undefined };
                    }
                    return cell;
                });
            });
        });
        const catChannel = echo.channel('categories');
        catChannel.listen('.CategoryCreated', (e: { category: Category; cells: Cell[] }) => {
            // Optimized: update categories and cells state only
            setCategories((prev) => {
                const idx = prev.findIndex((cat) => cat.primary_id === e.category.primary_id);
                if (idx !== -1) {
                    const updated = [...prev];
                    updated[idx] = e.category;
                    return updated;
                }
                return [...prev, e.category];
            });
            setCells((prev) => {
                const updatedCellIds = new Set(e.cells.map((c) => c.cell_id));
                const updatedCells = prev.map((cell) =>
                    updatedCellIds.has(cell.cell_id)
                        ? e.cells.find((c) => c.cell_id === cell.cell_id) || cell
                        : cell
                );
                e.cells.forEach((c) => {
                    if (!prev.some((cell) => cell.cell_id === c.cell_id)) {
                        updatedCells.push(c);
                    }
                });
                return updatedCells;
            });
        });
        return () => {
            mapChannel.stopListening('.DimensionsUpdated');
            mapChannel.stopListening('.CategoryDeleted');
            mapChannel.stopListening('.CategoryUpdated');
            catChannel.stopListening('.CategoryCreated');
        };
    }, []);
    // const [hoveredCell, setHoveredCell] = useState<string | null>(null);
    const [hoveredCellData, setHoveredCellData] = useState<Cell | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
    const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    function handleMouseEnter(cell_id: string, cell: Cell | undefined, e: React.MouseEvent) {
        // Only show tooltip for cells with status 'selected'
        // Allow tooltip on other cells even when modal is open (but not on the selected cell with modal)
        if (cell && cell.status === 'selected' && !(showCellModal && selectedCellId === cell_id)) {
            setHoveredCellData(cell);
            setTooltipPosition({ x: e.clientX, y: e.clientY });
            if (tooltipTimeoutRef.current) {
                clearTimeout(tooltipTimeoutRef.current);
            }
            tooltipTimeoutRef.current = setTimeout(() => {
                setShowTooltip(true);
            }, 150);
        } else {
            setShowTooltip(false);
            setHoveredCellData(null);
        }
    }

    function handleMouseLeave() {
        if (tooltipTimeoutRef.current) {
            clearTimeout(tooltipTimeoutRef.current);
        }
        setShowTooltip(false);
        setHoveredCellData(null);
    }

    function handleCellClick(cell_id: string, cell: Cell | undefined) {
        // If in move mode, only allow picking a cell with no info
        if (moveFromCellId) {
            const hasInfo = cellsInfo.some(info => info.cell_id === cell_id);
            if (!hasInfo && cell) {
                handleMoveToCell(cell_id);
            }
            return;
        }
        // Only allow clicks on selected cells
        if (!cell || cell.status !== 'selected') return;

        // Close tooltip immediately
        setShowTooltip(false);
        setHoveredCellData(null);
        if (tooltipTimeoutRef.current) {
            clearTimeout(tooltipTimeoutRef.current);
        }

        // If clicking the same cell, close modal
        if (selectedCellId === cell_id && showCellModal) {
            setShowCellModal(false);
            setSelectedCellId(null);
            return;
        }

        // Calculate cell position for modal placement
        const cellPos = calculateCellPosition(cell_id);
        
        // Set new cell and position
        setSelectedCellId(cell_id);
        setCellModalPosition({ 
            x: cellPos.x + cellPos.width + cellPos.width, // Position 1 cell further to the right (default)
            y: cellPos.centerY, // Center vertically with the cell
            cellWidth: cellPos.width,
            cellHeight: cellPos.height,
            cellX: cellPos.x, // Left edge of the cell (for fallback positioning)
            cellY: cellPos.y  // Top edge of the cell
        });
        setShowCellModal(true);
    }

    // Called when user picks a cell to move info to
    function handleMoveToCell(toCellId: string) {
        if (!moveFromCellId) return;
        // Call move API
        Inertia.post(route('staff.cell-info.move'), {
            from_cell_id: moveFromCellId,
            to_cell_id: toCellId
        }, {
            preserveScroll: true,
            onSuccess: (page) => {
                // If flash data present, update only the two cells
                const flash = (page.props.flash || {}) as any;
                if (flash.moved_cell_info && flash.moved_from_cell_id) {
                    const moved = flash.moved_cell_info;
                    const fromId = flash.moved_from_cell_id;
                    setCellsInfo(prev => {
                        // Remove old cell info, add/update new one
                        const filtered = prev.filter(info => info.cell_id !== fromId && info.cell_id !== moved.cell_id);
                        return [...filtered, moved];
                    });
                }
                setMoveFromCellId(null);
            },
            onFinish: () => {
                setMoveFromCellId(null);
            }
        });
    }

    function handleCloseModal() {
        setShowCellModal(false);
        setSelectedCellId(null);
    }

    // Called from CellEditModal when move is requested
    function handleRequestMove(fromCellId: string) {
        setShowCellModal(false);
        setSelectedCellId(null);
        setMoveFromCellId(fromCellId);
    }

    // Get cell info for the selected cell
    const selectedCell = selectedCellId ? cells.find(c => c.cell_id === selectedCellId) : null;
    const selectedCellInfo = selectedCellId ? cellsInfo.find(info => info.cell_id === selectedCellId) : undefined;

    // mapLength, mapWidth, categories, and cells now come from state, updated in real-time

    // Highlight empty cells in move mode
    const moveModeHighlightCell = moveFromCellId
        ? (cell: Cell) => {
            const hasInfo = cellsInfo.some(info => info.cell_id === cell.cell_id);
            return !hasInfo;
        }
        : undefined;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex flex-col items-center justify-center w-full h-full min-h-[60vh] p-4 py-2" style={{ boxSizing: 'border-box'}}>
                <div className="w-full h-full flex items-center justify-center" style={{ width: '100%', height: '100%', boxSizing: 'border-box' }}>
                    <div ref={gridRef} className="w-full h-full">
                        <Grid
                            mapLength={mapLength}
                            mapWidth={mapWidth}
                            categories={categories}
                            cells={cells}
                            cellsInfo={cellsInfo}
                            onCellMouseEnter={handleMouseEnter}
                            onCellMouseLeave={handleMouseLeave}
                            onCellClick={handleCellClick}
                            highlightedCell={selectedCellId || undefined}
                            borderColor="input"
                        // highlightCell={moveModeHighlightCell}
                        />
                    </div>
                </div>

                {/* Tooltip: Only show cell name for selected cells when not hovering over the cell with open modal */}
                {showTooltip && hoveredCellData && hoveredCellData.status === 'selected' && hoveredCellData.name && !(showCellModal && selectedCellId === hoveredCellData.cell_id) && (
                    <div
                        className="fixed z-40 px-2 py-1 text-xs font-medium text-primary bg-sidebar border-1 border-foreground rounded shadow-lg pointer-events-none cursor-pointer"
                        style={{
                            left: `${tooltipPosition.x}px`,
                            top: `${tooltipPosition.y}px`,
                            transform: 'translate(-100%, -100%)',
                        }}
                    >
                        {hoveredCellData.name}
                    </div>
                )}

                {/* Cell Edit Modal */}
                {showCellModal && selectedCellId && selectedCell && (
                    <CellEditModal
                        open={showCellModal}
                        onClose={handleCloseModal}
                        cellId={selectedCellId}
                        cellName={selectedCell.name}
                        position={cellModalPosition}
                        existingData={selectedCellInfo}
                        onRequestMove={handleRequestMove}
                        onCellInfoDeleted={(cellId) => {
                            setCellsInfo(prev => prev.filter(info => info.cell_id !== cellId));
                        }}
                    />
                )}
            </div>
            <style>{`
                :root {
                    --box-border: var(--muted-foreground);
                }
                html.dark :root {
                    --box-border: var(--muted-foreground);
                }
            `}</style>
        </AppLayout>
    );
}
