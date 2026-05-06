/* ── Dept Staff Dashboard JS ── */
/* WORKFLOW: Student submits → DeptStaff reviews
 *   - Forward to Dean (if dean available)
 *   - Send to Admin directly (if dean unavailable)
 *   - Reject (final)
 */

let reports = [];
let currentIndex = null;
let deanUnavailable = false;

function init() {
  // Restore dean toggle state
  deanUnavailable = localStorage.getItem('sfrs_deanUnavailable') === 'true';
  const toggle = document.getElementById('deanToggle');
  if (toggle) toggle.checked = deanUnavailable;
  applyDeanMode();

  reports = getReports();
  renderCards();
  updateCounts();
}

function renderCards() {
  const list = document.getElementById('reportList');
  list.innerHTML = '';
  reports.forEach((r, i) => {
    const s = statusDisplay(r.status);
    const p = priorityDisplay(r.priority);
    const remarksLine = r.remarks ? `<p class="card-remarks">💬 Remarks: ${r.remarks}</p>` : '';
    list.innerHTML += `
      <div class="card" data-status="${r.status}" data-search="${r.student.toLowerCase()} ${r.studentId} ${r.location.toLowerCase()} ${r.category.toLowerCase()} ${r.type.toLowerCase()}">
        <div class="CardTop">
          <div><span class="CardTitle">${r.type}</span><span class="badge ${p.cls}">${p.label}</span></div>
          <button class="view" onclick="openModal(${i})">👁 View &amp; Review</button>
        </div>
        <p class="CardPerson">👤 ${r.student} &nbsp; ID: ${r.studentId}</p>
        <p class="CardDesc">${r.desc}</p>
        <p class="CardTags">📍 ${r.location} &nbsp;&nbsp; 📋 ${r.category} &nbsp;&nbsp; 📅 ${r.date} &nbsp;&nbsp; ${r.id}</p>
        ${remarksLine}
        <span class="status ${s.cls}">${s.icon}</span>
      </div>`;
  });
  document.getElementById('secTitle').textContent = `Reports (${reports.length})`;
}

function updateCounts() {
  const c = { pending:0, forwarded:0, 'sent-to-admin':0, 'dean-approved':0, 'dean-rejected':0, 'admin-approved':0, 'in-progress':0, completed:0, resolved:0, rejected:0 };
  reports.forEach(r => { if (c[r.status] !== undefined) c[r.status]++; });
  const total = reports.length;
  const actionNeeded = c.pending;

  document.getElementById('statTotal').textContent     = total;
  document.getElementById('statPending').textContent   = actionNeeded;
  document.getElementById('statForwarded').textContent = c.forwarded;
  document.getElementById('statSentAdmin').textContent = c['sent-to-admin'];
  document.getElementById('statApproved').textContent  = c['dean-approved'] + c['admin-approved'] + c.resolved;
  document.getElementById('statRejected').textContent  = c.rejected + c['dean-rejected'];
  document.getElementById('secTitle').textContent      = `Reports (${total})`;

  document.getElementById('fb-all').textContent           = total;
  document.getElementById('fb-pending').textContent       = actionNeeded;
  document.getElementById('fb-forwarded').textContent     = c.forwarded;
  document.getElementById('fb-sent-to-admin').textContent = c['sent-to-admin'];
  document.getElementById('fb-approved').textContent      = c['dean-approved'] + c['admin-approved'] + c.resolved;
  document.getElementById('fb-rejected').textContent      = c.rejected + c['dean-rejected'];
}

function toggleDeanMode() {
  deanUnavailable = document.getElementById('deanToggle').checked;
  localStorage.setItem('sfrs_deanUnavailable', deanUnavailable);
  applyDeanMode();
}

