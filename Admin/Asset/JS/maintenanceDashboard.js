/* ── Maintenance Dashboard JS ── */
/* WORKFLOW: Maintenance sees reports with status 'admin-approved'
 *   - Mark In Progress → 'in-progress'
 *   - Mark Done → 'completed' (Admin then closes it to 'resolved')
 */

let tasks = [];
let currentTaskIndex = null;
let currentStatus = 'admin-approved';

// Maintenance sees only reports assigned to them
const MAINT_VISIBLE = ['admin-approved', 'in-progress', 'completed', 'resolved'];

function init() {
  const all = getReports();
  tasks = all.filter(r => MAINT_VISIBLE.includes(r.status));
  renderCards();
  updateStatCards();
}

function renderCards() {
  const list = document.getElementById('taskList');
  list.innerHTML = '';

  if (tasks.length === 0) {
    list.innerHTML = '<p style="color:#94a3b8;margin-top:24px;text-align:center;">No tasks assigned yet.</p>';
    document.querySelector('.sec-title').textContent = 'Assigned Tasks (0)';
    return;
  }

  tasks.forEach((r, i) => {
    const displayStatus = r.status === 'admin-approved' ? 'pending' : r.status === 'resolved' ? 'completed' : r.status;
    const s = statusDisplay(r.status);
    const p = priorityDisplay(r.priority);
    const notesLine = r.maintenanceNotes ? `<p class="card-remarks">🔧 Notes: ${r.maintenanceNotes}</p>` : '';
    const remarksLine = r.remarks ? `<p class="card-remarks">💬 Admin/Dean: ${r.remarks}</p>` : '';

    list.innerHTML += `
      <div class="card" data-status="${displayStatus}" data-search="${r.type.toLowerCase()} ${r.location.toLowerCase()} ${r.category.toLowerCase()} ${r.student.toLowerCase()}">
        <div class="CardTop">
          <div><span class="CardTitle">${r.type}</span><span class="badge ${p.cls}">${p.label}</span></div>
          <button class="view" onclick="openModal(${i})">🔧 View &amp; Update</button>
        </div>
        <p class="CardPerson">👤 Reported by: ${r.student} &nbsp; ID: ${r.studentId}</p>
        <p class="CardDesc">${r.desc}</p>
        <p class="CardTags">📍 ${r.location} &nbsp;&nbsp; 📋 ${r.category} &nbsp;&nbsp; 📅 ${r.date} &nbsp;&nbsp; ${r.id}</p>
        ${remarksLine}${notesLine}
        <span class="status ${s.cls}">${s.icon}</span>
      </div>`;
  });

  document.querySelector('.sec-title').textContent = `Assigned Tasks (${tasks.length})`;
}

function updateStatCards() {
  const c = { total: tasks.length, pending: 0, inProgress: 0, completed: 0 };
  tasks.forEach(r => {
    if (r.status === 'admin-approved')  c.pending++;
    else if (r.status === 'in-progress') c.inProgress++;
    else if (r.status === 'completed' || r.status === 'resolved') c.completed++;
  });
  const vals = document.querySelectorAll('.StatCard .StatValue');
  if (vals[0]) vals[0].textContent = c.total;
  if (vals[1]) vals[1].textContent = c.pending;
  if (vals[2]) vals[2].textContent = c.inProgress;
  if (vals[3]) vals[3].textContent = c.completed;

  document.querySelectorAll('.filter-chip').forEach(chip => {
    const f = chip.dataset.filter;
    const badge = chip.querySelector('.count-badge');
    if (!badge) return;
    if (f === 'all') badge.textContent = c.total;
    else if (f === 'pending') badge.textContent = c.pending;
    else if (f === 'in-progress') badge.textContent = c.inProgress;
    else if (f === 'completed') badge.textContent = c.completed;
  });
}

function openModal(index) {
  currentTaskIndex = index;
  const r = tasks[index];
  document.getElementById('modalTaskId').textContent  = `Task ID: ${r.id}`;
  document.getElementById('mStudent').textContent     = `${r.student} (${r.studentId})`;
  document.getElementById('mType').textContent        = r.type;
  document.getElementById('mCategory').textContent    = r.category;
  document.getElementById('mDesc').textContent        = r.desc;
  document.getElementById('mLocation').textContent    = r.location;
  document.getElementById('mDate').textContent        = r.date;
  document.getElementById('notesInput').value         = r.maintenanceNotes || '';

  // Map stored status to button state
  const displayStatus = r.status === 'admin-approved' ? 'pending' : r.status === 'resolved' ? 'completed' : r.status;
  setStatus(displayStatus);

  // Disable saving if already resolved by admin
  const isClosed = r.status === 'resolved';
  document.getElementById('btnSave').disabled = isClosed;
  if (isClosed) {
    document.getElementById('notesInput').disabled = true;
    document.getElementById('notesInput').placeholder = 'Report has been closed by Admin.';
  } else {
    document.getElementById('notesInput').disabled = false;
    document.getElementById('notesInput').placeholder = 'Add notes about the repair work done...';
  }

  document.getElementById('modal').classList.add('open');
}

function closeModal() { document.getElementById('modal').classList.remove('open'); }

function saveAndClose() {
  if (currentTaskIndex === null) return;
  const r = tasks[currentTaskIndex];
  if (r.status === 'resolved') { closeModal(); return; }

  const oldStatus = r.status;
  const notes = document.getElementById('notesInput').value.trim();

  // Map display status back to stored status
  let newStatus;
  if (currentStatus === 'pending')      newStatus = 'admin-approved';
  else if (currentStatus === 'in-progress') newStatus = 'in-progress';
  else if (currentStatus === 'completed')   newStatus = 'completed';
  else newStatus = currentStatus;

  r.status = newStatus;
  r.maintenanceNotes = notes;
  r.updatedAt = nowTimestamp();

  const allReports = getReports();
  const idx = allReports.findIndex(rep => rep.id === r.id);
  if (idx !== -1) {
    allReports[idx].status = newStatus;
    allReports[idx].maintenanceNotes = notes;
    allReports[idx].updatedAt = r.updatedAt;
    saveReports(allReports);
  }

  const actionLabel = newStatus === 'completed'
    ? 'Marked as Done — awaiting Admin closure'
    : `Updated status to ${newStatus}`;

  addLog('Maintenance', 'Maintenance Staff', actionLabel, r.id,
    `${r.type} @ ${r.location}${notes ? ' | Notes: '+notes : ''}`);

  // Refresh task list
  const all = getReports();
  tasks = all.filter(rep => MAINT_VISIBLE.includes(rep.id === r.id ? newStatus : rep.status));
  // Simpler: just refresh from storage
  const fresh = getReports();
  tasks = fresh.filter(rep => MAINT_VISIBLE.includes(rep.status));

  renderCards();
  updateStatCards();
  closeModal();
}

function setStatus(level) {
  currentStatus = level;
  ['pending','in-progress','completed'].forEach(s => {
    const btn = document.getElementById('sta-'+s);
    if (btn) btn.className = 'sta-btn' + (s === level ? ' active-'+s.replace('-','') : '');
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
    document.querySelectorAll('#taskList .card').forEach(card => {
      card.style.display = (filter === 'all' || card.dataset.status === filter) ? '' : 'none';
    });
  });
});

function filterCards() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  document.querySelectorAll('#taskList .card').forEach(card => {
    card.style.display = card.dataset.search.includes(q) ? '' : 'none';
  });
}

init();
