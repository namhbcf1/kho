import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../dialog';
import { Button } from '../button';
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';

const Modals = {
  // Base Modal
  Modal: ({ 
    isOpen, 
    onClose, 
    title, 
    children, 
    size = 'md',
    showCloseButton = true,
    className = ''
  }) => (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${size === 'sm' ? 'max-w-md' : size === 'lg' ? 'max-w-4xl' : size === 'xl' ? 'max-w-6xl' : 'max-w-2xl'} ${className}`}>
        {showCloseButton && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-4 top-4"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        {title && (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
        )}
        {children}
      </DialogContent>
    </Dialog>
  ),

  // Confirmation Modal
  ConfirmModal: ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title = "Confirm Action", 
    message = "Are you sure you want to proceed?",
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = 'default' // default, danger, warning
  }) => (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            {variant === 'danger' && <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />}
            {variant === 'warning' && <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />}
            {title}
          </DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {cancelText}
          </Button>
          <Button 
            variant={variant === 'danger' ? 'destructive' : 'default'} 
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),

  // Alert Modal
  AlertModal: ({ 
    isOpen, 
    onClose, 
    title, 
    message, 
    type = 'info' // info, success, warning, error
  }) => {
    const icons = {
      info: <Info className="h-5 w-5 text-blue-500" />,
      success: <CheckCircle className="h-5 w-5 text-green-500" />,
      warning: <AlertCircle className="h-5 w-5 text-yellow-500" />,
      error: <AlertTriangle className="h-5 w-5 text-red-500" />
    };

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              {icons[type]}
              <span className="ml-2">{title}</span>
            </DialogTitle>
            <DialogDescription>{message}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={onClose}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  },

  // Form Modal
  FormModal: ({ 
    isOpen, 
    onClose, 
    title, 
    children, 
    onSubmit, 
    submitText = "Save",
    cancelText = "Cancel",
    loading = false,
    size = 'md'
  }) => (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${size === 'sm' ? 'max-w-md' : size === 'lg' ? 'max-w-4xl' : 'max-w-2xl'}`}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="py-4">
            {children}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {cancelText}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : submitText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  ),

  // Loading Modal
  LoadingModal: ({ isOpen, message = "Loading..." }) => (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-sm">
        <div className="flex items-center justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
          <span>{message}</span>
        </div>
      </DialogContent>
    </Dialog>
  )
};

export default Modals; 