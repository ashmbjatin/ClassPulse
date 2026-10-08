export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';

export type PerformanceTrend = 'falling' | 'stable' | 'improving';

export type AppointmentStatus = 'NOT_SCHEDULED' | 'PENDING' | 'CONFIRMED' | 'COMPLETED';

export type CommunicationStatus = 'NOT_SENT' | 'SENT' | 'DELIVERED' | 'ACKNOWLEDGED' | 'EXPIRED';

export interface TestScore {
  testName: string;
  score: number;
  maxScore: number;
  date: string;
}

export interface StudentRiskRecord {
  id: string;
  name: string;
  department: string;
  subject: string;
  semester: number;
  email: string;
  advisorName: string;
  
  // Attendance metrics
  attendedClasses: number;
  totalClasses: number;
  attendancePct: number;
  requiredPct: number; // Defaults to 85%
  classesToRecover: number; // Consecutive classes required to hit threshold
  
  // Academic metrics
  currentMarks: number;
  marksTrend: PerformanceTrend;
  marksHistory: TestScore[];
  
  // Risk assessment
  riskLevel: RiskLevel;
  primaryRiskFactor: string;
  aiExplanation: string;
  recommendedIntervention: string;
  
  // Status tracking
  facultyAssigned: string;
  appointmentStatus: AppointmentStatus;
  appointmentDate?: string;
  communicationStatus: CommunicationStatus;
  lastInterventionDate?: string;
}

export interface SummaryMetrics {
  totalStudents: number;
  belowAttendanceCount: number;
  highAcademicRiskCount: number;
  fallingMarksCount: number;
  immediateInterventionCount: number;
  criticalRiskCount: number;
}

export interface DepartmentRisk {
  department: string;
  totalStudents: number;
  atRiskCount: number;
  avgAttendancePct: number;
  avgMarksPct: number;
}

export interface SubjectRisk {
  subject: string;
  department: string;
  atRiskCount: number;
  avgAttendancePct: number;
  avgMarksPct: number;
  failureRiskPct: number;
}

export interface MakeWebhookPayload {
  filename?: string;
  uploadTimestamp?: string;
  records?: Partial<StudentRiskRecord>[];
  rawFileBase64?: string;
  departmentFilter?: string;
}

export interface MakeWebhookResponse {
  success?: boolean;
  message?: string;
  timestamp?: string;
  summary?: Partial<SummaryMetrics>;
  students?: Partial<StudentRiskRecord>[];
  departmentRisks?: DepartmentRisk[];
  subjectRisks?: SubjectRisk[];
  raw?: any;
}
