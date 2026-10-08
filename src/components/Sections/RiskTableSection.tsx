import React, { useState, useMemo } from 'react';
import type { StudentRiskRecord, RiskLevel } from '../../types';
import { RiskBadge, TrendIndicator } from '../Common/RiskBadge';
import { Search, Download, ArrowUpDown } from 'lucide-react';

interface RiskTableSectionProps {
  students: StudentRiskRecord[];
  onSelectStudent: (student: StudentRiskRecord) => void;
}

type SortField = 'name' | 'attendancePct' | 'classesToRecover' | 'currentMarks' | 'riskLevel';
type SortOrder = 'asc' | 'desc';

export const RiskTableSection: React.FC<RiskTableSectionProps> = ({
  students,
  onSelectStudent
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');
  const [onlyBelow85, setOnlyBelow85] = useState(false);
  const [sortField, setSortField] = useState<SortField>('riskLevel');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const departments = useMemo(() => {
    const set = new Set<string>();
    students.forEach(s => set.add(s.department));
    return Array.from(set);
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students
      .filter(s => {
        const matchesSearch =
          s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.subject.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesDept = selectedDept === 'ALL' || s.department === selectedDept;
        const matchesRisk = selectedRisk === 'ALL' || s.riskLevel === selectedRisk;
        const matchesAttendance85 = !onlyBelow85 || s.attendancePct < 85;

        return matchesSearch && matchesDept && matchesRisk && matchesAttendance85;
      })
      .sort((a, b) => {
        let valA: any = a[sortField];
        let valB: any = b[sortField];

        if (sortField === 'riskLevel') {
          const weights: Record<RiskLevel, number> = { CRITICAL: 4, HIGH: 3, MODERATE: 2, LOW: 1 };
          valA = weights[a.riskLevel];
          valB = weights[b.riskLevel];
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [students, searchTerm, selectedDept, selectedRisk, onlyBelow85, sortField, sortOrder]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const exportCSV = () => {
    const headers = [
      'ID',
      'Name',
      'Department',
      'Subject',
      'Attendance %',
      'Classes Needed to Recover 85%',
      'Current Marks %',
      'Marks Trend',
      'Risk Level',
      'Primary Risk Factor',
      'Recommended Action',
      'Faculty Assigned',
      'Appointment Status'
    ];

    const rows = filteredStudents.map(s => [
      s.id,
      `"${s.name}"`,
      `"${s.department}"`,
      `"${s.subject}"`,
      s.attendancePct,
      s.classesToRecover,
      s.currentMarks,
      s.marksTrend,
      s.riskLevel,
      `"${s.primaryRiskFactor.replace(/"/g, '""')}"`,
      `"${s.recommendedIntervention.replace(/"/g, '""')}"`,
      `"${s.facultyAssigned}"`,
      s.appointmentStatus
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ClassPulse_Student_Risk_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-md border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search student name, ID, department, or subject..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-700 focus:bg-white text-slate-900"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-slate-700"
            >
              <option value="ALL">All Departments</option>
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <select
              value={selectedRisk}
              onChange={e => setSelectedRisk(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-slate-700"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="CRITICAL">Critical Risk</option>
              <option value="HIGH">High Risk</option>
              <option value="MODERATE">Moderate Risk</option>
              <option value="LOW">Low Risk</option>
            </select>

            <label className="flex items-center space-x-1.5 text-xs text-slate-700 bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 cursor-pointer font-medium select-none">
              <input
                type="checkbox"
                checked={onlyBelow85}
                onChange={e => setOnlyBelow85(e.target.checked)}
                className="rounded text-red-600 focus:ring-red-500"
              />
              <span>&lt;85% Attendance Only</span>
            </label>

            <button
              onClick={exportCSV}
              className="text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded border border-slate-700 flex items-center space-x-1.5 transition ml-auto"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center text-xs text-slate-500 font-mono pt-1">
          <span>Showing {filteredStudents.length} of {students.length} student records</span>
          {onlyBelow85 && (
            <span className="text-red-700 font-semibold bg-red-50 px-2 py-0.5 rounded border border-red-200">
              Filtered: Attendance Below Required 85% Threshold
            </span>
          )}
        </div>
      </div>

      <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-slate-200 border-b border-slate-800 font-mono uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3.5 font-semibold">Student Name & ID</th>
                <th
                  onClick={() => toggleSort('attendancePct')}
                  className="py-3 px-3 font-semibold cursor-pointer hover:text-white"
                >
                  <div className="flex items-center space-x-1">
                    <span>Attendance %</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('classesToRecover')}
                  className="py-3 px-3 font-semibold cursor-pointer hover:text-white"
                >
                  <div className="flex items-center space-x-1">
                    <span>Classes Needed (85%)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('currentMarks')}
                  className="py-3 px-3 font-semibold cursor-pointer hover:text-white"
                >
                  <div className="flex items-center space-x-1">
                    <span>Current Marks</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3 font-semibold">Marks Trend</th>
                <th
                  onClick={() => toggleSort('riskLevel')}
                  className="py-3 px-3 font-semibold cursor-pointer hover:text-white"
                >
                  <div className="flex items-center space-x-1">
                    <span>Risk Level</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3.5 font-semibold">Recommended Intervention</th>
                <th className="py-3 px-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 font-medium">
                    No matching student records found. Try adjusting your search query or filters.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => {
                  const isBelowThreshold = student.attendancePct < 85;

                  return (
                    <tr
                      key={student.id}
                      onClick={() => onSelectStudent(student)}
                      className={`hover:bg-slate-50/80 transition cursor-pointer ${
                        student.riskLevel === 'CRITICAL' ? 'bg-red-50/20' : idx % 2 === 1 ? 'bg-slate-50/30' : 'bg-white'
                      }`}
                    >
                      <td className="py-3 px-3.5">
                        <div className="font-bold text-slate-900 text-xs">{student.name}</div>
                        <div className="text-[11px] font-mono text-slate-500">
                          {student.id} • {student.department}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center space-x-1.5">
                          <span
                            className={`font-mono font-bold text-xs ${
                              isBelowThreshold ? 'text-red-700 font-extrabold' : 'text-slate-800'
                            }`}
                          >
                            {student.attendancePct}%
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ({student.attendedClasses}/{student.totalClasses})
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        {student.classesToRecover > 0 ? (
                          <span className="inline-flex items-center px-2 py-0.5 font-mono text-xs font-bold text-amber-900 bg-amber-100 rounded border border-amber-300">
                            {student.classesToRecover} consecutive
                          </span>
                        ) : (
                          <span className="text-[11px] text-emerald-700 font-medium">
                            0 (Compliant)
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <span className={`font-mono font-bold text-xs ${student.currentMarks < 60 ? 'text-red-700' : 'text-slate-900'}`}>
                          {student.currentMarks}%
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <TrendIndicator trend={student.marksTrend} />
                      </td>

                      <td className="py-3 px-3">
                        <RiskBadge level={student.riskLevel} size="sm" />
                      </td>

                      <td className="py-3 px-3.5 max-w-xs">
                        <p className="text-xs text-slate-700 line-clamp-2 font-medium">
                          {student.recommendedIntervention}
                        </p>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            onSelectStudent(student);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded border border-slate-300 transition"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
