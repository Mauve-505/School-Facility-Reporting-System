/**
 * hamburger.js — shared navbar toggle for all Admin dashboards
 * Handles open/close and closes on outside click.
 */
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var hamburger = document.getElementById('hamburger');
    var navLinks  = document.querySelector('.nav-links');

    if (!hamburger || !navLinks) return;

    // Toggle menu open/closed
    hamburger.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = navLinks.classList.toggle('nav-open');
      hamburger.setAttribute('aria-expanded', isOpen);
      hamburger.classList.toggle('is-open', isOpen);
    });

    // Close when clicking a nav link
    navLinks.addEventListener('click', function () {
      navLinks.classList.remove('nav-open');
      hamburger.classList.remove('is-open');
      hamburger.setAttribute('aria-expanded', 'false');
    });

    // Close when clicking outside
    document.addEventListener('click', function (e) {
      if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) {
        navLinks.classList.remove('nav-open');
        hamburger.classList.remove('is-open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  });
})();
