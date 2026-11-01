import { createAppServer } from './app.js';

const port = Number(process.env.PORT ?? 3000);
createAppServer().listen(port, '0.0.0.0', () => {
  console.log(`Server dang chay tai: http://localhost:${port}`);
});
