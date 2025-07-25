# UptimeRobot Setup Guide

## What is UptimeRobot?
UptimeRobot is a free monitoring service that can ping your bot every 5 minutes to keep it alive 24/7.

## Setup Steps:

### 1. Get Your Bot URL
Your bot now has a keep-alive server running on port 3000. The URL format is:
```
https://your-repl-name.your-username.repl.co/ping
```

For example: `https://discord-bot.mikragd.repl.co/ping`

### 2. Create UptimeRobot Account
1. Go to https://uptimerobot.com/
2. Sign up for a free account
3. Verify your email

### 3. Add Your Bot Monitor
1. Click "Add New Monitor"
2. Choose "HTTP(s)" monitor type
3. **Friendly Name**: "GDVN Discord Bot"
4. **URL**: Your bot's ping URL (see step 1)
5. **Monitoring Interval**: 5 minutes (free plan)
6. Click "Create Monitor"

### 4. Verify Setup
- Your bot should show "Up" status in UptimeRobot
- Check logs in Replit for self-ping messages every 5 minutes
- Your bot will now stay online 24/7!

## Alternative Free Services:
- **Koyeb** - Free tier with always-on hosting
- **Railway** - Free tier with some limitations  
- **Fly.io** - Free tier available

## Bot Status Endpoints:
- `/ping` - Simple ping for monitoring
- `/` - Full status with uptime and memory
- `/status` - Bot features and health info

Your bot is now configured to stay alive automatically!