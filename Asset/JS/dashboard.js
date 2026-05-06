const STUDENT_STATUS = {
        'pending':        { label:'Pending — Awaiting Staff Review', cls:'pending' },
        'forwarded':      { label:'Under Review by Dean',            cls:'pending' },
        'sent-to-admin':  { label:'Under Admin Review',              cls:'pending' },
        'dean-approved':  { label:'Approved — Being Processed',      cls:'pending' },
        'dean-rejected':  { label:'Not Approved',                    cls:'rejected' },
        'admin-approved': { label:'Assigned to Maintenance',         cls:'progress' },
        'rejected':       { label:'Rejected',                        cls:'rejected' },
        'in-progress':    { label:'In Progress',                     cls:'progress' },
        'completed':      { label:'Work Done — Awaiting Closure',    cls:'progress' },
        'resolved':       { label:'Resolved ✅',                     cls:'resolved' }
    };

    function loadDashboard() {
        const studentName = sessionStorage.getItem('sfrs_name') || 'Student';
        const studentId   = sessionStorage.getItem('sfrs_id')   || '';
        document.getElementById('welcomeName').textContent = studentName;

        // Load from unified key
        const all = JSON.parse(localStorage.getItem('sfrs_reports') || '[]');

        // Show only this student's reports (match by studentId or name if no ID)
        const reports = all.filter(r =>
            (studentId && r.studentId === studentId) ||
            (!studentId && r.student === studentName) ||
            // fallback: show all if demo user
            studentName === 'Student'
        );

        let pending = 0, inProgress = 0, resolved = 0;
        reports.forEach(r => {
            if (['pending','forwarded','sent-to-admin','dean-approved'].includes(r.status)) pending++;
            else if (['admin-approved','in-progress','completed'].includes(r.status)) inProgress++;
            else if (r.status === 'resolved') resolved++;
        });
        document.getElementById('statPending').textContent   = pending;
        document.getElementById('statInProgress').textContent = inProgress;
        document.getElementById('statResolved').textContent  = resolved;

        const list = document.getElementById('reportList');
        if (reports.length === 0) {
            list.innerHTML = '<p style="color:#94a3b8;margin-top:16px;">No reports submitted yet.</p>';
            return;
        }

        list.innerHTML = reports.map(r => {
            const s = STUDENT_STATUS[r.status] || { label: r.status, cls:'pending' };
            return `
            <div class="report">
                <span class="cardTitle">${r.type}</span>
                <p class="desc">${r.desc || r.description || ''}</p>
                <span class="info">
                    <p class="CardTags">📍 ${r.location || r.room} &nbsp;&nbsp; 📋 ${r.department || r.category} &nbsp;&nbsp; 📅 ${(r.submittedAt || r.date || '').slice(0,10)}</p>
                </span>
                <span class="status ${s.cls}">${s.label}</span>
            </div><br>`;
        }).join('');
    }

    loadDashboard();