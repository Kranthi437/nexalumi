import { createApp } from './app.js';
import { getConfig, loadEnv } from './config.js';

loadEnv();
const config = getConfig();
const app = createApp({ config });

app.listen(config.port, () => {
  console.log(`NEXALUMI Link Checker API listening on port ${config.port}`);
});
