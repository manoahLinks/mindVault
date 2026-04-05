import { config } from "./config.js";
import { createApp } from "./app.js";

const app = createApp();

app.listen(config.PORT, () => {
  console.log(`MindVault server running on port ${config.PORT}`);
  console.log(`Network: ${config.NETWORK}`);
  console.log(`Health: http://localhost:${config.PORT}/health`);
});
