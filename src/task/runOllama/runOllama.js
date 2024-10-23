

import { spawn } from 'child_process';
import modelFile from './ollamaModelFile.js';
import ollama from 'ollama';
export async function runOllama({ollamaUnzipPath, serveCommand}) {

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
    }).then(async () => {
      const result = await ollama.create({ model: 'koiiLlama', modelfile: modelFile })
      console.log(result);
    })
}
