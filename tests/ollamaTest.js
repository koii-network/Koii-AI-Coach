import ollama from 'ollama';
async function main(){
    const result = await ollama.chat({
        model: 'koiiLlama',
        messages: [{role: 'user', content: 'Hello, how are you?'}],
        options: {}
    });
    console.log(result);
}
main();