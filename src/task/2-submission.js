import { namespaceWrapper } from "@_koii/namespace-wrapper";
import { getTasksLink } from "./utils/getBaseInfo.js";
import { validateNetworkAccessible } from "./utils/upnpAccessible.js";
export async function submission(roundNumber) {
  /**
   * Submit the task proofs for auditing
   * Must return a string of max 512 bytes to be submitted on chain
   */
  try {
    console.log(`MAKE SUBMISSION FOR ROUND ${roundNumber}`);
    await new Promise(resolve => setTimeout(resolve, 5000));
    const submitterKeypair = await namespaceWrapper.getSubmitterAccount();
    const IPAddressArray = await getAddressRecord();
    // const nodeAddress = undefined;
    const nodeAddress = IPAddressArray[submitterKeypair.publicKey.toBase58()];
    if (!nodeAddress) {
      return;
    }
    const tasksLink = await getTasksLink(nodeAddress);
    if (!tasksLink){  
      return;
    }
    console.log("Validating", tasksLink);
    const accessibleValidationResult = await validateNetworkAccessible(tasksLink)
    if (!accessibleValidationResult){
      return;
    }
    console.log("Accessible Validation Result", accessibleValidationResult);
    return await namespaceWrapper.storeGet("value");
  } catch (error) {
    console.error("MAKE SUBMISSION ERROR:", error);
  }
}
