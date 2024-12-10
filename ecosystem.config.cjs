module.exports = {
  apps: [
    {
      name: "frontend",
      script: "nginx",
      args: '-g "daemon off;"',
      exec_mode: "fork",
      watch: false,
    },
    {
      name: "backend",
      script: "server.js",
      cwd: "/backend",
      exec_mode: "fork",
      watch: false,
    },
  ],
};
