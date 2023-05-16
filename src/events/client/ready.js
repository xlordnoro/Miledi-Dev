//Displays a bot connection message and changes the presence once every 24 hours. This can changed as seen fit, but 24 hours is fine for my use case.

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        setInterval(client.pickPresence, 3600 * 1000);
        console.log(`${client.user.tag} has logged into discord.`);

        setTimeout(client.checkVideo, 60 * 1000);
    }
}