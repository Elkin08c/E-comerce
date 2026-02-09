import { useState, useCallback } from 'react';

interface ConfirmationOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

interface ConfirmationModalState extends ConfirmationOptions {
  isOpen: boolean;
  onConfirm: (() => void) | null;
  isLoading: boolean;
}

export function useConfirmationModal() {
  const [modalState, setModalState] = useState<ConfirmationModalState>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    type: 'danger',
    onConfirm: null,
    isLoading: false
  });

  const showConfirmation = useCallback((options: ConfirmationOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        ...options,
        onConfirm: () => {
          setModalState(prev => ({ ...prev, isLoading: true }));
          resolve(true);
        },
        isLoading: false
      });
    });
  }, []);

  const hideConfirmation = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      isOpen: false,
      onConfirm: null,
      isLoading: false
    }));
  }, []);

  const handleConfirm = useCallback(() => {
    if (modalState.onConfirm) {
      modalState.onConfirm();
    }
  }, [modalState]);

  return {
    modalState,
    showConfirmation,
    hideConfirmation,
    handleConfirm
  };
}
