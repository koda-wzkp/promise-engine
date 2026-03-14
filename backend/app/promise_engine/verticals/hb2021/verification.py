"""HB 2021 Verification Logic - Emissions trajectory and promise verification.

The core verifier: given a utility's actual emissions reduction percentage
and the current year, determine whether they're on track to meet their
statutory targets (80% by 2030, 90% by 2035, 100% by 2040).

Uses linear interpolation between targets to compute expected trajectory.
"""

from dataclasses import dataclass
from typing import Dict, Optional

from app.promise_engine.core.models import VerificationResult, PromiseResult


# Statutory targets from HB 2021 §3(1)
TARGETS = [
    (2030, 80.0),
    (2035, 90.0),
    (2040, 100.0),
]

BASELINE_YEAR = 2012
BASELINE_REDUCTION = 0.0


@dataclass
class TrajectoryPoint:
    """A point on the expected emissions reduction trajectory."""
    year: int
    expected_reduction_pct: float
    next_target_year: int
    next_target_pct: float
    years_remaining: int


class EmissionsTrajectoryVerifier:
    """Verifies whether a utility is on track to meet HB 2021 emissions targets.

    Linear interpolation between statutory milestones:
        Baseline (2012, 0%) → (2030, 80%) → (2035, 90%) → (2040, 100%)

    A utility is "on track" if its actual reduction is within `tolerance_pct`
    of the interpolated expected value for the current year.
    """

    def __init__(self, tolerance_pct: float = 5.0):
        self.tolerance_pct = tolerance_pct

    def expected_reduction(self, year: int) -> TrajectoryPoint:
        """Calculate the expected emissions reduction for a given year.

        Interpolates linearly between the baseline and statutory targets.
        """
        if year <= BASELINE_YEAR:
            return TrajectoryPoint(
                year=year,
                expected_reduction_pct=0.0,
                next_target_year=2030,
                next_target_pct=80.0,
                years_remaining=2030 - year,
            )

        if year >= 2040:
            return TrajectoryPoint(
                year=year,
                expected_reduction_pct=100.0,
                next_target_year=2040,
                next_target_pct=100.0,
                years_remaining=0,
            )

        # Build segment list: baseline → each target
        milestones = [(BASELINE_YEAR, BASELINE_REDUCTION)] + list(TARGETS)

        for i in range(len(milestones) - 1):
            start_year, start_pct = milestones[i]
            end_year, end_pct = milestones[i + 1]

            if start_year <= year <= end_year:
                # Linear interpolation within this segment
                progress = (year - start_year) / (end_year - start_year)
                expected = start_pct + progress * (end_pct - start_pct)

                return TrajectoryPoint(
                    year=year,
                    expected_reduction_pct=round(expected, 1),
                    next_target_year=end_year,
                    next_target_pct=end_pct,
                    years_remaining=end_year - year,
                )

        # Shouldn't reach here, but handle gracefully
        return TrajectoryPoint(
            year=year,
            expected_reduction_pct=100.0,
            next_target_year=2040,
            next_target_pct=100.0,
            years_remaining=max(0, 2040 - year),
        )

    def verify(
        self,
        actual_reduction_pct: float,
        reporting_year: int,
        utility_id: Optional[str] = None,
    ) -> VerificationResult:
        """Verify whether a utility's emissions reduction is on trajectory.

        Args:
            actual_reduction_pct: The utility's actual % reduction from baseline.
            reporting_year: The year of the emissions data.
            utility_id: Optional identifier for the utility.

        Returns:
            VerificationResult with kept/broken status and trajectory details.
        """
        trajectory = self.expected_reduction(reporting_year)
        gap = trajectory.expected_reduction_pct - actual_reduction_pct

        details = {
            "utility_id": utility_id,
            "reporting_year": reporting_year,
            "actual_reduction_pct": actual_reduction_pct,
            "expected_reduction_pct": trajectory.expected_reduction_pct,
            "gap_pct": round(gap, 1),
            "next_target_year": trajectory.next_target_year,
            "next_target_pct": trajectory.next_target_pct,
            "years_remaining": trajectory.years_remaining,
            "tolerance_pct": self.tolerance_pct,
        }

        if gap <= self.tolerance_pct:
            return VerificationResult(
                kept=True,
                result=PromiseResult.KEPT,
                details=details,
            )
        else:
            severity = "critical" if gap > 30 else "major" if gap > 15 else "minor"
            return VerificationResult(
                kept=False,
                result=PromiseResult.BROKEN,
                violation=f"Behind trajectory by {gap:.1f}% (tolerance: {self.tolerance_pct}%)",
                details={**details, "severity": severity},
            )

    def project_trajectory(
        self,
        actual_reduction_pct: float,
        actual_year: int,
        annual_rate: Optional[float] = None,
    ) -> Dict[int, float]:
        """Project future emissions reductions based on current pace.

        If annual_rate is not provided, calculates it from baseline to current.

        Returns dict of {year: projected_reduction_pct} for target years.
        """
        if annual_rate is None:
            years_elapsed = actual_year - BASELINE_YEAR
            if years_elapsed > 0:
                annual_rate = actual_reduction_pct / years_elapsed
            else:
                annual_rate = 0.0

        projections = {}
        for target_year, target_pct in TARGETS:
            years_ahead = target_year - actual_year
            if years_ahead <= 0:
                projected = actual_reduction_pct
            else:
                projected = actual_reduction_pct + (annual_rate * years_ahead)
            projections[target_year] = {
                "projected_pct": round(min(projected, 100.0), 1),
                "target_pct": target_pct,
                "gap_pct": round(max(target_pct - projected, 0), 1),
                "on_track": projected >= target_pct,
            }

        return projections
