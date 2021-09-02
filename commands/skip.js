const {SlashCommandBuilder} = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
      .setName('skip')
      .setDescription('Pula a música que esta sendo tocada.'),
  async execute(interaction) {
    const player = interaction.client.manager.get(interaction.guildId);
    if (!player) return interaction.reply('Não há um player para este servidor.', {ephemeral: true});

    const { channel } = interaction.member.voice;
    if (!channel) return interaction.reply('Você precisa estar em um canal de voz.', {ephemeral: true});
    if (channel.id !== player.voiceChannel) return interaction.reply('Você não está no mesmo canal.', {ephemeral: true});

    if (!player.queue.current) return interaction.reply("Nenhuma música está sendo tocada.", {ephemeral: true})

    const { title } = player.queue.current;

    player.stop();
    return interaction.reply(`Pulando \`${title}\`.`)
  },
};
