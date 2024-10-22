import StreamZip from 'node-stream-zip';
import * as tar from 'tar';
import fs from 'fs';
import path from 'path';

export async function unzipFile(zipPath, extractPath) {
    try {

        if (!fs.existsSync(extractPath)) {
            fs.mkdirSync(extractPath, { recursive: true });
        }

        if (zipPath.endsWith(".tgz")) {
  
            await tar.x({
                file: zipPath,
                C: extractPath 
            });
        } else {
    
            const zip = new StreamZip.async({ file: zipPath });
            await zip.extract(null, extractPath);
            await zip.close();
        }
        return true;
    } catch (e) {
        console.log("Failed to unzip file", e);
        return false;
    }
}

// async function main(){
//     await unzipFile("d:\\Downloads\\ollama-linux-amd64.tgz", "d:\\Downloads\\ollama")
// }
// main()
