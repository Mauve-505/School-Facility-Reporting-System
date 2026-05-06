function logActivity(user, role, action) {
  const table = document.getElementById("activityTable");
  const row = table.insertRow(1);
  const badgeClass = action === "Logged In" ? "login" : "logout";
  row.innerHTML =
    '<td>' + user + '</td>' +
    '<td>' + role + '</td>' +
    '<td><span class="badge ' + badgeClass + '">' + action + '</span></td>' +
    '<td>' + new Date().toLocaleString() + '</td>';
}

function goBack() {
  window.history.back();
}
