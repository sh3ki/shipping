import React from 'react';
import Modal from './modal';
import { FiAlertCircle } from 'react-icons/fi';

interface ConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  icon?: React.ReactNode;
  processing?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description = '',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  icon,
  processing = false,
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      className="w-full max-w-sm"
      title={
        <div className="flex items-center justify-center gap-2 text-lg font-semibold text-foreground">
          {icon || <FiAlertCircle className="text-yellow-500 text-2xl" />}
          <span>{title}</span>
        </div>
      }
    >
      <div className="space-y-4 py-2">
        {description && (
          <div className="text-center text-muted-foreground text-sm">{description}</div>
        )}
        <div className="flex justify-center gap-4 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-1.5 text-sm font-semibold rounded-md border border-muted-foreground bg-background text-muted-foreground shadow hover:bg-muted transition-colors"
            disabled={processing}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-6 py-1.5 text-sm font-semibold rounded-md border border-primary bg-primary text-primary-foreground shadow hover:bg-primary-foreground hover:text-primary transition-colors"
            disabled={processing}
          >
            {processing ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
