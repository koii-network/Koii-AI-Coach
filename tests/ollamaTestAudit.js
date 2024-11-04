import ollama from 'ollama';
async function main(){
    const question = await ollama.chat(
        { "model":"koiiLlama", "messages": [ {"role":"system", "content":"You are a helpful assistant."}, {"role":"user", "content":"Please generate a question"}], "options":{"num_predict":50, "temperature":1}});
    console.log(question.message.content);
        const result = await ollama.chat(
        { "model":"koiiLlama", "messages": [ {"role":"system", "content":"You are a helpful assistant."}, {"role":"user", "content":question.message.content}], "options":{"num_predict":10, "temperature":0}});
    console.log("------Local Result-----");
    console.log(result.message.content);
    const accessLink = "http://f7fdc54b8315a1669635c1ccea04d2cb3c052320.koiidns.com:5644/task/73DREuENc1NawrvdsZbvUfhUVYF6voujiEVBaAxmnBwM"
    const response = await fetch(`${accessLink}/ask-query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ "model":"koiiLlama", "messages": [ {"role":"system", "content":"You are a helpful assistant."}, {"role":"user", "content":question.message.content}], "options":{"num_predict":10, "temperature":0}}) 
      });
    console.log("------Other Nodes Result-----");
    const otherNodesResult = await response.json();
    console.log(otherNodesResult.reply);
}
main();