const fs = require('fs');
const path = require('path');

// Parse lint results to get files with MD040 errors
const lint = fs.readFileSync('lint-results2.txt', 'utf8');
const md040Lines = lint.split('\n').filter(l => l.includes('MD040'));
const fileMap = {};
md040Lines.forEach(l => {
  const m = l.match(/^(.+?):(\d+)\s+error/);
  if (m) {
    const [, file, line] = m;
    if (!fileMap[file]) fileMap[file] = [];
    fileMap[file].push(parseInt(line));
  }
});

function inferLang(lines) {
  const content = lines.join('\n').trim();
  if (!content) return 'text';
  // JSON
  if (/^\s*[{[]/.test(content) && /[}\]]\s*$/.test(content)) return 'json';
  if (/"[^"]+"\s*:/.test(content)) return 'json';
  // Python
  if (/\b(import |from |def |class |print\(|self\.)/.test(content)) return 'python';
  // JavaScript/TypeScript
  if (/\b(const |let |var |function |=>|require\(|import )/.test(content)) return 'javascript';
  // HTML
  if (/<\/?[a-z][^>]*>/i.test(content) && !content.includes('```')) return 'html';
  // CSS
  if (/[.#][a-zA-Z][\w-]*\s*\{/.test(content) || /:\s*(flex|grid|none|auto|block)/.test(content)) return 'css';
  // Shell/bash
  if (/^\s*(npm |npx |git |cd |mkdir |pip |curl |wget |chmod |echo |export |source )/m.test(content)) return 'bash';
  if (/^\s*\$\s/m.test(content)) return 'bash';
  // PowerShell
  if (/\b(Get-|Set-|New-|Remove-|Install-Module|Write-Host)/.test(content)) return 'powershell';
  // YAML
  if (/^[a-zA-Z_-]+:(\s|$)/m.test(content) && !content.includes('{')) return 'yaml';
  // Markdown
  if (/^#{1,6}\s/m.test(content)) return 'markdown';
  // TOML/INI
  if (/^\[[\w.-]+\]$/m.test(content)) return 'toml';
  // XML
  if (/^<\?xml/.test(content) || (/^<[a-zA-Z]/.test(content) && /<\/[a-zA-Z]/.test(content))) return 'xml';
  return 'text';
}

let totalFixed = 0;
for (const [file, lines] of Object.entries(fileMap)) {
  const fullPath = path.resolve(file);
  if (!fs.existsSync(fullPath)) continue;
  const fileLines = fs.readFileSync(fullPath, 'utf8').split('\n');
  
  // Process from bottom to avoid line number shifts
  const sortedLines = [...lines].sort((a, b) => b - a);
  for (const lineNum of sortedLines) {
    const idx = lineNum - 1;
    const line = fileLines[idx];
    if (line !== undefined && line.trim() === '```') {
      // Find the closing fence
      let endIdx = -1;
      for (let i = idx + 1; i < fileLines.length; i++) {
        if (fileLines[i].trim().startsWith('```')) {
          endIdx = i;
          break;
        }
      }
      if (endIdx > idx) {
        const codeLines = fileLines.slice(idx + 1, endIdx);
        const lang = inferLang(codeLines);
        const indent = line.match(/^(\s*)/)[1];
        fileLines[idx] = indent + '```' + lang;
        totalFixed++;
        console.log(`  ${file}:${lineNum} -> ${lang}`);
      }
    }
  }
  fs.writeFileSync(fullPath, fileLines.join('\n'));
}
console.log(`\nFixed ${totalFixed} bare code fences across ${Object.keys(fileMap).length} files`);
