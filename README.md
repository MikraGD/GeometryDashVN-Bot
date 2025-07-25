# 🤖 GDVN Bot

A smart, customizable Discord bot built to make your server smarter, faster, and more fun. Whether you're running a small community or a busy guild — GDVN Bot helps automate the boring stuff so you can focus on the good vibes.

---

## 📦 Features

- 🔒 Role-based permission system (no more token sharing!)
- 📌 Moderation tools
- 🎮 Fun & utility commands
- 🔧 Easy config with `.env` support
- 📊 Logging system for actions
- ☁️ Deployable to any 24/7 environment

---

## 🚀 Getting Started

### 1. Clone the Repository

```
bash
git clone https://github.com/yourusername/gdvn-bot.git
cd gdvn-bot
```
2. Install Dependencies
```
npm install
```
3. Set up the Environment Variables
Copy .env.example and create your own .env:

```
cp .env.example .env
```
Edit .env and fill in your bot token, guild ID, etc.

▶️ Run the Bot
```
bash
node index.js
```
Or if you're using nodemon for live reloads during development:
```
bash
npx nodemon index.js
```
🛠️ Customize
You can easily edit command files in the commands/ folder or tweak how the bot handles events via the events/ folder. Make it yours!

🌍 Deployment
You can deploy this bot to:

Replit (free, but goes to sleep — use UptimeRobot or cron pinging)

Railway, Render, or Fly.io

Your own VPS or home server

🤝 Contributing
Pull requests are welcome! If you have ideas or want to help out, feel free to fork and PR.

📄 License
MIT License – do whatever you want, just give credit. ❤️

