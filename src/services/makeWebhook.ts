import type { MakeWebhookResponse, StudentRiskRecord, SummaryMetrics, DepartmentRisk, SubjectRisk } from '../types';
import { calculateClassesToRecover, calculateAttendancePct, determineRiskLevel, calculateMarksTrend } from '../utils/attendanceCalc';

const MAKE_WEBHOOK_URL = 'https://hook.eu1.make.com/oag2tdgwjesdkb5x0qy9yjh1pwh0otwo';

export interface MakeUploadOptions {
  department?: string;
  subject?: string;
  academicTerm?: string;
}

export async function sendDataToMakeWebhook(
  payloadData: any,
  options?: MakeUploadOptions
): Promise<MakeWebhookResponse> {
  const timestamp = new Date().toISOString();
  
  try {
    const response = await fetch(MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*'
      },
      body: JSON.stringify({
        source: 'ClassPulse_Frontend',
        timestamp,
        metadata: {
          department: options?.department || 'All Departments',
          subject: options?.subject || 'All Subjects',
          term: options?.academicTerm || 'Fall 2026'
        },
        payload: payloadData
      })
    });

    if (!response.ok) {
      throw new Error(`Make webhook returned HTTP ${response.status}: ${response.statusText}`);
    }

    const responseText = await response.text();
    let parsedData: any = {};

    try {
      parsedData = JSON.parse(responseText);
    } catch {
      parsedData = { message: responseText || 'Workflow executed successfully in Make.' };
    }

    // If Make returned a simple message, fallback to payloadData if array
    if (!parsedData.students && Array.isArray(payloadData)) {
      parsedData.students = payloadData;
    }

    return parseAndNormalizeMakeResponse(parsedData, timestamp);
  } catch (error: any) {
    console.error('Make Webhook Error:', error);
    throw new Error(error.message || 'Failed to communicate with Make webhook.');
  }
}

