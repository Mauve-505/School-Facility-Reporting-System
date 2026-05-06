/* ── Admin Dashboard JS ── */
/* WORKFLOW: Admin sees dean-approved + sent-to-admin reports
 *   - Assign to Maintenance → status becomes 'admin-approved'
 *   - Reject → status 'rejected'
 *   - Close completed → status 'resolved'
 */

let reports = [];
let currentModal = null;

// Admin sees everything except pure 'pending' (that's dept staff's queue)
const ADMIN_VISIBLE = ['forwarded','sent-to-admin','dean-approved','dean-rejected','admin-approved','in-progress','completed','resolved','rejected'];

function init() {
  reports = getReports();
  renderCards();
  renderCharts();
  updateStatCards();
}

function renderCards() {
  const list = document.getElementById('reportList');
  list.innerHTML = '';
  const visible = reports; // Admin sees all for full oversight

  visible.forEach((r, i) => {
    const s = statusDisplay(r.status);
    const p = priorityDisplay(r.priority);
    const remarksLine = r.remarks ? `<p class="card-remarks">💬 Remarks: ${r.remarks}</p>` : '';
    const notesLine = r.maintenanceNotes ? `<p class="card-remarks">🔧 Maintenance: ${r.maintenanceNotes}</p>` : '';

    let actionBtn = '';
    if (r.status === 'dean-approved' || r.status === 'sent-to-admin') {
      actionBtn = `<button class="view btn-action-assign" onclick="openModal(${i})">🔧 Assign to Maintenance</button>`;
    } else if (r.status === 'completed') {
      actionBtn = `<button class="view btn-action-close" onclick="openModal(${i})">✅ Close Report</button>`;
    } else {
      actionBtn = `<button class="view" onclick="openModal(${i})">👁 View &amp; Update</button>`;
    }

    list.innerHTML += `
      <div class="card" data-status="${r.status}" data-search="${r.student.toLowerCase()} ${r.studentId} ${r.location.toLowerCase()} ${r.category.toLowerCase()} ${r.type.toLowerCase()}">
        <div class="CardTop">
          <div>
            <span class="CardTitle">${r.type}</span>
            <span class="badge ${p.cls}">${p.label}</span>
            ${r.status === 'sent-to-admin' ? '<span class="tag-staff-approved">🏢 Dean Bypassed</span>' : ''}
            ${r.status === 'completed' ? '<span class="tag-staff-approved" style="background:#0e7490;color:#fff;">🔧 Needs Closure</span>' : ''}
          </div>
          ${actionBtn}
        </div>
        <p class="CardPerson">👤 ${r.student} &nbsp; ID: ${r.studentId}</p>
        <p class="CardDesc">${r.desc}</p>
        <p class="CardTags">📍 ${r.location} &nbsp;&nbsp; 📋 ${r.category} &nbsp;&nbsp; 📅 ${r.date} &nbsp;&nbsp; ${r.id}</p>
        ${remarksLine}${notesLine}
        <span class="status ${s.cls}">${s.icon}</span>
      </div>`;
  });

  document.querySelector('.sec-title').textContent = `All Reports (${visible.length})`;
}

function updateStatCards() {
  const c = {
    total: reports.length, pending: 0, inProgress: 0,
    resolved: 0, rejected: 0, staffApproved: 0
  };
  reports.forEach(r => {
    if (r.status === 'pending' || r.status === 'forwarded') c.pending++;
    else if (r.status === 'sent-to-admin' || r.status === 'dean-approved') c.staffApproved++;
    else if (r.status === 'admin-approved' || r.status === 'in-progress' || r.status === 'completed') c.inProgress++;
    else if (r.status === 'resolved') c.resolved++;
    else if (r.status === 'rejected' || r.status === 'dean-rejected') c.rejected++;
  });
  const vals = document.querySelectorAll('.StatCard .StatValue');
  if (vals[0]) vals[0].textContent = c.total;
  if (vals[1]) vals[1].textContent = c.pending;
  if (vals[2]) vals[2].textContent = c.inProgress;
  if (vals[3]) vals[3].textContent = c.resolved;
  if (vals[4]) vals[4].textContent = c.rejected;
  if (vals[5]) vals[5].textContent = c.staffApproved;
  return c;
}

let trendChart, statusChart, priorityChart;

function renderCharts() {
  const c = updateStatCards();

  if (statusChart) statusChart.destroy();
  statusChart = new Chart(document.getElementById('statusChart'), {
    type: 'pie',
    data: {
      labels: ['Pending/Review','Needs Action','In Progress','Resolved','Rejected'],
      datasets: [{ data:[c.pending, c.staffApproved, c.inProgress, c.resolved, c.rejected],
        backgroundColor:['#a16207','#0e7490','#2563eb','#15803d','#b91c1c'], borderWidth:2, borderColor:'#fff' }]
    },
    options: { responsive:true, plugins:{
      legend:{ position:'right', labels:{ font:{ family:'DM Sans', size:11 }, padding:12 } }
    }}
  });

  const pc = { high:0, medium:0, low:0 };
  reports.forEach(r => { if (pc[r.priority] !== undefined) pc[r.priority]++; });
  if (priorityChart) priorityChart.destroy();
  priorityChart = new Chart(document.getElementById('priorityChart'), {
    type: 'pie',
    data: {
      labels: ['High','Medium','Low'],
      datasets: [{ data:[pc.high, pc.medium, pc.low],
        backgroundColor:['#b91c1c','#ea580c','#475569'], borderWidth:2, borderColor:'#fff' }]
    },
    options: { responsive:true, plugins:{
      legend:{ position:'right', labels:{ font:{ family:'DM Sans', size:11 }, padding:12 } }
    }}
  });

  renderTrendChart('weekly');
  document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderTrendChart(btn.dataset.period);
    });
  });
}

