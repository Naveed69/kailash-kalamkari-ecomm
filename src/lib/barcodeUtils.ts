/**
 * Utility functions for barcode generation
 */

/**
 * Generates a unique barcode for a product
 * Format: KK-{TIMESTAMP}-{RANDOM}
 * Example: KK-1732693200-A7B3
 */
export function generateBarcode(): string {
  const timestamp = Date.now().toString(36).toUpperCase(); // Convert to base36 for shorter string
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `KK${timestamp}${random}`;
}

/**
 * Validates if a barcode follows the expected format
 */
export function isValidBarcode(barcode: string): boolean {
  // Format: KK followed by alphanumeric characters
  const regex = /^KK[A-Z0-9]+$/;
  return regex.test(barcode);
}
