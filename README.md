# Witness My Depths - Poetry Website

A simple static website that displays poems from the [Witness My Depths](https://github.com/selinacoppersmith/Witness-My-Depths) repository.

## Features

- Pulls poems directly from the GitHub repository
- Minimalistic black and white design
- Dark/light mode toggle
- Organizes poems by their folders
- Featured poems section

## How It Works

This is a completely static website that uses JavaScript to:

1. Fetch poems from the GitHub repository via the API
2. Display poems organized by their folders
3. Show featured poems in a specified order
4. Provide a simple reading experience

## Customizing

### Featured Poems

To change which poems are featured, edit the `poems.js` file:

```javascript
// Featured poems in display order
const featuredPoems = [
    {
        path: "done-ish/on grief.md",
        title: "On Grief"
    },
    // Add more featured poems here
];
```

### Styling

The site styling is contained in `styles.css`. You can edit this file to change colors, fonts, and layout.

## Deployment

The site is automatically deployed to GitHub Pages using GitHub Actions when changes are pushed to the main branch.

The live site is available at: https://yourusername.github.io/witness-my-depths-web/ 