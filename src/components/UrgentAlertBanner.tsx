import React from 'react';
import type { StudentRiskRecord } from '../types';
import { AlertOctagon, ArrowRight } from 'lucide-react';
import { RiskBadge } from './Common/RiskBadge';

interface UrgentAlertBannerProps {
  students: StudentRiskRecord[];
  onSelectStudent: (student: StudentRiskRecord) => void;
  onNavigateToInterventions: () => void;
}

export const UrgentAlertBanner: React.FC<UrgentAlertBannerProps> = ({
  students,
  onSelectStudent,
  onNavigateToInterventions
}) => {
  const criticalStudents = students.filter(s => s.riskLevel === 'CRITICAL');
  const topPriorityStudent = criticalStudents.length > 0
    ? criticalStudents.sort((a, b) => a.attendancePct - b.attendancePct)[0]
    : students.filter(s => s.riskLevel === 'HIGH')[0] || students[0];

  if (!topPriorityStudent) return null;

  return (
    <div className="bg-red-950/90 text-red-100 border border-red-800 rounded-md p-4 mb-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-red-900 border border-red-700 rounded text-red-200 shrink-0 mt-0.5">
            <AlertOctagon className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-red-300">
                IMMEDIATE ACTION REQUIRED • PRIORITY INTERVENTION #1
              </span>
              <RiskBadge level={topPriorityStudent.riskLevel} size="sm" />
            </div>

            <h3 className="text-base font-bold text-white mt-0.5">
              {topPriorityStudent.name} ({topPriorityStudent.id}) &mdash; {topPriorityStudent.department}
            </h3>

            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-red-900/60 p-2.5 rounded border border-red-800/80">
              <div>
                <span className="font-semibold text-red-200 block text-[11px] uppercase tracking-wide">
                  WHY THEY NEED ATTENTION:
                </span>
                <p className="text-red-100 font-medium mt-0.5">
                  Attendance is <span className="font-mono font-bold underline">{topPriorityStudent.attendancePct}%</span> (Needs <span className="font-mono font-bold text-white">{topPriorityStudent.classesToRecover} consecutive classes</span> to hit 85%). Current Score: <span className="font-mono font-bold">{topPriorityStudent.currentMarks}%</span> ({topPriorityStudent.marksTrend} trend).
                </p>
              </div>

              <div>
                <span className="font-semibold text-red-200 block text-[11px] uppercase tracking-wide">
                  RECOMMENDED ACTION:
                </span>
                <p className="text-red-100 font-medium mt-0.5">
                  {topPriorityStudent.recommendedIntervention}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-row md:flex-col justify-end gap-2 shrink-0">
          <button
            onClick={() => onSelectStudent(topPriorityStudent)}
            className="px-3 py-2 bg-red-800 hover:bg-red-700 text-white rounded text-xs font-semibold border border-red-600 flex items-center justify-center space-x-1.5 transition"
          >
            <span>Review Full Profile</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onNavigateToInterventions}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded text-xs font-medium border border-slate-700 flex items-center justify-center space-x-1.5 transition"
          >
            <span>All {criticalStudents.length} Critical Actions</span>
          </button>
        </div>
      </div>
    </div>
  );
};
