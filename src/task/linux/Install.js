import path from 'path';
import { namespaceWrapper } from "@_koii/namespace-wrapper";
import { downloadFile } from "../utils/downloadFile.js";
import { unzipFile } from "../utils/unzipFile.js";
import { calculateFileHash } from "../utils/calculateHash.js";
import { isAccessible } from "../utils/isAccessible.js";
import fs from 'fs'
import { getBasePath } from "../utils/getBaseInfo.js";
const expectedHash = "8b746572392b6a6912bedfb5ac8115c18b77815ea4614c6cce7ccb6f67b9d929";
let downloadURL = "https://github.com/ollama/ollama/releases/download/v0.3.14/ollama-linux-amd64.tgz";
const ollamaBasePath = await getBasePath();
let downloadPath = path.join(ollamaBasePath, "Ollama", "ollama.tgz");
let ollamaUnzipPath = path.join(ollamaBasePath, "Ollama");
import { runOllama } from "../runOllama/runOllama.js";
const serveCommand = "./ollama serve";
const pullCommand = "./ollama pull llama3.2";
const runCommand = "./ollama run llama3.2";


async function initializeOllama(){
    if (await isAccessible()){  
        console.log("Ollama is already installed");
        return true;
    }
    // Download Ollama
    if (await calculateFileHash(downloadPath) !== expectedHash) {
        // Delete the file if the hash is not expected
        try{
            fs.unlinkSync(downloadPath);
            console.log("Download file deleted");
        }catch(e){
            console.log("Error deleting download file", e);
        }
        // Download the file again
        try {
            console.log('Downloading Ollama...');
            await downloadFile(downloadURL, downloadPath);
            console.log('Ollama downloaded successfully.');
        } catch (error) {
            console.error('Error downloading Ollama:', error);
        }
    }else{
      console.log("Hash matches, skipping download");
    }
    if (await calculateFileHash(downloadPath) !== expectedHash) {
        console.log("Hash does not match, something went wrong");
    }
    // Unzip Ollama
    if (await namespaceWrapper.storeGet("ollama_initialized") !== "true"){
      try {
          console.log('Unzipping Ollama...');
          await unzipFile(downloadPath, ollamaUnzipPath);
          console.log('Ollama unzipped successfully.');
          await namespaceWrapper.storeSet("ollama_initialized", "true");
      } catch (error) {
          console.error('Error unzipping Ollama:', error);
      }
    }else{
      console.log("Ollama already unzipped");
    }
    // Run Ollama
    try {
        console.log('Running Ollama...');
        await runOllama({ ollamaUnzipPath, serveCommand, pullCommand, runCommand });
        console.log('Ollama started successfully.');
    } catch (error) {
        console.error('Error running Ollama:', error);
    }



    return true;
}

export {initializeOllama};



