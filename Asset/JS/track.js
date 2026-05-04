document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();

    const filterButtons = document.querySelectorAll('.filter-chip');
    const cards = document.querySelectorAll('.card');
    const searchInput = document.getElementById('searchInput');

    const updateCounters = () => {
        filterButtons.forEach(button => {
            const filter = button.getAttribute('data-filter');
            if (filter === 'all') return;

            const count = document.querySelectorAll(`.card[data-status="${filter}"]`).length;
            const label = filter.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

            if (count > 0) {
                button.innerHTML = `${label} <span class="count-badge">${count}</span>`;
            } else {
                button.innerHTML = label;
            }
        });
    };

    

    updateCounters();

    const applyFilters = () => {
        const query = searchInput.value.toLowerCase();
        const activeFilter = document.querySelector('.filter-chip.active').getAttribute('data-filter');

        cards.forEach(card => {
            const status = card.getAttribute('data-status');
            const content = card.innerText.toLowerCase();
            const matchesSearch = content.includes(query);
            const matchesFilter = (activeFilter === 'all' || status === activeFilter);

            card.classList.toggle('hidden', !(matchesSearch && matchesFilter));
        });
    };

    searchInput.addEventListener('input', applyFilters);

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            applyFilters();
        });
    });
});
