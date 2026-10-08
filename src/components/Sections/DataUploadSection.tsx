import React, { useState, useRef } from 'react';
import { uploadFileToMakeWebhook, sendDataToMakeWebhook } from '../../services/makeWebhook';
import type { MakeWebhookResponse } from '../../types';
import { INITIAL_STUDENTS } from '../../data/mockData';
import { Upload, CheckCircle2, AlertTriangle, RefreshCw, Download, Radio, FileSpreadsheet } from 'lucide-react';

interface DataUploadSectionProps {
  onWebhookSuccess: (response: MakeWebhookResponse) => void;
}

type UploadStep = 'IDLE' | 'UPLOADING' | 'PROCESSING' | 'AI_ANALYSIS' | 'COMPLETE' | 'ERROR';

export const DataUploadSection: React.FC<DataUploadSectionProps> = ({ onWebhookSuccess }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [department, setDepartment] = useState('Computer Science');
  const [subject, setSubject] = useState('Data Structures & Algorithms');
  
  const [currentStep, setCurrentStep] = useState<UploadStep>('IDLE');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<MakeWebhookResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const processFileToMake = async () => {
    if (!selectedFile) return;

    setCurrentStep('UPLOADING');
    setErrorMessage(null);

    try {
      await new Promise(res => setTimeout(res, 600));
      setCurrentStep('PROCESSING');

      await new Promise(res => setTimeout(res, 600));
      setCurrentStep('AI_ANALYSIS');

      const response = await uploadFileToMakeWebhook(selectedFile, { department, subject });

      setCurrentStep('COMPLETE');
      setLastResponse(response);
      onWebhookSuccess(response);
    } catch (err: any) {
      console.error(err);
      setCurrentStep('ERROR');
      setErrorMessage(err.message || 'Failed to submit file to Make webhook.');
    }
  };

  const sendTestPayloadToMake = async () => {
    setCurrentStep('UPLOADING');
    setErrorMessage(null);

    try {
      await new Promise(res => setTimeout(res, 500));
      setCurrentStep('PROCESSING');

      await new Promise(res => setTimeout(res, 500));
      setCurrentStep('AI_ANALYSIS');

      const response = await sendDataToMakeWebhook(INITIAL_STUDENTS, { department, subject });

      setCurrentStep('COMPLETE');
      setLastResponse(response);
      onWebhookSuccess(response);
    } catch (err: any) {
      console.error(err);
      setCurrentStep('ERROR');
      setErrorMessage(err.message || 'Failed to send test payload to Make webhook.');
    }
  };

  const downloadSampleCSV = () => {
    const csvContent = `ID,StudentName,Department,Subject,Semester,AttendedClasses,TotalClasses,CurrentMarks\nCS-2026-001,Amit Kumar,Computer Science,Data Structures,5,26,45,52\nME-2026-002,Priya Sharma,Mechanical Eng,Thermodynamics,6,30,42,48\nEE-2026-003,Rajesh Verma,Electronics Eng,Digital Signal Processing,5,34,44,58\nDS-2026-004,Neha Gupta,Data Science,Machine Learning,4,32,40,54`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'ClassPulse_Attendance_Sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-md border border-slate-200 shadow-sm flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-slate-900 font-serif flex items-center space-x-2">
            <Upload className="w-5 h-5 text-slate-700" />
            <span>Attendance & Examination Data Upload</span>
          </h2>
          <p className="text-xs text-slate-500">
            Submit attendance logs and test mark sheets to trigger the Make.com AI analytics workflow.
          </p>
        </div>

        <button
          onClick={downloadSampleCSV}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded border border-slate-300 text-xs font-semibold flex items-center space-x-1.5 transition"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download Sample CSV Template</span>
        </button>
      </div>

      <div className="bg-slate-900 text-white p-4 rounded-md border border-slate-800 shadow-sm">
        <div className="text-xs font-mono font-semibold uppercase text-slate-400 mb-3 flex items-center space-x-2">
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>MAKE WORKFLOW EXECUTION STATUS</span>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
          <div className={`p-2.5 rounded border transition ${currentStep === 'UPLOADING' ? 'bg-amber-900/60 border-amber-500 text-white font-bold' : currentStep === 'COMPLETE' || currentStep === 'PROCESSING' || currentStep === 'AI_ANALYSIS' ? 'bg-slate-800 border-slate-700 text-emerald-400' : 'bg-slate-850 border-slate-800 text-slate-500'}`}>
            1. File Upload
          </div>
          <div className={`p-2.5 rounded border transition ${currentStep === 'PROCESSING' ? 'bg-amber-900/60 border-amber-500 text-white font-bold' : currentStep === 'COMPLETE' || currentStep === 'AI_ANALYSIS' ? 'bg-slate-800 border-slate-700 text-emerald-400' : 'bg-slate-850 border-slate-800 text-slate-500'}`}>
            2. Processing
          </div>
          <div className={`p-2.5 rounded border transition ${currentStep === 'AI_ANALYSIS' ? 'bg-amber-900/60 border-amber-500 text-white font-bold animate-pulse' : currentStep === 'COMPLETE' ? 'bg-slate-800 border-slate-700 text-emerald-400' : 'bg-slate-850 border-slate-800 text-slate-500'}`}>
            3. AI Analysis
          </div>
          <div className={`p-2.5 rounded border transition ${currentStep === 'COMPLETE' ? 'bg-emerald-950 border-emerald-500 text-emerald-200 font-bold' : currentStep === 'ERROR' ? 'bg-red-950 border-red-500 text-red-200 font-bold' : 'bg-slate-850 border-slate-800 text-slate-500'}`}>
            4. Complete / Error
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-md border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
              Target Department
            </label>
            <select
              value={department}
              onChange={e => setDepartment(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 font-medium"
            >
              <option value="Computer Science">Computer Science</option>
              <option value="Mechanical Eng">Mechanical Eng</option>
              <option value="Electronics Eng">Electronics Eng</option>
              <option value="Data Science">Data Science</option>
              <option value="Civil Eng">Civil Eng</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
              Subject Course
            </label>
            <input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 font-medium"
            />
          </div>
        </div>

        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-md p-8 text-center cursor-pointer transition ${
            dragActive
              ? 'border-slate-800 bg-slate-100'
              : selectedFile
              ? 'border-emerald-500 bg-emerald-50/30'
              : 'border-slate-300 bg-slate-50 hover:bg-slate-100/60'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls,.json,.txt"
            onChange={handleFileChange}
            className="hidden"
          />

          {selectedFile ? (
            <div className="flex flex-col items-center justify-center space-y-2">
              <FileSpreadsheet className="w-10 h-10 text-emerald-600" />
              <div className="font-bold text-slate-900 text-sm">{selectedFile.name}</div>
              <div className="text-xs font-mono text-slate-500">
                {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type || 'CSV/XLSX Document'}
              </div>
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  setSelectedFile(null);
                }}
                className="text-xs text-red-600 underline font-medium hover:text-red-800 mt-1"
              >
                Remove selected file
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-2">
              <Upload className="w-8 h-8 text-slate-400" />
              <div className="font-bold text-sm text-slate-800">
                Drag & drop attendance/marks sheet here, or click to browse
              </div>
              <div className="text-xs text-slate-500">
                Supports CSV, Excel (.xlsx), or JSON data files
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2">
          <button
            onClick={sendTestPayloadToMake}
            disabled={currentStep === 'UPLOADING' || currentStep === 'PROCESSING' || currentStep === 'AI_ANALYSIS'}
            className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded border border-slate-300 text-xs font-semibold transition flex items-center justify-center space-x-1.5 disabled:opacity-50"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Transmit Sample Dataset to Make Webhook</span>
          </button>

          <button
            onClick={processFileToMake}
            disabled={!selectedFile || currentStep === 'UPLOADING' || currentStep === 'PROCESSING' || currentStep === 'AI_ANALYSIS'}
            className="w-full sm:w-auto px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold border border-slate-700 transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            <span>
              {currentStep === 'UPLOADING'
                ? 'Uploading to Make...'
                : currentStep === 'PROCESSING'
                ? 'Make Processing...'
                : currentStep === 'AI_ANALYSIS'
                ? 'Running AI Analysis...'
                : 'Send to Make Webhook & Analyze'}
            </span>
          </button>
        </div>
      </div>

      {lastResponse && (
        <div className="bg-slate-900 text-slate-100 p-4 rounded-md border border-slate-800 space-y-3 font-mono text-xs">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>LIVE CONFIRMATION FROM MAKE WORKHOOK</span>
          </div>

          <p className="text-slate-300 font-sans text-xs">
            {lastResponse.message}
          </p>

          <div className="bg-slate-950 p-3 rounded border border-slate-800 overflow-x-auto text-[11px] text-slate-300">
            <pre>{JSON.stringify(lastResponse, null, 2)}</pre>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-950 text-red-100 p-4 rounded-md border border-red-800 space-y-2 font-mono text-xs">
          <div className="flex items-center space-x-2 text-red-400 font-bold">
            <AlertTriangle className="w-4 h-4" />
            <span>MAKE WEBHOOK ERROR</span>
          </div>
          <p className="font-sans text-xs">{errorMessage}</p>
        </div>
      )}
    </div>
  );
};
