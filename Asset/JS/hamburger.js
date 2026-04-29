document.addEventListener("DOMContentLoaded", () => {

    const hamburger = document.getElementById("hamburger");

    // works for BOTH pages
    const navLinks = document.querySelector(".links1, .nav-links");

    if (!hamburger || !navLinks) {
        console.log("Navbar elements missing");
        return;
    }

    hamburger.addEventListener("click", () => {
        navLinks.classList.toggle("active");
    });

});