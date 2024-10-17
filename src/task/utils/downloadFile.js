import fs from 'fs';
import https from 'https';
import path from 'path';

async function downloadFile(url, filePath) {
    const dir = path.dirname(filePath);

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filePath);

        const makeRequest = (currentUrl) => {
            https.get(currentUrl, (response) => {
                if (response.statusCode === 302) {
                    // Handle 302 redirect by making another request to the new location
                    const newUrl = response.headers.location;
                    makeRequest(newUrl);
                } else if (response.statusCode === 200) {
                    response.pipe(file);
                    file.on('finish', () => {
                        file.close(resolve);
                    });
                } else {
                    reject(new Error(`Failed to download file: ${response.statusCode}`));
                }
            }).on('error', (err) => {
                fs.unlink(filePath, () => reject(err));
            });
        };

        makeRequest(url);
    });
}

export { downloadFile };