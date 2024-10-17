import ollama from 'ollama';

async function isAccessible(){

    try {
        await ollama.chat({
            model: 'llama3.2',
            messages: [{ role: 'user', content: 'Hello' }],
        });
        return true;
    } catch (error) {
        return false;
    }
}

export { isAccessible };