
import { LoanBookLiveRecord } from "@/types/loan-book-live-record";

/**
 * Rule-based risk scoring.
 * Returns: { risk_score (0-100), default_probability (0-1), risk_level, risk_factors (explainable) }
 */
export function scoreLoanRisk(loan: LoanBookLiveRecord) {
  // Payment behavior as signals
  const daysSinceLoan = Math.max(
    1,
    Math.floor(
      (new Date().getTime() - new Date(loan.loan_date).getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );
  const monthsSinceLoan = Math.max(
    1,
    Math.floor(daysSinceLoan / 30)
  );
  const totalPaid =
    (loan.amount_paid_1 || 0) +
    (loan.amount_paid_2 || 0) +
    (loan.amount_paid_3 || 0) +
    (loan.amount_paid_4 || 0) +
    (loan.amount_paid_5 || 0) +
    (loan.Amount_paid_6 || 0) +
    (loan.Amount_paid_7 || 0) +
    (loan.Amount_Paid_8 || 0) +
    (loan.Amount_Paid_9 || 0) +
    (loan.Amount_Paid_10 || 0) +
    (loan.Amount_Paid_11 || 0) +
    (loan.Amount_Paid_12 || 0);

  const payment_ratio =
    loan.amount_returnable > 0
      ? totalPaid / loan.amount_returnable
      : 0;

  // Risk signals
  let score = 0;
  let risk_level: 'low' | 'medium' | 'high' | 'critical' = "low";
  const risk_factors: Record<string, any> = {};

  // Base: higher payments, lower risk
  score += Math.min(payment_ratio * 70, 70);

  // Lateness signal: months passed with low paid=> risky
  if (monthsSinceLoan > 3 && payment_ratio < monthsSinceLoan * 0.08) {
    score -= 20;
    risk_factors["late_payments"] = true;
  }

  // High outstanding ratio
  const outstanding_ratio =
    loan.amount_returnable > 0
      ? loan.remaining_balance / loan.amount_returnable
      : 1;
  if (outstanding_ratio > 0.8) {
    score -= 10;
    risk_factors["high_outstanding"] = true;
  }
  if (loan.status === "overdue") {
    score -= 25;
    risk_factors["overdue"] = true;
  }
  // Negative payment anomaly
  [
    loan.amount_paid_1, loan.amount_paid_2, loan.amount_paid_3, loan.amount_paid_4, loan.amount_paid_5,
    loan.Amount_paid_6, loan.Amount_paid_7, loan.Amount_Paid_8, loan.Amount_Paid_9, loan.Amount_Paid_10,
    loan.Amount_Paid_11, loan.Amount_Paid_12
  ].forEach((amt, idx) => {
    if ((amt || 0) < 0) {
      score -= 10;
      risk_factors[`negative_payment_${idx + 1}`] = true;
    }
  });

  // Payment frequency anomaly
  const nonZeroPaymentsCount = [
    loan.amount_paid_1,
    loan.amount_paid_2,
    loan.amount_paid_3,
    loan.amount_paid_4,
    loan.amount_paid_5,
    loan.Amount_paid_6,
    loan.Amount_paid_7,
    loan.Amount_Paid_8,
    loan.Amount_Paid_9,
    loan.Amount_Paid_10,
    loan.Amount_Paid_11,
    loan.Amount_Paid_12,
  ].filter((amt) => (amt || 0) > 0).length;

  if (monthsSinceLoan > 0 && nonZeroPaymentsCount / monthsSinceLoan < 0.5) {
    score -= 10;
    risk_factors["irregular_payments"] = true;
  }

  // Cap risk_score
  score = Math.max(0, Math.min(100, Math.round(score)));

  let default_prob = Math.max(0.01, 1 - score / 100); // simplistic

  if (score > 75) {
    risk_level = "low";
  } else if (score > 50) {
    risk_level = "medium";
  } else if (score > 30) {
    risk_level = "high";
  } else {
    risk_level = "critical";
  }

  return {
    risk_score: score,
    default_probability: parseFloat(default_prob.toFixed(2)),
    risk_level,
    risk_factors,
  };
}
