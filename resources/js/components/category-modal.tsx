import React, { useState, useEffect } from 'react';
import { FiEye, FiTrash2, FiEdit3 } from 'react-icons/fi';
import { route } from 'ziggy-js';
import { router } from '@inertiajs/react';
import Modal from './ui/modal';
import ConfirmationModal from './ui/confirmation-modal';
import ViewCellsModal from './ui/view-cells-modal';
import DirectionDropdown from './ui/direction-dropdown';
import SelectCellsModal from './ui/select-cells-modal';

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

interface CategoryModalProps {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  cells: Cell[];
  mapLength: number;
  mapWidth: number;
  onRefresh: () => void;
}

export default function CategoryModal({ open, onClose, categories, cells, mapLength, mapWidth, onRefresh }: CategoryModalProps) {
  const [showViewCells, setShowViewCells] = useState(false);
  const [viewCellIds, setViewCellIds] = useState<string[]>([]);
  // Confirmation modal for update category
  const [showConfirmUpdateModal, setShowConfirmUpdateModal] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState(false);
  // Confirmation modal for delete category
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [deleteCategoryId, setDeleteCategoryId] = useState<number | null>(null);
  // Handle delete button click
  const handleDeleteClick = (categoryId: number) => {
    setDeleteCategoryId(categoryId);
    setShowConfirmDeleteModal(true);
  };

  // Handle actual delete
  const handleDeleteCategory = () => {
    if (!deleteCategoryId) return;
    setProcessing(true);
    router.delete(route('admin.categories.destroy', { id: deleteCategoryId }), {
      preserveScroll: true,
      onSuccess: () => {
        setShowConfirmDeleteModal(false);
        setDeleteCategoryId(null);
        onRefresh(); // Optionally keep this if you want to close modal, but do not reload
        // No reload: UI will update via real-time event
      },
      onError: () => {
        setProcessing(false);
      },
      onFinish: () => {
        setProcessing(false);
      }
    });
  };
  // Hide the inner color swatch box for the color input
  const colorInputStyle = `\n    input[type='color'].custom-color::-webkit-color-swatch-wrapper {\n      padding: 0;\n      border-radius: 0.375rem; /* match rounded-md */\n    }\n    input[type='color'].custom-color::-webkit-color-swatch {\n      border: none;\n      border-radius: 0.375rem; /* match rounded-md */\n      padding: 0;\n    }\n    input[type='color'].custom-color::-moz-color-swatch {\n      border: none;\n      border-radius: 0.375rem;\n      padding: 0;\n    }\n  `;
  // Main modal states
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showEditCategory, setShowEditCategory] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [showSelectCells, setShowSelectCells] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [color, setColor] = useState('#2563eb');
  const [direction, setDirection] = useState('upward');
  const [description, setDescription] = useState('');
  const [selectedCells, setSelectedCells] = useState<string[]>([]);
  const [displayCells, setDisplayCells] = useState<string[]>([]);

  // UI states
  const [errors, setErrors] = useState<{ name?: string; cells?: string; general?: string }>({});
  const [processing, setProcessing] = useState(false);

  // Reset form when add or edit category modal closes
  useEffect(() => {
    if (!showAddCategory && !showEditCategory) {
      resetForm();
    }
  }, [showAddCategory, showEditCategory]);

  const resetForm = () => {
    setName('');
    setColor('#2563eb');
    setDirection('upward');
    setDescription('');
    setSelectedCells([]);
    setDisplayCells([]);
    setErrors({});
    setEditCategory(null);
  };

  const validateForm = () => {
    const newErrors: { name?: string; cells?: string } = {};
    if (!name.trim()) {
      newErrors.name = 'Category name is required';
    }
    if (selectedCells.length === 0) {
      newErrors.cells = 'Please select at least one cell';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveCategory = async () => {
    if (!validateForm()) return;
    setProcessing(true);
    setErrors({});
    try {
      // Check uniqueness
      const uniqueRes = await fetch(route('admin.categories.check_unique'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        },
        body: JSON.stringify({ name }),
      });
      const uniqueData = await uniqueRes.json();
      if (!uniqueData.unique) {
        setErrors({ name: 'Category name must be unique' });
        setProcessing(false);
        return;
      }
    } catch (err) {
      console.error('Error checking uniqueness:', err);
      setProcessing(false);
      return;
    }
    // Save category and assign cells
    const formData = {
      name,
      color,
      direction,
      description,
      cell_ids: selectedCells,
      map_length: mapLength,
      map_width: mapWidth,
    };
    router.post(route('admin.categories.store'), formData, {
      preserveScroll: true,
      onSuccess: () => {
        setShowAddCategory(false);
        setShowSelectCells(false);
        onClose(); // Close the main modal as well
        resetForm();
        // No reload: UI will update via real-time event
      },
      onError: (errors) => {
        setErrors(errors as { name?: string; cells?: string; general?: string });
      },
      onFinish: () => {
        setProcessing(false);
      }
    });
  };

  // Edit Category logic
  const openEditCategoryModal = (category: Category) => {
    setEditCategory(category);
    setName(category.name);
    setColor(category.color);
    setDirection(category.direction);
    setDescription(category.description || '');
    // Get cell IDs for this category
    const cellIds = cells.filter(cell => cell.category_id === category.primary_id).map(cell => cell.cell_id);
    setSelectedCells(cellIds);
    setDisplayCells([...cellIds].sort((a, b) => {
      const [l1, w1] = a.split('_').map(Number);
      const [l2, w2] = b.split('_').map(Number);
      if (l1 !== l2) return l1 - l2;
      return w1 - w2;
    }));
    setShowEditCategory(true);
  };

  const handleUpdateCategory = async () => {
    if (!validateForm()) return;
    setProcessing(true);
    setErrors({});
    try {
      // Check uniqueness, but allow current name
      if (name !== editCategory?.name) {
        const uniqueRes = await fetch(route('admin.categories.check_unique'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
          },
          body: JSON.stringify({ name }),
        });
        const uniqueData = await uniqueRes.json();
        if (!uniqueData.unique) {
          setErrors({ name: 'Category name must be unique' });
          setProcessing(false);
          return;
        }
      }
    } catch (err) {
      console.error('Error checking uniqueness:', err);
      setProcessing(false);
      return;
    }
    // Update category and assign cells
    const formData = {
      name,
      color,
      direction,
      description,
      cell_ids: selectedCells,
      map_length: mapLength,
      map_width: mapWidth,
    };
    router.post(route('admin.categories.update', { id: editCategory?.primary_id }), formData, {
      preserveScroll: true,
      onSuccess: () => {
        setShowEditCategory(false);
        setShowSelectCells(false);
        onClose();
        resetForm();
        router.reload({ only: ['categories', 'cells'] });
      },
      onError: (errors) => {
        setErrors(errors as { name?: string; cells?: string; general?: string });
      },
      onFinish: () => {
        setProcessing(false);
      }
    });
  };

  const handleSelectCells = (cellIds: string[]) => {
    setSelectedCells([...cellIds]);
    const sortedForDisplay = [...cellIds].sort((a, b) => {
      const [l1, w1] = a.split('_').map(Number);
      const [l2, w2] = b.split('_').map(Number);
      if (l1 !== l2) return l1 - l2;
      return w1 - w2;
    });
    setDisplayCells(sortedForDisplay);
  };

  const handleSelectCellsClick = () => {
    setShowSelectCells(true);
  };

  // Category Management Modal (Main)
  if (open && !showAddCategory && !showEditCategory) {
    return (
      <>
        <Modal
          open={open}
          onClose={onClose}
          title={
            <div className="flex items-center justify-center gap-2 text-lg font-semibold text-foreground">
              <span>Category Management</span>
            </div>
          }
        >
          <div className="space-y-2">
            {/* Categories Table */}
            <div className="max-h-80 overflow-y-auto rounded-lg border border-border bg-card shadow-sm">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold text-primary">Name</th>
                    <th className="px-4 py-2 text-center font-semibold text-primary">Color</th>
                    <th className="px-4 py-2 text-center font-semibold text-primary">Direction</th>
                    <th className="px-4 py-2 text-center font-semibold text-primary">Quantity</th>
                    <th className="px-4 py-2 text-center font-semibold text-primary">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-3 text-center text-muted-foreground">No categories found</td>
                    </tr>
                  ) : (
                    categories.map((category) => {
                      // Find cell IDs for this category
                      const cellIds = cells.filter(cell => cell.category_id === category.primary_id).map(cell => cell.cell_id);
                      return (
                        <tr key={category.primary_id} className="hover:bg-muted/60 transition-colors">
                          <td className="px-4 py-2 align-middle text-primary">{category.name}</td>
                          <td className="px-4 py-2 align-middle text-primary">
                            <div className="flex items-center gap-2 justify-center">
                              <span className="inline-block w-5 h-5 rounded border border-border " style={{ backgroundColor: category.color }} />
                              <span className="text-xs text-primary">{category.color}</span>
                            </div>
                          </td>
                          <td className="px-4 py-2 align-middle text-center text-primary">{category.direction}</td>
                          <td className="px-4 py-2 align-middle text-center text-primary">{category.cells_count || 0}</td>
                          <td className="px-4 py-2 align-middle text-center">
                            <div className="flex gap-3 justify-center">
                              <button
                                title="View"
                                className="text-green-800 hover:text-green-400 transition-colors"
                                onClick={() => {
                                  setViewCellIds(cellIds);
                                  setShowViewCells(true);
                                }}
                              >
                                <FiEye />
                              </button>
                              <button
                                title="Edit"
                                className="text-blue-800 hover:text-blue-400 transition-colors"
                                onClick={() => openEditCategoryModal(category)}
                              >
                                <FiEdit3 />
                              </button>
                              <button
                                title="Delete"
                                className="text-red-800 hover:text-red-400  transition-colors"
                                onClick={() => handleDeleteClick(category.primary_id)}
                              >
                                <FiTrash2 />
                              </button>
        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          open={showConfirmDeleteModal}
          onClose={() => setShowConfirmDeleteModal(false)}
          title="Delete Category"
          description="Are you sure you want to delete this category? This will also unassign all related cells."
          confirmText="Delete"
          confirmColor="red"
          onConfirm={handleDeleteCategory}
          processing={processing}
        />
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            {/* Add Category Button */}
            <div className="flex justify-end pt-4">
              <button
                onClick={() => setShowAddCategory(true)}
                className="px-4 py-1.5 text-sm font-semibold rounded-md border border-muted-foreground bg-primary-foreground text-primary shadow hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                Add Category
              </button>
            </div>
          </div>
        </Modal>
        {/* View Cells Modal */}
        <ViewCellsModal
          open={showViewCells}
          onClose={() => setShowViewCells(false)}
          cells={cells}
          categories={categories}
          mapLength={mapLength}
          mapWidth={mapWidth}
          cellIds={viewCellIds}
        />
      </>
    );
  }

  // Add Category Modal
  if (showAddCategory) {
    return (
      <>
        <Modal
          open={showAddCategory}
          onClose={() => setShowAddCategory(false)}
          className="w-full max-w-1/3"
          title={
            <div className="flex items-center justify-center gap-2 text-lg font-semibold text-foreground">
              <span>Add Category</span>
            </div>
          }
        >
          <form className="space-y-2" onSubmit={e => { e.preventDefault(); handleSaveCategory(); }}>
            {/* Name Input */}
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter category name"
                required
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground bg-background"
              />
              {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
            </div>

            <div className='flex flex-row justify-between'>
              {/* Color Picker */}
              <div>
                <label className="block text-sm font-medium mb-1">Color</label>
                <div className="flex items-center gap-2">
                  <>
                    <style>{colorInputStyle}</style>
                    <input
                      type="color"
                      value={color}
                      onChange={e => setColor(e.target.value)}
                      className="w-10 h-10 rounded-md border-2 border-border cursor-pointer transition-all duration-100 hover:scale-110 hover:border-primary appearance-none custom-color"
                      style={{ background: color, appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none' }}
                    />
                  </>
                  <input
                    type="text"
                    value={color}
                    onChange={e => setColor(e.target.value)}
                    placeholder="#2563eb"
                    className="px-3 py-2 w-35 border border-border rounded-md bg-background shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/30 text-foreground"
                  />
                </div>
              </div>
              {/* Direction Dropdown */}
              <div>
                <label className="block text-sm font-medium mb-1">Direction</label>
                <DirectionDropdown
                  value={direction}
                  onChange={setDirection}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-1">Description (Optional)</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Enter category description"
                className="w-full px-3 py-2 border border-border rounded-md bg-background shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/30 text-foreground"
                rows={2}
              />
            </div>

            {/* Selected Cells Display */}
            <div>
              <label className="block text-sm font-medium mb-1">Selected Cells</label>
              <div className="flex gap-2">
                <textarea
                  value={displayCells.join(', ')}
                  readOnly
                  placeholder="No cells selected"
                  className="flex-1 px-3 py-2 border border-border rounded-md bg-muted text-muted-foreground shadow-sm focus:outline-none"
                  rows={2}
                />
                <button
                  type="button"
                  onClick={handleSelectCellsClick}
                  className="px-3 py-1.5 text-sm font-semibold rounded-md border border-muted-foreground bg-primary-foreground text-primary shadow hover:bg-primary hover:text-primary-foreground transition-colors focus:outline-none h-fit"
                >
                  Select Cells
                </button>
              </div>
              {errors.cells && <p className="text-destructive text-xs mt-1">{errors.cells}</p>}
            </div>

            {errors.general && (
              <div className="text-destructive text-xs">{errors.general}</div>
            )}

            {/* Save Category Button */}
            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={processing}
                className="px-10 py-1.5 text-sm font-semibold rounded-md border border-muted-foreground bg-primary-foreground text-primary shadow hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {processing ? 'Saving...' : 'Save Category'}
              </button>
            </div>
          </form>
        </Modal>

        {/* Select Cells Modal */}
        <SelectCellsModal
          open={showSelectCells}
          onClose={() => setShowSelectCells(false)}
          cells={cells}
          categories={categories}
          onSave={handleSelectCells}
          mapLength={mapLength}
          mapWidth={mapWidth}
          preSelectedCells={selectedCells}
        />
      </>
    );
  }

  // Edit Category Modal
  if (showEditCategory && editCategory) {
    return (
      <>
        <Modal
          open={showEditCategory}
          onClose={() => setShowEditCategory(false)}
          className="w-full max-w-1/3"
          title={
            <div className="flex items-center justify-center gap-2 text-lg font-semibold text-foreground">
              <span>Edit Category</span>
            </div>
          }
        >
          <form className="space-y-2" onSubmit={e => { e.preventDefault(); setShowConfirmUpdateModal(true); setPendingUpdate(true); }}>
            {/* Name Input */}
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter category name"
                required
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground bg-background"
              />
              {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
            </div>

            <div className='flex flex-row justify-between'>
              {/* Color Picker */}
              <div>
                <label className="block text-sm font-medium mb-1">Color</label>
                <div className="flex items-center gap-2">
                  <>
                    <style>{colorInputStyle}</style>
                    <input
                      type="color"
                      value={color}
                      onChange={e => setColor(e.target.value)}
                      className="w-10 h-10 rounded-md border-2 border-border cursor-pointer transition-all duration-100 hover:scale-110 hover:border-primary appearance-none custom-color"
                      style={{ background: color, appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none' }}
                    />
                  </>
                  <input
                    type="text"
                    value={color}
                    onChange={e => setColor(e.target.value)}
                    placeholder="#2563eb"
                    className="px-3 py-2 w-35 border border-border rounded-md bg-background shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/30 text-foreground"
                  />
                </div>
              </div>
              {/* Direction Dropdown */}
              <div>
                <label className="block text-sm font-medium mb-1">Direction</label>
                <DirectionDropdown
                  value={direction}
                  onChange={setDirection}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-1">Description (Optional)</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Enter category description"
                className="w-full px-3 py-2 border border-border rounded-md bg-background shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/30 text-foreground"
                rows={2}
              />
            </div>

            {/* Selected Cells Display */}
            <div>
              <label className="block text-sm font-medium mb-1">Selected Cells</label>
              <div className="flex gap-2">
                <textarea
                  value={displayCells.join(', ')}
                  readOnly
                  placeholder="No cells selected"
                  className="flex-1 px-3 py-2 border border-border rounded-md bg-muted text-muted-foreground shadow-sm focus:outline-none"
                  rows={2}
                />
                <button
                  type="button"
                  onClick={handleSelectCellsClick}
                  className="px-3 py-1.5 text-sm font-semibold rounded-md border border-muted-foreground bg-primary-foreground text-primary shadow hover:bg-primary hover:text-primary-foreground transition-colors focus:outline-none h-fit"
                >
                  Select Cells
                </button>
              </div>
              {errors.cells && <p className="text-destructive text-xs mt-1">{errors.cells}</p>}
            </div>

            {errors.general && (
              <div className="text-destructive text-xs">{errors.general}</div>
            )}

            {/* Update Category Button */}
            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={processing}
                className="px-10 py-1.5 text-sm font-semibold rounded-md border border-muted-foreground bg-primary-foreground text-primary shadow hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {processing ? 'Updating...' : 'Update Category'}
              </button>
            </div>
          </form>
        </Modal>

        {/* Confirmation Modal for Update Category */}
        <ConfirmationModal
          open={showConfirmUpdateModal}
          onClose={() => { setShowConfirmUpdateModal(false); setPendingUpdate(false); }}
          onConfirm={() => { setShowConfirmUpdateModal(false); setPendingUpdate(false); handleUpdateCategory(); }}
          title="Update Category?"
          description="Are you sure you want to update this category and its assigned cells? This action will overwrite previous assignments."
          confirmText="Update"
          cancelText="Cancel"
          processing={processing}
        />

        {/* Select Cells Modal */}
        <SelectCellsModal
          open={showSelectCells}
          onClose={() => setShowSelectCells(false)}
          cells={cells}
          categories={categories}
          onSave={handleSelectCells}
          mapLength={mapLength}
          mapWidth={mapWidth}
          preSelectedCells={selectedCells}
          allowToggleSelected={true}
          toggleCategoryId={editCategory.primary_id}
        />
      </>
    );
  }

  return null;
}
