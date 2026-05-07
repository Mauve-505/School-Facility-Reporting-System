/**
 * notifications.js — SFRS Notification System
 *
 * Notifications are stored in localStorage under 'sfrs_notifications'.
 * Each notification:
 *   { id, reportId, reportType, message, status, timestamp, read: false }
 *
 * Called by Admin/Dean/Dept/Maintenance dashboards when they update a report.
 * Read by student-facing pages (dashboard, track) to show the bell icon.
 */

const NOTIF_KEY = 'sfrs_notifications';

const STATUS_MESSAGES = {
  'forwarded':      (r) => `📤 Your report "<b>${r.type}</b>" has been forwarded to the Dean for review.`,
  'sent-to-admin':  (r) => `🏢 Your report "<b>${r.type}</b>" has been escalated to the Admin.`,
  'dean-approved':  (r) => `✅ Great news! Your report "<b>${r.type}</b>" was approved by the Dean.`,
  'dean-rejected':  (r) => `❌ Your report "<b>${r.type}</b>" was not approved by the Dean.`,
  'admin-approved': (r) => `🔧 Your report "<b>${r.type}</b>" has been assigned to the Maintenance team.`,
  'rejected':       (r) => `❌ Your report "<b>${r.type}</b>" was rejected by the Admin.`,
  'in-progress':    (r) => `🔨 Maintenance is now working on your report "<b>${r.type}</b>".`,
  'completed':      (r) => `🏁 Maintenance has completed work on "<b>${r.type}</b>". Awaiting final closure.`,
  'resolved':       (r) => `🎉 Your report "<b>${r.type}</b>" has been fully resolved!`,
};

function getNotifications() {
  const raw = localStorage.getItem(NOTIF_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveNotifications(notifs) {
  localStorage.setItem(NOTIF_KEY, JSON.stringify(notifs));
}

/**
 * Called whenever a report's status changes.
 * @param {Object} report - the full report object after status update
 * @param {string} newStatus - the new status string
 */
function pushNotification(report, newStatus) {
  const msgFn = STATUS_MESSAGES[newStatus];
  if (!msgFn) return; // no notification for this status

  const notifs = getNotifications();
  const notif = {
    id: 'N-' + Date.now(),
    reportId: report.id,
    studentId: report.studentId,
    studentName: report.student,
    reportType: report.type,
    message: msgFn(report),
    status: newStatus,
    timestamp: new Date().toISOString(),
    displayTime: new Date().toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }),
    read: false
  };

  notifs.unshift(notif);
  if (notifs.length > 100) notifs.splice(100);
  saveNotifications(notifs);
}

/**
 * Returns unread count for the current logged-in student.
 */
function getUnreadCount() {
  const studentId = sessionStorage.getItem('sfrs_id') || '';
  const studentName = sessionStorage.getItem('sfrs_name') || '';
  return getNotifications().filter(n =>
    !n.read && (
      (studentId && n.studentId === studentId) ||
      (!studentId && n.studentName === studentName) ||
      studentName === 'Student'
    )
  ).length;
}

/**
 * Returns all notifications for the current student.
 */
function getMyNotifications() {
  const studentId = sessionStorage.getItem('sfrs_id') || '';
  const studentName = sessionStorage.getItem('sfrs_name') || '';
  return getNotifications().filter(n =>
    (studentId && n.studentId === studentId) ||
    (!studentId && n.studentName === studentName) ||
    studentName === 'Student'
  );
}

/**
 * Mark all notifications as read for this student.
 */
function markAllRead() {
  const studentId = sessionStorage.getItem('sfrs_id') || '';
  const studentName = sessionStorage.getItem('sfrs_name') || '';
  const notifs = getNotifications().map(n => {
    if (
      (studentId && n.studentId === studentId) ||
      (!studentId && n.studentName === studentName) ||
      studentName === 'Student'
    ) {
      return { ...n, read: true };
    }
    return n;
  });
  saveNotifications(notifs);
}

/**
 * Injects the notification bell into a nav element.
 * Call this on student-facing pages after DOM is ready.
 * @param {string} navLinksId - the id of the <ul> nav links element
 */
