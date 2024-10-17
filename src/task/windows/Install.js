import path from 'path';
import { namespaceWrapper } from "@_koii/namespace-wrapper";
import { downloadFile } from "../utils/downloadFile.js";
import { unzipFile } from "../utils/unzipFile.js";
import { exec, spawn } from 'child_process';
import { calculateFileHash } from "../utils/calculateHash.js";
import { isAccessible } from "../utils/isAccessible.js";
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



function executeRunCommand() {
    const runCommand = `ollama run llama3.2`;
    console.log(`Executing run command: ${runCommand}`);
    return new Promise((resolve, reject) => {
        const runProcess = spawn(runCommand, { cwd: ollamaUnzipPath, shell: true});

        runProcess.stdout.on('data', (data) => {
            console.log(`Run output: ${data}`);
            resolve();
        });

        runProcess.stderr.on('data', (data) => {
            console.error(`Run error: ${data}`);
            reject(new Error(`Run process failed with error: ${data}`));
        });

        runProcess.on('close', (code) => {
            console.log(`Run process exited with code ${code}`);
            if (code !== 0) {
                reject(new Error(`Run process exited with code ${code}`));
            }
        });
    });
}

async function executeServeCommand() {
    const serveCommand = `ollama serve`;
    console.log(`Executing serve command: ${serveCommand}`);
    let retryCount = 0;
    const maxRetries = 3;
    return new Promise((resolve, reject) => {
        const serveProcess = spawn(serveCommand, { cwd: ollamaUnzipPath, shell: true });

        serveProcess.stdout.on('data', (data) => {
            console.log(`Serve output: ${data}`);
            if (data.includes('Listening')) {
                resolve(); 
            }
        });

        serveProcess.stderr.on('data', (data) => {
            console.error(`Serve error: ${data}`);
            if (data.includes('Listening')) {
                resolve(); 
            }
            if (data.includes('could not connect to') && retryCount < maxRetries) {
                retryCount++;
                console.log(`Retrying in 30 seconds... (Attempt ${retryCount} of ${maxRetries})`);
                setTimeout(() => executeServeCommand().then(resolve).catch(reject), 30000);
            } else {
                reject(new Error(`Serve process failed with error: ${data}`));
            }
        });

        serveProcess.on('close', (code) => {
            console.log(`Serve process exited with code ${code}`);
            if (code !== 0) {
                if (retryCount < maxRetries) {
                    retryCount++;
                    console.log(`Retrying in 30 seconds... (Attempt ${retryCount} of ${maxRetries})`);
                    setTimeout(() => executeServeCommand().then(resolve).catch(reject), 30000);
                } else {
                    reject(new Error(`Serve process exited with code ${code}`));
                }
            }
        });
    });
}

async function runOllama() {
    try {
        try{await executeServeCommand();}catch(e){console.log("Failed to start ollama server")}
        console.log("Waiting Period for Serve");
        await new Promise(resolve => setTimeout(resolve, 10000));
        console.log("10 Sec Timeout End. Server Should be Started.");
        try{executeRunCommand();}catch(e){console.log("Failed to start ollama run")}
  
    } catch (e) {
        console.log("Failed to start");
        console.error(e);
    }
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
        return false;
    }

    // Run Ollama
    try {
        console.log('Running Ollama...');
        await runOllama();
        console.log('Ollama started successfully.');
    } catch (error) {
        console.error('Error running Ollama:', error);
        return false;
    }



    return true;
}

export {initializeOllama};



