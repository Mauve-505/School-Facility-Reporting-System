/**
 * sharedData.js — unified storage for ALL roles (student + admin sides)
 *
 * Single key: 'sfrs_reports'
 *
 * WORKFLOW STATUSES:
 *   'pending'        → Student submitted, waiting for DeptStaff
 *   'forwarded'      → DeptStaff forwarded to Dean
 *   'sent-to-admin'  → DeptStaff bypassed Dean (unavailable), sent to Admin
 *   'dean-approved'  → Dean approved, waiting for Admin
 *   'dean-rejected'  → Dean rejected (final)
 *   'admin-approved' → Admin assigned to Maintenance
 *   'rejected'       → Admin rejected (final)
 *   'in-progress'    → Maintenance working on it
 *   'completed'      → Maintenance done, waiting Admin to close
 *   'resolved'       → Admin closed (final)
 */

const SEED_REPORTS = [
  {
    id:'RPT-001', student:'Juan Dela Cruz', studentId:'2024-12345',
    type:'Broken Chair', category:'Furniture',
    desc:'Chair leg is broken in Room 301. Students are having difficulty sitting comfortably.',
    location:'Room 301', department:'College of Computing Studies', room:'LR 1',
    date:'2026-03-01', submittedAt:'2026-03-01 08:00 AM', updatedAt:'2026-03-01 08:00 AM',
    priority:'medium', status:'pending', remarks:'', maintenanceNotes:''
  },
  {
    id:'RPT-002', student:'Maria Santos', studentId:'2024-12346',
    type:'Projector Not Working', category:'ICT/Equipment',
    desc:'Projector not turning on. Classroom lessons have been disrupted.',
    location:'Room 205', department:'College of Science and Mathematics', room:'Room 102',
    date:'2026-02-28', submittedAt:'2026-02-28 09:15 AM', updatedAt:'2026-02-28 09:15 AM',
    priority:'high', status:'forwarded', remarks:'', maintenanceNotes:''
  },
  {
    id:'RPT-003', student:'Pedro Reyes', studentId:'2024-12347',
    type:'Air Conditioner Noise', category:'Air Conditioning/Ventilation',
    desc:'AC unit making loud rattling noise, disrupting study sessions.',
    location:'Library', department:'College of Liberal Arts', room:'Lecture Hall 1',
    date:'2026-03-02', submittedAt:'2026-03-02 10:30 AM', updatedAt:'2026-03-02 10:30 AM',
    priority:'low', status:'dean-approved', remarks:'Verify ASAP', maintenanceNotes:''
  },
  {
    id:'RPT-004', student:'Ana Garcia', studentId:'2024-12348',
    type:'Leaking Faucet', category:'Plumbing/Water',
    desc:'Water leaking from faucet in restroom, causing waste and slipping hazard.',
    location:'Restroom B2', department:'College of Engineering', room:'Eng Lab 1',
    date:'2026-03-03', submittedAt:'2026-03-03 11:00 AM', updatedAt:'2026-03-03 11:00 AM',
    priority:'high', status:'admin-approved', remarks:'Urgent fix needed', maintenanceNotes:''
  },
  {
    id:'RPT-005', student:'Carlos Lopez', studentId:'2024-12349',
    type:'Broken Light', category:'Electrical',
    desc:'Fluorescent light not working, causing poor visibility in the hallway.',
    location:'Hallway 3F', department:'College of Engineering', room:'Electronics Room',
    date:'2026-03-04', submittedAt:'2026-03-04 09:00 AM', updatedAt:'2026-03-04 02:00 PM',
    priority:'medium', status:'in-progress', remarks:'', maintenanceNotes:'Replacement bulb ordered'
  },
  {
    id:'RPT-006', student:'Lisa Tan', studentId:'2024-12350',
    type:'Cracked Window', category:'Building/Structural',
    desc:'Window has a large crack that poses a safety risk.',
    location:'Room 401', department:'College of Law', room:'LR 401',
    date:'2026-03-05', submittedAt:'2026-03-05 08:30 AM', updatedAt:'2026-03-05 03:00 PM',
    priority:'low', status:'completed', remarks:'', maintenanceNotes:'Window sealed temporarily'
  }
];

function getReports() {
  const raw = localStorage.getItem('sfrs_reports');
  if (!raw) {
    localStorage.setItem('sfrs_reports', JSON.stringify(SEED_REPORTS));
    return SEED_REPORTS.map(r => Object.assign({}, r));
  }
  return JSON.parse(raw);
}

function saveReports(reports) {
  localStorage.setItem('sfrs_reports', JSON.stringify(reports));
}

function getLog() {
  const raw = localStorage.getItem('sfrs_activityLog');
  return raw ? JSON.parse(raw) : [];
}

function addLog(role, actor, action, reportId, detail) {
  const log = getLog();
  const now = new Date();
  log.unshift({
    timestamp: now.toISOString(),
    displayTime: now.toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }) +
                 ' ' + now.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' }),
    role, actor, action,
    reportId: reportId || '',
    detail: detail || ''
  });
  if (log.length > 200) log.splice(200);
  localStorage.setItem('sfrs_activityLog', JSON.stringify(log));
}

const STATUS_MAP = {
  'pending':        { cls:'orange',  icon:'⏳ Pending — Awaiting Dept. Staff' },
  'forwarded':      { cls:'purple',  icon:'📤 Forwarded to Dean' },
  'sent-to-admin':  { cls:'teal',    icon:'🏢 Sent to Admin (Dean Bypassed)' },
  'dean-approved':  { cls:'blue',    icon:'✔ Dean Approved — Awaiting Admin' },
  'dean-rejected':  { cls:'red',     icon:'✖ Rejected by Dean' },
  'admin-approved': { cls:'blue',    icon:'🔧 Assigned to Maintenance' },
  'rejected':       { cls:'red',     icon:'✖ Rejected' },
  'in-progress':    { cls:'blue',    icon:'🔧 In Progress' },
  'completed':      { cls:'teal',    icon:'✔ Done — Awaiting Admin Closure' },
  'resolved':       { cls:'green',   icon:'✅ Resolved' }
};

function statusDisplay(status) {
  return STATUS_MAP[status] || { cls:'orange', icon: status };
}

const PRIORITY_MAP = {
  high:   { cls:'red',    label:'High' },
  medium: { cls:'orange', label:'Medium' },
  low:    { cls:'gray',   label:'Low' }
};

function priorityDisplay(priority) {
  return PRIORITY_MAP[priority] || { cls:'gray', label: priority };
}

function nowTimestamp() {
  const now = new Date();
  return now.toISOString().slice(0,10) + ' ' +
    now.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' });
}
