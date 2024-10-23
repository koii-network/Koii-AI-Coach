import { namespaceWrapper, app } from "@_koii/namespace-wrapper";
import ollama from 'ollama';
export function routes() {
  if (app) {
    app.get("/value", async (_req, res) => {
      const value = await namespaceWrapper.storeGet("value");
      if (value){
        res.status(200).json({ value: value });
      }else{
        res.status(200).send({ value: "N/A" });
      }
    });
    app.post('/ask-query', async (req, res) => {
      const { model, messages, options } = req.body;

      try {
        const response = await ollama.chat({
          model: model,
          messages: messages,
          options: options
        });
        console.log(response);
        res.json({ reply: response.message.content });
      } catch (error) {
        console.log(error);
        res.status(500).send({ error: 'Error interacting with the model' });
      }
    });
    if (process.env.DEV_MODE) {
      const PORT = 4628;
      try{
        app.listen(PORT, () => {
          console.log(`Server is running on port ${PORT}`);
        });
      } catch (e) {
        console.log("Failed to start server", e);
      }
    }
  }
}
