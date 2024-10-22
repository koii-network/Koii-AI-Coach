

import { spawn } from 'child_process';
import { isAccessible } from "../utils/isAccessible.js";

export async function runOllama({ollamaUnzipPath, serveCommand, pullCommand, runCommand}) {

    return new Promise((resolve, reject) => {

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
