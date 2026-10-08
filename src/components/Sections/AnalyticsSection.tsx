import React from 'react';
import type { DepartmentRisk, SubjectRisk, StudentRiskRecord } from '../../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ScatterChart, Scatter, Cell } from 'recharts';
import { BarChart3, GraduationCap, BookOpen, Activity } from 'lucide-react';

interface AnalyticsSectionProps {
  departmentRisks: DepartmentRisk[];
  subjectRisks: SubjectRisk[];
  students: StudentRiskRecord[];
}

export const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({
  departmentRisks,
  subjectRisks,
  students
}) => {
  const scatterData = students.map(s => ({
    name: s.name,
    attendance: s.attendancePct,
    marks: s.currentMarks,
    risk: s.riskLevel,
    dept: s.department
  }));

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'CRITICAL': return '#991b1b';
      case 'HIGH': return '#c2410c';
      case 'MODERATE': return '#ca8a04';
      default: return '#166534';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-md border border-slate-200 shadow-sm flex items-center space-x-3">
        <div className="p-2 bg-slate-900 text-white rounded">
          <BarChart3 className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900 font-serif">
            Institutional Risk Analytics & Attendance Trends
          </h2>
          <p className="text-xs text-slate-500">
            Real-time metric distributions computed directly from attendance and examination records.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-md border border-slate-200 shadow-sm">
          <div className="pb-3 mb-3 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 font-serif flex items-center space-x-2">
              <GraduationCap className="w-4 h-4 text-slate-700" />
              <span>Department At-Risk vs Total Enrolled</span>
            </h3>
            <p className="text-xs text-slate-500">Comparing total cohort size against students in high risk</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentRisks} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="department" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '4px', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="totalStudents" name="Total Students" fill="#64748b" />
                <Bar dataKey="atRiskCount" name="At-Risk Students" fill="#dc2626" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-4 rounded-md border border-slate-200 shadow-sm">
          <div className="pb-3 mb-3 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 font-serif flex items-center space-x-2">
              <Activity className="w-4 h-4 text-slate-700" />
              <span>Attendance % vs Current Marks Correlation</span>
            </h3>
            <p className="text-xs text-slate-500">Student position relative to 85% attendance threshold</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  type="number"
                  dataKey="attendance"
                  name="Attendance %"
                  domain={[50, 100]}
                  unit="%"
                  tick={{ fontSize: 10 }}
                />
                <YAxis
                  type="number"
                  dataKey="marks"
                  name="Current Marks"
                  domain={[30, 100]}
                  unit="%"
                  tick={{ fontSize: 10 }}
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ payload }) => {
                    if (payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-2 rounded text-xs font-mono">
                          <p className="font-bold">{data.name}</p>
                          <p>Dept: {data.dept}</p>
                          <p>Attendance: {data.attendance}%</p>
                          <p>Marks: {data.marks}%</p>
                          <p className="text-red-400 font-bold">Risk: {data.risk}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Students" data={scatterData}>
                  {scatterData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getRiskColor(entry.risk)} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-md border border-slate-200 shadow-sm">
        <div className="pb-3 mb-3 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 font-serif flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-slate-700" />
            <span>Subject-Wise Failure Risk Percentage (%)</span>
          </h3>
          <p className="text-xs text-slate-500">Subject courses ordered by highest student failure risk</p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={subjectRisks}
              margin={{ top: 10, right: 30, left: 60, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" unit="%" tick={{ fontSize: 10 }} />
              <YAxis dataKey="subject" type="category" tick={{ fontSize: 10 }} width={140} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '4px', fontSize: '11px' }}
              />
              <Bar dataKey="failureRiskPct" name="Failure Risk Rate (%)" fill="#d97706" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
