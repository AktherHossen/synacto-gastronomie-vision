import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import MenuItemForm, { MenuItemFormData } from './MenuItemForm';

interface MenuItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: MenuItemFormData) => void;
  initialData?: Partial<MenuItemFormData>;
  title?: string;
}

const MenuItemModal: React.FC<MenuItemModalProps> = ({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  title
}) => {
  const handleSubmit = (data: MenuItemFormData) => {
    onSubmit(data);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const modalTitle = title || (initialData ? 'Edit Menu Item' : 'Add New Menu Item');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{modalTitle}</DialogTitle>
        </DialogHeader>
        <MenuItemForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          initialData={initialData}
        />
      </DialogContent>
    </Dialog>
  );
};

export default MenuItemModal; 