import { KoiiStorageClient } from '@_koii/storage-task-sdk';
import { getStakingKeypair } from './getBaseInfo.js';

export async function uploadToIPFS(path){
  const storageTaskSDK = KoiiStorageClient.getInstance({});
  const keypair = await getStakingKeypair();
  const publicKey = keypair.publicKey.toBase58();
  console.log(publicKey);
  const result = await storageTaskSDK.uploadFile(path, keypair);
  try{
    return result.cid;
  }catch(error){
    console.log(error);
    return null;
  }
}
