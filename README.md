# CLASS PULSE — College Attendance Recovery & Academic Risk Early Warning System

CLASS PULSE is an institutional web application built for university faculty, department chairs, and academic advisors. It processes student attendance sheets and examination mark records, calculates exact consecutive class recovery requirements to maintain the mandatory **85% eligibility threshold**, identifies weak or falling academic trajectories, and integrates with **Make.com** automation workflows for faculty appointment scheduling and risk interventions.

---

## 🚀 How to Run CLASS PULSE Locally

Follow these step-by-step instructions to run CLASS PULSE on your local machine:

### 1. Prerequisites
Ensure you have the following installed on your system:
- **Node.js** (v18.0.0 or higher): [Download Node.js](https://nodejs.org/)
- **npm** (v9.0.0 or higher) or **yarn** / **pnpm**
- **Git**: [Download Git](https://git-scm.com/)

---

### 2. Clone the Repository
Open your terminal/PowerShell and run:
```bash
git clone https://github.com/ashmbjatin/ClassPulse.git
cd ClassPulse
```

---

### 3. Install Project Dependencies
Install all required React, TypeScript, Vite, Tailwind CSS, Recharts, and Lucide Icon packages:
```bash
npm install
```

---

### 4. Start the Local Development Server
Launch Vite's local development server:
```bash
npm run dev
```

Once started, open your browser and navigate to:
```text
http://localhost:5173/
```

---

### 5. Build for Production (Optional)
To test or verify the production bundle:
```bash
npm run build
```
To preview the production build locally:
```bash
npm run preview
```

---

## 🎯 Primary Focus Question

CLASS PULSE is engineered around a single core administrative mandate:

> **"WHO NEEDS MY ATTENTION RIGHT NOW, WHY, AND WHAT SHOULD I DO?"**

The dashboard immediately displays a **Priority Intervention Banner** highlighting the highest-risk student, detailing their exact attendance deficit, exam trend, and recommended administrative action.

---

## 📊 Core Features & Main Sections

1. **Overview Dashboard:** High-level metrics (total enrolled, sub-85% attendance, high academic risk, falling marks, immediate interventions), priority student queue, department-wise risk, and subject failure rates.
2. **Student Risk Table:** Comprehensive data table supporting instant search, multi-criteria filtering (department, risk level, `<85%` attendance), column sorting, and **one-click CSV export**.
3. **Student Profile Audit Modal:** In-depth student drawer featuring the **Consecutive Attendance Recovery Calculator**, historical exam trends, Make workflow AI risk explanations, and faculty appointment/notice tracking.
4. **Interventions & Appointments:** Action workflow for scheduling faculty-student advisory sessions, assigning advisors, and tracking student notice receipt (`Sent`, `Delivered`, `Acknowledged`).
5. **Analytics & Risk Distribution:** Interactive Recharts visual analytics showing department risk distributions, attendance vs marks correlation scatter plots, and subject failure risk rankings.
6. **Data Upload & Make Webhook Execution:** Drag-and-drop file upload for CSV/XLSX/JSON attendance sheets with real-time step execution (`Upload → Processing → AI Analysis → Complete`).

---

## 📐 Attendance Recovery Formula

To regain eligibility under an **85% ($T = 0.85$)** mandatory attendance requirement, CLASS PULSE computes the exact minimum number of consecutive future lectures ($N$) a student must attend without absence:

$$\frac{C_{\text{attended}} + N}{C_{\text{total}} + N} \ge 0.85 \implies N \ge \left\lceil \frac{0.85 \cdot C_{\text{total}} - C_{\text{attended}}}{0.15} \right\rceil$$

---

## ⚡ Make.com Webhook Integration

CLASS PULSE connects directly to the production Make.com automation workflow:
- **Webhook URL:** `https://hook.eu1.make.com/oag2tdgwjesdkb5x0qy9yjh1pwh0otwo`
- **Service Layer:** [`src/services/makeWebhook.ts`](src/services/makeWebhook.ts) handles direct fetch requests, error states, multipart file uploads, and payload normalizations.
- **Security:** No backend API keys exposed in the frontend.

---

## 📁 Sample Test File Included

A pre-formatted sample attendance and marks CSV file is included in this repository:
- [`sample_attendance_records.csv`](sample_attendance_records.csv)

You can also download a sample CSV directly inside the application under **6. Data Upload** by clicking **"Download Sample CSV Template"**.

---

## 🛠️ Technology Stack
- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v4 + Institutional Custom CSS
- **Charts:** Recharts
- **Icons:** Lucide React
