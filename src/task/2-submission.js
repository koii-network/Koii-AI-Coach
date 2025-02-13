import { namespaceWrapper } from "@_koii/namespace-wrapper";
import { getTasksLink } from "./utils/getBaseInfo.js";
import { checkIsAccessible } from "./utils/upnpAccessible.js";
export async function submission(roundNumber) {
  /**
   * Submit the task proofs for auditing
   * Must return a string of max 512 bytes to be submitted on chain
   */
  try {
    console.log(`MAKE SUBMISSION FOR ROUND ${roundNumber}`);
    await new Promise(resolve => setTimeout(resolve, 5000));
    const submitterKeypair = await namespaceWrapper.getSubmitterAccount();

    const submitterPublicKey = submitterKeypair.publicKey.toBase58();
    // const result = await checkIsAccessible(submitterPublicKey);
    // if(!result){
    //   return;
    // }
    return await namespaceWrapper.storeGet("value");
  } catch (error) {
    console.error("MAKE SUBMISSION ERROR:", error);
  }
}
