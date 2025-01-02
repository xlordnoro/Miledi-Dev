//Define any of the required libraries or files to externally load/call for the command here.

const Guild = require("../../Schemas/guild");
const { MessageFlags, SlashCommandBuilder } = require("discord.js");
const mongoose = require("mongoose");

//Creates the slash command and fetches the users role for verification

module.exports = {
  data: new SlashCommandBuilder()
    .setName("database")
    .setDescription("Returns information from a database."),
  async execute(interaction, client) {
    const { roles } = interaction.member;
    const role = await interaction.guild.roles
      .fetch("1073460830110228611")
      .catch(console.error);

    //Cross-checks the fetch from earlier and if the user has the role, run the command.
    if (roles.cache.has("1073460830110228611")) {
      let guildProfile = await Guild.findOne({ guildId: interaction.guild.id });
      if (!guildProfile) {
        guildProfile = await new Guild({
          _id: mongoose.Types.ObjectId(),
          guildId: interaction.guild.id,
          guildName: interaction.guild.name,
          guildIcon: interaction.guild.iconURL()
            ? interaction.guild.iconURL()
            : "None.",
        });

      //If the server is new, log the schema details in the db. Otherwise, print the server ID of the discord server to the console and command.

        await guildProfile.save().catch(console.error);
        await interaction.reply({
          content: `Server Name: ${guildProfile.guildName}`,
          flags: MessageFlags.Ephemeral,
        });
        console.log(guildProfile);
      } else {
        await interaction.reply({
          content: `Server ID: ${guildProfile.guildId}`,
          flags: MessageFlags.Ephemeral,
        });
        console.log(guildProfile);
      }
    } else {
      await interaction.reply({
        content: `You do not have the ${role.name} role.`,
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
