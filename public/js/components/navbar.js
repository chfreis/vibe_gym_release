// This script ensures that links that point to sections within the same page (using hashes like #home) 
// always navigate to the correct part of the index.html page, even if the user is not currently on the index page.

// Check if the current page is index.html or its root directory
const indexPage = location.pathname.endsWith('/') || location.pathname.endsWith('index.html');
// Find all anchor elements with href attributes starting with "#"
document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
        // If the current page is not the index page, we prevent the default action
        if (!indexPage) {
            e.preventDefault();
            const hash = e.target.getAttribute('href');
            location.href = 'index.html' + hash;     // Get the hash (the section ID) from the clicked link's href
        }
    });
});
