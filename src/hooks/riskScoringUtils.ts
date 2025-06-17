
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

  // Calculate total paid from date-based payment columns
  const totalPaid =
    (loan["30-05-2025"] || 0) +
    (loan["31-05-2025"] || 0) +
    (loan["02-06-2025"] || 0) +
    (loan["04-06-2025"] || 0) +
    (loan["05-06-2025"] || 0) +
    (loan["07-06-2025"] || 0) +
    (loan["10-06-2025"] || 0) +
    (loan["11-06-2025"] || 0) +
    (loan["12-06-2025"] || 0) +
    (loan["13-06-2025"] || 0) +
    (loan["14-06-2025"] || 0) +
    (loan["16-06-2025"] || 0);

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

  // Negative payment anomaly - check date-based columns
  const dateBasedPayments = [
    loan["30-05-2025"], loan["31-05-2025"], loan["02-06-2025"], 
    loan["04-06-2025"], loan["05-06-2025"], loan["07-06-2025"],
    loan["10-06-2025"], loan["11-06-2025"], loan["12-06-2025"],
    loan["13-06-2025"], loan["14-06-2025"], loan["16-06-2025"]
  ];

  dateBasedPayments.forEach((amt, idx) => {
    if ((amt || 0) < 0) {
      score -= 10;
      risk_factors[`negative_payment_${idx + 1}`] = true;
    }
  });

  // Payment frequency anomaly
  const nonZeroPaymentsCount = dateBasedPayments.filter((amt) => (amt || 0) > 0).length;

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
