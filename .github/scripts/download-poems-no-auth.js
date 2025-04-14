const axios = require('axios');
const fs = require('fs');
const path = require('path');

// GitHub repository information
const sourceRepoOwner = 'selinacoppersmith';
const sourceRepoName = 'Witness-My-Depths';

// API configuration - no authentication for public repos
const apiBase = `https://api.github.com/repos/${sourceRepoOwner}/${sourceRepoName}/contents`;
const headers = {
  'Accept': 'application/vnd.github.v3+json'
};

// Main function to download all poems
async function downloadAllPoems() {
  try {
    console.log('Starting to download poems...');
    
    // Create poems directory if it doesn't exist
    const poemsDir = path.join(process.cwd(), 'poems');
    if (!fs.existsSync(poemsDir)) {
      fs.mkdirSync(poemsDir, { recursive: true });
    }
    
    // Get repository root contents
    const rootResponse = await axios.get(apiBase, { headers });
    const rootContents = rootResponse.data;
    
    // Find all directories
    const directories = rootContents.filter(item => item.type === 'dir');
    console.log(`Found ${directories.length} directories`);
    
    // Process all directories in parallel
    const directoryPromises = directories.map(dir => processDirectory(dir.name, `${apiBase}/${dir.name}`));
    const directoryResults = await Promise.all(directoryPromises);
    
    // Also process root markdown files
    const rootPoems = await processRootMarkdownFiles(rootContents);
    
    // Generate index.json
    await generateIndexJson(directoryResults, rootPoems);
    
    console.log('Successfully downloaded all poems');
  } catch (error) {
    console.error('Error downloading poems:', error.message);
    process.exit(1);
  }
}

// Process a single directory
async function processDirectory(dirName, dirUrl) {
  try {
    console.log(`Processing directory: ${dirName}`);
    const response = await axios.get(dirUrl, { headers });
    const contents = response.data;
    
    // Get all markdown files
    const markdownFiles = contents.filter(item => 
      item.type === 'file' && item.name.toLowerCase().endsWith('.md')
    );
    
    console.log(`Found ${markdownFiles.length} markdown files in ${dirName}`);
    
    // Create directory for this folder
    const folderDir = path.join(process.cwd(), 'poems', dirName);
    if (!fs.existsSync(folderDir)) {
      fs.mkdirSync(folderDir, { recursive: true });
    }
    
    // Download all markdown files in parallel
    const downloadPromises = markdownFiles.map(file => downloadPoemFile(file, folderDir));
    const results = await Promise.all(downloadPromises);
    
    return {
      name: dirName,
      poems: results.filter(Boolean)
    };
  } catch (error) {
    console.error(`Error processing directory ${dirName}:`, error.message);
    return null;
  }
}

// Process markdown files in the root directory
async function processRootMarkdownFiles(rootContents) {
  const markdownFiles = rootContents.filter(item => 
    item.type === 'file' && 
    item.name.toLowerCase().endsWith('.md') && 
    item.name.toLowerCase() !== 'readme.md'
  );
  
  console.log(`Found ${markdownFiles.length} markdown files in root directory`);
  
  // Create Uncategorized directory
  const uncategorizedDir = path.join(process.cwd(), 'poems', 'Uncategorized');
  if (!fs.existsSync(uncategorizedDir)) {
    fs.mkdirSync(uncategorizedDir, { recursive: true });
  }
  
  // Download all markdown files in parallel
  const downloadPromises = markdownFiles.map(file => downloadPoemFile(file, uncategorizedDir));
  const results = await Promise.all(downloadPromises);
  
  return {
    name: 'Uncategorized',
    poems: results.filter(Boolean)
  };
}

// Download a poem file
async function downloadPoemFile(file, targetDir) {
  try {
    console.log(`Downloading: ${file.name}`);
    const response = await axios.get(file.download_url);
    const content = response.data;
    
    // Save the file
    const filePath = path.join(targetDir, file.name);
    fs.writeFileSync(filePath, content);
    
    return {
      name: file.name,
      path: file.path,
      content: content
    };
  } catch (error) {
    console.error(`Error downloading poem ${file.name}:`, error.message);
    return null;
  }
}

// Generate index.json file
async function generateIndexJson(directoryResults, rootPoems) {
  try {
    const indexData = {};
    
    // Add poems from directories
    directoryResults.forEach(result => {
      if (result) {
        indexData[result.name] = result.poems;
      }
    });
    
    // Add poems from root
    if (rootPoems && rootPoems.poems.length > 0) {
      indexData[rootPoems.name] = rootPoems.poems;
    }
    
    // Save index.json
    const indexPath = path.join(process.cwd(), 'poems', 'index.json');
    fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2));
    
    console.log('Generated index.json file');
  } catch (error) {
    console.error('Error generating index.json:', error.message);
  }
}

// Run the main function
downloadAllPoems(); 