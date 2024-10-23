import ollama from 'ollama';

async function isAccessible(){

    try {
        const result = await ollama.chat({
            model: 'koiiLlama',
            messages: [{ role: 'user', content: 'Hello' }],
        });
        console.log("Check Result: ", result);
        console.log("Check Result: ", "Accessible");
        return true;
    } catch (error) {
        console.log("Check Result: ", "Not Accessible");
        return false;
    }
}

export { isAccessible };