import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import ConfirmationModal from './confirmation-modal';

type CellInfo = {
  cell_id: string;
  shipping_line?: string;
  size?: string;
  type?: string;
  cell_status?: string;
};

type CellEditModalProps = {
  open: boolean;
  onClose: () => void;
  cellId: string;
  cellName?: string;
  position: { 
    x: number; 
    y: number; 
    cellWidth: number; 
    cellHeight: number; 
    cellX: number; 
    cellY: number; 
  };
  existingData?: CellInfo;
};

const SHIPPING_LINES = [
  'BENLINE - HARBOUR LINK',
  'BENLINE - MBF CARPENTER',
  'BLPL',
  'CONCORDE',
  'COSCO',
  'ENTERPHIL',
  'ELAN INTERNATIONAL',
  'EW INTERNATIONAL',
  'KYOWA',
  'LANCER',
  'MSC',
  'NAMSUNG',
  'NEW ZEALAND',
  'OOCL',
  'PENEX / ORCHID',
  'RCL',
  'SAMUDERA / M STAR',
  'SEAFRONT',
  'SWIRE SHIPPING PTE LTD',
  'TAEWOONG'
];

const SIZES = ['1 x 40', '1 x 20'];

const TYPES = [
  'DRY HIGH CUBE',
  'DRY STANDARD',
  'REEFER',
  'FLAT RACK',
  'OPEN TOP'
];

const CELL_STATUSES = [
  'Available',
  'For Repair',
  'Pending Approval EOR',
  'Damaged'
];