function injectNotificationBell(navLinksId) {
  const nav = document.getElementById(navLinksId);
  if (!nav) return;

  const count = getUnreadCount();

  const li = document.createElement('li');
  li.id = 'notif-nav-item';
  li.innerHTML = `
    <a href="#" id="notif-bell-btn" onclick="toggleNotifPanel(event)" style="position:relative;display:inline-flex;align-items:center;" title="Notifications">
      <span style="font-size:1.2rem;line-height:1;">🔔</span>
      <span id="notif-badge" style="
        display:${count > 0 ? 'inline-flex' : 'none'};
        position:absolute;top:-6px;right:-8px;
        background:#e53e3e;color:#fff;
        font-size:0.65rem;font-weight:700;
        min-width:17px;height:17px;border-radius:999px;
        align-items:center;justify-content:center;padding:0 3px;
        line-height:1;
      ">${count > 9 ? '9+' : count}</span>
    </a>
  `;
  nav.insertBefore(li, nav.firstChild);

  // Inject the panel
  const panel = document.createElement('div');
  panel.id = 'notif-panel';
  panel.style.cssText = `
    display:none;position:fixed;top:58px;right:16px;
    width:340px;max-height:420px;overflow-y:auto;
    background:#fff;border:1px solid #e2e8f0;
    border-radius:14px;box-shadow:0 8px 32px rgba(0,0,0,0.13);
    z-index:9999;font-family:'DM Sans',inherit;
  `;
  document.body.appendChild(panel);
  renderNotifPanel();
}

function toggleNotifPanel(e) {
  e.preventDefault();
  const panel = document.getElementById('notif-panel');
  if (!panel) return;
  const isOpen = panel.style.display === 'block';
  panel.style.display = isOpen ? 'none' : 'block';
  if (!isOpen) {
    renderNotifPanel();
    markAllRead();
    updateBadge(0);
  }
}

function renderNotifPanel() {
  const panel = document.getElementById('notif-panel');
  if (!panel) return;
  const notifs = getMyNotifications();

  if (notifs.length === 0) {
    panel.innerHTML = `
      <div style="padding:20px;text-align:center;color:#94a3b8;">
        <div style="font-size:2rem;margin-bottom:8px;">🔔</div>
        <p style="font-size:0.9rem;">No notifications yet.</p>
        <p style="font-size:0.8rem;color:#cbd5e1;">You'll be notified when your report status changes.</p>
      </div>`;
    return;
  }

  panel.innerHTML = `
    <div style="padding:12px 16px;border-bottom:1px solid #f1f5f9;display:flex;align-items:center;justify-content:space-between;">
      <span style="font-weight:600;font-size:0.95rem;color:#1a202c;">Notifications</span>
      <span style="font-size:0.75rem;color:#94a3b8;">${notifs.length} total</span>
    </div>
    ${notifs.map(n => `
      <div style="
        padding:12px 16px;
        border-bottom:1px solid #f8fafc;
        background:${n.read ? '#fff' : '#f0f9ff'};
        transition:background .2s;
      ">
        <p style="font-size:0.85rem;color:#1e293b;margin:0 0 4px;line-height:1.5;">${n.message}</p>
        <div style="display:flex;align-items:center;gap:8px;margin-top:4px;">
          <span style="font-size:0.72rem;color:#94a3b8;">${n.displayTime}</span>
          <span style="font-size:0.72rem;color:#64748b;background:#f1f5f9;padding:1px 7px;border-radius:999px;">${n.reportId}</span>
          ${!n.read ? '<span style="width:7px;height:7px;border-radius:50%;background:#3b82f6;display:inline-block;"></span>' : ''}
        </div>
      </div>
    `).join('')}
  `;
}

function updateBadge(count) {
  const badge = document.getElementById('notif-badge');
  if (!badge) return;
  if (count > 0) {
    badge.style.display = 'inline-flex';
    badge.textContent = count > 9 ? '9+' : count;
  } else {
    badge.style.display = 'none';
  }
}

// Close panel when clicking outside
document.addEventListener('click', function(e) {
  const panel = document.getElementById('notif-panel');
  const bell = document.getElementById('notif-bell-btn');
  if (panel && bell && !panel.contains(e.target) && !bell.contains(e.target)) {
    panel.style.display = 'none';
  }
});
