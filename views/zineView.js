import { getFeaturedPoems } from '../poems.js';

export function renderZineView() {
    document.getElementById('zine-view').style.display = 'block';
    document.getElementById('poem-list-view').style.display = 'none';
    document.getElementById('poem-detail-view').style.display = 'none';

    const zineView = document.getElementById('zine-view');

    // Fetch and display featured poems
    getFeaturedPoems()
        .then(featuredPoems => {
            displayZinePoems(featuredPoems, zineView);
        })
        .catch(error => {
            console.error('Error fetching featured poems:', error);
        });
}

/**
 * Displays featured poems in the zine view.
 * 
 * @param {Array} poems - Array of poem objects.
 * @param {HTMLElement} zineView - The zine view element to display the poems in.
 */
function displayZinePoems(poems, zineView) {
    if (!poems || poems.length === 0) {
        zineView.innerHTML = '<li>No featured poems available</li>';
        return;
    }

    // Clear existing content
    zineView.innerHTML = '';

    for (const poem of poems) {
        const poemDiv = document.createElement('div');
        poemDiv.className = 'poem-content';

        const poemContent = document.createElement('div');
        poemContent.className = 'poem-text';
        poemContent.innerHTML = marked.parse(poem.content);
        poemDiv.appendChild(poemContent);

        zineView.appendChild(poemDiv);
    }
}

// Configure marked options
marked.setOptions({
    breaks: false,  // Convert \n to <br>
    gfm: true,     // Enable GitHub Flavored Markdown
    headerIds: false, // Disable header IDs
    mangle: false,  // Don't escape HTML
    sanitize: false // Don't sanitize HTML
});
