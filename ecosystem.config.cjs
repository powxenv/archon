/** @type {import('pm2').ModuleConfiguration} */
module.exports = {
  apps: [
    {
      name: "archon-web",
      script: "bun",
      args: "run .output/server/index.mjs",
      cwd: "./",
      env: {
        NODE_ENV: "production",
        HOST: "0.0.0.0",
        PORT: 7162,
      },
      instances: 1,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 5000,
    },
    {
      name: "archon-worker",
      script: "bun",
      args: "run services/worker/index.ts",
      cwd: "./",
      env: {
        NODE_ENV: "production",
      },
      instances: 1,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 5000,
      kill_timeout: 30000,
      listen_timeout: 10000,
    },
  ],
};
