import { useState, useMemo } from 'react';
import { Header, type TabType } from './components/Header';
import { UrgentAlertBanner } from './components/UrgentAlertBanner';
import { OverviewSection } from './components/Sections/OverviewSection';
import { RiskTableSection } from './components/Sections/RiskTableSection';
import { StudentProfileModal } from './components/Sections/StudentProfileModal';
import { InterventionsSection } from './components/Sections/InterventionsSection';
import { AnalyticsSection } from './components/Sections/AnalyticsSection';
import { DataUploadSection } from './components/Sections/DataUploadSection';

import type { StudentRiskRecord, MakeWebhookResponse, AppointmentStatus, CommunicationStatus } from './types';
import { INITIAL_STUDENTS } from './data/mockData';
import { computeSummaryFromStudents, computeDepartmentRisks, computeSubjectRisks } from './services/makeWebhook';
import './styles/index.css';

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [students, setStudents] = useState<StudentRiskRecord[]>(INITIAL_STUDENTS);
  const [selectedStudent, setSelectedStudent] = useState<StudentRiskRecord | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string | undefined>(undefined);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const summary = useMemo(() => computeSummaryFromStudents(students), [students]);
  const departmentRisks = useMemo(() => computeDepartmentRisks(students), [students]);
  const subjectRisks = useMemo(() => computeSubjectRisks(students), [students]);

  const handleWebhookSuccess = (response: MakeWebhookResponse) => {
    setLastSyncTime(response.timestamp || new Date().toLocaleTimeString());
    setIsSyncing(false);

    if (response.students && response.students.length > 0) {
      setStudents(response.students as StudentRiskRecord[]);
    }
  };

  const handleUpdateStatus = (
    studentId: string,
    appointmentStatus: AppointmentStatus,
    communicationStatus: CommunicationStatus,
    appointmentDate?: string
  ) => {
    setStudents(prev =>
      prev.map(s => {
        if (s.id === studentId) {
          return {
            ...s,
            appointmentStatus,
            communicationStatus,
            appointmentDate: appointmentDate || s.appointmentDate,
            lastInterventionDate: new Date().toISOString().split('T')[0]
          };
        }
        return s;
      })
    );

    if (selectedStudent && selectedStudent.id === studentId) {
      setSelectedStudent(prev =>
        prev
          ? {
              ...prev,
              appointmentStatus,
              communicationStatus,
              appointmentDate: appointmentDate || prev.appointmentDate,
              lastInterventionDate: new Date().toISOString().split('T')[0]
            }
          : null
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 selection:bg-slate-900 selection:text-white">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lastSyncTime={lastSyncTime}
        isSyncing={isSyncing}
        onTriggerSync={() => setActiveTab('upload')}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <UrgentAlertBanner
          students={students}
          onSelectStudent={student => setSelectedStudent(student)}
          onNavigateToInterventions={() => setActiveTab('interventions')}
        />

        {activeTab === 'overview' && (
          <OverviewSection
            summary={summary}
            students={students}
            departmentRisks={departmentRisks}
            subjectRisks={subjectRisks}
            onSelectStudent={student => setSelectedStudent(student)}
            onNavigateToTab={tab => setActiveTab(tab)}
          />
        )}

        {activeTab === 'table' && (
          <RiskTableSection
            students={students}
            onSelectStudent={student => setSelectedStudent(student)}
          />
        )}

        {activeTab === 'interventions' && (
          <InterventionsSection
            students={students}
            onSelectStudent={student => setSelectedStudent(student)}
            onUpdateStatus={handleUpdateStatus}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsSection
            departmentRisks={departmentRisks}
            subjectRisks={subjectRisks}
            students={students}
          />
        )}

        {activeTab === 'upload' && (
          <DataUploadSection onWebhookSuccess={handleWebhookSuccess} />
        )}
      </main>

      <StudentProfileModal
        student={selectedStudent}
        onClose={() => setSelectedStudent(null)}
        onUpdateStatus={handleUpdateStatus}
      />

      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-2 font-mono">
          <div>
            <strong>CLASS PULSE</strong> • College Attendance & Risk Intervention Platform
          </div>
          <div className="text-[11px] text-slate-500">
            Make Webhook Target: <span className="text-slate-300">hook.eu1.make.com/oag2tdgwjesdkb5x0qy9yjh1pwh0otwo</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
