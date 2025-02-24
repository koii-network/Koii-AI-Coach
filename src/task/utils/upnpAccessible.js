import { TASK_ID } from "@_koii/namespace-wrapper";
import { namespaceWrapper } from "@_koii/namespace-wrapper";
import { getAccessLink, getTasksLink } from "./getBaseInfo.js";
import ollama from 'ollama';
export async function validateNetworkAccessible(accesslink){
    try {
      const response = await fetch(accesslink);
      if (!response.ok) {
        console.log("Network not accessible");
        return false;
      }
      const data = await response.json();
      
      const taskIds = data.map(task => task.TaskID);
      // console.log(taskIds);
      // console.log(TASK_ID)
      if (taskIds.includes(TASK_ID)) {
        console.log("TASK_ID found in the response");
        return true;
      } else {
        console.log("TASK_ID not found in the response");
        return false;
      }
    } catch (error) {
      console.log("Error accessing the network", error);
      return false;
    }
  }

  export async function getAddressRecord() {
    try {
      // Get the task state from the K2
      const taskState = await namespaceWrapper.getTaskState();
      // console.log('TASK STATE', taskState);
      const nodeList = taskState.ip_address_list;
      console.log('Node List Length During Audit', Object.keys(nodeList).length);
      return nodeList;
    } catch (e) {
      console.log('ERROR GETTING TASK STATE', e);
    }
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

  export async function checkIsAccessible(submitterPublicKey) {
    const IPAddressArray = await getAddressRecord();
    const nodeAddress = IPAddressArray[submitterPublicKey];
    if (!nodeAddress) {
      return false;
    }
    const tasksLink = await getTasksLink(nodeAddress);
    if (!tasksLink){  
      return false;
    }
    console.log("Validating", tasksLink);
    const accessibleValidationResult = await validateNetworkAccessible(tasksLink)
    if (!accessibleValidationResult){
      return false;
    }
    console.log("Accessible Validation Result", accessibleValidationResult);

    const accessLink = await getAccessLink(nodeAddress);
    if (!accessLink){
      return false;
    }
    const modelValidationResult = await validateModel(accessLink);
    if (modelValidationResult === undefined) {
      return true;// When it cannot be validated becuase the auditers issue, be tolerant
    }
    return true;
  }

  export async function compareString(string1, string2){
    return string1 === string2;
  }
  