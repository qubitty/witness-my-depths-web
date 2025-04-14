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
    
    // Fetch poems from GitHub repo
    fetchPoems();
});

// GitHub repository information
const repoOwner = 'selinacoppersmith';
const repoName = 'Witness-My-Depths';
const apiBase = `https://api.github.com/repos/${repoOwner}/${repoName}/contents`;

// Fetch and display poems
async function fetchPoems() {
    try {
        // Fetch all content from the repository
        const rootResponse = await fetch(apiBase);
        if (!rootResponse.ok) throw new Error('Failed to fetch repository contents');
        const rootContents = await rootResponse.json();
        
        // Group files by folder
        const folders = {};
        
        // Process each item in the repository
        for (const item of rootContents) {
            if (item.type === 'dir') {
                // Fetch folder contents
                await processFolderContents(item.name, folders);
            } else if (item.name.endsWith('.md') && item.name !== 'readme.md') {
                // Add markdown files in root to "Uncategorized" folder
                if (!folders['Uncategorized']) {
                    folders['Uncategorized'] = [];
                }
                const fileContent = await fetchFileContent(item.download_url);
                folders['Uncategorized'].push({
                    name: item.name,
                    path: item.path,
                    content: fileContent
                });
            }
        }
        
        // Display featured poems
        displayFeaturedPoems(folders);
        
        // Display all folders and poems
        displayAllPoems(folders);
        
    } catch (error) {
        console.error('Error fetching poems:', error);
        document.getElementById('all-poems').innerHTML += 
            `<p class="error">Failed to load poems. Please try again later.</p>`;
    }
}

// Process contents of a folder
async function processFolderContents(folderName, folders) {
    try {
        const folderResponse = await fetch(`${apiBase}/${folderName}`);
        if (!folderResponse.ok) throw new Error(`Failed to fetch folder: ${folderName}`);
        const folderContents = await folderResponse.json();
        
        folders[folderName] = [];
        
        // Process each markdown file in the folder
        for (const item of folderContents) {
            if (item.type === 'file' && item.name.endsWith('.md')) {
                const fileContent = await fetchFileContent(item.download_url);
                folders[folderName].push({
                    name: item.name,
                    path: item.path,
                    content: fileContent
                });
            }
        }
    } catch (error) {
        console.error(`Error processing folder ${folderName}:`, error);
    }
}

// Fetch content of a markdown file
async function fetchFileContent(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch file: ${url}`);
        return await response.text();
    } catch (error) {
        console.error(`Error fetching file: ${url}`, error);
        return null;
    }
}

// Display featured poems
function displayFeaturedPoems(folders) {
    const featuredList = document.getElementById('featured-poems-list');
    
    for (const featured of featuredPoems) {
        let foundPoem = null;
        const pathParts = featured.path.split('/');
        const folderName = pathParts.length > 1 ? pathParts[0] : 'Uncategorized';
        const fileName = pathParts[pathParts.length - 1];
        
        // Find matching poem in folders
        if (folders[folderName]) {
            foundPoem = folders[folderName].find(poem => poem.name === fileName);
        }
        
        if (foundPoem) {
            // Create poem element with link to view full poem
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = '#';
            a.textContent = featured.title || formatTitle(foundPoem.name);
            a.dataset.folder = folderName;
            a.dataset.filename = foundPoem.name;
            a.addEventListener('click', function(e) {
                e.preventDefault();
                displayPoemDetail(foundPoem, folderName);
            });
            
            li.appendChild(a);
            featuredList.appendChild(li);
        }
    }
}

// Display all poems by folder
function displayAllPoems(folders) {
    const foldersContainer = document.getElementById('folders-container');
    
    // Sort folder names alphabetically
    const sortedFolderNames = Object.keys(folders).sort();
    
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
        const poems = folders[folderName];
        poems.sort((a, b) => a.name.localeCompare(b.name));
        
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
    content.textContent = poem.content;
    
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

// Format title from filename
function formatTitle(filename) {
    return filename
        .replace(/\.md$/, '')
        .replace(/-/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
} 