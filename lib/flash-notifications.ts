/**
 * Flash notification system using in-memory store.
 * 
 * This provides a reliable way to show notifications after redirects,
 * replacing the fragile query-param pattern.
 * 
 * Usage:
 * 1. Before redirect: setFlashNotification('success', 'Operation completed')
 * 2. On target page mount: readFlashNotification() - returns notification or null
 */

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface FlashNotification {
  type: NotificationType;
  title: string;
  message: string;
}

/**
 * In-memory store for flash notifications.
 * Survives route changes via redirect but NOT page refresh.
 */
let flashNotification: FlashNotification | null = null;

/**
 * Set a flash notification before redirecting.
 * Call this BEFORE router.push() to ensure the notification survives the navigation.
 */
export function setFlashNotification(
  type: NotificationType,
  message: string,
  title?: string
): void {
  const defaultTitles: Record<NotificationType, string> = {
    success: 'Éxito',
    error: 'Error',
    warning: 'Advertencia',
    info: 'Información',
  };

  flashNotification = {
    type,
    message,
    title: title || defaultTitles[type],
  };
}

/**
 * Read and clear the flash notification.
 * Should be called once on component mount.
 * Returns the notification if one exists, then clears it.
 */
export function readFlashNotification(): FlashNotification | null {
  const notification = flashNotification;
  flashNotification = null;
  return notification;
}

/**
 * Peek at the flash notification without clearing it.
 */
export function peekFlashNotification(): FlashNotification | null {
  return flashNotification;
}

/**
 * Clear any pending flash notification.
 */
export function clearFlashNotification(): void {
  flashNotification = null;
}
