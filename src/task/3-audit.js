// import { namespaceWrapper } from "@_koii/namespace-wrapper";
import { getAccessLink, getTasksLink } from "./utils/getBaseInfo.js";
import ollama from 'ollama';
import { validateNetworkAccessible, getAddressRecord } from "./utils/upnpAccessible.js";
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
  const IPAddressArray = await getAddressRecord();
  // const nodeAddress = undefined;
  const nodeAddress = IPAddressArray[submitterPublicKey];
  if (!nodeAddress) {
    return false;
  }
  console.log("Validating", nodeAddress);
  const tasksLink = await getTasksLink(nodeAddress);
  if (!tasksLink){
    return false;
  }
  const accessibleValidationResult = await validateNetworkAccessible(tasksLink)
  if (!accessibleValidationResult){
    return false;
  }
  const accessLink = await getAccessLink(nodeAddress);
  if (!accessLink){
    return false;
  }
  
  const modelValidationResult = await validateModel(accessLink);
  if (modelValidationResult === undefined) {
    return;
  }
  return modelValidationResult;
}


export async function validateModel(accessLink){
  let question;
  let result;
  try{
    question = await ollama.chat(
    { "model":"koiiLlama", "messages": [ {"role":"system", "content":"You are a helpful assistant."}, {"role":"user", "content":"Please generate a question"}], "options":{"num_predict":50, "temperature":1}});
    console.log("Question", question.message.content);
    result = await ollama.chat(
      { "model":"koiiLlama", "messages": [ {"role":"system", "content":"You are a helpful assistant."}, {"role":"user", "content":question.message.content}], "options":{"num_predict":10, "temperature":0}});
    console.log("Result", result.message.content);
  } catch (error){
    console.log("Error in generating question", error);
    return;
  }
  
  try{
    const response = await fetch(`${accessLink}/ask-query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ "model":"koiiLlama", "messages": [ {"role":"system", "content":"You are a helpful assistant."}, {"role":"user", "content":question.message.content}], "options":{"num_predict":10, "temperature":0}}) 
    });
    const otherNodesResult = await response.json();
    console.log(otherNodesResult.reply);
    return compareString(result.message.content, otherNodesResult.reply);
  }catch (error){
    console.log("Error in getting access link", error);
    return false;
  }
}



export async function compareString(string1, string2){
  return string1 === string2;
}
