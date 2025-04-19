// Featured poems in display order
export const featuredPoems = [
    {
        path: "done-ish/Divided.md",
        title: "Divided"
    },
    {
        path: "done-ish/Mr Tubbs.md",
        title: "Mr Tubbs"
    },
    {
        path: "done-ish/on depression.md",
        title: "on depression"
    },
    {
        path: "done-ish/on shame.md",
        title: "on shame"
    },
    {
        path: "done-ish/on grief.md",
        title: "on grief"
    },
    {
        path: "done-ish/on time.md",
        title: "on time"
    }
];

/**
 * Gets all poems from the ./poems/index.json file.
 * 
 * @async
 * @returns {Promise<Array>} A promise that resolves to an array of all poems.
 */
export async function getAllPoems() {
    // Fetch poems from local files
    const response = await fetch(`${window.basePath}/poems/index.json`);
    if (!response.ok) {
        throw new Error('Failed to fetch poems index');
    }

    const poemsData = await response.json();
    let allPoems = [];
    Object.entries(poemsData).forEach(([folderName, poems]) => {
        poems.forEach(poem => {
            allPoems.push({
                ...poem,
                folder: folderName
            });
        });
    });

    return allPoems;
}

/**
 * Gets featured poems from the ./poems.js file.
 * 
 * @async
 * @returns {Promise<Array>} A promise that resolves to an array of featured poems.
 */
export async function getFeaturedPoems() {
    // Fetch all poems
    const allPoems = await getAllPoems();
    // Match featured poem references with actual poems in allPoems
    const processedFeaturedPoems = featuredPoems
        .map(featuredRef => allPoems.find(poem => poem.path === featuredRef.path))
        .filter(poem => poem !== undefined && poem !== null);  // Remove any not found
    
    return processedFeaturedPoems;
}

/**
 * Formats the title of a poem by removing the file extension.
 * 
 * @param {string} title - The title of the poem.
 * @returns {string} The formatted title.
 */
export function getPoemUrl(folderName, poemName) {
    return `/poems/${folderName}/${poemName.replace(/\.md$/, '')}`;
}
