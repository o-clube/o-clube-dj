const {SlashCommandBuilder} = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
      .setName('stop')
      .setDescription('Para de tocar.'),
  async execute(interaction) {
    const player = interaction.client.manager.get(interaction.guildId);
    console.log(player)
    if (!player) return interaction.reply('Não há um player para este servidor.', {ephemeral: true});

    const { channel } = interaction.member.voice;

    if (!channel) return interaction.reply('Você precisa estar em um canal de voz.', {ephemeral: true});
    if (channel.id !== player.voiceChannel) return interaction.reply('Você não está no mesmo canal.', {ephemeral: true});

    player.destroy();
    return interaction.reply("Saindo.")
  },
};
