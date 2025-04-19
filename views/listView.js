import { getAllPoems } from "../poems.js";

/**
 * Renders the list view of poems.
 */
export async function renderListView() {
    document.getElementById('poem-list-view').style.display = 'block';
    document.getElementById('poem-detail-view').style.display = 'none';
    document.getElementById('zine-view').style.display = 'none';

    const allPoems = await getAllPoems();
    displayAllPoems(allPoems);
}

/**
 * Displays all poems in the list view.
 * 
 * @param {Array} allPoems - Array of poem objects.
 */
function displayAllPoems(allPoems) {
    const foldersContainer = document.getElementById('folders-container');
    foldersContainer.innerHTML = ''; // Clear existing content
    
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
            a.href = `/poems/${folderName}/${poem.name.replace(/\.md$/, '')}`;
            a.textContent = formatTitle(poem.name);
            a.dataset.link = true;
            
            li.appendChild(a);
            poemsList.appendChild(li);
        }
        
        folderDiv.appendChild(folderTitle);
        folderDiv.appendChild(poemsList);
        foldersContainer.appendChild(folderDiv);
    }
}

function formatTitle(filename) {
    return filename
        .replace(/\.md$/, '')
        .replace(/-/g, ' ');
}