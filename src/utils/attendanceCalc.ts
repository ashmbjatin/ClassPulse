import type { RiskLevel, PerformanceTrend, TestScore } from '../types';

/**
 * Calculates the exact number of consecutive classes a student must attend 
 * to bring their attendance percentage up to the required threshold (default 85%).
 */
export function calculateClassesToRecover(
  attended: number,
  total: number,
  targetThresholdPct: number = 85
): number {
  if (total === 0) return 0;
  const currentPct = (attended / total) * 100;
  if (currentPct >= targetThresholdPct) return 0;

  const thresholdDecimal = targetThresholdPct / 100;
  const required = Math.ceil(
    (thresholdDecimal * total - attended) / (1 - thresholdDecimal)
  );

  return Math.max(0, required);
}

/**
 * Computes current attendance percentage rounded to 1 decimal place.
 */
export function calculateAttendancePct(attended: number, total: number): number {
  if (total === 0) return 0;
  return Number(((attended / total) * 100).toFixed(1));
}

/**
 * Determines trend from historical test scores.
 */
export function calculateMarksTrend(scores: TestScore[]): PerformanceTrend {
  if (!scores || scores.length < 2) return 'stable';
  const recent = scores[scores.length - 1].score;
  const previous = scores[scores.length - 2].score;
  const diff = recent - previous;

  if (diff <= -5) return 'falling';
  if (diff >= 5) return 'improving';
  return 'stable';
}

/**
 * Determines holistic student risk level.
 */
export function determineRiskLevel(
  attendancePct: number,
  currentMarks: number,
  marksTrend: PerformanceTrend
): RiskLevel {
  const lowAttendance = attendancePct < 85;
  const criticalAttendance = attendancePct < 75;
  const lowMarks = currentMarks < 60;
  const criticalMarks = currentMarks < 50;
  const isFalling = marksTrend === 'falling';

  if (criticalAttendance && (criticalMarks || isFalling)) {
    return 'CRITICAL';
  }
  if (criticalAttendance || (lowAttendance && lowMarks) || (criticalMarks && isFalling)) {
    return 'HIGH';
  }
  if (lowAttendance || lowMarks || isFalling) {
    return 'MODERATE';
  }
  return 'LOW';
}
