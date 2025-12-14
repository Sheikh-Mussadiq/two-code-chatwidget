const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Starting Vercel build...');

// 1. Build the widget
try {
  console.log('Building widget...');
  execSync('npm run build:widget', { stdio: 'inherit' });
  
  // 2. Copy widget-demo.html to index.html
  console.log('Copying files...');
  fs.copyFileSync('widget-demo.html', 'index.html');
  
  // 3. Create dist-widget directory if it doesn't exist
  if (!fs.existsSync('dist-widget')) {
    fs.mkdirSync('dist-widget');
  }
  
  // 4. Move index.html to dist-widget
  fs.renameSync('index.html', 'dist-widget/index.html');
  
  // 5. Copy public directory if it exists
  if (fs.existsSync('public')) {
    console.log('Copying public directory...');
    copyDirSync('public', 'dist-widget/public');
  }
  
  console.log('Build completed successfully!');
  process.exit(0);
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}

// Helper function to copy directories recursively
function copyDirSync(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