function applyDeanMode() {
  const badge = document.getElementById('deanBadge');
  const warn  = document.getElementById('warnBanner');
  const info  = document.getElementById('infoBanner');
  const chip  = document.getElementById('chipSentAdmin');
  if (deanUnavailable) {
    badge.textContent = '✖ Unavailable'; badge.className = 'dean-badge unavailable';
    if (warn) warn.classList.add('show');
    if (info) info.style.display = 'none';
    if (chip) chip.style.display = '';
  } else {
    badge.textContent = '✔ Available'; badge.className = 'dean-badge available';
    if (warn) warn.classList.remove('show');
    if (info) info.style.display = '';
    if (chip) chip.style.display = 'none';
  }
}

function openModal(index) {
  currentIndex = index;
  const r = reports[index];
  document.getElementById('modalReportId').textContent = `Report ID: ${r.id}`;
  document.getElementById('mStudent').textContent   = `${r.student} (${r.studentId})`;
  document.getElementById('mType').textContent      = r.type;
  document.getElementById('mCategory').textContent  = r.category;
  document.getElementById('mDesc').textContent      = r.desc;
  document.getElementById('mLocation').textContent  = r.location;
  document.getElementById('mDate').textContent      = r.date;
  document.getElementById('remarksInput').value     = r.remarks || '';
  setPriority(r.priority || 'medium');

  const notice = document.getElementById('modalDeanNotice');
  const fwdBtn = document.getElementById('btnForward');
  const appBtn = document.getElementById('btnApprove');

  // Only pending reports can be actioned
  const isActionable = r.status === 'pending';
  if (fwdBtn) fwdBtn.disabled = !isActionable;
  if (appBtn) appBtn.disabled = !isActionable;
  document.querySelector('.btn-reject').disabled = !isActionable;

  if (deanUnavailable) {
    if (notice) notice.style.display = '';
    if (fwdBtn) fwdBtn.style.display = 'none';
    if (appBtn) { appBtn.style.display = ''; appBtn.textContent = '🏢 Approve & Send to Admin'; appBtn.classList.add('to-admin'); }
  } else {
    if (notice) notice.style.display = 'none';
    if (fwdBtn) fwdBtn.style.display = '';
    if (appBtn) appBtn.style.display = 'none';
  }

  document.getElementById('modal').classList.add('open');
}

function closeModal() { document.getElementById('modal').classList.remove('open'); }

document.getElementById('modal').addEventListener('click', e => {
  if (e.target === document.getElementById('modal')) closeModal();
});

function doAction(action) {
  if (currentIndex === null) return;
  const r = reports[currentIndex];
  if (r.status !== 'pending') { closeModal(); return; } // guard: only pending can be actioned

  const oldStatus = r.status;
  r.remarks = document.getElementById('remarksInput').value.trim();
  r.priority = ['low','medium','high'].find(l => document.getElementById('pri-'+l).classList.contains('active-'+l)) || r.priority;
  r.updatedAt = nowTimestamp();

  let actionLabel = '';
  if (action === 'reject') {
    r.status = 'rejected';
    actionLabel = 'Rejected report';
  } else if (action === 'forward') {
    r.status = 'forwarded';
    actionLabel = 'Forwarded to Dean';
  } else if (action === 'approve') {
    if (deanUnavailable) {
      r.status = 'sent-to-admin';
      actionLabel = 'Approved & Sent to Admin (Dean unavailable)';
    } else {
      r.status = 'forwarded';
      actionLabel = 'Forwarded to Dean';
    }
  }

  saveReports(reports);
  addLog('Dept Staff', 'Dept Staff', `${actionLabel}`, r.id, `${r.type} @ ${r.location}${r.remarks ? ' | Remarks: '+r.remarks : ''}`);

  renderCards();
  updateCounts();
  closeModal();
}

function setPriority(level) {
  ['low','medium','high'].forEach(l => {
    const btn = document.getElementById('pri-'+l);
    if (btn) btn.className = 'pri-btn' + (l === level ? ' active-'+l : '');
  });
}

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
