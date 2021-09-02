module.exports = {
    name: 'ready',
    async execute(client) {
        client.manager.init(client.user.id);
        console.log(`Logged in as ${client.user.tag}`);
    },
  };
