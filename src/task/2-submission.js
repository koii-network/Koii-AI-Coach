import { namespaceWrapper } from "@_koii/namespace-wrapper";

export async function submission(roundNumber) {
  /**
   * Submit the task proofs for auditing
   * Must return a string of max 512 bytes to be submitted on chain
   */
  try {
    console.log(`MAKE SUBMISSION FOR ROUND ${roundNumber}`);
    await new Promise(resolve => setTimeout(resolve, 5000));
    const nodeKeypair = await namespaceWrapper.getSubmitterAccount();
    const nodeAddress = nodeKeypair.publicKey.toBase58();
    const tasksLink = await getTasksLink(nodeAddress);
    if (!tasksLink){
      return;
    }
    const accessibleValidationResult = await validateNetworkAccessible(tasksLink)
    if (!accessibleValidationResult){
      return;
    }
    return await namespaceWrapper.storeGet("value");
  } catch (error) {
    console.error("MAKE SUBMISSION ERROR:", error);
  }
}
