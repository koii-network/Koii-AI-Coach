import crypto from 'crypto';
import fs from 'fs';

async function calculateFileHash(filePath) {
    try{
        const fileBuffer = await fs.promises.readFile(filePath);
        const hashSum = crypto.createHash('sha256');
        hashSum.update(fileBuffer);
        const hash = hashSum.digest('hex');
        console.log(hash);
        return hash;
    } catch (error) {
        console.error('Error calculating file hash:', error);
        return null;
    }
}

export { calculateFileHash };