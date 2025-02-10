// import { app } from "@_koii/namespace-wrapper";
import os from 'os';
import { initializeOllama as initializeOllamaWindows } from "./windows/Install.js";
import { initializeOllama as initializeOllamaLinux } from "./linux/Install.js";
export async function setup() {
  // define any steps that must be executed before the task starts
  console.log("CUSTOM SETUP");
  console.log("Setup", new Date(), "TEST");
  // Check if it is Mac
  if (os.platform() === "darwin"){
    return;
  }
  if (os.platform() === "win32"){
    await initializeOllamaWindows();
  }else{
    await initializeOllamaLinux();
  }
}
