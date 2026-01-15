import fs from 'fs'
import path from 'path'

const logFiles = [
  path.join(__dirname, '../logs/combined.log'),
  path.join(__dirname, '../logs/error.log'),
];

logFiles.forEach((file) => {
  if (fs.existsSync(file)) {
    fs.truncateSync(file, 0); 
    console.log(`Cleared: ${file}`);
  }
});
