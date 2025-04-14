# Witness My Depths - Poetry Website

A minimalistic Jekyll website for displaying poems from [Witness My Depths](https://github.com/selinacoppersmith/Witness-My-Depths).

## Features

- Pulls poems from the entire GitHub repository, preserving folder structure
- Organizes poems by their folders on the homepage
- Minimalistic black and white design
- Dark/light mode toggle
- Custom ordering of featured poems

## Setup

### Local Development

1. Install Jekyll and Bundler:
   ```
   gem install jekyll bundler
   ```

2. Install dependencies:
   ```
   bundle install
   ```

3. Fetch poems from the repository:
   ```
   ruby scripts/fetch_poems.rb
   ```

4. Run the development server:
   ```
   bundle exec jekyll serve
   ```

5. Visit `http://localhost:4000` in your browser

### Deploying to GitHub Pages

1. Push this repository to GitHub
2. Go to Settings > Pages
3. Set Source to "GitHub Actions"
4. GitHub will automatically build and deploy your site
5. The site will automatically update with new poems daily

## Customizing

### Featured Poem Order

Edit the `_data/poem_order.yml` file to change the order of featured poems:

```yaml
poems:
  - filename: folder-name-poem1.md
    title: Optional Custom Title
  - filename: folder-name-poem2.md
  - filename: folder-name-poem3.md
```

Note: The filename should include the folder prefix that was created during the fetching process.

### Updating Poems

To update the poems from the repository:

```
ruby scripts/fetch_poems.rb
```

This will fetch all markdown files from the entire Witness My Depths repository. The poems will be organized by their folder location.

### Customizing Design

- Main SCSS file: `_sass/main.scss`
- Layout templates: `_layouts/` directory
- JavaScript for theme toggle: `assets/js/theme.js` 