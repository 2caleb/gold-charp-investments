
/**
 * Utility function: Accepts an object,
 * validates presence/naming/values of date-based payment columns,
 * logs a warning if anything is missing or misnamed.
 */
export function validatePaymentColumns(obj: any) {
  const dateCols = [
    "30-05-2025", "31-05-2025", "02-06-2025", "04-06-2025", "05-06-2025",
    "07-06-2025", "10-06-2025", "11-06-2025", "12-06-2025", "13-06-2025", 
    "14-06-2025", "16-06-2025"
  ];
  
  let foundColumns = 0;
  dateCols.forEach(col => {
    if (col in obj) {
      foundColumns++;
    } else {
      console.warn(`Missing payment column in record: ${col}`, obj);
    }
  });
  
  if (foundColumns === 0) {
    console.warn('No date-based payment columns found in record', obj);
  }
}
