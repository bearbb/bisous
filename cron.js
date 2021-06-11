const CronJob = require("cron").CronJob;
const Cron = require("./mongodb__backup.js");

// AutoBackUp every week (at 00:00 on Sunday)

new CronJob(
  "0 0 *  * 0",
  function () {
    Cron.dbAutoBackUp();
  },
  null,
  true,
  "Asia/Ho_Chi_Minh"
);