export default function CellEditModal({ 
  open, 
  onClose, 
  cellId, 
  cellName, 
  position, 
  existingData 
}: CellEditModalProps) {
  const [formData, setFormData] = useState({
    shipping_line: existingData?.shipping_line || '',
    size: existingData?.size || '',
    type: existingData?.type || '',
    cell_status: existingData?.cell_status || 'Available'
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'save' | 'update' | 'move' | 'delete' | null>(null);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });

  const hasExistingData = Boolean(existingData?.shipping_line || existingData?.size || existingData?.type);

  // Calculate modal position based on cell position
  React.useEffect(() => {
    if (!open) return;

    const modalWidth = 320; // w-80 = 20rem = 320px
    const modalHeight = 400; // Approximate modal height
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const maxWidth = viewportWidth * 0.9; // 90% of viewport width
    const maxHeight = viewportHeight * 0.85; // 85% of viewport height

    let x = position.x; // Default: Place modal's left border at the cell's right border
    let y = position.y - modalHeight / 2; // Center vertically with the cell

    // Check if modal fits to the right (preferred position)
    if (x + modalWidth > maxWidth) {
      // If it doesn't fit on the right, place modal 1 cell further to the left of the cell
      x = position.cellX - modalWidth - position.cellWidth;
      
      // If it doesn't fit to the left either, fallback to viewport constraints
      if (x < 0) {
        x = Math.max(10, maxWidth - modalWidth - 10); // Small margin from edges
      }
    }

    // Ensure modal doesn't exceed viewport bounds vertically
    if (y < 10) {
      y = 10; // Small margin from top
    } else if (y + modalHeight > maxHeight) {
      y = maxHeight - modalHeight - 10; // Small margin from bottom
    }

    // Final constraint: ensure modal stays within viewport
    x = Math.max(10, Math.min(x, viewportWidth - modalWidth - 10));
    y = Math.max(10, Math.min(y, viewportHeight - modalHeight - 10));

    setModalPosition({ x, y });
  }, [open, position]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setFormData({
        shipping_line: existingData?.shipping_line || '',
        size: existingData?.size || '',
        type: existingData?.type || '',
        cell_status: existingData?.cell_status || 'Available'
      });
      setErrors({});
    }
  }, [open, existingData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.shipping_line) {
      newErrors.shipping_line = 'Shipping line is required';
    }
    if (!formData.size) {
      newErrors.size = 'Size is required';
    }
    if (!formData.type) {
      newErrors.type = 'Type is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;
    
    setProcessing(true);
    
    const data = {
      cell_id: cellId,
      ...formData
    };

    router.post(route('staff.cell-info.store'), data, {
      preserveScroll: true,
      onSuccess: () => {
        onClose();
        setProcessing(false);
      },
      onError: (errors) => {
        setErrors(errors);
        setProcessing(false);
      }
    });
  };

  const handleUpdate = () => {
    if (!validateForm()) return;
    
    setProcessing(true);
    
    router.put(route('staff.cell-info.update', { cell_id: cellId }), formData, {
      preserveScroll: true,
      onSuccess: () => {
        onClose();
        setProcessing(false);
      },
      onError: (errors) => {
        setErrors(errors);
        setProcessing(false);
      }
    });
  };

  const handleMove = () => {
    // TODO: Implement move functionality
    console.log('Move functionality to be implemented');
    setShowConfirmModal(false);
  };

  const handleDelete = () => {
    setProcessing(true);
    
    router.delete(route('staff.cell-info.destroy', { cell_id: cellId }), {
      preserveScroll: true,
      onSuccess: () => {
        onClose();
        setProcessing(false);
        setShowConfirmModal(false);
      },
      onError: () => {
        setProcessing(false);
        setShowConfirmModal(false);
      }
    });
  };

  const handleConfirmAction = () => {
    switch (confirmAction) {
      case 'save':
        handleSave();
        break;
      case 'update':
        handleUpdate();
        break;
      case 'move':
        handleMove();
        break;
      case 'delete':
        handleDelete();
        break;
    }
    setShowConfirmModal(false);
  };

  const getActionButtons = () => {
    if (hasExistingData) {
      return (
        <div className="flex justify-center gap-3 pt-4">
          <button
            type="button"
            onClick={() => {
              setConfirmAction('update');
              setShowConfirmModal(true);
            }}
            disabled={processing}
            className="px-6 py-2 text-sm font-semibold rounded-md border border-primary bg-primary text-primary-foreground shadow hover:bg-primary/90 transition-colors"
          >
            {processing ? 'Updating...' : 'Update'}
          </button>
          <button
            type="button"
            onClick={() => {
              setConfirmAction('move');
              setShowConfirmModal(true);
            }}
            disabled={processing}
            className="px-6 py-2 text-sm font-semibold rounded-md border border-muted-foreground bg-background text-foreground shadow hover:bg-muted transition-colors"
          >
            Move
          </button>
          <button
            type="button"
            onClick={() => {
              setConfirmAction('delete');
              setShowConfirmModal(true);
            }}
            disabled={processing}
            className="px-6 py-2 text-sm font-semibold rounded-md border border-destructive bg-destructive text-destructive-foreground shadow hover:bg-destructive/90 transition-colors"
          >
            Delete
          </button>
        </div>
      );
    } else {
      return (
        <div className="flex justify-center pt-4">
          <button
            type="button"
            onClick={() => {
              setConfirmAction('save');
              setShowConfirmModal(true);
            }}
            disabled={processing}
            className="px-8 py-2 text-sm font-semibold rounded-md border border-primary bg-primary text-primary-foreground shadow hover:bg-primary/90 transition-colors"
          >
            {processing ? 'Saving...' : 'Save'}
          </button>
        </div>
      );
    }
  };

  const getConfirmationContent = () => {
    switch (confirmAction) {
      case 'save':
        return {
          title: 'Save Cell Data',
          description: 'Are you sure you want to save this cell information?',
          confirmText: 'Save'
        };
      case 'update':
        return {
          title: 'Update Cell Data',
          description: 'Are you sure you want to update this cell information?',
          confirmText: 'Update'
        };
      case 'move':
        return {
          title: 'Move Cell Data',
          description: 'Are you sure you want to move this cell data? This functionality is coming soon.',
          confirmText: 'Move'
        };
      case 'delete':
        return {
          title: 'Delete Cell Data',
          description: 'Are you sure you want to delete this cell information? This action cannot be undone.',
          confirmText: 'Delete'
        };
      default:
        return {
          title: 'Confirm Action',
          description: 'Are you sure you want to proceed?',
          confirmText: 'Confirm'
        };
    }
  };

  const getFormContent = () => {
    return (
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        {/* Shipping Line */}
        <div>
          <label className="block text-sm font-medium mb-1">Shipping Line</label>
          <select
            value={formData.shipping_line}
            onChange={(e) => handleInputChange('shipping_line', e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md bg-background shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/30 text-foreground"
          >
            <option value="">Select shipping line</option>
            {SHIPPING_LINES.map((line) => (
              <option key={line} value={line}>
                {line}
              </option>
            ))}
          </select>
          {errors.shipping_line && (
            <p className="text-destructive text-xs mt-1">{errors.shipping_line}</p>
          )}
        </div>

        {/* Size */}
        <div>
          <label className="block text-sm font-medium mb-1">Size</label>
          <select
            value={formData.size}
            onChange={(e) => handleInputChange('size', e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md bg-background shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/30 text-foreground"
          >
            <option value="">Select size</option>
            {SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          {errors.size && (
            <p className="text-destructive text-xs mt-1">{errors.size}</p>
          )}
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium mb-1">Type</label>
          <select
            value={formData.type}
            onChange={(e) => handleInputChange('type', e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md bg-background shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/30 text-foreground"
          >
            <option value="">Select type</option>
            {TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors.type && (
            <p className="text-destructive text-xs mt-1">{errors.type}</p>
          )}
        </div>

        {/* Cell Status */}
        <div>
          <label className="block text-sm font-medium mb-1">Cell Status</label>
          <select
            value={formData.cell_status}
            onChange={(e) => handleInputChange('cell_status', e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md bg-background shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/30 text-foreground"
          >
            {CELL_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        {getActionButtons()}
      </form>
    );
  };

  if (!open) return null;

  return (
    <>
      {/* Modal positioned adjacent to the selected cell */}
      <div 
        className="fixed z-50 pointer-events-none"
        style={{
          left: `${modalPosition.x}px`,
          top: `${modalPosition.y}px`,
        }}
      >
        <div className="pointer-events-auto">
          <div
            className="relative bg-background rounded-2xl shadow-2xl border border-border p-6 sm:p-8 sm:pb-4 flex flex-col items-stretch w-80 max-w-[90vw] max-h-[85vh] overflow-y-auto animate-in fade-in-0 zoom-in-95"
          >
            {/* Close button top right */}
            <button
              className="absolute top-2 right-4 text-3xl text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
              onClick={onClose}
              aria-label="Close"
            >
              <span aria-hidden>×</span>
            </button>
            
            {/* Title */}
            <div className="mb-6">
              <div className="text-center">
                <div className="text-lg font-semibold text-foreground">
                  {cellName || cellId}
                </div>
                <div className="text-sm text-muted-foreground">
                  Cell Information
                </div>
              </div>
            </div>

            {/* Form Content */}
            <div className="flex-1">{getFormContent()}</div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        open={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmAction}
        {...getConfirmationContent()}
        processing={processing}
      />
    </>
  );
}
