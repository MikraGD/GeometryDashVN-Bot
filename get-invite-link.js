require('dotenv').config();

const CLIENT_ID = process.env.CLIENT_ID;

if (!CLIENT_ID) {
    console.log('❌ CLIENT_ID not found in environment variables');
    console.log('Please make sure you have set up your Discord Bot Application and added the CLIENT_ID to Replit Secrets');
    process.exit(1);
}

console.log('🤖 GDVN Bot Discord Invite Information');
console.log('=====================================');
console.log(`Client ID: ${CLIENT_ID}`);
console.log('');
console.log('📋 Copy this invite link to add your bot to Discord:');
console.log('');
console.log(`https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&permissions=8&scope=bot%20applications.commands`);
console.log('');
console.log('🔧 Instructions:');
console.log('1. Copy the link above');
console.log('2. Open it in your browser'); 
console.log('3. Select your Discord server');
console.log('4. Click "Authorize"');
console.log('5. Test with /help or /demonlist commands');
console.log('');
console.log('✅ Your bot has 11 commands ready to use including the new demon list feature!');