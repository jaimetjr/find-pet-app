/**
 * Date utility functions for handling date format conversions
 */

/**
 * Converts ISO date string (YYYY-MM-DD) to Brazilian format (DD/MM/YYYY)
 * @param isoDate - Date in ISO format (YYYY-MM-DD)
 * @returns Date in Brazilian format (DD/MM/YYYY) or empty string if invalid
 */
export const formatDateForDisplay = (isoDate: string): string => {
  if (!isoDate) return '';
  
  try {
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return '';
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Error formatting date for display:', error);
    return '';
  }
};

/**
 * Converts Brazilian date format (DD/MM/YYYY) to ISO format (YYYY-MM-DD)
 * @param brazilianDate - Date in Brazilian format (DD/MM/YYYY)
 * @returns Date in ISO format (YYYY-MM-DD) or empty string if invalid
 */
export const formatDateForBackend = (brazilianDate: string): string => {
  if (!brazilianDate) return '';
  
  try {
    // Check if it's already in ISO format
    if (brazilianDate.includes('-')) {
      return brazilianDate;
    }
    
    // Parse Brazilian format (DD/MM/YYYY)
    const parts = brazilianDate.split('/');
    if (parts.length !== 3) return '';
    
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    
    if (isNaN(day) || isNaN(month) || isNaN(year)) return '';
    
    // Validate date
    const date = new Date(year, month - 1, day);
    if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
      return '';
    }
    
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  } catch (error) {
    console.error('Error formatting date for backend:', error);
    return '';
  }
};

/**
 * Validates if a date string is in valid Brazilian format (DD/MM/YYYY)
 * @param dateString - Date string to validate
 * @returns true if valid, false otherwise
 */
export const isValidBrazilianDate = (dateString: string): boolean => {
  if (!dateString) return false;
  
  const formatted = formatDateForBackend(dateString);
  return formatted !== '';
}; 