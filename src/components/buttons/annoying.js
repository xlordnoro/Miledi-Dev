module.exports = {
    data: {
        name: `annoying`
    },
    async execute(interaction, client) {
        const options = ["Too slow!", "Almost!", "No, nadda, not happening! Mwahaha!", "It really is a pain being this cute, right!? Right!? Right!?", "That's mean, O-kun! You should revere me as the grandest and cute mage that I am!"]
        const randomResponse = options[Math.floor(Math.random() * options.length)];
        await interaction.reply({
            content: (randomResponse),
            ephemeral: true
        });
    }
}