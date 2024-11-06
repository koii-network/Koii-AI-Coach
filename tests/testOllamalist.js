import ollama from 'ollama';
const response = ollama.chat({
    model: "koiiLlama",
    messages: [{"role":"user", "content":"Please generate a question"}],
    options: {num_predict:50, temperature:1}
  }).then(console.log);