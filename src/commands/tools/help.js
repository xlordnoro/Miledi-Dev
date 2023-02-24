//Loads the required libraries or files to externally load for the command.

const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

//Create slash command and display a message containing all of the commands available for Mieru-Nee-Main presently.

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription(
      "Shows a list of the available commands for Miledi-Main."
    ),
  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setTitle(`Available Commands`)
      .setDescription(
        `**Normal Commands:**\n\n **/help** Displays the command list.\n\n **Mod commands:**\n\n **/database** Allows users to add information to the database (Requires the ninja role).\n\n **/annoying** Designed solely to torture the socks off users who are annoying/problematic as Miledi herself (requires the jailer role).`
      )
      .setColor(14554646);

    await interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
  },
};
