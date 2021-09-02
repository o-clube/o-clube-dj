const {SlashCommandBuilder} = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
      .setName('play')
      .setDescription('Toca uma música.')
      .addStringOption((option) => option.setName('musica')
        .setDescription('Texto ou URL para a música')
        .setRequired(true)),
  async execute(interaction) {
    const search = interaction.options.getString('musica');

    const { channel } = interaction.member.voice;

    if (!channel) return interaction.reply('Você precisa estar em um canal de voz.', {ephemeral: true});

    const player = interaction.client.manager.create({
        guild: interaction.guildId,
        voiceChannel: channel.id,
        textChannel: interaction.channel.id,
        volume: 25,
      });
    if (player.state !== "CONNECTED") player.connect();

    let res;

    try {
      res = await player.search(search, interaction.author);
      if (res.loadType === 'LOAD_FAILED') {
        if (!player.queue.current) player.destroy();
        throw res.exception;
      }
    } catch (err) {
      return interaction.reply(`Houve um erro durante a busca: ${err.message}`, {ephemeral: true});
    }

    switch (res.loadType) {
      case 'NO_MATCHES':
        if (!player.queue.current) player.destroy();
        return interaction.reply('Nenhum resultado encontrado.');
      case 'TRACK_LOADED':
        player.queue.add(res.tracks[0]);

        if (!player.playing && !player.paused && !player.queue.size) player.play();
        return interaction.reply(`Adicionada a fila \`${res.tracks[0].title}\`.`);
      case 'PLAYLIST_LOADED':
        player.queue.add(res.tracks);

        if (!player.playing && !player.paused && player.queue.totalSize === res.tracks.length) player.play();
        return interaction.reply(`Playlist adicionada \`${res.playlist.name}\` com ${res.tracks.length} músicas.`);
      case 'SEARCH_RESULT':
        const max = 5;
        const filter = (m) => {
          return m.author.id === interaction.member.user.id && /^(\d+|end)$/i.test(m.content);
        }

        if (res.tracks.length < max) max = res.tracks.length;

        const results = res.tracks
            .slice(0, max)
            .map((track, index) => `${++index} - \`${track.title}\``)
            .join('\n');

        interaction.reply(results, { fetchReply: true })
          .then(()=>{
            interaction.channel.awaitMessages({filter, max: 1, time: 30e3, errors: ['time'] })
              .then((collected)=> {
                const first = collected.first().content;

                if (first.toLowerCase() === 'end') {
                    if (!player.queue.current) player.destroy();
                    return interaction.channel.send('Seleção cancelada.');
                }

                const index = Number(first) - 1;
                if (index < 0 || index > max - 1) return interaction.followUp(`Por favor selecione entre 1 até ${max}.`);

                const track = res.tracks[index];
                player.queue.add(track);

                if (!player.playing && !player.paused && !player.queue.size) player.play();
                return interaction.editReply(`Adicionado a fila \`${track.title}\`.`);
              })
              .catch(()=>{
                if (!player.queue.current) player.destroy();
                return interaction.editReply('Você não escolheu nenhuma opção.');
              });
          });
    }
  },
};
