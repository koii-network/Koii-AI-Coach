// import { namespaceWrapper } from "@_koii/namespace-wrapper";
import ollama from 'ollama';
import { checkIsAccessible } from "./utils/upnpAccessible.js";
export async function audit(submission, roundNumber, submitterPublicKey) {
  /**
   * Audit a submission
   * This function should return true if the submission is correct, false otherwise
   */
  const submissionJSON = JSON.parse(submission);
  const { b: answer } = submissionJSON;
  if (!answer || answer.length === 0 || answer.length > 5) {
    return false;
  }
  console.log(`AUDIT SUBMISSION FOR ROUND ${roundNumber}`); 
  // First: Check if model is accessible
  // const result = await checkIsAccessible(submitterPublicKey);
  // if (!result){
  //   return false;
  // }
  return true;
}






