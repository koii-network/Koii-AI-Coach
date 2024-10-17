import { namespaceWrapper } from "@_koii/namespace-wrapper";
import { initializeOllama } from "./windows/Install.js";
import ollama from 'ollama';
export async function task(roundNumber) {
  // Run your task and store the proofs to be submitted for auditing
  // The submission of the proofs is done in the submission function
  try {
    await initializeOllama();

    try {
      const response = await ollama.chat({
        model: "llama3.2",
        messages: [{ role: "user", content: "Hello, how are you?" }],
      });
      console.log(response);
      await namespaceWrapper.storeSet("value", response.message.content.substring(0, 5));
    } catch (e) {
      console.log(e);
      await namespaceWrapper.storeSet("value", "Not Initialized");
    }
  } catch (error) {
    console.error("EXECUTE TASK ERROR:", error);
  }
}
