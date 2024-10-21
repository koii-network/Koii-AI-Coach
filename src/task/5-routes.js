import { namespaceWrapper, app } from "@_koii/namespace-wrapper";
import ollama from 'ollama';
export function routes() {
  if (app) {
    app.get("/value", async (_req, res) => {
      const value = await namespaceWrapper.storeGet("value");
      console.log("value", value);
      res.status(200).json({ value: value });
    });
    app.post('/ask-query', async (req, res) => {
      const { model, query } = req.body;

      try {
        const response = await ollama.chat({
          model: model,
          messages: [{ role: 'user', content: query }],
        });
        console.log(response);
        res.json({ reply: response.message.content });
      } catch (error) {
        console.log(error);
        res.status(500).send({ error: 'Error interacting with the model' });
      }
    });
    const PORT = 4629;
    try{
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    }catch(e){
      console.log("Failed to start server", e);
    }
  }
}
