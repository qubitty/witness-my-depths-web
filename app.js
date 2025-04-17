document.addEventListener('DOMContentLoaded', async function() {
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

    // Handle direct URL access
    const urlParts = window.location.pathname.split('/').filter(Boolean);
    if (urlParts[0] === 'poems' && urlParts.length === 3) {
        const folderName = urlParts[1];
        // TODO: this can easily break if we start using other file types, fix this
        const poemName = `${urlParts[2]}.md`; // Add .md extension back

        // Fetch poems and find the requested poem
        const response = await fetch(`${window.basePath}/poems/index.json`);
        const poemsData = await response.json();
        const poem = poemsData[folderName]?.find(p => p.name === poemName);

        if (poem) {
            displayPoemDetail(poem, folderName);
            return;
        }
    }

    // Handle browser back/forward navigation
    window.addEventListener('popstate', function(event) {
        if (event.state && event.state.poem) {
            // Display the poem from the state
            displayPoemDetail(event.state.poem, event.state.folderName);
        } else {
            // If no state, reload the poem list
            fetchPoems();
        }
    });

    // Fetch poems from local files
    fetchPoems();
});


// Fetch poems from local files
async function fetchPoems() {
    try {
        // Show the poem list view and hide the poem detail view
        document.getElementById('poem-list-view').style.display = 'block';
        document.getElementById('poem-detail-view').style.display = 'none';

        // Clear existing content
        clearFeaturedPoems();
        clearPoems();
    
        // Fetch poems from local files
        const response = await fetch(`${window.basePath}/poems/index.json`);
        if (!response.ok) {
            throw new Error('Failed to fetch poems index');
        }
        
        const poemsData = await response.json();
        
        // Get and show the list of poems
        let allPoems = [];
        Object.entries(poemsData).forEach(([folderName, poems]) => {
            poems.forEach(poem => {
                allPoems.push({
                    ...poem,
                    folder: folderName
                });
            });
        });

        // Process featured poems
        try{
            const { featuredPoems } = await import('./poems.js');

            // Match featured poem references with actual poems in allPoems
            const processedFeaturedPoems = featuredPoems
                .map(featuredRef => allPoems.find(poem => poem.path === featuredRef.path))
                .filter(poem => poem !== undefined && poem !== null);  // Remove any not found

            displayFeaturedPoems(processedFeaturedPoems);

        } catch (error) {
            console.error('Error loading featured poems:', error);
        }
        
        // Display poems
        displayAllPoems(allPoems);

    } catch (error) {
        console.error('Error fetching poems:', error);
        const main = document.querySelector('main');
        main.innerHTML = `<div class="error">Error loading poems: ${error.message}</div>`;
    }
}

// Display featured poems
function displayFeaturedPoems(featuredPoems) {
    const featuredList = document.getElementById('featured-poems-list');
    
    if (!featuredPoems || featuredPoems.length === 0) {
        featuredList.innerHTML = '<li>No featured poems available</li>';
        return;
    }

    for (const poem of featuredPoems) {
        // Create poem element with link to view full poem
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#';
        a.textContent = poem.title || formatTitle(poem.name);
        a.dataset.folder = poem.folder;
        a.dataset.filename = poem.name;
        a.addEventListener('click', function(e) {
            e.preventDefault();
            displayPoemDetail(poem, poem.folder);
        });
        
        li.appendChild(a);
        featuredList.appendChild(li);
    }
}

function clearFeaturedPoems() {
    const featuredList = document.getElementById('featured-poems-list');
    featuredList.innerHTML = ''; // Clear existing featured poems
}

// Display all poems by folder
function displayAllPoems(allPoems) {
    const foldersContainer = document.getElementById('folders-container');
    
    // Group poems by folder
    const folderGroups = {};
    allPoems.forEach(poem => {
        if (!folderGroups[poem.folder]) {
            folderGroups[poem.folder] = [];
        }
        folderGroups[poem.folder].push(poem);
    });

    // Sort folder names alphabetically
    const sortedFolderNames = Object.keys(folderGroups).sort();
    
    // Move "Uncategorized" to the end if it exists
    if (sortedFolderNames.includes('Uncategorized')) {
        sortedFolderNames.splice(sortedFolderNames.indexOf('Uncategorized'), 1);
        sortedFolderNames.push('Uncategorized');
    }
    
    for (const folderName of sortedFolderNames) {
        const folderDiv = document.createElement('div');
        folderDiv.className = 'folder';
        
        const folderTitle = document.createElement('h3');
        folderTitle.className = 'folder-title';
        folderTitle.textContent = folderName;
        
        const poemsList = document.createElement('ul');
        
        // Sort poems by name
        const poems = folderGroups[folderName];

        poems.sort((a, b) => {
            const nameA = formatTitle(a.name);
            const nameB = formatTitle(b.name);
            return nameA.localeCompare(nameB);
        });
        
        for (const poem of poems) {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = '#';
            a.textContent = formatTitle(poem.name);
            a.dataset.folder = folderName;
            a.dataset.filename = poem.name;
            a.addEventListener('click', function(e) {
                e.preventDefault();
                displayPoemDetail(poem, folderName);
            });
            
            li.appendChild(a);
            poemsList.appendChild(li);
        }
        
        folderDiv.appendChild(folderTitle);
        folderDiv.appendChild(poemsList);
        foldersContainer.appendChild(folderDiv);
    }
}

function clearPoems() {
    const foldersContainer = document.getElementById('folders-container');
    foldersContainer.innerHTML = ''; // Clear existing poems
}

// Get the url path for a poem
function getPoemUrl(folderName, poemName) {
    return `/poems/${folderName}/${poemName.replace(/\.md$/, '')}`;
}

// Display poem detail
function displayPoemDetail(poem, folderName) {
    // Update the URL
    const poemUrl = getPoemUrl(folderName, poem.name);
    history.pushState({ poem, folderName }, '', poemUrl);

    // Hide the poem list view and show the poem detail view
    document.getElementById('poem-list-view').style.display = 'none';
    const poemDetailView = document.getElementById('poem-detail-view');
    poemDetailView.style.display = 'block';
    
    // Populate the poem detail view
    poemDetailView.innerHTML = `
        <div class="poem-detail">
            <div class="poem-meta">From: ${folderName}</div>
            <div class="poem-content">${marked.parse(poem.content)}</div>
            <div class="poem-nav">
                <a href="#" id="back-to-list">Back to Poems</a>
            </div>
        </div>
    `;

    // Add event listener for the back button
    document.getElementById('back-to-list').addEventListener('click', function (e) {
        e.preventDefault();
        history.back();
    });
    
    const backLink = document.createElement('a');
    backLink.href = '#';
    backLink.textContent = 'Back to Poems';
    backLink.addEventListener('click', function(e) {
        e.preventDefault();
        history.back();
    });
    
    const nav = document.createElement('div');
    nav.className = 'poem-nav';
    nav.appendChild(backLink);
    
    // Assemble the poem detail view
    poemDiv.appendChild(meta);
    poemDiv.appendChild(content);
    poemDiv.appendChild(nav);
    
    main.appendChild(poemDiv);
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// Configure marked options
marked.setOptions({
    breaks: false,  // Convert \n to <br>
    gfm: true,     // Enable GitHub Flavored Markdown
    headerIds: false, // Disable header IDs
    mangle: false,  // Don't escape HTML
    sanitize: false // Don't sanitize HTML
});

// Format title from filename
function formatTitle(filename) {
    return filename
        .replace(/\.md$/, '')
        .replace(/-/g, ' ');
} 