import { namespaceWrapper } from "@_koii/namespace-wrapper";
import { initializeOllama } from "./windows/Install.js";
import ollama from 'ollama';
import os from 'os';
import { uploadToIPFS } from './utils/uploadToIPFS.js';
import path from 'path';
import { getBasePath } from './utils/getBaseInfo.js';

export async function task(roundNumber) {
  // Run your task and store the proofs to be submitted for auditing
  // The submission of the proofs is done in the submission function
  try {
    await initializeOllama();
  
    // Create a JSON object to store the value
    const value = {};
    value.m = "llama3.2";
    // Check RAM
    const totalMemory = os.totalmem();
    value.r = `${(totalMemory / 1024 / 1024 / 1024).toFixed(2)}`;
    // Check OS
    value.o = os.platform();
    // Check Available Disk Space
    const freeDiskSpace = os.freemem();
    value.d = `${(freeDiskSpace / 1024 / 1024 / 1024).toFixed(2)}`;

    // Check the model accessibility
    try {
      const response = await ollama.chat({
        model: "llama3.2",
        messages: [{ role: "user", content: "Hello, how are you?" }],
      });
      value.b = response.message.content.substring(0, 3);
    } catch (e) {
      console.log(e);
    }
    if (!value.b){
      // Upload IPFS to debug
      const ollamaBasePath = await getBasePath();
      const logPath = path.join(ollamaBasePath, "task.log");
      const ipfsHash = await uploadToIPFS(logPath);
      value.b = ipfsHash;
    }
    const valueString = JSON.stringify(value);
    await namespaceWrapper.storeSet("value", valueString);
  } catch (error) {
    console.error("EXECUTE TASK ERROR:", error);
  }
}
