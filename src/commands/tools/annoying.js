//Define any of the required libraries or files to externally load/call for the command here.

const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  PermissionFlagsBits,
  PermissionsBitField,
} = require("discord.js");
const annoying = require("../../components/buttons/annoying");

//Creates the slash command and fetches the users role for verification

module.exports = {
  data: new SlashCommandBuilder()
    .setName("annoying")
    .setDescription(
      "Do not run this code ever if you value your ears and life."
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("user")
        .setDescription(
          "Enter the username of the victim you want torture endlessly."
        )
        .addUserOption((option) =>
          option.setName("target").setDescription("The user").setRequired(true)
        )
    ),

  async execute(interaction, client) {
    const { roles } = interaction.member;
    const role = await interaction.guild.roles
      .fetch("1074229659119661058")
      .catch(console.error);
    const title =
      "Hi! Hi! Everyone's favorite and cute mage has arrived! *Teehee!";
    const options = [
      "Sorry! It must be so hard facing your family knowing that you have a bald head at your age!",
      "You're too slow and weak if you think you can beat me, O-kun!",
      "Hello? Aren't you going to say anything? It's proper manners to return a greeting, you know? Sheesh, kids these days... no respect, I tell you.",
      "If you don't like how things went, then come down here and fight us, you bastard! We'll show you how strong mortals can be!",
      "Transcendent Genius Beautiful Girl Wizard. Enough said.",
      "Ho...? Do explain what you were trying to hide from me, you two? N-Nothing... *Heavensfall!",
    ];
    const randomResponse = options[Math.floor(Math.random() * options.length)];
    const randomResponse2 = options[Math.floor(Math.random() * options.length)];
    const randomResponse3 = options[Math.floor(Math.random() * options.length)];
    const randomResponse4 = options[Math.floor(Math.random() * options.length)];

    //Cross-checks the fetch from earlier and if the user has the role, run the command. Otherwise, print a message to the user stating they lack the role required.

    if (roles.cache.has("1074229659119661058")) {

      //Gets the username of the victim who is about to meet their maker as she crosses onto the battlefield with her trademark pose in hand.
      const user = interaction.options.getMember("target");

      const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(randomResponse)
        .setColor(14554646);

      const embed2 = new EmbedBuilder()
        .setTitle(title)
        .setDescription(randomResponse2)
        .setColor(14554646);

      const embed3 = new EmbedBuilder()
        .setTitle(title)
        .setDescription(randomResponse3)
        .setColor(14554646);

      const embed4 = new EmbedBuilder()
        .setTitle(title)
        .setDescription(randomResponse4)
        .setColor(14554646);

      //Creates a button for the embed which randomly pulls a quote from annoying.js.

      const buttons = new ActionRowBuilder().setComponents([
        new ButtonBuilder()
          .setCustomId("annoying")
          .setLabel("Please make it stop!!")
          .setStyle(ButtonStyle.Secondary),
      ]);

      //Sends a simple message to the user when the command is run correctly.

      await interaction.reply({
        content: `Message sent.`,
        ephemeral: true,
      });

      //Sends the output of the embed to a different channel and pings the role via their id. Otherwise, print they lack the role required to run the command.

      const channel = client.channels.cache.get("1073467097675477042");
      channel.send({
        content: `<@&1073466795337453599>`,
        allowedMentions: { roles: ["1073466795337453599"] },
        embeds: [embed],
        components: [buttons],
      });
      setTimeout(function () {
        channel.send({
          content: `<@&1073466795337453599>`,
          allowedMentions: { roles: ["1073466795337453599"] },
          embeds: [embed2],
          components: [buttons],
        });
      }, 1000 * 5);
      setTimeout(function () {
        channel.send({
          content: `<@&1073466795337453599>`,
          allowedMentions: { roles: ["1073466795337453599"] },
          embeds: [embed3],
          components: [buttons],
        });
      }, 1000 * 5);
      setTimeout(function () {
        channel.send({
          content: `<@&1073466795337453599>`,
          allowedMentions: { roles: ["1073466795337453599"] },
          embeds: [embed4],
          components: [buttons],
        });
      }, 1000 * 5);
    } else {
      await interaction.reply({
        content: `You do not have the ${role.name} role.`,
        ephemeral: true,
      });
    }
  },
};
