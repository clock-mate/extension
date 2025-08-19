import fs from 'fs';
import fsExtra from 'fs-extra';
const { copySync } = fsExtra;

console.log('Adjusting manifest files...');

copySync('./build/extension', './build/extension-chromium'); // copies directory with subdirectories
// swap the firefox manifest for the chromium manifest
fs.rmSync('./build/extension/manifest-chromium.json', { force: true });
fs.rmSync('./build/extension-chromium/manifest.json', { force: true });
fs.renameSync(
    './build/extension-chromium/manifest-chromium.json',
    './build/extension-chromium/manifest.json',
);

console.log('\x1b[32m%s\x1b[0m', 'Successfully adjusted manifest files and manifest file names.');
