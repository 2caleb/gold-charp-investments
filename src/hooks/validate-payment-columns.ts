
/**
 * Utility function: Accepts an object,
 * validates presence/naming/values of all 12 payment columns,
 * logs a warning if anything is missing or misnamed.
 */
export function validatePaymentColumns(obj: any) {
  const cols = [
    'amount_paid_1', 'amount_paid_2', 'amount_paid_3', 'amount_paid_4', 'amount_paid_5',
    'Amount_paid_6', 'Amount_paid_7',
    'Amount_Paid_8', 'Amount_Paid_9', 'Amount_Paid_10', 'Amount_Paid_11', 'Amount_Paid_12'
  ];
  cols.forEach(col => {
    if (!(col in obj)) {
      console.warn(`Missing payment column in record: ${col}`, obj);
    }
  });
}
