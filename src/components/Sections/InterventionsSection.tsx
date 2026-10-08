import React, { useState } from 'react';
import type { StudentRiskRecord, AppointmentStatus, CommunicationStatus } from '../../types';
import { RiskBadge } from '../Common/RiskBadge';
import { ShieldAlert, Calendar, Filter } from 'lucide-react';

interface InterventionsSectionProps {
  students: StudentRiskRecord[];
  onSelectStudent: (student: StudentRiskRecord) => void;
  onUpdateStatus: (
    studentId: string,
    appointmentStatus: AppointmentStatus,
    communicationStatus: CommunicationStatus,
    appointmentDate?: string
  ) => void;
}

export const InterventionsSection: React.FC<InterventionsSectionProps> = ({
  students,
  onSelectStudent,
  onUpdateStatus
}) => {
  const [filterRisk, setFilterRisk] = useState<string>('ACTION_NEEDED');

  const actionableStudents = students.filter(s => {
    if (filterRisk === 'ACTION_NEEDED') {
      return s.riskLevel === 'CRITICAL' || s.riskLevel === 'HIGH' || s.appointmentStatus !== 'COMPLETED';
    }
    if (filterRisk === 'CRITICAL') return s.riskLevel === 'CRITICAL';
    if (filterRisk === 'PENDING_APPOINTMENT') return s.appointmentStatus === 'NOT_SCHEDULED' || s.appointmentStatus === 'PENDING';
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-md border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 font-serif flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-red-700" />
            <span>Faculty Intervention & Appointment Workflow</span>
          </h2>
          <p className="text-xs text-slate-500">
            Track student interventions, scheduled advisor meetings, and warning communications.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filterRisk}
            onChange={e => setFilterRisk(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-slate-800"
          >
            <option value="ACTION_NEEDED">Action Needed Only ({actionableStudents.length})</option>
            <option value="CRITICAL">Critical Risk Only</option>
            <option value="PENDING_APPOINTMENT">Unscheduled Appointments</option>
            <option value="ALL">All Enrolled Students</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-200">
          {actionableStudents.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm font-medium">
              No pending interventions matching current filter criteria.
            </div>
          ) : (
            actionableStudents.map(student => {
              return (
                <div
                  key={student.id}
                  className="p-4 hover:bg-slate-50 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center space-x-2">
                      <RiskBadge level={student.riskLevel} size="sm" />
                      <span className="font-bold text-sm text-slate-900">{student.name}</span>
                      <span className="text-xs font-mono text-slate-500">({student.id})</span>
                    </div>

                    <p className="text-xs text-slate-600">
                      <strong>Dept:</strong> {student.department} • <strong>Subject:</strong> {student.subject}
                    </p>

                    <div className="mt-2 p-2.5 bg-red-50/60 rounded border border-red-200 text-xs">
                      <span className="font-bold text-red-900 block text-[11px] uppercase">
                        Reason for Intervention:
                      </span>
                      <span className="text-red-800 font-medium">
                        {student.primaryRiskFactor} &mdash; Attendance {student.attendancePct}% ({student.classesToRecover} recover classes needed), Score {student.currentMarks}%.
                      </span>
                    </div>

                    <div className="mt-1 text-xs text-slate-700">
                      <strong>Recommended Action:</strong> {student.recommendedIntervention}
                    </div>
                  </div>

                  <div className="w-full md:w-80 shrink-0 bg-slate-50 p-3 rounded border border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between items-center text-[11px] font-mono text-slate-600 border-b border-slate-200 pb-1.5">
                      <span>Faculty: <strong>{student.facultyAssigned}</strong></span>
                      <button
                        onClick={() => onSelectStudent(student)}
                        className="text-slate-900 underline font-semibold"
                      >
                        Full Profile
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="block text-[10px] text-slate-500 uppercase font-mono mb-0.5">
                          Appointment Status
                        </span>
                        <select
                          value={student.appointmentStatus}
                          onChange={e => onUpdateStatus(student.id, e.target.value as AppointmentStatus, student.communicationStatus, student.appointmentDate)}
                          className="w-full text-xs font-semibold bg-white border border-slate-300 rounded px-1.5 py-1 text-slate-900"
                        >
                          <option value="NOT_SCHEDULED">Not Scheduled</option>
                          <option value="PENDING">Pending</option>
                          <option value="CONFIRMED">Confirmed</option>
                          <option value="COMPLETED">Completed</option>
                        </select>
                      </div>

                      <div>
                        <span className="block text-[10px] text-slate-500 uppercase font-mono mb-0.5">
                          Communication Notice
                        </span>
                        <select
                          value={student.communicationStatus}
                          onChange={e => onUpdateStatus(student.id, student.appointmentStatus, e.target.value as CommunicationStatus, student.appointmentDate)}
                          className="w-full text-xs font-semibold bg-white border border-slate-300 rounded px-1.5 py-1 text-slate-900"
                        >
                          <option value="NOT_SENT">Not Sent</option>
                          <option value="SENT">Email Sent</option>
                          <option value="DELIVERED">Delivered</option>
                          <option value="ACKNOWLEDGED">Acknowledged</option>
                        </select>
                      </div>
                    </div>

                    {student.appointmentDate ? (
                      <div className="text-[11px] font-mono text-slate-700 bg-white p-1.5 rounded border border-slate-200 flex items-center space-x-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>Date: {new Date(student.appointmentDate).toLocaleString()}</span>
                      </div>
                    ) : (
                      <div className="text-[10px] text-amber-800 font-mono italic">
                        No appointment timestamp set yet.
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
