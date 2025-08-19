import fs from 'fs';
import fsExtra from 'fs-extra';
const { copySync } = fsExtra;

console.log('Copying extension folder...');

copySync('./src/extension/assets', './build/extension/assets'); // copies assets folder with all files

// remove sourcemap files from development
if (fs.existsSync('./build/extension/backgroundscript/backgroundscript.js.map')) {
    fs.rmSync('./build/extension/backgroundscript/backgroundscript.js.map');
}
if (fs.existsSync('./build/extension/contentscript/clockmate.js.map')) {
    fs.rmSync('./build/extension/contentscript/clockmate.js.map');
}

// create folders
if (!fs.existsSync('./build/extension/backgroundscript')) {
    fs.mkdirSync('./build/extension/backgroundscript');
}
if (!fs.existsSync('./build/extension/contentscript')) {
    fs.mkdirSync('./build/extension/contentscript');
}
if (!fs.existsSync('./build/extension-chromium/backgroundscript/chromium')) {
    fs.mkdirSync('./build/extension-chromium/backgroundscript/chromium', {
        recursive: true,
    });
}
if (!fs.existsSync('./build/extension/settings')) {
    fs.mkdirSync('./build/extension/settings', {
        recursive: true,
    });
}
if (!fs.existsSync('./build/extension/popup')) {
    fs.mkdirSync('./build/extension/popup', {
        recursive: true,
    });
}

// copy necessary files
fs.copyFileSync(
    './src/extension/contentscript/clockmate.css',
    './build/extension/contentscript/clockmate.css',
);
fs.copyFileSync('./src/extension/manifest.json', './build/extension/manifest.json');
fs.copyFileSync(
    './src/extension/manifest-chromium.json',
    './build/extension/manifest-chromium.json',
);

// copy pdf.js worker file, necessary for pdf analysis
fs.copyFileSync(
    './node_modules/pdfjs-dist/build/pdf.worker.min.mjs',
    './build/extension/backgroundscript/pdf.worker.min.mjs',
);

// copy popup files
fs.copyFileSync('./src/extension/popup/clockmate.html', './build/extension/popup/clockmate.html');

// copy Chromium specific files only to Chromium output
fs.copyFileSync(
    'src/extension/backgroundscript/workers/chromium/offScreenDocument/offscreen.html',
    './build/extension-chromium/backgroundscript/chromium/offscreen.html',
);

if (!fs.existsSync('./build/clockmate-zip')) {
    fs.mkdirSync('./build/clockmate-zip'); // create folder
}

console.log('\x1b[32m%s\x1b[0m', 'Copied extension folder succesfully!');
