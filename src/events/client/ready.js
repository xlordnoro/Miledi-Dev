//Displays a bot connection message and changes the presence once every hour. This can changed as seen fit, but 1 hour is fine for my use case.

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        setInterval(client.pickPresence, 3600 * 1000);
        console.log(`${client.user.tag} has logged into discord.`);
    }
}