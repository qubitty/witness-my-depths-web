document.addEventListener('DOMContentLoaded', function() {
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
    
    // Fetch poems from local files
    fetchPoems();
});


// Fetch poems from local files
async function fetchPoems() {
    try {
        // Fetch poems from local files
        const response = await fetch('/poems/index.json');
        if (!response.ok) {
            throw new Error('Failed to fetch poems index');
        }
        
        const poemsData = await response.json();
        
        // Process the data
        let allPoems = [];
        
        // Process each category
        Object.entries(poemsData).forEach(([folderName, poems]) => {
            // Add folder info to each poem
            poems.forEach(poem => {
                allPoems.push({
                    ...poem,
                    folder: folderName
                });
            });
        });

        // Process featured poems
        let featuredPoems = [];
        try{
            const { featuredPoems } = await import('./poems.js');
            console.log(featuredPoems);
            console.log(allPoems)

            // Match featured poem references with actual poems in allPoems
            const processedFeaturedPoems = featuredPoems
                .map(featuredRef => allPoems.find(poem =>
                    poem.path === featuredRef.path
                ))
                .filter(poem => poem !== undefined && poem !== null);  // Remove any not found

            console.log(processedFeaturedPoems)

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

// Display poem detail
function displayPoemDetail(poem, folderName) {
    // Clear the main content
    const main = document.querySelector('main');
    main.innerHTML = '';
    
    // Create poem container
    const poemDiv = document.createElement('div');
    poemDiv.className = 'poem-detail';
    
    // Create poem title
    const title = document.createElement('h2');
    title.textContent = formatTitle(poem.name);
    
    // Create poem metadata
    const meta = document.createElement('div');
    meta.className = 'poem-meta';
    meta.textContent = `From: ${folderName}`;
    
    // Create poem content
    const content = document.createElement('div');
    content.className = 'poem-content';
    
    // Use marked library to parse markdown content
    content.innerHTML = marked.parse(poem.content);
    
    // Create navigation
    const nav = document.createElement('div');
    nav.className = 'poem-nav';
    
    const backLink = document.createElement('a');
    backLink.href = '#';
    backLink.textContent = 'Back to Poems';
    backLink.addEventListener('click', function(e) {
        e.preventDefault();
        // Reload the page to go back to poem list
        window.location.reload();
    });
    
    nav.appendChild(backLink);
    
    // Assemble the poem detail view
    poemDiv.appendChild(title);
    poemDiv.appendChild(meta);
    poemDiv.appendChild(content);
    poemDiv.appendChild(nav);
    
    main.appendChild(poemDiv);
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// Configure marked options
marked.setOptions({
    breaks: true,  // Convert \n to <br>
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