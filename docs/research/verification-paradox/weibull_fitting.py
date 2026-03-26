"""
Weibull survival curve fitting for commitment dwell times.

Method described in:
  Nolan-Finkel, C. (2026). The Verification Paradox.

Usage:
  python weibull_fitting.py <csv_file> <dwell_time_column> <cohort_column>

The CSV should have one row per observation with at minimum:
  - A dwell time column (integer, number of periods in current status)
  - A cohort column (categorical, e.g. initial_status)

Output: k, λ, R² for each cohort with N >= 50 observations.
"""

import sys
import numpy as np
from scipy.optimize import curve_fit


def weibull_survival(tau, k, lam):
    """Weibull survival function: P(T > tau) = exp(-(tau/lam)^k)"""
    return np.exp(-(tau / lam) ** k)


def fit_weibull(dwell_times, min_n=50):
    """
    Fit Weibull k and λ to an array of dwell times via NLS
    on the empirical survival curve.

    Returns (k, λ, R²) or (None, None, None) if insufficient data.
    """
    dwell_times = np.array(dwell_times, dtype=float)
    dwell_times = dwell_times[dwell_times > 0]

    if len(dwell_times) < min_n:
        return None, None, None

    unique_t = np.sort(np.unique(dwell_times))
    n = len(dwell_times)
    surv = np.array([np.sum(dwell_times > t) / n for t in unique_t])

    mask = (surv > 0) & (surv < 1) & (unique_t > 0)
    if mask.sum() < 3:
        return None, None, None

    try:
        popt, _ = curve_fit(
            weibull_survival,
            unique_t[mask], surv[mask],
            p0=[0.5, 10],
            bounds=([0.01, 0.1], [3.0, 10000]),
            maxfev=5000
        )
        pred = weibull_survival(unique_t[mask], *popt)
        ss_res = np.sum((surv[mask] - pred) ** 2)
        ss_tot = np.sum((surv[mask] - np.mean(surv[mask])) ** 2)
        r2 = 1 - ss_res / ss_tot if ss_tot > 0 else 0
        return popt[0], popt[1], r2
    except (RuntimeError, ValueError):
        return None, None, None


def main():
    if len(sys.argv) < 4:
        print(__doc__)
        sys.exit(1)

    import pandas as pd

    csv_file = sys.argv[1]
    dwell_col = sys.argv[2]
    cohort_col = sys.argv[3]

    df = pd.read_csv(csv_file)

    print(f"{'Cohort':<35} {'k':>6} {'λ':>8} {'R²':>6} {'N':>7}")
    print("-" * 65)

    for cohort, group in sorted(df.groupby(cohort_col)):
        k, lam, r2 = fit_weibull(group[dwell_col].values)
        if k is not None:
            print(f"{str(cohort):<35} {k:6.3f} {lam:8.1f} {r2:6.3f} {len(group):7d}")


if __name__ == "__main__":
    main()
