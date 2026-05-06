function logout() {
    window.location.href = 'logout.html';
}

// Load registration data saved during register
const reg = JSON.parse(localStorage.getItem('registrationData') || 'null');
if (reg) {
    const fullName = (reg.given + ' ' + (reg.mi ? reg.mi + '. ' : '') + reg.lastname).trim();
    document.getElementById('profileName').textContent = fullName;
    document.getElementById('profileEmail').textContent = reg.email || '—';
    document.getElementById('fieldName').textContent = fullName;
    document.getElementById('fieldEmail').textContent = reg.email || '—';
    document.getElementById('fieldPhone').textContent = reg.phone || '—';
    document.getElementById('fieldCollege').textContent = reg.college || '—';

    if (reg.docs && reg.docs.length > 0) {
        document.getElementById('verifiedDocs').innerHTML = reg.docs.map(d => `
            <div class="verified-doc">
                ${d}
                <p>Verified during registration</p>
            </div>`).join('');
    }
}