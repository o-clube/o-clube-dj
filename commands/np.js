const {SlashCommandBuilder} = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
      .setName('np')
      .setDescription('Mostra informação da música atual.'),
  async execute(interaction) {
    const player = interaction.client.manager.get(interaction.guildId);
    if (!player) return interaction.reply('Não há um player para este servidor.', {ephemeral: true});

    if (!player.queue.current) return interaction.reply("Nenhuma música está sendo tocada.", {ephemeral: true})

    const { title } = player.queue.current;

    return interaction.reply(`Tocando agora: \`${title}\`.`)
  },
};
