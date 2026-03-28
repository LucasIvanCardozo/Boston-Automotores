import { sileo } from 'sileo';

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'error' | 'warning' | 'info';
}

// Store active confirmation callbacks
const activeConfirmations = new Map<string, { resolve: (value: boolean) => void }>();

/**
 * Show a confirmation dialog using sileo
 * Returns a promise that resolves to true if confirmed, false if cancelled
 */
export function confirm({
  title,
  description = '',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'warning',
}: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    const confirmationId = Math.random().toString(36).substring(7);
    
    // Store the resolve function
    activeConfirmations.set(confirmationId, { resolve });
    
    const id = sileo.show({
      title,
      description,
      type,
      duration: null, // Don't auto-dismiss
      button: {
        title: confirmText,
        onClick: () => {
          activeConfirmations.delete(confirmationId);
          sileo.dismiss(id);
          resolve(true);
        },
      },
      styles: {
        button: type === 'error' 
          ? 'bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded' 
          : 'bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded',
      },
    });

    // Handle dismiss/cancel by clicking outside or auto-dismiss
    // We need to poll to check if notification was dismissed
    const checkDismissed = setInterval(() => {
      // If notification is no longer visible and wasn't confirmed
      if (!activeConfirmations.has(confirmationId)) {
        clearInterval(checkDismissed);
        return;
      }
      
      // Check if still in active confirmations after a reasonable time
      // This is a workaround since sileo doesn't have a direct onDismiss callback
    }, 500);

    // Auto-resolve to false after 30 seconds (user didn't interact)
    setTimeout(() => {
      if (activeConfirmations.has(confirmationId)) {
        activeConfirmations.delete(confirmationId);
        clearInterval(checkDismissed);
        sileo.dismiss(id);
        resolve(false);
      }
    }, 30000);
  });
}

/**
 * Dismiss all active confirmations
 */
export function dismissAllConfirmations() {
  activeConfirmations.forEach(({ resolve }) => resolve(false));
  activeConfirmations.clear();
  sileo.clear();
}

/**
 * Show a success notification
 */
export function notifySuccess(title: string, description?: string) {
  return sileo.success({
    title,
    description,
    duration: 4000,
  });
}

/**
 * Show an error notification
 */
export function notifyError(title: string, description?: string) {
  return sileo.error({
    title,
    description,
    duration: 6000,
  });
}

/**
 * Show a warning notification
 */
export function notifyWarning(title: string, description?: string) {
  return sileo.warning({
    title,
    description,
    duration: 5000,
  });
}

/**
 * Show an info notification
 */
export function notifyInfo(title: string, description?: string) {
  return sileo.info({
    title,
    description,
    duration: 4000,
  });
}

/**
 * Show a loading notification, returns the id to update/dismiss
 */
export function notifyLoading(title: string, description?: string) {
  return sileo.show({
    title,
    description,
    type: 'loading',
    duration: null, // Don't auto-dismiss
  });
}

/**
 * Update a notification by id
 */
export function updateNotification(
  id: string,
  type: 'success' | 'error' | 'warning' | 'info',
  title: string,
  description?: string
) {
  sileo.dismiss(id);
  
  switch (type) {
    case 'success':
      return notifySuccess(title, description);
    case 'error':
      return notifyError(title, description);
    case 'warning':
      return notifyWarning(title, description);
    case 'info':
      return notifyInfo(title, description);
  }
}

/**
 * Dismiss a notification by id
 */
export function dismissNotification(id: string) {
  sileo.dismiss(id);
}

/**
 * Clear all notifications
 */
export function clearNotifications() {
  sileo.clear();
}
