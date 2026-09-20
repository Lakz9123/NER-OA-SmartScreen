export function escapeCsvField(value: any): string {
  if (value === null || value === undefined) {
    return '""';
  }
  
  let strValue = String(value);

  // Prevent CSV injection
  if (/^[=+\-@]/.test(strValue)) {
    strValue = "'" + strValue;
  }

  // Escape double quotes by replacing " with ""
  strValue = strValue.replace(/"/g, '""');

  // Wrap the entire field in double quotes
  return `"${strValue}"`;
}
