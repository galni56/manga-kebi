module.exports = {
  apps: [
    {
      name: "mangal-web",
      cwd: "/var/www/mangal-kebab",
      script: "npm",
      args: "run start",
      env: { NODE_ENV: "production", PORT: "3000" },
      max_memory_restart: "500M",
    },
    {
      name: "mangal-tg-bot",
      cwd: "/var/www/mangal-kebab",
      script: "node",
      args: "--env-file=.env.local scripts/telegram-worker.mjs",
      max_memory_restart: "150M",
    },
  ],
};
