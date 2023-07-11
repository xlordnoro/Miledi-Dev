//Displays a bot connection message and changes the presence once every hour. This can changed as seen fit, but 1 hour is fine for my use case.
//Also runs the youtube channel updates at specified times (7:00 a.m. & 7:05 a.m.)

const { scheduleVideoChecks } = require("E:/Discord_bots/Miledi-Dev/src/functions/tools/checkVideos");

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        setInterval(client.pickPresence, 3600 * 1000);
        console.log(`${client.user.tag} has logged into discord.`);
        scheduleVideoChecks();
    }
}