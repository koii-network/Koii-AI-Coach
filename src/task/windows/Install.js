import path from 'path';
import { namespaceWrapper } from "@_koii/namespace-wrapper";
import { downloadFile } from "../utils/downloadFile.js";
import { unzipFile } from "../utils/unzipFile.js";
import { calculateFileHash } from "../utils/calculateHash.js";
import { isAccessible } from "../utils/isAccessible.js";
import fs from 'fs'
import { getBasePath } from "../utils/getBaseInfo.js";
const expectedHash = "2ddde0db7c7b63854538aabc1b3b1185a9f697a9d11a1134c10c70742d0f823d";
let downloadURL = "https://github.com/ollama/ollama/releases/download/v0.3.13/ollama-windows-amd64.zip";
const ollamaBasePath = await getBasePath();
let downloadPath = path.join(ollamaBasePath, "Ollama", "ollama.zip");
let ollamaUnzipPath = path.join(ollamaBasePath, "Ollama");
import { runOllama } from "../runOllama/runOllama.js";
const serveCommand = "ollama.exe serve";
const pullCommand = "ollama.exe pull llama3.2";
const runCommand = "ollama.exe run llama3.2";


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
          const result = await unzipFile(downloadPath, ollamaUnzipPath);
          if (result){
            console.log('Ollama unzipped successfully.');
            await namespaceWrapper.storeSet("ollama_initialized", "true");
          }else{
            console.log("Failed to unzip Ollama");
          }
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



