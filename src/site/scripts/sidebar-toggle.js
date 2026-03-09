document.addEventListener('DOMContentLoaded', () => {
    const html = document.documentElement;
    const toggleLeftSidebar = document.getElementById('toggle-left-sidebar');
    const toggleRightSidebar = document.getElementById('toggle-right-sidebar');
    const closeLeftSidebar = document.getElementById('close-left-sidebar');
    const closeRightSidebar = document.getElementById('close-right-sidebar');

    const stateConfig = {
        left: {
            className: 'left-sidebar-collapsed',
            storageKey: 'leftSidebarCollapsed',
            rootSelector: '.filetree-sidebar-wrapper',
            button: toggleLeftSidebar,
            expandLabel: 'Expand left sidebar',
            collapseLabel: 'Collapse left sidebar',
        },
        right: {
            className: 'right-sidebar-collapsed',
            storageKey: 'rightSidebarCollapsed',
            rootSelector: '.sidebar-wrapper',
            button: toggleRightSidebar,
            expandLabel: 'Expand right sidebar',
            collapseLabel: 'Collapse right sidebar',
        },
    };

    const persistState = (key, value) => {
        try {
            localStorage.setItem(key, String(value));
        } catch (error) {
            console.warn(`Unable to persist sidebar state for ${key}.`, error);
        }
    };

    const hasSidebar = (side) => Boolean(document.querySelector(stateConfig[side].rootSelector));

    const updateButtonState = (side) => {
        const config = stateConfig[side];
        const exists = hasSidebar(side);
        const isCollapsed = html.classList.contains(config.className);

        html.classList.toggle(`has-${side}-sidebar`, exists);

        if (!config.button) {
            return;
        }

        config.button.hidden = !exists;
        config.button.setAttribute('aria-hidden', String(!exists));

        if (!exists) {
            return;
        }

        const label = isCollapsed ? config.expandLabel : config.collapseLabel;
        config.button.setAttribute('aria-expanded', String(!isCollapsed));
        config.button.setAttribute('aria-label', label);
        config.button.setAttribute('title', label);
    };

    const syncSidebarState = () => {
        updateButtonState('left');
        updateButtonState('right');
    };

    const setSidebarCollapsed = (side, collapsed) => {
        const config = stateConfig[side];

        if (!hasSidebar(side)) {
            return;
        }

        html.classList.toggle(config.className, collapsed);
        persistState(config.storageKey, collapsed);
        syncSidebarState();
    };

    const toggleSidebar = (side) => {
        const className = stateConfig[side].className;
        setSidebarCollapsed(side, !html.classList.contains(className));
    };

    if (toggleLeftSidebar) {
        toggleLeftSidebar.addEventListener('click', () => toggleSidebar('left'));
    }

    if (toggleRightSidebar) {
        toggleRightSidebar.addEventListener('click', () => toggleSidebar('right'));
    }

    if (closeLeftSidebar) {
        closeLeftSidebar.addEventListener('click', () => setSidebarCollapsed('left', true));
    }

    if (closeRightSidebar) {
        closeRightSidebar.addEventListener('click', () => setSidebarCollapsed('right', true));
    }

    const observer = new MutationObserver(syncSidebarState);
    observer.observe(html, { attributes: true, attributeFilter: ['class'] });

    syncSidebarState();
});
