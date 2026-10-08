import React from 'react';
import type { StudentRiskRecord, SummaryMetrics, DepartmentRisk, SubjectRisk } from '../../types';
import { StatCard, RiskBadge, TrendIndicator } from '../Common/RiskBadge';
import { Users, AlertTriangle, TrendingDown, ShieldAlert, GraduationCap, BookOpen, ChevronRight, ArrowUpRight } from 'lucide-react';

interface OverviewSectionProps {
  summary: SummaryMetrics;
  students: StudentRiskRecord[];
  departmentRisks: DepartmentRisk[];
  subjectRisks: SubjectRisk[];
  onSelectStudent: (student: StudentRiskRecord) => void;
  onNavigateToTab: (tab: any) => void;
}

export const OverviewSection: React.FC<OverviewSectionProps> = ({
  summary,
  students,
  departmentRisks,
  subjectRisks,
  onSelectStudent,
  onNavigateToTab
}) => {
  const priorityAtRiskStudents = [...students]
    .filter(s => s.riskLevel === 'CRITICAL' || s.riskLevel === 'HIGH' || s.attendancePct < 85)
    .sort((a, b) => {
      const riskWeight = { CRITICAL: 4, HIGH: 3, MODERATE: 2, LOW: 1 };
      if (riskWeight[b.riskLevel] !== riskWeight[a.riskLevel]) {
        return riskWeight[b.riskLevel] - riskWeight[a.riskLevel];
      }
      return a.attendancePct - b.attendancePct;
    });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard
          title="Total Enrolled"
          value={summary.totalStudents}
          subtitle="Active cohorts analyzed"
          icon={<Users className="w-4 h-4 text-slate-500" />}
          onClick={() => onNavigateToTab('table')}
        />
        <StatCard
          title="Sub-85% Attendance"
          value={summary.belowAttendanceCount}
          subtitle="Near or below eligibility"
          icon={<AlertTriangle className="w-4 h-4 text-amber-600" />}
          variant="warning"
          onClick={() => onNavigateToTab('table')}
        />
        <StatCard
          title="High Academic Risk"
          value={summary.highAcademicRiskCount}
          subtitle="Score < 60% or critical risk"
          icon={<ShieldAlert className="w-4 h-4 text-red-600" />}
          variant="critical"
          onClick={() => onNavigateToTab('table')}
        />
        <StatCard
          title="Falling Marks Trend"
          value={summary.fallingMarksCount}
          subtitle="Declining performance trajectory"
          icon={<TrendingDown className="w-4 h-4 text-red-500" />}
          variant="critical"
          onClick={() => onNavigateToTab('table')}
        />
        <StatCard
          title="Immediate Interventions"
          value={summary.immediateInterventionCount}
          subtitle="Action required today"
          icon={<GraduationCap className="w-4 h-4 text-red-700" />}
          variant="critical"
          onClick={() => onNavigateToTab('interventions')}
        />
      </div>

      <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-serif">
              Priority Students Requiring Recovery & Intervention
            </h2>
            <p className="text-xs text-slate-500">
              Ranked by attendance recovery deficit and academic mark drop
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab('table')}
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center space-x-1"
          >
            <span>View Full Risk Table</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-200 overflow-x-auto">
          {priorityAtRiskStudents.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm font-medium">
              No students currently below required risk thresholds.
            </div>
          ) : (
            priorityAtRiskStudents.slice(0, 6).map(student => (
              <div
                key={student.id}
                onClick={() => onSelectStudent(student)}
                className="p-3.5 hover:bg-slate-50 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start space-x-3">
                  <div className="mt-1">
                    <RiskBadge level={student.riskLevel} size="sm" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-slate-900">{student.name}</span>
                      <span className="text-xs font-mono text-slate-500">({student.id})</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {student.department} • <span className="font-medium text-slate-700">{student.subject}</span>
                    </p>
                    <p className="text-xs text-red-700 font-medium mt-1">
                      Reason: {student.primaryRiskFactor}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-6 text-xs text-right shrink-0">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Attendance %</span>
                    <span className={`font-bold font-mono text-sm ${student.attendancePct < 85 ? 'text-red-700' : 'text-slate-800'}`}>
                      {student.attendancePct}%
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Classes to Recover</span>
                    <span className="font-bold font-mono text-sm text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                      {student.classesToRecover} consecutive
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Current Marks</span>
                    <div className="flex items-center space-x-1 justify-end">
                      <span className="font-bold font-mono text-sm text-slate-900">{student.currentMarks}%</span>
                      <TrendIndicator trend={student.marksTrend} />
                    </div>
                  </div>

                  <div className="hidden md:block pl-2">
                    <button className="px-2.5 py-1 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded border border-slate-700 flex items-center space-x-1">
                      <span>Inspect Profile</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-md border border-slate-200 shadow-sm p-4">
          <div className="flex justify-between items-center pb-3 mb-3 border-b border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-serif flex items-center space-x-2">
                <GraduationCap className="w-4 h-4 text-slate-700" />
                <span>Department-Wise Risk Analytics</span>
              </h3>
              <p className="text-xs text-slate-500">Student enrollment and attendance compliance</p>
            </div>
            <button
              onClick={() => onNavigateToTab('analytics')}
              className="text-xs text-slate-600 hover:text-slate-900 font-medium"
            >
              Detailed Breakdown &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {departmentRisks.map(dept => (
              <div key={dept.department} className="p-3 bg-slate-50 rounded border border-slate-200 text-xs">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-bold text-slate-900">{dept.department}</span>
                  <span className="font-mono text-xs font-bold text-red-700 bg-red-100/60 px-2 py-0.5 rounded border border-red-200">
                    {dept.atRiskCount} At Risk / {dept.totalStudents} Total
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-200 text-[11px] text-slate-600">
                  <div>
                    Avg Attendance: <span className="font-bold font-mono text-slate-900">{dept.avgAttendancePct}%</span>
                  </div>
                  <div>
                    Avg Academic Score: <span className="font-bold font-mono text-slate-900">{dept.avgMarksPct}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-md border border-slate-200 shadow-sm p-4">
          <div className="flex justify-between items-center pb-3 mb-3 border-b border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-serif flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-slate-700" />
                <span>Subject-Wise Failure Risk</span>
              </h3>
              <p className="text-xs text-slate-500">High failure percentage subjects</p>
            </div>
            <button
              onClick={() => onNavigateToTab('analytics')}
              className="text-xs text-slate-600 hover:text-slate-900 font-medium"
            >
              Detailed Breakdown &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {subjectRisks.map(subj => (
              <div key={subj.subject} className="p-3 bg-slate-50 rounded border border-slate-200 text-xs">
                <div className="flex justify-between items-center mb-1">
                  <div>
                    <span className="font-bold text-slate-900">{subj.subject}</span>
                    <span className="text-slate-500 text-[11px] block">{subj.department}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-bold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded border border-amber-300">
                      {subj.failureRiskPct}% Risk Rate
                    </span>
                  </div>
                </div>
                <div className="mt-2 text-[11px] text-slate-600 flex justify-between">
                  <span>Avg Attendance: <strong className="font-mono">{subj.avgAttendancePct}%</strong></span>
                  <span>Avg Marks: <strong className="font-mono">{subj.avgMarksPct}%</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
