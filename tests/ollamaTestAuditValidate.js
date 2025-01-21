import {validateNetworkAccessible} from '../src/task/3-audit.js';

async function main(){
    const result = await validateNetworkAccessible("http://b6c539bf52dd43263c4fc923819e5d0f8233797b.koiidns.com:5644/tasks")
    console.log(result)

}
main()