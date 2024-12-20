import { namespaceWrapper, TASK_ID } from "@_koii/namespace-wrapper";
import { getAccessLink } from "./utils/getBaseInfo.js";
import ollama from 'ollama';
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
  const IPAddressArray = await getAddressArray();
  // const nodeAddress = undefined;
  const nodeAddress = IPAddressArray[submitterPublicKey];
  if (!nodeAddress) {
    return false;
  }
  console.log("Validating", nodeAddress);

  const accessLink = await getAccessLink(nodeAddress);
  const result = await validateModel(accessLink);
  if (result === undefined) {
    return;
  }
  return result;
}

async function validateModel(accessLink){
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

async function getAddressArray() {
  try {
    // Get the task state from the K2
    const taskState = await namespaceWrapper.getTaskState();
    // console.log('TASK STATE', taskState);
    const nodeList = taskState.ip_address_list;
    console.log('Node List Length During Audit', nodeList.length);
    return nodeList;
  } catch (e) {
    console.log('ERROR GETTING TASK STATE', e);
  }
}

async function compareString(string1, string2){
  return string1 === string2;
}
