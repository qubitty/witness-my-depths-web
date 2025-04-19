import { getAllPoems } from "../poems.js";

export async function renderPoemView(folder, title) {
    document.getElementById('zine-view').style.display = 'none';
    document.getElementById('poem-list-view').style.display = 'none';
    document.getElementById('poem-detail-view').style.display = 'block';

    try{
        const decodedFolder = decodeURIComponent(folder);
        const decodedTitle = decodeURIComponent(title);
    
        // Fetch poems data
        const allPoems = await getAllPoems();

        // Find the specific poem based on folder and title
        const poem = allPoems.find(p =>
            p.folder === decodedFolder &&
            p.name.replace(/\.md$/, '') === decodedTitle);
        if (!poem) {
            throw new Error(`Poem not found: ${decodedFolder}/${decodedTitle}`);
        }

        // Display the poem
        displayPoemView(poem, decodedFolder);

    } catch (error) {
        console.error("Error displaying poem:", error);
        document.getElementById('poem-detail-view').innerHTML = '<h2>Error loading poem</h2>';
    }
}

function displayPoemView(poem, folderName) {
    const poemDetailView = document.getElementById('poem-detail-view');
    poemDetailView.style.display = 'block';

    poemDetailView.innerHTML = ''; // Clear existing content

    poemDetailView.innerHTML = `
        <div class="poem-detail">
            <div class="poem-meta">From: ${folderName}</div>
            <div class="poem-content">${marked.parse(poem.content)}</div>
            <div class="poem-nav">
                <a href="/all" id="back-to-list" data-link>Back to Poems</a>
            </div>
        </div>
    `;
 
}
