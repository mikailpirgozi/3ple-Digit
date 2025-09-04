// PM2 ecosystem configuration
module.exports = {
  apps: [
    {
      name: '3ple-digit-api',
      script: 'pnpm',
      args: 'dev --filter api',
      cwd: '/Users/mikailpirgozi/Desktop/Cursor zalohy mac16/3ple digit aplikacia',
      interpreter: 'none',
      env: {
        NODE_ENV: 'development',
        PORT: 4000,
      },
      // Restart settings
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s',
      // Logs
      log_file: './logs/api-combined.log',
      out_file: './logs/api-out.log',
      error_file: './logs/api-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      // Database connection retry
      kill_timeout: 5000,
      listen_timeout: 8000,
      // Exponential backoff restart
      exp_backoff_restart_delay: 100,
    },
    {
      name: '3ple-digit-web',
      script: 'pnpm',
      args: 'dev --filter web',
      cwd: '/Users/mikailpirgozi/Desktop/Cursor zalohy mac16/3ple digit aplikacia',
      interpreter: 'none',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      // Restart settings
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s',
      // Logs
      log_file: './logs/web-combined.log',
      out_file: './logs/web-out.log',
      error_file: './logs/web-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      // Kill timeout
      kill_timeout: 5000,
      listen_timeout: 8000,
    },
  ],
};
