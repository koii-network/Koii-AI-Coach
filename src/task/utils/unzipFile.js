import StreamZip from 'node-stream-zip';

export async function unzipFile(zipPath, extractPath) {
    try{
        const zip = new StreamZip.async({ file: zipPath });
        await zip.extract(null, extractPath);
        await zip.close();

    }catch(e){
        console.log("Failed to unzip file",e)
    }

}

