document.addEventListener('DOMContentLoaded', () => {
    // Use documentElement (the <html> tag) which is consistent with the early-load script.
    const html = document.documentElement; 
    const toggleLeftSidebar = document.getElementById('toggle-left-sidebar');
    const toggleRightSidebar = document.getElementById('toggle-right-sidebar');

    // The initial state is now set by an inline script in the <head>,
    // so the page-load check here is no longer needed.

    // Left sidebar toggle handler
    if (toggleLeftSidebar) {
        toggleLeftSidebar.addEventListener('click', () => {
            // Toggle the class on the <html> element
            html.classList.toggle('left-sidebar-collapsed');
            // Save the new state to localStorage
            localStorage.setItem('leftSidebarCollapsed', html.classList.contains('left-sidebar-collapsed'));
        });
    }

    // Right sidebar toggle handler
    if (toggleRightSidebar) {
        toggleRightSidebar.addEventListener('click', () => {
            // Toggle the class on the <html> element
            html.classList.toggle('right-sidebar-collapsed');
            // Save the new state to localStorage
            localStorage.setItem('rightSidebarCollapsed', html.classList.contains('right-sidebar-collapsed'));
        });
    }
});
