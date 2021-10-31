const fs = require('fs');

const {Client, Collection, Intents} = require('discord.js');
const { Manager } = require("erela.js");
const Spotify  = require("erela.js-spotify");

// Deploy commands to Discord API
require('./deployCommands');

const client = new Client({intents: [Intents.FLAGS.GUILDS,
  Intents.FLAGS.GUILD_VOICE_STATES,
  Intents.FLAGS.GUILD_MEMBERS,
  Intents.FLAGS.GUILD_MESSAGES]});


const nodes = [
  {
    host: process.env.LAVALINK_HOST,
    password: process.env.LAVALINK_PASSWORD,
    port: 2333,
  }
];

client.manager = new Manager({
  nodes,
  plugins:[
    new Spotify({
      clientID: process.env.SPOTIFY_ID,
      clientSecret: process.env.SPOTIFY_SECRET
    })
  ],
  send: (id, payload) => {
    const guild = client.guilds.cache.get(id);
    if (guild) guild.shard.send(payload);
  }
})
.on("nodeConnect", node => console.log(`Node "${node.options.identifier}" connected.`))
.on("nodeError", (node, error) => console.log(
  `Node "${node.options.identifier}" encountered an error: ${error.message}.`
))
.on("trackStart", (player, track) => {
  const channel = client.channels.cache.get(player.textChannel);
  channel.send(`Tocando agora: \`${track.title}\`.`);
})
.on("queueEnd", player => {
  const channel = client.channels.cache.get(player.textChannel);
  player.destroy();
});


// Load commands
client.commands = new Collection();
// eslint-disable-next-line semi
if (fs.existsSync('./commands')) {
  const commandFiles = fs.readdirSync('./commands')
      .filter((file) => file.endsWith('.js'));


  for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
    console.log(`Command ${command.data.name} loaded.`);
  }
}

// Load events
if (fs.existsSync('./events')) {
  const eventFiles = fs.readdirSync('./events')
      .filter((file) => file.endsWith('.js'));

  for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }
    console.log(`Event ${event.name} loaded.`);
  }
}

client.on("raw", d => client.manager.updateVoiceState(d));

// Handle interactions
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.editReply({
      content: 'There was an error while executing this command!',
      ephemeral: true});
  }
});


client.login(process.env.DISCORD_TOKEN);
