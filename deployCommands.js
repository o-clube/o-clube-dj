const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');


const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
}

(async () => {
    try {
        if (process.env.PRODUCTION) {
            await rest.put(
                Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
                { body: commands },
            );
        }
        else{
            await rest.put(
                Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, '201502853737480193'),
                { body: commands },
            );
        }

        console.log('Successfully registered application commands.');
    } catch (error) {
        console.error(error);
    }
})();
