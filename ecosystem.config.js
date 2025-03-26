module.exports = {
  apps: [
    {
      name: 'socialchain-backend',
      script: 'server.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        max_memory_restart: '1G',
        error_file: 'logs/err.log',
        out_file: 'logs/out.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss',
        merge_logs: true,
        watch: false,
        autorestart: true,
        max_restarts: 10
      }
    }
  ]
}; 