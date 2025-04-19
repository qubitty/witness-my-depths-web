import { initRouter, navigateTo } from './router/router.js';

document.addEventListener('DOMContentLoaded', function() {
    
    document.body.addEventListener('click', function(event) {
        const link = event.target.closest('a[data-link]');
        if (link) {
            event.preventDefault();
            const url = link.getAttribute('href');
            navigateTo(url);
        }
    });

    initRouter();

    // Set up theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.documentElement;

    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        body.setAttribute('data-theme', savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        body.setAttribute('data-theme', 'dark');
    }

    // Theme toggle functionality
    themeToggle.addEventListener('click', function() {
        const currentTheme = body.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
});

// Configure marked options
marked.setOptions({
    breaks: false,  // Convert \n to <br>
    gfm: true,     // Enable GitHub Flavored Markdown
    headerIds: false, // Disable header IDs
    mangle: false,  // Don't escape HTML
    sanitize: false // Don't sanitize HTML
});
