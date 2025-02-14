import cron from "node-cron";
import fetch from "node-fetch";

// Run ETL every 6 hours
cron.schedule("0 */6 * * *", async () => {
  await fetch("https://localhost:3000/api/etl", { method: "POST" });
});
