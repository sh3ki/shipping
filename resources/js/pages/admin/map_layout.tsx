import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import echo from '../../lib/echo';
import { Inertia, Method } from '@inertiajs/inertia';
import CategoryModal, { Category, Cell } from '@/components/category-modal';
import { Grid } from '@/components/Grid';
import Modal from '@/components/ui/modal';
import ConfirmationModal from '@/components/ui/confirmation-modal';
import React from 'react';

import { router } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Map Layout',
        href: '/admin/map_layout',
    },
];

type AdminMapLayoutProps = {
    map_length?: number;
    map_width?: number;
    categories?: Category[];
    cells?: Cell[];
};

export default function AdminMapLayout(props: AdminMapLayoutProps) {
    // Real-time update: listen for DimensionsUpdated and CategoryCreated events
    const [categories, setCategories] = useState<Category[]>(props.categories || []);
    const [cells, setCells] = useState<Cell[]>(props.cells || []);
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
    const [showModal, setShowModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    // const [hoveredCell, setHoveredCell] = useState<string | null>(null);
    const [hoveredCellData, setHoveredCellData] = useState<Cell | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

    // Confirmation modal state (move to top level)
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // Form state for dimension modal
    // Local state for modal form to avoid main content re-render
    const [dimensionForm, setDimensionForm] = useState({
        map_length: props.map_length?.toString() ?? '',
        map_width: props.map_width?.toString() ?? '',
    });
    const [dimensionErrors, setDimensionErrors] = useState<{ map_length?: string; map_width?: string }>({});
    const [dimensionProcessing, setDimensionProcessing] = useState(false);

    // Function to refresh data
    function handleRefresh() {
        window.location.reload();
    }

    function handleDimensionInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        // Allow empty string, only allow digits
        if (value === '' || /^\d+$/.test(value)) {
            setDimensionForm(prev => ({ ...prev, [name]: value }));
            setDimensionErrors(prev => ({ ...prev, [name]: undefined }));
        }
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        // Validate
        const errors: { map_length?: string; map_width?: string } = {};
        if (!dimensionForm.map_length) {
            errors.map_length = 'Please fill out this field.';
        } else if (parseInt(dimensionForm.map_length) < 1) {
            errors.map_length = 'Value must be at least 1.';
        }
        if (!dimensionForm.map_width) {
            errors.map_width = 'Please fill out this field.';
        } else if (parseInt(dimensionForm.map_width) < 1) {
            errors.map_width = 'Value must be at least 1.';
        }
        setDimensionErrors(errors);
        if (Object.keys(errors).length > 0) return;

        setShowConfirmModal(true);
        setPendingDimensionSubmit(true);
    }

    function handleConfirmSaveDimensions() {
        setDimensionProcessing(true);
        setShowConfirmModal(false);
        setPendingDimensionSubmit(false);
        router.post(route('admin.map_layout.save'), {
            map_length: parseInt(dimensionForm.map_length),
            map_width: parseInt(dimensionForm.map_width),
        }, {
            onSuccess: () => {
                setShowModal(false);
                // No reload: let real-time event update dashboard
            },
            onError: (err: any) => {
                setDimensionErrors(err as { map_length?: string; map_width?: string });
            },
            onFinish: () => setDimensionProcessing(false),
            preserveScroll: true,
        });
    }

    const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    function handleMouseEnter(cell_id: string, cell: Cell | undefined, e: React.MouseEvent) {
        // Only show tooltip for cells with status 'selected'
        if (cell && cell.status === 'selected') {
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

    // Use grid from props for map size, but categories/cells from state for real-time
    const mapLength = props.map_length ?? 1;
    const mapWidth = props.map_width ?? 1;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Map Layout" />
            <div className="flex flex-col items-center justify-center w-full h-full min-h-[60vh] p-4 py-2" style={{ boxSizing: 'border-box'}}>
                {/* Top Buttons Section */}
                <div className="w-full flex justify-end gap-2 mb-2">
                    <button
                        type="button"
                        onClick={() => setShowCategoryModal(true)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-md border border-muted-foreground bg-primary-foreground text-primary shadow hover:bg-primary hover:text-primary-foreground transition-colors"
                        style={{ outline: 'none', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                    >
                        Category
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowModal(true)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-md border border-muted-foreground bg-primary-foreground text-primary shadow hover:bg-primary hover:text-primary-foreground transition-colors"
                        style={{ outline: 'none', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                    >
                        Dimension
                    </button>
                </div>

                {/* Dimension Modal */}
                {showModal && (
                    <Modal
                        open={showModal}
                        onClose={() => setShowModal(false)}
                        className="w-1/4 max-w-md"
                        title={
                            <div className="flex items-center justify-center gap-2 text-lg font-semibold text-foreground">
                                <span>Set Map Dimensions</span>
                            </div>
                        }
                    >
                        <form onSubmit={handleSubmit} className="space-y-3" autoComplete="off">
                            <div>
                                <label htmlFor="map_length" className="block text-sm font-medium mb-1">Length</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    name="map_length"
                                    id="map_length"
                                    value={dimensionForm.map_length}
                                    onChange={handleDimensionInputChange}
                                    className={`w-full px-3 py-2 border ${dimensionErrors.map_length ? 'border-red-500' : 'border-border'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground`}
                                />
                                {dimensionErrors.map_length && (
                                    <div className="text-xs text-red-500 mt-1">{dimensionErrors.map_length}</div>
                                )}
                            </div>
                            <div>
                                <label htmlFor="map_width" className="block text-sm font-medium mb-1">Width</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    name="map_width"
                                    id="map_width"
                                    value={dimensionForm.map_width}
                                    onChange={handleDimensionInputChange}
                                    className={`w-full px-3 py-2 border ${dimensionErrors.map_width ? 'border-red-500' : 'border-border'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground`}
                                />
                                {dimensionErrors.map_width && (
                                    <div className="text-xs text-red-500 mt-1">{dimensionErrors.map_width}</div>
                                )}
                            </div>
                            <div className="flex justify-center mt-6">
                                <button
                                    type="submit"
                                    className="px-4 py-1.5 text-sm font-semibold rounded-md border border-muted-foreground bg-primary-foreground text-primary shadow hover:bg-primary hover:text-primary-foreground transition-colors"
                                    disabled={dimensionProcessing}
                                >
                                    {dimensionProcessing ? 'Saving...' : 'Save Dimensions'}
                                </button>
                            </div>
                        </form>
                    </Modal>
                )}

                {/* Confirmation Modal for Save Dimensions */}
                <ConfirmationModal
                    open={showConfirmModal}
                    onClose={() => setShowConfirmModal(false)}
                    onConfirm={handleConfirmSaveDimensions}
                    title="Save Map Dimensions?"
                    description="Are you sure you want to save these map dimensions? This action may affect the current map layout."
                    confirmText="Save"
                    cancelText="Cancel"
                    processing={dimensionProcessing}
                />

                {/* Category Management Modal */}
                <CategoryModal
                    open={showCategoryModal}
                    onClose={() => setShowCategoryModal(false)}
                    categories={categories}
                    cells={cells}
                    mapLength={mapLength}
                    mapWidth={mapWidth}
                    onRefresh={handleRefresh}
                />

                {/* Main Grid with cell status and category color */}
                <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ width: '100%', height: '100%', boxSizing: 'border-box' }}
                >
                    <Grid
                        mapLength={mapLength}
                        mapWidth={mapWidth}
                        categories={categories}
                        cells={cells}
                        onCellMouseEnter={handleMouseEnter}
                        onCellMouseLeave={handleMouseLeave}
                        borderColor="ring"
                    />
                </div>

                {/* Tooltip: Only show cell name for selected cells */}
                {showTooltip && hoveredCellData && hoveredCellData.status === 'selected' && hoveredCellData.name && (
                    <div
                        className="fixed z-50 px-2 py-1 text-xs font-medium text-primary bg-sidebar border-1 border-foreground rounded shadow-lg pointer-events-none"
                        style={{
                            left: `${tooltipPosition.x}px`,
                            top: `${tooltipPosition.y}px`,
                            transform: 'translate(-100%, -100%)',
                        }}
                    >
                        {hoveredCellData.name}
                    </div>
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
