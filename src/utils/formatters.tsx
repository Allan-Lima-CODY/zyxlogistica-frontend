// Format phone number to (XX) XXXXX-XXXX or (XX) XXXX-XXXX
export const formatPhone = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  
  if (numbers.length <= 10) {
    // (XX) XXXX-XXXX
    return numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .substring(0, 14);
  } else {
    // (XX) XXXXX-XXXX
    return numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .substring(0, 15);
  }
};

// Remove all non-numeric characters
export const unformatPhone = (value: string): string => {
  return value.replace(/\D/g, '');
};

// Format CNH to XXXXXXXXXXX (11 digits)
export const formatCNH = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  return numbers.substring(0, 11);
};

// Format license plate - allows letters and numbers, max 7 characters
export const formatLicensePlate = (value: string): string => {
  const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return cleaned.substring(0, 7);
};

// Format year to XXXX (4 digits)
export const formatYear = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  return numbers.substring(0, 4);
};

// Format price like bank inputs - fills from right to left starting with cents
// Example: "1" -> "0,01", "123" -> "1,23", "12345" -> "123,45"
export const formatPriceInput = (value: string): string => {
  // Remove all non-numeric characters
  const numbers = value.replace(/\D/g, '');
  
  // If empty, return empty
  if (!numbers) return '';
  
  // Convert to number and divide by 100 to get cents
  const amount = parseInt(numbers, 10) / 100;
  
  // Format with 2 decimal places, using comma as decimal separator
  return amount.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Convert formatted price input back to decimal number
// Example: "1.234,56" -> 1234.56, "123,45" -> 123.45
export const unformatPriceInput = (value: string): number => {
  // Remove all non-numeric characters
  const numbers = value.replace(/\D/g, '');
  
  // If empty, return 0
  if (!numbers) return 0;
  
  // Divide by 100 to get the decimal value
  return parseInt(numbers, 10) / 100;
};
