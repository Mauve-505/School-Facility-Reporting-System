document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();

    // Student-facing status mapping
    const STATUS_DISPLAY = {
        'pending':        { label:'Awaiting Staff Review',       filter:'pending',     colorClass:'card-yellow', labelClass:'status-yellow' },
        'forwarded':      { label:'Forwarded to Dean',           filter:'pending',     colorClass:'card-yellow', labelClass:'status-yellow' },
        'sent-to-admin':  { label:'Under Admin Review',          filter:'pending',     colorClass:'card-yellow', labelClass:'status-yellow' },
        'dean-approved':  { label:'Approved — Being Processed',  filter:'in-progress', colorClass:'card-blue',   labelClass:'status-blue'   },
        'dean-rejected':  { label:'Not Approved by Dean',        filter:'rejected',    colorClass:'card-red',    labelClass:'status-red'    },
        'admin-approved': { label:'Assigned to Maintenance',     filter:'in-progress', colorClass:'card-blue',   labelClass:'status-blue'   },
        'rejected':       { label:'Rejected',                    filter:'rejected',    colorClass:'card-red',    labelClass:'status-red'    },
        'in-progress':    { label:'Maintenance In Progress',     filter:'in-progress', colorClass:'card-blue',   labelClass:'status-blue'   },
        'completed':      { label:'Work Done — Finalizing',      filter:'in-progress', colorClass:'card-blue',   labelClass:'status-blue'   },
        'resolved':       { label:'Resolved ✅',                 filter:'resolved',    colorClass:'card-green',  labelClass:'status-green'  }
    };

    const all = JSON.parse(localStorage.getItem('sfrs_reports') || '[]');
    const studentName = sessionStorage.getItem('sfrs_name') || 'Student';
    const studentId   = sessionStorage.getItem('sfrs_id') || '';

    const reports = all.filter(r =>
        (studentId && r.studentId === studentId) ||
        (!studentId && r.student === studentName) ||
        studentName === 'Student'
    );

    const counts = { all: reports.length, pending: 0, 'in-progress': 0, resolved: 0, rejected: 0 };
    reports.forEach(r => {
        const f = (STATUS_DISPLAY[r.status] || {}).filter || 'pending';
        if (counts[f] !== undefined) counts[f]++;
    });
    document.getElementById('countAll').textContent        = counts.all;
    document.getElementById('countPending').textContent    = counts.pending;
    document.getElementById('countInProgress').textContent = counts['in-progress'];
    document.getElementById('countResolved').textContent   = counts.resolved;
    document.getElementById('countRejected').textContent   = counts.rejected;

    const cardList = document.getElementById('cardList');
    if (reports.length === 0) {
        cardList.innerHTML = '<p style="color:#94a3b8;margin-top:24px;text-align:center;">No reports yet. <a href="report.html" style="color:#b01c1c;">Submit one now.</a></p>';
        return;
    }

    reports.forEach(r => {
        const cfg = STATUS_DISPLAY[r.status] || STATUS_DISPLAY['pending'];
        const card = document.createElement('div');
        card.className = `card ${cfg.colorClass}`;
        card.setAttribute('data-filter', cfg.filter);
        card.innerHTML = `
            <div class="card-content">
                <div class="card-header">
                    <span class="id-badge">${r.id}</span>
                    <span class="status-label ${cfg.labelClass}"><span class="dot"></span> ${cfg.label}</span>
                </div>
                <span class="CardTitle">${r.type}</span>
                <p class="description">${r.desc || r.description || ''}</p>
                <div class="details">
                    <div class="detail-item"><i data-lucide="map-pin"></i> ${r.location || r.room}</div>
                    <div class="detail-item"><i data-lucide="calendar"></i> Submitted: ${r.submittedAt || r.date}</div>
                    <div class="detail-item"><i data-lucide="clock"></i> Updated: ${r.updatedAt || r.submittedAt || r.date}</div>
                    ${r.maintenanceNotes ? `<div class="detail-item">🔧 ${r.maintenanceNotes}</div>` : ''}
                </div>
            </div>`;
        cardList.appendChild(card);
    });

    lucide.createIcons();

    const searchInput = document.getElementById('searchInput');
    const filterButtons = document.querySelectorAll('.filter-chip');

    const applyFilters = () => {
        const query = searchInput.value.toLowerCase();
        const activeFilter = document.querySelector('.filter-chip.active').getAttribute('data-filter');
        document.querySelectorAll('#cardList .card').forEach(card => {
            const matchFilter = activeFilter === 'all' || card.getAttribute('data-filter') === activeFilter;
            const matchSearch = card.innerText.toLowerCase().includes(query);
            card.style.display = (matchFilter && matchSearch) ? '' : 'none';
        });
    };

    searchInput.addEventListener('input', applyFilters);
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            applyFilters();
        });
    });
});