function renderTrendChart(period) {
  const labels = period === 'weekly'
    ? ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
    : period === 'monthly'
    ? ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    : ['2022','2023','2024','2025','2026'];
  const data = labels.map(() => Math.floor(Math.random()*8)+1);
  if (trendChart) trendChart.destroy();
  trendChart = new Chart(document.getElementById('trendChart'), {
    type:'line',
    data:{ labels, datasets:[{ label:'Reports', data, borderColor:'#2563eb', backgroundColor:'rgba(37,99,235,0.08)', tension:0.4, fill:true, pointBackgroundColor:'#2563eb' }] },
    options:{ responsive:true, plugins:{ legend:{ display:false } }, scales:{ y:{ beginAtZero:true, ticks:{ stepSize:1 } } } }
  });
}

function openModal(index) {
  currentModal = index;
  const r = reports[index];
  document.getElementById('modalTitle').textContent = `${r.type} — ${r.id}`;

  // Build action buttons based on status
  let actionHtml = '';
  if (r.status === 'dean-approved' || r.status === 'sent-to-admin') {
    actionHtml = `
      <label class="modal-label">Action</label>
      <div class="status-btn-group">
        <button class="status-action resolved" onclick="doAdminAction('assign')">🔧 Assign to Maintenance</button>
        <button class="status-action rejected" onclick="doAdminAction('reject')">✖ Reject</button>
      </div>`;
  } else if (r.status === 'completed') {
    actionHtml = `
      <label class="modal-label">Action</label>
      <div class="status-btn-group">
        <button class="status-action resolved" onclick="doAdminAction('close')">✅ Close & Mark Resolved</button>
        <button class="status-action in-progress" onclick="doAdminAction('reopen')">🔄 Send Back to Maintenance</button>
      </div>`;
  } else {
    actionHtml = `<p style="color:#94a3b8;font-size:0.85rem;">No action needed at this stage.</p>`;
  }

  document.getElementById('modalBody').innerHTML = `
    <div style="display:flex;flex-direction:column;gap:8px;">
      <p><strong>Student:</strong> ${r.student} (${r.studentId})</p>
      <p><strong>Type:</strong> ${r.type} &nbsp; <strong>Category:</strong> ${r.category}</p>
      <p><strong>Location:</strong> ${r.location}</p>
      <p><strong>Description:</strong> ${r.desc}</p>
      <p><strong>Priority:</strong> ${r.priority}</p>
      <p><strong>Status:</strong> ${statusDisplay(r.status).icon}</p>
      ${r.remarks ? `<p><strong>Remarks:</strong> ${r.remarks}</p>` : ''}
      ${r.maintenanceNotes ? `<p><strong>Maintenance Notes:</strong> ${r.maintenanceNotes}</p>` : ''}
      <p><strong>Submitted:</strong> ${r.submittedAt || r.date} &nbsp; <strong>Updated:</strong> ${r.updatedAt || '—'}</p>
    </div>`;

  document.getElementById('modalFooter').innerHTML = actionHtml + `<div id="updateMsg" class="update-msg"></div>`;
  document.getElementById('modalOverlay').classList.add('open');
}

function doAdminAction(action) {
  if (currentModal === null) return;
  const r = reports[currentModal];
  const oldStatus = r.status;
  r.updatedAt = nowTimestamp();

  if (action === 'assign') {
    r.status = 'admin-approved';
    addLog('Admin', 'Admin', 'Assigned to Maintenance', r.id, `${r.type} @ ${r.location}`);
  } else if (action === 'reject') {
    r.status = 'rejected';
    addLog('Admin', 'Admin', 'Rejected report', r.id, `${r.type} @ ${r.location}`);
  } else if (action === 'close') {
    r.status = 'resolved';
    addLog('Admin', 'Admin', 'Closed report — Resolved', r.id, `${r.type} @ ${r.location}`);
  } else if (action === 'reopen') {
    r.status = 'admin-approved';
    addLog('Admin', 'Admin', 'Sent back to Maintenance', r.id, `${r.type} @ ${r.location}`);
  }

  saveReports(reports);
  document.getElementById('updateMsg').textContent = `✔ Updated to: ${r.status}`;
  setTimeout(() => { closeModal(); renderCards(); renderCharts(); }, 900);
}

function closeModal(e) {
  if (e && e.target !== document.getElementById('modalOverlay')) return;
  document.getElementById('modalOverlay').classList.remove('open');
}

function filterCards() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  document.querySelectorAll('#reportList .card').forEach(card => {
    card.style.display = card.dataset.search.includes(q) ? '' : 'none';
  });
}

init();