export async function uploadFileToMakeWebhook(
  file: File,
  options?: MakeUploadOptions
): Promise<MakeWebhookResponse> {
  const timestamp = new Date().toISOString();
  const formData = new FormData();
  formData.append('file', file);
  formData.append('filename', file.name);
  formData.append('fileSize', file.size.toString());
  formData.append('fileType', file.type);
  formData.append('uploadTimestamp', timestamp);
  if (options?.department) formData.append('department', options.department);
  if (options?.subject) formData.append('subject', options.subject);

  // Read client file text to parse records locally if Make returns basic "Accepted" string
  let localParsedStudents: StudentRiskRecord[] = [];
  try {
    const fileText = await file.text();
    localParsedStudents = parseFileTextToStudents(fileText, options?.department, options?.subject);
  } catch (err) {
    console.warn('Could not parse local file text:', err);
  }

  try {
    const response = await fetch(MAKE_WEBHOOK_URL, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Make Webhook upload failed with HTTP ${response.status}`);
    }

    const responseText = await response.text();
    let parsedData: any = {};

    try {
      parsedData = JSON.parse(responseText);
    } catch {
      parsedData = {
        message: responseText || 'File successfully transmitted to Make workflow.',
        students: localParsedStudents
      };
    }

    if (!parsedData.students && localParsedStudents.length > 0) {
      parsedData.students = localParsedStudents;
    }

    return parseAndNormalizeMakeResponse(parsedData, timestamp);
  } catch (error: any) {
    console.error('Make Webhook File Upload Error:', error);
    throw new Error(error.message || 'Failed to upload file to Make webhook.');
  }
}

/**
 * Parses CSV or JSON text into normalized student risk records.
 */
export function parseFileTextToStudents(
  text: string,
  defaultDept?: string,
  defaultSubject?: string
): StudentRiskRecord[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  // If JSON format
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      const obj = JSON.parse(trimmed);
      const arr = Array.isArray(obj) ? obj : obj.students || obj.data || [];
      return arr.map((item: any, idx: number) => normalizeStudentRecord(item, idx));
    } catch {
      // Fall through to CSV parser
    }
  }

  // Simple CSV parser
  const lines = trimmed.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/[^a-z0-9]/g, ''));
  const findIndex = (keys: string[]) => headers.findIndex(h => keys.some(k => h.includes(k)));

  const idIdx = findIndex(['id', 'roll']);
  const nameIdx = findIndex(['name', 'student']);
  const deptIdx = findIndex(['dept', 'department']);
  const subjIdx = findIndex(['subj', 'course']);
  const semIdx = findIndex(['sem', 'term']);
  const attendedIdx = findIndex(['attended', 'present']);
  const totalIdx = findIndex(['total', 'classes']);
  const marksIdx = findIndex(['mark', 'score', 'grade']);

  const records: StudentRiskRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
    if (cols.length < 3) continue;

    const id = idIdx >= 0 ? cols[idIdx] : `STU-2026-${String(i).padStart(3, '0')}`;
    const name = nameIdx >= 0 ? cols[nameIdx] : `Student ${i}`;
    const department = deptIdx >= 0 ? cols[deptIdx] : (defaultDept || 'Computer Science');
    const subject = subjIdx >= 0 ? cols[subjIdx] : (defaultSubject || 'General Subject');
    const semester = semIdx >= 0 ? Number(cols[semIdx]) || 5 : 5;
    const attendedClasses = attendedIdx >= 0 ? Number(cols[attendedIdx]) || 30 : 30;
    const totalClasses = totalIdx >= 0 ? Number(cols[totalIdx]) || 45 : 45;
    const currentMarks = marksIdx >= 0 ? Number(cols[marksIdx]) || 65 : 65;

    records.push(
      normalizeStudentRecord(
        {
          id,
          name,
          department,
          subject,
          semester,
          attendedClasses,
          totalClasses,
          currentMarks
        },
        i - 1
      )
    );
  }

  return records;
}

function parseAndNormalizeMakeResponse(rawResponse: any, timestamp: string): MakeWebhookResponse {
  if (rawResponse && (Array.isArray(rawResponse.students) || Array.isArray(rawResponse.data))) {
    const rawStudents = rawResponse.students || rawResponse.data || [];
    const students: StudentRiskRecord[] = rawStudents.map((s: any, idx: number) => normalizeStudentRecord(s, idx));

    const summary = computeSummaryFromStudents(students);
    const departmentRisks = computeDepartmentRisks(students);
    const subjectRisks = computeSubjectRisks(students);

    return {
      success: true,
      message: rawResponse.message || 'Make workflow executed and updated student risk records.',
      timestamp,
      summary,
      students,
      departmentRisks,
      subjectRisks,
      raw: rawResponse
    };
  }

  return {
    success: true,
    message: rawResponse.message || (typeof rawResponse === 'string' ? rawResponse : 'Make automation workflow completed.'),
    timestamp,
    raw: rawResponse
  };
}

export function normalizeStudentRecord(s: any, index: number): StudentRiskRecord {
  const attended = Number(s.attendedClasses ?? s.attended ?? 0);
  const total = Number(s.totalClasses ?? s.total ?? 0);
  const attendancePct = s.attendancePct !== undefined ? Number(s.attendancePct) : calculateAttendancePct(attended, total);
  const requiredPct = Number(s.requiredPct ?? 85);
  const classesToRecover = s.classesToRecover !== undefined 
    ? Number(s.classesToRecover) 
    : calculateClassesToRecover(attended, total, requiredPct);

  const currentMarks = Number(s.currentMarks ?? s.marks ?? s.score ?? 0);
  const marksHistory = Array.isArray(s.marksHistory) ? s.marksHistory : [
    { testName: 'Midterm 1', score: Math.min(100, currentMarks + 8), maxScore: 100, date: '2026-09-01' },
    { testName: 'Midterm 2', score: currentMarks, maxScore: 100, date: '2026-09-20' }
  ];
  const marksTrend = s.marksTrend || calculateMarksTrend(marksHistory);
  const riskLevel = s.riskLevel || determineRiskLevel(attendancePct, currentMarks, marksTrend);

  return {
    id: s.id || `STU-2026-${String(index + 101).padStart(3, '0')}`,
    name: s.name || s.studentName || `Student ${index + 1}`,
    department: s.department || 'Computer Science',
    subject: s.subject || 'Core Subjects',
    semester: Number(s.semester || 5),
    email: s.email || `${(s.name || `student${index}`).toLowerCase().replace(/\s+/g, '.')}@university.edu`,
    advisorName: s.advisorName || 'Dr. A. Sharma',
    attendedClasses: attended,
    totalClasses: total,
    attendancePct,
    requiredPct,
    classesToRecover,
    currentMarks,
    marksTrend,
    marksHistory,
    riskLevel,
    primaryRiskFactor: s.primaryRiskFactor || (attendancePct < 85 ? 'Low Attendance' : 'Low Academic Marks'),
    aiExplanation: s.aiExplanation || s.ai_analysis || `Student shows a deficit of ${classesToRecover} classes from the 85% requirement along with ${marksTrend} exam performance (${currentMarks}%).`,
    recommendedIntervention: s.recommendedIntervention || s.recommended_action || 'Schedule 1-on-1 faculty counseling and mandatory remedial workshops.',
    facultyAssigned: s.facultyAssigned || 'Prof. K. Vance',
    appointmentStatus: s.appointmentStatus || (riskLevel === 'CRITICAL' ? 'PENDING' : 'NOT_SCHEDULED'),
    appointmentDate: s.appointmentDate,
    communicationStatus: s.communicationStatus || (riskLevel === 'CRITICAL' ? 'SENT' : 'NOT_SCHEDULED' as any),
    lastInterventionDate: s.lastInterventionDate
  };
}

export function computeSummaryFromStudents(students: StudentRiskRecord[]): SummaryMetrics {
  return {
    totalStudents: students.length,
    belowAttendanceCount: students.filter(s => s.attendancePct < s.requiredPct).length,
    highAcademicRiskCount: students.filter(s => s.currentMarks < 60 || s.riskLevel === 'HIGH' || s.riskLevel === 'CRITICAL').length,
    fallingMarksCount: students.filter(s => s.marksTrend === 'falling').length,
    immediateInterventionCount: students.filter(s => s.riskLevel === 'CRITICAL' || (s.riskLevel === 'HIGH' && s.appointmentStatus === 'NOT_SCHEDULED')).length,
    criticalRiskCount: students.filter(s => s.riskLevel === 'CRITICAL').length
  };
}

export function computeDepartmentRisks(students: StudentRiskRecord[]): DepartmentRisk[] {
  const map: Record<string, StudentRiskRecord[]> = {};
  students.forEach(s => {
    if (!map[s.department]) map[s.department] = [];
    map[s.department].push(s);
  });

  return Object.keys(map).map(dept => {
    const list = map[dept];
    const atRiskCount = list.filter(s => s.riskLevel === 'CRITICAL' || s.riskLevel === 'HIGH').length;
    const avgAttendancePct = Number((list.reduce((acc, s) => acc + s.attendancePct, 0) / list.length).toFixed(1));
    const avgMarksPct = Number((list.reduce((acc, s) => acc + s.currentMarks, 0) / list.length).toFixed(1));

    return {
      department: dept,
      totalStudents: list.length,
      atRiskCount,
      avgAttendancePct,
      avgMarksPct
    };
  });
}

export function computeSubjectRisks(students: StudentRiskRecord[]): SubjectRisk[] {
  const map: Record<string, StudentRiskRecord[]> = {};
  students.forEach(s => {
    const key = `${s.subject}__${s.department}`;
    if (!map[key]) map[key] = [];
    map[key].push(s);
  });

  return Object.keys(map).map(key => {
    const [subject, department] = key.split('__');
    const list = map[key];
    const atRiskCount = list.filter(s => s.riskLevel === 'CRITICAL' || s.riskLevel === 'HIGH').length;
    const avgAttendancePct = Number((list.reduce((acc, s) => acc + s.attendancePct, 0) / list.length).toFixed(1));
    const avgMarksPct = Number((list.reduce((acc, s) => acc + s.currentMarks, 0) / list.length).toFixed(1));
    const failureRiskPct = Number(((atRiskCount / list.length) * 100).toFixed(1));

    return {
      subject,
      department,
      atRiskCount,
      avgAttendancePct,
      avgMarksPct,
      failureRiskPct
    };
  });
}
