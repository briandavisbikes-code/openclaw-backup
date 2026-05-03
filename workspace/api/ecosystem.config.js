module.exports = {
  apps: [{
    name: 'truckpedia-api',
    script: 'server.js',
    cwd: '/home/your-email/api',
    exec_mode: 'fork',
    instances: 1,
    autorestart: true,
    watch: false,
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
    },
  }],
};
