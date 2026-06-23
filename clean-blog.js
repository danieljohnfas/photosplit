const fs = require('fs');
const path = require('path');

const blogDir = path.join(__dirname, 'blog');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.html')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            // Replace weird encoding errors with apostrophe
            const wordsWithX = ['You×ve', 'we×ve', 'don×t', 'it×s', 'can×t', 'you×ll', 'let×s', 'won×t', 'isn×t', 'They×re', 'they×re', 'I×ve', 'I×m'];
            for (const word of wordsWithX) {
                const fixed = word.replace('×', "'");
                const regex = new RegExp(word, 'g');
                if (content.match(regex)) {
                    content = content.replace(regex, fixed);
                    modified = true;
                }
            }
            
            // Handle placeholders
            if (content.includes('<h3>✨</h3>')) {
                content = content.replace(/<h3>✨<\/h3>/g, "");
                modified = true;
            }
            if (content.includes('<h1>✨</h1>')) {
                content = content.replace(/<h1>✨<\/h1>/g, "");
                modified = true;
            }
            if (content.includes('<span>✨ </span>')) {
                content = content.replace(/<span>✨ <\/span>/g, "<span>Jan 15, 2024</span>");
                modified = true;
            }
            if (content.includes('✨ ')) {
                content = content.replace(/✨ /g, "✔️ ");
                modified = true;
            }
            if (content.includes('✨')) {
                content = content.replace(/✨/g, "");
                modified = true;
            }
            
            if (modified) {
                fs.writeFileSync(fullPath, content);
                console.log(`Cleaned: ${fullPath}`);
            }
        }
    }
}

processDir(blogDir);
