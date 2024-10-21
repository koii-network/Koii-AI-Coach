import { namespaceWrapper, TASK_ID } from "@_koii/namespace-wrapper";
import path from 'path';
import { Keypair } from '@_koii/web3.js';
import dotenv from 'dotenv';
dotenv.config();

export async function getBasePath(){
    let ollamaBasePath;
    if (process.env.DEV_MODE === 'true') {
        ollamaBasePath = "./";
    }else{
        const namespaceBasePath = await namespaceWrapper.getBasePath();
        ollamaBasePath = path.dirname(namespaceBasePath);
    }
    return ollamaBasePath;
}

export async function getStakingKeypair(){
    if (process.env.DEV_MODE === 'true') {
        const keyArray = JSON.parse(process.env.KOII_STORAGE_TASK_KEY);
        const keypair = Keypair.fromSecretKey(Uint8Array.from(keyArray));
        return keypair;
    }else{
        const keypair = await namespaceWrapper.getSubmitterAccount();
        return keypair;
    }
}

export async function getAccessLink(nodeAddress){
    if (process.env.DEV_MODE === 'true') {

        return `http://localhost:3000`;
    }
    if (!nodeAddress){
        return "";
    }
    if (nodeAddress.includes("http")){
        return `${nodeAddress}/task/${TASK_ID}`;
    }
    return `http://${nodeAddress}/task/${TASK_ID}`;
}
