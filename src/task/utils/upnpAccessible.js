import { TASK_ID } from "@_koii/namespace-wrapper";
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