(function () {
    // Create the debug element
    const el = document.createElement('div');
    el.id = 'screen-debug';
    el.style.position = 'fixed';
    el.style.bottom = '10px';
    el.style.right = '10px';
    el.style.background = '#222';
    el.style.color = '#0f0';
    el.style.padding = '5px 10px';
    el.style.fontSize = '14px';
    el.style.fontFamily = 'monospace';
    el.style.zIndex = '9999';
    el.style.border = '1px solid #0f0';
    el.style.borderRadius = '4px';
    document.body.appendChild(el);

    function updateScreenSizeDebug() {
        const width = window.innerWidth;
        const label = width <= 480 ? '<= 480px'
                    : width <= 768 ? '<= 768px'
                    : '>= 769px';

        el.textContent = `${width}px (${label})`;
    }

    window.addEventListener("resize", updateScreenSizeDebug);
    document.addEventListener("DOMContentLoaded", updateScreenSizeDebug);
})();