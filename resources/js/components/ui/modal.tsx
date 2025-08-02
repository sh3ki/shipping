import React from 'react';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

const Modal = ({ open, onClose, title, children, className }: ModalProps) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className={`relative mx-auto bg-background rounded-2xl shadow-2xl border border-border p-6 sm:p-8 sm:pb-4 flex flex-col items-stretch min-w-[350px] max-h-[90vh] overflow-y-auto animate-in fade-in-0 zoom-in-95 ${className || 'w-3/5 max-w-full'}`}
      >
        {/* Close button top right */}
        <button
          className="absolute top-2 right-4 text-3xl text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
          onClick={onClose}
          aria-label="Close"
        >
          <span aria-hidden>×</span>
        </button>
        {title && <div className="mb-6">{title}</div>}
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
};
export default Modal;
