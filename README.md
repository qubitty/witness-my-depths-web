# Witness My Depths Website

A simple website that displays poems from the [Witness My Depths](https://github.com/selinacoppersmith/Witness-My-Depths) repository.

## Features

- Pulls poems directly from the GitHub repository

### Featured Poems

To change which poems are featured or to change the order of the featured poems, edit the `poems.js` file:

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

The live site is available at: https://qubitty.github.io/witness-my-depths-web/.