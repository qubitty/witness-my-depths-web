document.addEventListener('DOMContentLoaded', function() {
  const toggleButton = document.getElementById('theme-toggle-btn');
  const htmlElement = document.documentElement;
  
  // Check for saved theme preference or use OS preference
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    htmlElement.setAttribute('data-theme', savedTheme);
  } else {
    // Check if user has dark mode enabled at OS level
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDarkMode) {
      htmlElement.setAttribute('data-theme', 'dark');
    }
  }
  
  // Add toggle functionality
  toggleButton.addEventListener('click', function() {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  });
}); 