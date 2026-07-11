package billingexpr

import "math"

// QuotaRound converts a float64 quota value to int using half-away-from-zero
// rounding. Every tiered billing path (pre-consume, settlement, breakdown
// validation, log fields) MUST use this function to avoid +-1 discrepancies.
//
// It also saturates non-finite and out-of-range values so a malformed
// expression (e.g. division by zero producing NaN/Inf, or a discount that
// over-subtracts into the negative) can never yield a garbage quota via an
// undefined float->int conversion:
//   - NaN            -> 0
//   - negative       -> 0 (quota is never negative)
//   - +Inf / > MaxInt32 -> MaxInt32
func QuotaRound(f float64) int {
	if math.IsNaN(f) || f <= 0 {
		return 0
	}
	rounded := math.Round(f)
	if math.IsInf(rounded, 1) || rounded > math.MaxInt32 {
		return math.MaxInt32
	}
	return int(rounded)
}
