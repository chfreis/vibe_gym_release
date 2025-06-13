// Initialize everything on DOMContentLoaded
document.addEventListener("DOMContentLoaded", function () {
    // This will trigger the initialization right after the DOM is ready
    initialize();
});

// Async function to initialize everything, with clean awaiting
async function initialize() {
    try {
        await loadHtmlComponents();

        // Load form-utils.js when any <form>s are found
        if (document.querySelector('form')) {
            await loadScript('js/tools/form-utils.js');
        }
        // When a HTML component data-include attribute is found, load their respective JS file
        if (document.querySelector('[data-include$="navbar.html"]')) {
            await loadScript('js/components/navbar.js');
        }
        if (document.querySelector('[data-include$="confirm-modal.html"]')) {
            await loadScript('js/components/confirm-modal.js');
        }
        if (document.querySelector('[data-include$="access-modal.html"]')) {
            await loadScript('js/components/access-modal.js');
            await loadScript('js/api/customer-requests.js');
        }
        if (document.querySelector('[data-include$="user-register-form.html"]')) {
            await loadScript('js/components/user-register-form.js');
            await loadScript('js/api/customer-requests.js');
        }

        await loadPageSpecificScript();
    } catch (error) {
        console.error(error);
    }
}

// Load the page-specific script based on the current page
async function loadPageSpecificScript() {
    const page = window.location.pathname;
    try {
        // Use endsWith to check the URL and load the relevant scripts
        if (page.endsWith('my-profile.html')) {
            await loadScript('js/my-profile.js');
        }
    } catch (error) {
        console.error('Failed to load script:', error);
    }
}

// Function to dynamically load a script and return a Promise
function loadScript(src) {
    return new Promise(function (resolve, reject) {
        const script = document.createElement('script');
        script.src = src;
        script.type = 'text/javascript';
        script.onload = function () { resolve(); };  // Script loaded successfully
        script.onerror = function () { reject(new Error('Script load error: ' + src)); };
        document.body.appendChild(script);
    });
}

// This function will run as soon as the page loads and populate the elements
// with data-include attributes with their corresponding HTML content.
function loadHtmlComponents() {
    return new Promise(function (resolve, reject) {
        const thisFile = document.thisFile || document.querySelector('script[src*="page-setup.js"]');
        if (!thisFile) {
            reject(new Error('Cannot determine script path for page-setup.js'));
            return;
        }

        const thisFilePath = thisFile.src.substring(0, thisFile.src.lastIndexOf('/') + 1);
        const htmlComponentPath = thisFilePath + '../components/';
        const cssComponentPath = thisFilePath + '../css/components/';
        const cssBasePath = thisFilePath + '../css/';
        const urlPath = window.location.pathname;
        const pageFile = urlPath.substring(urlPath.lastIndexOf('/') + 1);
        const pageName = pageFile.replace(/\.[^/.]+$/, '') || 'index';

        const loadedCssFiles = new Set(); // Track loaded CSS files to avoid duplicates

        // Load global CSS files first
        loadGlobalCss()
            .then(function () {
                return loadComponentsRecursively();
            })
            .then(resolve)
            .catch(reject);

        // Load main.css and page-specific CSS
        function loadGlobalCss() {
            const cssTasks = [];
            // Load main.css
            cssTasks.push(loadCssFile(cssBasePath + 'main.css', true));
            // Load page-specific CSS
            cssTasks.push(loadCssFile(cssBasePath + 'page-specific/' + pageName + '.css', true));
            return Promise.all(cssTasks);
        }

        // Recursively load components until no more are found
        function loadComponentsRecursively() {
            return new Promise(function (resolveRecursion, rejectRecursion) {
                const elements = document.querySelectorAll('[data-include]:not([data-component-loaded])');
                if (elements.length === 0) {
                    resolveRecursion();
                    return;
                }
                const tasks = [];
                Array.from(elements).forEach(function (el) {
                    const componentFile = el.getAttribute('data-include');

                    // Mark element as being processed to avoid duplicate loading
                    el.setAttribute('data-component-loaded', 'true');

                    // Load HTML component
                    tasks.push(
                        fetch(htmlComponentPath + componentFile)
                            .then(function (res) {
                                if (!res.ok) {
                                    throw new Error('Failed to load ' + htmlComponentPath + componentFile + ': ' + res.statusText);
                                }
                                return res.text();
                            })
                            .then(function (text) {
                                el.innerHTML = text;
                            })
                    );
                    // Load corresponding CSS file
                    const cssFile = cssComponentPath + componentFile.replace(/\.html$/, '.css');
                    if (!loadedCssFiles.has(cssFile)) {
                        tasks.push(loadCssFile(cssFile, false));
                    }
                });
                Promise.all(tasks)
                    .then(function () {
                        // After loading this batch, check for newly added nested components
                        loadComponentsRecursively()
                            .then(resolveRecursion)
                            .catch(rejectRecursion);
                    })
                    .catch(rejectRecursion);
            });
        }

        // Helper function to load CSS files
        function loadCssFile(href, isRequired) {
            return new Promise(function (resolve) {
                // Skip if already loaded
                if (loadedCssFiles.has(href)) {
                    resolve();
                    return;
                }
                // Check if CSS link already exists in document
                if (document.querySelector('link[href="' + href + '"]')) {
                    loadedCssFiles.add(href);
                    resolve();
                    return;
                }
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = href;

                link.onload = function () {
                    loadedCssFiles.add(href);
                    resolve();
                };
                link.onerror = function (error) {
                    if (isRequired) {
                        console.warn('Failed to load required CSS:', href, error);
                    } else {
                        console.warn('Failed to load CSS:', href, error);
                    }
                    resolve(); // Don't fail the entire process for CSS errors
                };
                document.head.appendChild(link);
            });
        }
    });
}
