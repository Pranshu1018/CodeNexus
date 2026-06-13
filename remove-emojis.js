// Script to remove emojis from all JSX/JS files
const fs = require('fs');
const path = require('path');

const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA70}-\u{1FAFF}]/gu;

function removeEmojis(text) {
  return text.replace(emojiRegex, '');
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const cleaned = removeEmojis(content);
    
    if (content !== cleaned) {
      fs.writeFileSync(filePath, cleaned, 'utf8');
      console.log(`✓ Cleaned: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  let cleanedCount = 0;
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!['node_modules', '.git', 'dist', 'build'].includes(file)) {
        cleanedCount += walkDir(filePath);
      }
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      if (processFile(filePath)) {
        cleanedCount++;
      }
    }
  });
  
  return cleanedCount;
}

console.log('Removing emojis from client files...\n');
const count = walkDir('./client/src');
console.log(`\nDone! Cleaned ${count} files.`);
