import { namespaceWrapper, TASK_ID } from "@_koii/namespace-wrapper";
import { getAccessLink } from "./utils/getBaseInfo.js";

export async function audit(submission, roundNumber, submitterPublicKey) {
  /**
   * Audit a submission
   * This function should return true if the submission is correct, false otherwise
   */

  const submissionJSON = JSON.parse(submission);
  const { m: model } = submissionJSON;

  console.log(`AUDIT SUBMISSION FOR ROUND ${roundNumber}`); 
  // First: Check if model is accessible
  const IPAddressArray = await getAddressArray();

  const nodeAddress = IPAddressArray[submitterPublicKey];
  console.log("Validating", nodeAddress);
  const query = `Hey! How are you?`;
  const accessLink = await getAccessLink(nodeAddress);
  console.log("Access Link", accessLink);
  const response = await fetch(`${accessLink}/ask-query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }, 
    body: JSON.stringify({ model: model, query: query }) 
  });
  try{
    const data = await response.json();
    const reply = data.reply;  
    console.log(reply);
    return true;
  } catch (error) {
    return false;
  }
  // TODO: Check the views of the Tweets


}

async function getAddressArray() {
  try {
    // Get the task state from the K2
    const taskState = await namespaceWrapper.getTaskState();
    // console.log('TASK STATE', taskState);
    const nodeList = taskState.ip_address_list;
    console.log('Node List', nodeList);
    return nodeList;
  } catch (e) {
    console.log('ERROR GETTING TASK STATE', e);
  }
}
