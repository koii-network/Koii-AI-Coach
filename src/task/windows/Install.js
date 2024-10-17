import path from 'path';
import { namespaceWrapper } from "@_koii/namespace-wrapper";
import { downloadFile } from "../utils/downloadFile.js";
import { unzipFile } from "../utils/unzipFile.js";
import { exec, spawn } from 'child_process';
import { calculateFileHash } from "../utils/calculateHash.js";
import { isAccessible } from "../utils/isAccessible.js";
import readline from 'readline';
import fs from 'fs'
let ollamaBasePath;
if (process.env.DEV_MODE === 'true') {
    ollamaBasePath = "./";
}else{
    const namespaceBasePath = await namespaceWrapper.getBasePath();
    ollamaBasePath = path.dirname(namespaceBasePath);
}
const expectedHash = "2ddde0db7c7b63854538aabc1b3b1185a9f697a9d11a1134c10c70742d0f823d";
let downloadURL = "https://github.com/ollama/ollama/releases/download/v0.3.13/ollama-windows-amd64.zip";
let downloadPath = path.join(ollamaBasePath, "Ollama", "ollama.zip");
let ollamaUnzipPath = path.join(ollamaBasePath, "Ollama");



async function runOllama() {
    const serveCommand = `ollama serve`;
    console.log(`Executing serve command: ${serveCommand}`);
    
    return new Promise((resolve, reject) => {
      const serveProcess = spawn(serveCommand, { cwd: ollamaUnzipPath, shell: true });
  
      serveProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(`Serve stdout: ${output}`);
  
        // 检测是否已有服务运行
        if (output.includes('bind: Only one usage of each socket address')) {
          console.log('Service already running, proceeding to next step.');
          serveProcess.kill();
          resolve(true);
        }
  
        // 检测 runners 表示服务已启动
        if (output.includes('runners')) {
          console.log('Serve started successfully.');
          resolve(true);
        }
      });
  
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
  
      serveProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`ollama serve process exited with code ${code}`));
        }
      });
    }).then(() => {
      return new Promise((resolve, reject) => {
        const runCommand = `ollama run llama3.2`;
        console.log(`Executing run command: ${runCommand}`);
        const runProcess = spawn('start', [runCommand], { cwd: ollamaUnzipPath, shell: true, stdio: 'pipe' });
        runProcess.stdin.write('a\n');
        runProcess.stdout.on('data', (data) => {
          console.log('Received stdout data');
          const output = data.toString();
          console.log(`Run stdout: ${output}`);
          if (output.includes('Send a message')) {
            console.log('ollama run is ready for input.');
            resolve(true);
            rl.close(); 
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

        // check if isAccessible every 5 seconds
        const interval = setInterval(() => {
          if (isAccessible()){
            clearInterval(interval);
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
        }catch(e){
            console.log(e)
        }
        // Download the file again
        try {
            console.log('Downloading Ollama...');
            await downloadFile(downloadURL, downloadPath);
            console.log('Ollama downloaded successfully.');
        } catch (error) {
            console.error('Error downloading Ollama:', error);
            return false;
        }
    }
    if (await calculateFileHash(downloadPath) !== expectedHash) {

        console.log("Hash does not match");
        return false;
    }
    // Unzip Ollama
    try {
        console.log('Unzipping Ollama...');
        await unzipFile(downloadPath, ollamaUnzipPath);
        console.log('Ollama unzipped successfully.');
    } catch (error) {
        console.error('Error unzipping Ollama:', error);

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



