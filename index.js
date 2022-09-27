// Permissions needed on
// https://discord.com/developers/applications/1023345301500735530/oauth2/url-generator
// are Bot -> Read Messages/View Channels, Add Reactions
// https://discord.com/api/oauth2/authorize?client_id=1023345301500735530&permissions=1088&scope=bot

// Require the necessary discord.js classes
const { Client, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');
const fetch = require('node-fetch');

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ]
});

// When the client is ready, run this code (only once)
client.once('ready', () => {
  console.log('Ready!');
});

// On reaction, send to Athens API.
client.on('messageReactionAdd', async messageReaction => {
  const { emoji, message } = messageReaction;
  const { channel } = message;
  const { parent } = channel;
  const channelString = channel.isThread() ? `${parent.name} / ${channel.name}` : channel.name;
  if (emoji.toString() == '📥') {
    const url = 'http://localhost:3010/api/path/write';
    const data = {
      "path": [{ "page/query": "@today" }, 
               { "block/string": "[[Discord]]" }, 
               { "block/string": channelString }],
      "data": [{ "block/string": message.cleanContent }],
    };
    const auth = "DiscordBot:";
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(auth).toString('base64'),
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (response.ok) {
      await message.react('📨');
    } else {
      console.error("API request failed");
      console.error(await response.text());
    }
  }
});

// Login to Discord with your client's token
client.login(token);