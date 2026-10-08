import React, { useState } from 'react';
import type { StudentRiskRecord, AppointmentStatus, CommunicationStatus } from '../../types';
import { RiskBadge, TrendIndicator } from '../Common/RiskBadge';
import { X, Calculator, Bot, CheckCircle2 } from 'lucide-react';

interface StudentProfileModalProps {
  student: StudentRiskRecord | null;
  onClose: () => void;
  onUpdateStatus: (
    studentId: string,
    appointmentStatus: AppointmentStatus,
    communicationStatus: CommunicationStatus,
    appointmentDate?: string
  ) => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  student,
  onClose,
  onUpdateStatus
}) => {
  if (!student) return null;

  const [appointmentStatus, setAppointmentStatus] = useState<AppointmentStatus>(student.appointmentStatus);
  const [communicationStatus, setCommunicationStatus] = useState<CommunicationStatus>(student.communicationStatus);
  const [appointmentDate, setAppointmentDate] = useState<string>(student.appointmentDate || '');
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);

  const handleSave = () => {
    onUpdateStatus(student.id, appointmentStatus, communicationStatus, appointmentDate);
    setShowSavedFeedback(true);
    setTimeout(() => setShowSavedFeedback(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-md border border-slate-300 shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        <div className="bg-slate-900 text-white p-4 flex justify-between items-start border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <RiskBadge level={student.riskLevel} size="md" />
              <span className="text-xs font-mono text-slate-400">ID: {student.id}</span>
            </div>
            <h2 className="text-xl font-bold font-serif text-white mt-1">{student.name}</h2>
            <p className="text-xs text-slate-300">
              {student.department} • Semester {student.semester} • Advisor: {student.advisorName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-6 text-xs text-slate-800">
          {showSavedFeedback && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded font-medium flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Intervention status and appointment successfully updated!</span>
            </div>
          )}

          <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm font-serif flex items-center space-x-1.5">
                <Calculator className="w-4 h-4 text-slate-700" />
                <span>Attendance Audit & Recovery Equation</span>
              </h3>
              <span className="text-xs font-mono font-semibold text-slate-600">
                Required Threshold: {student.requiredPct}%
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
              <div className="p-3 bg-white rounded border border-slate-200">
                <span className="text-slate-500 uppercase text-[10px] font-mono block">Current Attendance</span>
                <span className={`text-2xl font-bold font-mono ${student.attendancePct < 85 ? 'text-red-700' : 'text-emerald-700'}`}>
                  {student.attendancePct}%
                </span>
                <span className="text-[11px] text-slate-500 block font-mono">
                  ({student.attendedClasses} attended / {student.totalClasses} total)
                </span>
              </div>

              <div className="p-3 bg-amber-50/70 rounded border border-amber-200 md:col-span-2">
                <span className="text-amber-900 uppercase text-[10px] font-mono font-bold block">
                  CONSECUTIVE CLASSES TO RECOVER 85%
                </span>
                <div className="flex items-baseline space-x-2 mt-0.5">
                  <span className="text-2xl font-extrabold font-mono text-amber-900">
                    {student.classesToRecover} Classes
                  </span>
                  <span className="text-xs text-amber-800 font-medium">
                    (Zero absences allowed)
                  </span>
                </div>
                <div className="mt-2 text-[10px] font-mono text-amber-900/80 bg-amber-100/80 p-1.5 rounded border border-amber-200">
                  Formula: N ≥ ⌈(0.85 × {student.totalClasses} - {student.attendedClasses}) / (1 - 0.85)⌉ = {student.classesToRecover} lectures
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-md border border-slate-200">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm font-serif">
                Recent Test Results & Marks Trend
              </h3>
              <TrendIndicator trend={student.marksTrend} />
            </div>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {student.marksHistory.map((test, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded border border-slate-200 font-mono">
                  <span className="text-slate-500 text-[10px] block uppercase">{test.testName}</span>
                  <div className="flex justify-between items-baseline mt-1">
                    <span className="text-lg font-bold text-slate-900">{test.score} / {test.maxScore}</span>
                    <span className="text-[10px] text-slate-400">{test.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 text-slate-100 p-4 rounded-md border border-slate-800 space-y-3">
            <div className="flex items-center space-x-2 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider">
              <Bot className="w-4 h-4 text-amber-400" />
              <span>Make Workflow AI Diagnosis & Risk Explanation</span>
            </div>

            <div className="p-3 bg-slate-850 rounded border border-slate-700 text-xs leading-relaxed font-sans text-slate-200">
              <strong className="text-white block font-semibold mb-1">Primary Factor: {student.primaryRiskFactor}</strong>
              <p>{student.aiExplanation}</p>
            </div>

            <div className="p-3 bg-slate-800 rounded border border-slate-700 text-xs">
              <span className="text-emerald-400 font-bold uppercase text-[10px] font-mono block mb-1">
                RECOMMENDED INTERVENTION:
              </span>
              <p className="text-slate-100 font-medium">{student.recommendedIntervention}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-md border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm font-serif pb-2 border-b border-slate-200">
              Intervention Tracking & Faculty Appointment
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-600 text-[11px] font-semibold uppercase mb-1">
                  Faculty Assigned
                </label>
                <input
                  type="text"
                  disabled
                  value={student.facultyAssigned}
                  className="w-full bg-slate-100 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-600 text-[11px] font-semibold uppercase mb-1">
                  Appointment Status
                </label>
                <select
                  value={appointmentStatus}
                  onChange={e => setAppointmentStatus(e.target.value as AppointmentStatus)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-slate-800"
                >
                  <option value="NOT_SCHEDULED">Not Scheduled</option>
                  <option value="PENDING">Pending Confirmation</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 text-[11px] font-semibold uppercase mb-1">
                  Communication Notice
                </label>
                <select
                  value={communicationStatus}
                  onChange={e => setCommunicationStatus(e.target.value as CommunicationStatus)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-slate-800"
                >
                  <option value="NOT_SENT">Not Sent</option>
                  <option value="SENT">Email Sent</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="ACKNOWLEDGED">Acknowledged by Student</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-600 text-[11px] font-semibold uppercase mb-1">
                Scheduled Appointment Date & Time
              </label>
              <input
                type="datetime-local"
                value={appointmentDate}
                onChange={e => setAppointmentDate(e.target.value)}
                className="w-full sm:w-1/2 bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs font-mono text-slate-900"
              />
            </div>
          </div>
        </div>

        <div className="bg-slate-100 p-4 border-t border-slate-200 flex justify-between items-center">
          <span className="text-[11px] font-mono text-slate-500">
            Student Record ID: {student.id}
          </span>

          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold border border-slate-700 transition"
            >
              Save Updates
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
