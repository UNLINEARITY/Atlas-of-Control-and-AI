document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const toggleLeftSidebar = document.getElementById('toggle-left-sidebar');
    const toggleRightSidebar = document.getElementById('toggle-right-sidebar');

    // On page load, check localStorage and apply saved states
    if (localStorage.getItem('leftSidebarCollapsed') === 'true') {
        body.classList.add('left-sidebar-collapsed');
    }
    if (localStorage.getItem('rightSidebarCollapsed') === 'true') {
        body.classList.add('right-sidebar-collapsed');
    }

    // Left sidebar toggle handler
    if (toggleLeftSidebar) {
        toggleLeftSidebar.addEventListener('click', () => {
            // Toggle the class on the body
            body.classList.toggle('left-sidebar-collapsed');
            // Save the new state to localStorage
            localStorage.setItem('leftSidebarCollapsed', body.classList.contains('left-sidebar-collapsed'));
        });
    }

    // Right sidebar toggle handler
    if (toggleRightSidebar) {
        toggleRightSidebar.addEventListener('click', () => {
            // Toggle the class on the body
            body.classList.toggle('right-sidebar-collapsed');
            // Save the new state to localStorage
            localStorage.setItem('rightSidebarCollapsed', body.classList.contains('right-sidebar-collapsed'));
        });
    }
});