document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const toggleLeftSidebar = document.getElementById('toggle-left-sidebar');
    const toggleRightSidebar = document.getElementById('toggle-right-sidebar');

    if (toggleLeftSidebar) {
        toggleLeftSidebar.addEventListener('click', () => {
            body.classList.toggle('left-sidebar-collapsed');
        });
    }

    if (toggleRightSidebar) {
        toggleRightSidebar.addEventListener('click', () => {
            body.classList.toggle('right-sidebar-collapsed');
        });
    }
});
