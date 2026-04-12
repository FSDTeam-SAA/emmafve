import cron from "node-cron";
import chalk from "chalk";

//server ping in every 8 minutes
export const startPingServerCron = (): void => {
  const schedule = "*/8 * * * *";
  const urls = ["http://localhost:5000/api/v1/ping"];

  cron.schedule(
    schedule,
    async () => {
      console.log(chalk.cyan(`[PingServer] Start at ${new Date().toISOString()}`));

      let success = false;

      for (const url of urls) {
        try {
          console.log(chalk.yellow(`[PingServer] Trying ${url}`));

          const res = await fetch(url);

          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }

          const data = await res.json();

          console.log(
            chalk.green(
              `[PingServer] Success | url=${url} | status=${res.status} | message=${data?.message ?? "ok"}`,
            ),
          );

          success = true;
          break;
        } catch (err) {
          console.error(chalk.red(`[PingServer] Failed | url=${url}`), err);
        }
      }

      if (!success) {
        console.error(chalk.bgRed.white("[PingServer] All endpoints failed!"));
      }
    },
    { timezone: "UTC" },
  );

  console.log(chalk.magenta("[PingServer] Cron scheduled - runs every 8 minutes"));
};
