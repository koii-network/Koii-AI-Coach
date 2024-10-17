import ollama from 'ollama';

async function isAccessible(){

    try {
        await ollama.chat({
            model: 'llama3.2',
            messages: [{ role: 'user', content: 'Hello' }],
        });
        console.log("Check Result: ", "Accessible");
        return true;
    } catch (error) {
        console.log("Check Result: ", "Not Accessible");
        return false;
    }
}

export { isAccessible };