const ROOM_MAP = {
    ccs:   ['LR 1','LR 2','LR 3','LR 4','LR 5','LAB 1','LAB 2'],
    csm:   ['Room 101','Room 102','Room 103','Chemistry Lab','Physics Lab'],
    ccje:  ['CJ Room 1','CJ Room 2','Simulation Room'],
    carch: ['Design Studio A','Design Studio B','Drafting Room 1','Drafting Room 2','Model Workshop','Critique Hall'],
    cais:  ['Seminar Room 1','Seminar Room 2','Language Lab','Asian Studies Hall','Islamic Studies Room','Research Room 3'],
    coe:   ['Eng Lab 1','Eng Lab 2','Fabrication Shop','Hydraulics Lab','Electronics Room','CAD Room','Testing Area'],
    che:   ['Food Lab 1','Food Lab 2','Textile Room','Demo Kitchen','Nutrition Lab','Home Mgmt House'],
    claw:  ['Moot Court','Law Library','LR 401','LR 402','Legal Aid Office','Conference Room A'],
    cla:   ['Lecture Hall 1','Lecture Hall 2','Room 205','Room 206','Room 310','Language Center'],
    cmed:  ['Anatomy Lab','Physiology Lab','Cadaver Room','Lecture Hall M1','Lecture Hall M2','Skills Lab'],
    cnurs: ['Nursing Lab 1','Nursing Lab 2','Skills Training Room','Simulation Ward','Room N101','Room N102'],
    cpads: ['Policy Room 1','Policy Room 2','Governance Lab','Seminar Hall PA','Research Office','Room PA3'],
    cswcd: ['Social Work Lab','Community Room 1','Community Room 2','Counseling Room','SW Seminar Hall','Field Office'],
    cte:   ['Demo Teaching Room','Education Lab','Micro-Teaching Studio','Room TE201','Room TE202','Resource Center'],
    csspe: ['Gymnasium','Fitness Center','Sports Science Lab','Athletic Training Room','Dance Studio','Swimming Pool Area']
};
 
function updateRooms() {
    const dept = document.getElementById('department').value;
    const room = document.getElementById('room');
    room.innerHTML = '<option value="">-- Select Room --</option>';
    (ROOM_MAP[dept] || []).forEach(r => {
        const opt = document.createElement('option');
        opt.text = r;
        room.add(opt);
    });
}
 
function showPreview() {
    const file = document.getElementById('photoinput').files[0];
    const preview = document.getElementById('previewimg');
    if (file) {
        preview.src = URL.createObjectURL(file);
        preview.style.display = 'block';
    }
}
 
function clearErrors() {
    document.querySelectorAll('.field-error').forEach(e => e.style.display = 'none');
    document.querySelectorAll('.input-invalid').forEach(e => e.classList.remove('input-invalid'));
}
 
function showError(fieldId, errId) {
    document.getElementById(fieldId).classList.add('input-invalid');
    document.getElementById(errId).style.display = 'block';
}
 
function submitForm() {
    clearErrors();
    const request     = document.getElementById('myselect').value;
    const deptVal     = document.getElementById('department').value;
    const room        = document.getElementById('room').value;
    const description = document.getElementById('textbox').value.trim();
 
    let valid = true;
    if (!request)     { showError('myselect',   'err-request');     valid = false; }
    if (!deptVal)     { showError('department', 'err-department');  valid = false; }
    if (!room)        { showError('room',       'err-room');        valid = false; }
    if (!description) { showError('textbox',    'err-description'); valid = false; }
    if (!valid) return;
 
    const reports = JSON.parse(localStorage.getItem('sfrs_reports') || '[]');
    const nextNum = reports.length + 1;
    const reportId = 'RPT-' + String(nextNum).padStart(3, '0');
 
    const deptSelect = document.getElementById('department');
    const deptLabel  = deptSelect.options[deptSelect.selectedIndex].text;
 
    const now = new Date();
    const ts  = now.toISOString().slice(0,10) + ' ' + now.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'});
 
    const studentName = sessionStorage.getItem('sfrs_name') || 'Student';
    const studentId   = sessionStorage.getItem('sfrs_id')   || 'N/A';
 
    reports.push({
        id: reportId,
        student: studentName,
        studentId: studentId,
        type: request,
        category: request,
        department: deptLabel,
        room: room,
        location: room + ', ' + deptLabel,
        desc: description,
        description: description,
        date: now.toISOString().slice(0,10),
        submittedAt: ts,
        updatedAt: ts,
        priority: 'medium',
        status: 'pending',
        remarks: '',
        maintenanceNotes: ''
    });
 
    localStorage.setItem('sfrs_reports', JSON.stringify(reports));
 
    const log = JSON.parse(localStorage.getItem('sfrs_activityLog') || '[]');
    log.unshift({
        timestamp: now.toISOString(),
        displayTime: ts,
        role: 'Student',
        actor: studentName,
        action: 'Submitted report',
        reportId,
        detail: request + ' @ ' + room
    });
    localStorage.setItem('sfrs_activityLog', JSON.stringify(log));
 
    const banner = document.getElementById('successBanner');
    banner.textContent = '✅ Report ' + reportId + ' submitted! Forwarding to Dept. Staff for review...';
    banner.style.display = 'block';
    banner.scrollIntoView({ behavior: 'smooth' });
 
    setTimeout(() => { window.location.href = '../Pages/track.html'; }, 1800);
}
 
// ✅ FIXED: Single hamburger handler using DOMContentLoaded
document.addEventListener('DOMContentLoaded', function () {
    const hamburger = document.getElementById('hamburger');
    const navLinks  = document.getElementById('navLinks');
 
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', function () {
            navLinks.classList.toggle('active');
        });
    }
});