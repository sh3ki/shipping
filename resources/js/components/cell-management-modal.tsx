import React, { useState, useEffect } from 'react';
import { FiEye, FiTrash2, FiEdit3 } from 'react-icons/fi';
import { MdKeyboardArrowLeft, MdKeyboardArrowRight, MdKeyboardDoubleArrowLeft, MdKeyboardDoubleArrowRight } from 'react-icons/md';
import { route } from 'ziggy-js';
import { router } from '@inertiajs/react';
import Modal from './ui/modal';
import ConfirmationModal from './ui/confirmation-modal';

export type Category = {
  primary_id: number;
  name: string;
  color: string;
  direction: string;
};

export type Cell = {
  cell_id: string;
  name?: string;
  category_id?: number;
  status: string;
};

interface CellManagementModalProps {
  open: boolean;
  onClose: () => void;
  cells: Cell[];
  categories: Category[];
  onRefresh: () => void;
}

export default function CellManagementModal({ open, onClose, cells, categories, onRefresh }: CellManagementModalProps) {
  const [showAddCell, setShowAddCell] = useState(false);
  const [showEditCell, setShowEditCell] = useState(false);
  const [editCell, setEditCell] = useState<Cell | null>(null);
  const [showViewCell, setShowViewCell] = useState(false);
  const [viewCell, setViewCell] = useState<Cell | null>(null);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [deleteCellId, setDeleteCellId] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  // Add/Edit form states
  const [cellName, setCellName] = useState('');
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [status, setStatus] = useState('inactive');
  const [errors, setErrors] = useState<{ name?: string; category_id?: string; status?: string }>({});

  // Reset form
  const resetForm = () => {
    setCellName('');
    setCategoryId(undefined);
    setStatus('inactive');
    setErrors({});
    setEditCell(null);
  };

  // Open edit modal
  const openEditCellModal = (cell: Cell) => {
    setEditCell(cell);
    setCellName(cell.name || '');
    setCategoryId(cell.category_id);
    setStatus(cell.status);
    setShowEditCell(true);
  };

  // Open view modal
  const openViewCellModal = (cell: Cell) => {
    setViewCell(cell);
    setShowViewCell(true);
  };

  // Handle delete
  const handleDeleteClick = (cellId: string) => {
    setDeleteCellId(cellId);
    setShowConfirmDeleteModal(true);
  };
  const handleDeleteCell = () => {
    if (!deleteCellId) return;
    setProcessing(true);
    router.delete(route('admin.cells.destroy', { id: deleteCellId }), {
      preserveScroll: true,
      onSuccess: () => {
        setShowConfirmDeleteModal(false);
        setDeleteCellId(null);
        onRefresh();
      },
      onFinish: () => setProcessing(false),
    });
  };

  // Handle add/edit
  const handleSaveCell = () => {
    if (!cellName.trim()) {
      setErrors({ name: 'Cell name is required' });
      return;
    }
    if (!categoryId) {
      setErrors({ category_id: 'Category is required' });
      return;
    }
    setProcessing(true);
    setErrors({});
    const formData = {
      name: cellName,
      category_id: categoryId,
      status,
    };
    if (showEditCell && editCell) {
      router.put(route('admin.cells.update', { id: editCell.cell_id }), formData, {
        preserveScroll: true,
        onSuccess: () => {
          setShowEditCell(false);
          resetForm();
          onRefresh();
        },
        onFinish: () => setProcessing(false),
      });
    } else {
      router.post(route('admin.cells.store'), formData, {
        preserveScroll: true,
        onSuccess: () => {
          setShowAddCell(false);
          resetForm();
          onRefresh();
        },
        onFinish: () => setProcessing(false),
      });
    }
  };

  // Get color from category
  const getCategoryColor = (catId?: number) => {
    const cat = categories.find(c => c.primary_id === catId);
    return cat ? cat.color : '#ccc';
  };

  // Pagination state
  const [page, setPage] = useState(1);
  const pageSize = 100;
  const sortedCells = [...cells].sort((a, b) => {
    const catA = categories.find(c => c.primary_id === a.category_id);
    const catB = categories.find(c => c.primary_id === b.category_id);
    // 1. Sort by category name (alphabetical, empty last)
    if (catA && catB) {
      if (catA.name.toLowerCase() < catB.name.toLowerCase()) return -1;
      if (catA.name.toLowerCase() > catB.name.toLowerCase()) return 1;
    } else if (catA && !catB) {
      return -1;
    } else if (!catA && catB) {
      return 1;
    }
    // 2. Sort by cell_id (row-major: 1_1, 1_2, 2_1, ...)
    const parseCellId = (cellId) => {
      const [row, col] = cellId.split('_').map(Number);
      return { row: isNaN(row) ? 0 : row, col: isNaN(col) ? 0 : col };
    };
    const aId = parseCellId(a.cell_id);
    const bId = parseCellId(b.cell_id);
    if (aId.row !== bId.row) return aId.row - bId.row;
    return aId.col - bId.col;
  });
  const totalPages = Math.ceil(sortedCells.length / pageSize);
  const paginatedCells = sortedCells.slice((page - 1) * pageSize, page * pageSize);

  // Main modal
  if (open && !showAddCell && !showEditCell && !showViewCell) {
    return (
      <>
        <Modal open={open} onClose={onClose} title={<div className="flex items-center justify-center gap-2 text-lg font-semibold text-foreground">
              <span>Cell Management</span>
            </div>}>
          <div className="space-y-2">
            <div className="max-h-80 overflow-y-auto rounded-lg border border-border bg-card shadow-sm">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold text-primary">Cell Name</th>
                    <th className="px-4 py-2 text-center font-semibold text-primary">Category</th>
                    <th className="px-4 py-2 text-center font-semibold text-primary">Color</th>
                    <th className="px-4 py-2 text-center font-semibold text-primary">Cell Location</th>
                    <th className="px-4 py-2 text-center font-semibold text-primary">Status</th>
                    <th className="px-4 py-2 text-center font-semibold text-primary">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCells.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-3 text-center text-muted-foreground">No cells found</td>
                    </tr>
                  ) : (
                    paginatedCells.map(cell => {
                      const cat = categories.find(c => c.primary_id === cell.category_id);
                      return (
                        <tr key={cell.cell_id} className="hover:bg-muted/60 transition-colors">
                          <td className="px-4 py-2 align-middle text-center">{cell.name}</td>
                          <td className="px-4 py-2 align-middle text-center text-primary">{cat?.name || '-'}</td>
                          <td className="px-4 py-2 align-middle text-center">
                            <span className="inline-block w-5 h-5 rounded border border-border " style={{ backgroundColor: cat?.color || '#ccc' }} />
                          </td>
                          <td className="px-4 py-2 align-middle text-center text-primary">{cell.cell_id}</td>
                          <td className="px-4 py-2 align-middle text-center text-primary">{cell.status}</td>
                          <td className="px-4 py-2 align-middle text-center">
                            <div className="flex gap-3 justify-center">
                              <button title="View" className="text-green-800 hover:text-green-400 transition-colors" onClick={() => openViewCellModal(cell)}><FiEye /></button>
                              <button title="Edit" className="text-blue-800 hover:text-blue-400 transition-colors" onClick={() => openEditCellModal(cell)}><FiEdit3 /></button>
                              <button title="Delete" className="text-red-800 hover:text-red-400 transition-colors" onClick={() => handleDeleteClick(cell.cell_id)}><FiTrash2 /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination UI */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 pt-2">
                <button
                  className="p-1 rounded border border-border bg-muted text-primary disabled:opacity-50"
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  title="First Page"
                >
                  <MdKeyboardDoubleArrowLeft size={22} />
                </button>
                <button
                  className="p-1 rounded border border-border bg-muted text-primary disabled:opacity-50"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  title="Previous Page"
                >
                  <MdKeyboardArrowLeft size={22} />
                </button>
                <span className="text-sm font-medium text-primary">
                  Page {page} of {totalPages}
                </span>
                <button
                  className="p-1 rounded border border-border bg-muted text-primary disabled:opacity-50"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  title="Next Page"
                >
                  <MdKeyboardArrowRight size={22} />
                </button>
                <button
                  className="p-1 rounded border border-border bg-muted text-primary disabled:opacity-50"
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                  title="Last Page"
                >
                  <MdKeyboardDoubleArrowRight size={22} />
                </button>
              </div>
            )}
            <div className="flex justify-end pt-4">
              <button onClick={() => setShowAddCell(true)} className="px-4 py-1.5 text-sm font-semibold rounded-md border border-muted-foreground bg-primary-foreground text-primary shadow hover:bg-primary hover:text-primary-foreground transition-colors">Add Cell</button>
            </div>
          </div>
        </Modal>
        {/* Delete Confirmation Modal */}
        <ConfirmationModal open={showConfirmDeleteModal} onClose={() => setShowConfirmDeleteModal(false)} title="Delete Cell" description="Are you sure you want to delete this cell?" confirmText="Delete" confirmColor="red" onConfirm={handleDeleteCell} processing={processing} />
      </>
    );
  }

  // Add/Edit Cell Modal
  if (showAddCell || (showEditCell && editCell)) {
    const isEdit = showEditCell && editCell;
    return (
      <Modal open={showAddCell || showEditCell} onClose={() => { setShowAddCell(false); setShowEditCell(false); resetForm(); }} title={<span className="text-lg font-semibold">{isEdit ? 'Edit Cell' : 'Add Cell'}</span>}>
        <form className="space-y-2" onSubmit={e => { e.preventDefault(); handleSaveCell(); }}>
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input type="text" value={cellName} onChange={e => setCellName(e.target.value)} placeholder="Enter cell name" required className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground bg-background" />
            {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select value={categoryId || ''} onChange={e => setCategoryId(Number(e.target.value))} required className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground bg-background">
              <option value="">Select category</option>
              {categories.map(cat => (
                <option key={cat.primary_id} value={cat.primary_id}>{cat.name}</option>
              ))}
            </select>
            {errors.category_id && <p className="text-destructive text-xs mt-1">{errors.category_id}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Color</label>
            <div className="flex items-center gap-2">
              <span className="inline-block w-5 h-5 rounded border border-border" style={{ backgroundColor: getCategoryColor(categoryId) }} />
              <span className="text-xs">{getCategoryColor(categoryId)}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)} required className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground bg-background">
              <option value="inactive">Inactive</option>
              <option value="selected">Selected</option>
            </select>
            {errors.status && <p className="text-destructive text-xs mt-1">{errors.status}</p>}
          </div>
          <div className="flex justify-center pt-4">
            <button type="submit" disabled={processing} className="px-10 py-1.5 text-sm font-semibold rounded-md border border-muted-foreground bg-primary-foreground text-primary shadow hover:bg-primary hover:text-primary-foreground transition-colors">{processing ? (isEdit ? 'Updating...' : 'Saving...') : isEdit ? 'Update Cell' : 'Save Cell'}</button>
          </div>
        </form>
      </Modal>
    );
  }

  // View Cell Modal
  if (showViewCell && viewCell) {
    const cat = categories.find(c => c.primary_id === viewCell.category_id);
    return (
      <Modal open={showViewCell} onClose={() => setShowViewCell(false)} title={<span className="text-lg font-semibold">View Cell</span>}>
        <div className="space-y-2">
          <div><strong>Name:</strong> {viewCell.name}</div>
          <div><strong>Category:</strong> {cat?.name || '-'}</div>
          <div><strong>Color:</strong> <span className="inline-block w-5 h-5 rounded border border-border" style={{ backgroundColor: cat?.color || '#ccc' }} /> {cat?.color || '-'}</div>
          <div><strong>Cell Location (ID):</strong> {viewCell.cell_id}</div>
          <div><strong>Status:</strong> {viewCell.status}</div>
        </div>
      </Modal>
    );
  }

  return null;
}
