# Security Configuration

## Protected Endpoints

The following endpoints now require authentication:

### 🔒 Status Endpoint
- **URL**: `/status?token=YOUR_TOKEN`
- **Purpose**: Detailed bot status, memory usage, uptime
- **Authentication**: Query parameter or `X-Auth-Token` header

### 🔒 Monitoring Dashboard  
- **URL**: `/uptime?token=YOUR_TOKEN`
- **Purpose**: Web interface for bot monitoring
- **Authentication**: Query parameter required

## Public Endpoints (No Auth Required)

### ✅ Health Check
- **URL**: `/` (root)
- **Purpose**: Basic "alive" status for UptimeRobot
- **Info**: Limited to basic status only

### ✅ Ping Endpoint
- **URL**: `/ping`  
- **Purpose**: Simple "pong" response for monitoring
- **Info**: No sensitive data exposed

## Token Configuration

### Default Token
```
gdvn-bot-admin-2025
```

### Custom Token (Recommended)
Set environment variable:
```
STATUS_TOKEN=your-secure-random-token-here
```

## UptimeRobot Setup
Use the **public ping endpoint** for monitoring:
```
https://your-repl-url.repl.co/ping
```

This endpoint requires no authentication and is safe for external monitoring services.

## Security Best Practices

1. **Change default token** in production
2. **Use HTTPS** when possible  
3. **Monitor access logs** for unauthorized attempts
4. **Keep monitoring URLs private**
5. **Use strong, random tokens**

## Access Examples

```bash
# Public health check (safe)
curl https://your-bot.repl.co/

# Public ping (safe)  
curl https://your-bot.repl.co/ping

# Protected status (requires token)
curl https://your-bot.repl.co/status?token=your-token

# Protected monitoring page
https://your-bot.repl.co/uptime?token=your-token
```

Your bot is now secure for production use!