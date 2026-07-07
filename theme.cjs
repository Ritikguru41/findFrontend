const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
    });
}

const map = {
    'bg-dark-900': 'bg-gray-50',
    'bg-dark-800': 'bg-white',
    'bg-dark-700': 'bg-gray-100',
    'bg-dark-600': 'bg-gray-200',
    'bg-dark-500': 'bg-gray-300',
    'border-dark-700': 'border-gray-200',
    'border-dark-600': 'border-gray-200',
    'border-dark-500': 'border-gray-300',
    'border-dark-400': 'border-gray-300',
    'text-gray-300': 'text-gray-700',
    'text-gray-400': 'text-gray-600',
};

walk('./src', function(filePath) {
    if (filePath.endsWith('.jsx')) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        if (filePath.includes('Navbar.jsx')) {
            content = content.replace(/bg-dark-900\/95/g, 'bg-gray-800/95');
            content = content.replace(/border-dark-700/g, 'border-gray-700');
            content = content.replace(/bg-dark-700/g, 'bg-gray-700');
            content = content.replace(/text-gray-400/g, 'text-gray-300');
            content = content.replace(/text-gray-300/g, 'text-gray-200');
            // Keep text-white
        } else {
            // Protect specific text-white instances
            content = content.replace(/text-white/g, 'text-gray-900');
            // Revert some cases that shouldn't be dark text
            content = content.replace(/bg-brand text-gray-900/g, 'bg-brand text-white');
            content = content.replace(/text-gray-900 ml-1/g, 'text-white ml-1'); // Play icon in MovieDetail
            
            for (const [key, value] of Object.entries(map)) {
                content = content.replace(new RegExp(key, 'g'), value);
            }
        }
        fs.writeFileSync(filePath, content);
    }
});
console.log('JSX files updated');
