import path from 'path';
import { namespaceWrapper } from "@_koii/namespace-wrapper";
import { downloadFile } from "../utils/downloadFile.js";
import { unzipFile } from "../utils/unzipFile.js";
import { exec, spawn } from 'child_process';
import { calculateFileHash } from "../utils/calculateHash.js";
import { isAccessible } from "../utils/isAccessible.js";
import readline from 'readline';
import fs from 'fs'
import { getBasePath } from "../utils/getBaseInfo.js";
const expectedHash = "2ddde0db7c7b63854538aabc1b3b1185a9f697a9d11a1134c10c70742d0f823d";
let downloadURL = "https://github.com/ollama/ollama/releases/download/v0.3.13/ollama-windows-amd64.zip";
const ollamaBasePath = await getBasePath();
let downloadPath = path.join(ollamaBasePath, "Ollama", "ollama.zip");
let ollamaUnzipPath = path.join(ollamaBasePath, "Ollama");



async function runOllama() {

    return new Promise((resolve, reject) => {
      const serveCommand = `ollama serve`;
      console.log(`Executing serve command: ${serveCommand}`);  
      const serveProcess = spawn(serveCommand, { cwd: ollamaUnzipPath, shell: true });
  
      serveProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(`Serve stdout: ${output}`);
  
        // Check if the service is already running
        if (output.includes('bind: Only one usage of each socket address')) {
          console.log('Service already running, proceeding to next step.');
          serveProcess.kill();
          resolve(true);
        }
  
        // Check if the service is started
        if (output.includes('runners')) {
          console.log('Serve started successfully.');
          resolve(true);
        }
      });
      // Check if the service is started (Sometimes it shows in STDERR)
      serveProcess.stderr.on('data', (data) => {
        const output = data.toString();
        console.error(`Serve stderr: ${output}`);
        if (output.includes('runners')) {
            console.log('Serve started successfully.');
            resolve(true);
        }
        if (output.includes('bind: Only one usage of each socket address')) {
          console.log('Port already in use, proceeding to next step.');
          serveProcess.kill();
          resolve(true);
        } 
      });
      // Check if the process is closed
      serveProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`ollama serve process exited with code ${code}`));
        }
      });
    }).then(() => {
      // Pull the model 
      return new Promise((resolve, reject) => {
        const pullCommand = `ollama pull llama3.2`;
        console.log(`Executing pull command: ${pullCommand}`);
        const pullProcess = spawn(pullCommand, { cwd: ollamaUnzipPath, shell: true, stdio: 'pipe' });
        // Check if the model is pulled
        pullProcess.stdout.on('data', (data) => {
          console.log('Received stdout data');
          const output = data.toString();
          console.log(`Pull stdout: ${output}`);
          if (output.includes('success')) {
            console.log('ollama pull completed successfully.');
            resolve(true);
          }
        });
        // Check if the model is pulled (Sometimes it shows in STDERR)
        pullProcess.stderr.on('data', (data) => {
          console.log('Received stderr data');
          const output = data.toString();
          if (output.includes('success')) {
            console.log('ollama pull completed successfully.');
            resolve(true);
          }
        });
        // Check if the process is closed
        pullProcess.on('close', (code) => {
          if (code !== 0) {
            reject(new Error(`ollama pull process exited with code ${code}`));
          }
        });
      });
    }).then(() => {
      
      return new Promise((resolve, reject) => {
        const runCommand = `ollama run llama3.2`;
        console.log(`Executing run command: ${runCommand}`);
        const runProcess = spawn(runCommand, { cwd: ollamaUnzipPath, shell: true, stdio: 'pipe' });
        runProcess.stdin.write('a\n');
        // TODO: This part still cannot get access to the output
        runProcess.stdout.on('data', (data) => {
          console.log('Received stdout data');
          const output = data.toString();
          console.log(`Run stdout: ${output}`);
          // TODO: This check will never work
          if (output.includes('Send a message')) {
            console.log('ollama run is ready for input.');
            resolve(true);
          }
        });
        
        runProcess.stderr.on('data', (data) => {
          console.log('Received stderr data');
          const output = data.toString();
          console.error(`Run stderr: ${output}`);
          reject(new Error(output));
        });
        runProcess.on('close', (code) => {
          if (code !== 0) {
            reject(new Error(`ollama run process exited with code ${code}`));
          }
        });

        // check if isAccessible every 5 seconds, only resolve if it is accessible
        const interval = setInterval(() => {
          if (isAccessible()){
            clearInterval(interval);
            console.log("Ollama is accessible");
            resolve(true);
          }
        }, 5000);
      });
    });
}


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
        await runOllama();
        console.log('Ollama started successfully.');
    } catch (error) {
        console.error('Error running Ollama:', error);
    }



    return true;
}

export {initializeOllama};



