/* ── Dean Dashboard JS ── */
/* WORKFLOW: Dean sees reports with status 'forwarded'
 *   - Approve → status becomes 'dean-approved' (Admin sees it next)
 *   - Reject  → status becomes 'dean-rejected' (final)
 */

let reports = [];
let currentModalIndex = null;

// Dean only sees reports forwarded to them
const DEAN_VISIBLE = ['forwarded', 'dean-approved', 'dean-rejected'];

function init() {
  reports = getReports();
  renderCards();
  updateStatCards();
}

function renderCards() {
  const list = document.getElementById('reportList');
  list.innerHTML = '';
  const visible = reports.filter(r => DEAN_VISIBLE.includes(r.status));

  visible.forEach((r, i) => {
    const s = statusDisplay(r.status);
    const p = priorityDisplay(r.priority);
    const remarksLine = r.remarks ? `<p class="card-remarks">💬 Staff Remarks: ${r.remarks}</p>` : '';
    const globalIdx = reports.indexOf(r);
    list.innerHTML += `
      <div class="card" data-status="${r.status}" data-search="${r.student.toLowerCase()} ${r.studentId} ${r.location.toLowerCase()} ${r.category.toLowerCase()} ${r.type.toLowerCase()}">
        <div class="CardTop">
          <div><span class="CardTitle">${r.type}</span><span class="badge ${p.cls}">${p.label}</span></div>
          <button class="view" onclick="openModal(${globalIdx})">👁 View &amp; Review</button>
        </div>
        <p class="CardPerson">👤 ${r.student} &nbsp; ID: ${r.studentId}</p>
        <p class="CardDesc">${r.desc}</p>
        <p class="CardTags">📍 ${r.location} &nbsp;&nbsp; 📋 ${r.category} &nbsp;&nbsp; 📅 ${r.date} &nbsp;&nbsp; ${r.id}</p>
        ${remarksLine}
        <span class="status ${s.cls}">${s.icon}</span>
      </div>`;
  });

  if (visible.length === 0) {
    list.innerHTML = '<p style="color:#94a3b8;margin-top:16px;text-align:center;">No reports forwarded to Dean yet.</p>';
  }

  document.querySelector('.sec-title').textContent = `Reports Forwarded to Dean (${visible.length})`;
  updateFilterBadges(visible);
}

function updateStatCards() {
  const visible = reports.filter(r => DEAN_VISIBLE.includes(r.status));
  const c = { total: visible.length, pending: 0, approved: 0, rejected: 0 };
  visible.forEach(r => {
    if (r.status === 'forwarded')     c.pending++;
    if (r.status === 'dean-approved') c.approved++;
    if (r.status === 'dean-rejected') c.rejected++;
  });
  const vals = document.querySelectorAll('.StatCard .StatValue');
  if (vals[0]) vals[0].textContent = c.total;
  if (vals[1]) vals[1].textContent = c.pending;
  if (vals[2]) vals[2].textContent = c.approved;
  if (vals[3]) vals[3].textContent = c.rejected;
}

function updateFilterBadges(visible) {
  const c = { all: visible.length, forwarded: 0, 'dean-approved': 0, 'dean-rejected': 0 };
  visible.forEach(r => { if (c[r.status] !== undefined) c[r.status]++; });
  document.querySelectorAll('.filter-chip').forEach(btn => {
    const f = btn.dataset.filter;
    const badge = btn.querySelector('.count-badge');
    if (!badge) return;
    if (f === 'all') badge.textContent = c.all;
    else if (f === 'forwarded') badge.textContent = c.forwarded;
    else if (f === 'dean-approved') badge.textContent = c['dean-approved'];
    else if (f === 'dean-rejected') badge.textContent = c['dean-rejected'];
  });
}

function openModal(globalIndex) {
  currentModalIndex = globalIndex;
  const r = reports[globalIndex];
  document.getElementById('modalReportId').textContent = `Report ID: ${r.id}`;
  document.getElementById('mStudent').textContent   = `${r.student} (${r.studentId})`;
  document.getElementById('mType').textContent      = r.type;
  document.getElementById('mCategory').textContent  = r.category;
  document.getElementById('mDesc').textContent      = r.desc;
  document.getElementById('mLocation').textContent  = r.location;
  document.getElementById('mDate').textContent      = r.date;
  document.getElementById('remarksInput').value     = r.remarks || '';
  const mNotes = document.getElementById('mMaintenanceNotes');
  if (mNotes) mNotes.textContent = r.maintenanceNotes || 'None';
  setPriority(r.priority || 'medium');

  // Only 'forwarded' can be actioned
  const isActionable = r.status === 'forwarded';
  document.querySelectorAll('.modal-actions button').forEach(b => b.disabled = !isActionable);

  document.getElementById('modal').classList.add('open');
}

function closeModal() {
  document.getElementById('modal').classList.remove('open');
}

function applyAction(decision) {
  if (currentModalIndex === null) return;
  const r = reports[currentModalIndex];
  if (r.status !== 'forwarded') { closeModal(); return; }

  const oldStatus = r.status;
  r.remarks  = document.getElementById('remarksInput').value.trim();
  r.priority = ['low','medium','high'].find(l => document.getElementById('pri-'+l).classList.contains('active-'+l)) || r.priority;
  r.updatedAt = nowTimestamp();

  if (decision === 'Approved') {
    r.status = 'dean-approved';
  } else if (decision === 'Rejected') {
    r.status = 'dean-rejected';
  }

  saveReports(reports);
  addLog('Dean', 'Dean', `${decision} report (${oldStatus} → ${r.status})`, r.id,
    `${r.type} @ ${r.location}${r.remarks ? ' | Remarks: '+r.remarks : ''}`);

  renderCards();
  updateStatCards();
  closeModal();
}

function setPriority(level) {
  ['low','medium','high'].forEach(l => {
    const btn = document.getElementById('pri-'+l);
    if (btn) btn.className = 'pri-btn' + (l === level ? ' active-'+l : '');
  });
}

document.getElementById('modal').addEventListener('click', e => {
  if (e.target === document.getElementById('modal')) closeModal();
});

document.querySelectorAll('.filter-chip').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    document.querySelectorAll('#reportList .card').forEach(card => {
      card.style.display = (filter === 'all' || card.dataset.status === filter) ? '' : 'none';
    });
  });
});

function filterCards() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  document.querySelectorAll('#reportList .card').forEach(card => {
    card.style.display = card.dataset.search.includes(q) ? '' : 'none';
  });
}

init();
