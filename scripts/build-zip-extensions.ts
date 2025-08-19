import AdmZip from 'adm-zip';

function createFirefoxZip() {
    const zip = new AdmZip();
    const outputFile = './build/clockmate-zip/clockmate-firefox.zip';

    zip.addLocalFolder('./build/extension');
    zip.writeZip(outputFile);
    console.log('\x1b[32m%s\x1b[0m', 'Created Firefox zip succesfully!');
}

function createChromiumZip() {
    const zip = new AdmZip();
    const outputFile = './build/clockmate-zip/clockmate-chromium.zip';

    zip.addLocalFolder('./build/extension-chromium');
    zip.writeZip(outputFile);
    console.log('\x1b[32m%s\x1b[0m', 'Created Chromium zip succesfully!');
}
console.log('Creating zip archives...');

createFirefoxZip();
createChromiumZip();
