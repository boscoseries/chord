const { topGainers } = require('./jobs/top_gainers');

setInterval(async () => {
  await topGainers();
}, 4000 * 60 * 60);
