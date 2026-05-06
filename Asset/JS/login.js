  var DEAN_EMAILS = [
    "dean@wmsu.edu"
  ];

  var ADMIN_EMAILS = [
    "admin@wmsu.edu"
  ];

  var MAINTENANCE_EMAILS = [
    "maintenance@wmsu.edu"
  ];

  var DEPT_EMAILS = [
    "deptstaff@wmsu.edu"
  ];

  function handleLogin(event) {
    event.preventDefault();
    var email = document.getElementById('email').value.trim().toLowerCase();
    // Store user identity for student pages
    sessionStorage.setItem('sfrs_email', email);

    if (ADMIN_EMAILS.includes(email)) {
      window.location.href = "../Admin/Pages/adminlog.html";
    } else if (DEAN_EMAILS.includes(email)) {
      window.location.href = "../Admin/Pages/deanlog.html";
    } else if (MAINTENANCE_EMAILS.includes(email)) {
      window.location.href = "../Admin/Pages/maintenancelog.html";
    } else if (DEPT_EMAILS.includes(email)) {
      window.location.href = "../Admin/Pages/deptlog.html";
    } else {
      // Regular student — store demo name
      var name = email.split('@')[0] || 'Student';
      name = name.charAt(0).toUpperCase() + name.slice(1);
      sessionStorage.setItem('sfrs_name', name);
      sessionStorage.setItem('sfrs_id', '2024-99999');
      window.location.href = "logsucess.html";
    }
  }

  function showHidePassword() {
    var input = document.getElementById('password');
    input.type = (input.type === "password") ? "text" : "password";
  }