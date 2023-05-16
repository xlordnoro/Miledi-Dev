const { EmbedBuilder } = require("discord.js");
const Parser = require("rss-parser");
const parser = new Parser();
const fs = require("fs");

module.exports = (client) => {
  client.checkVideo = async () => {
    const data = await parser
      .parseURL(
        "https://youtube.com/feeds/videos.xml?channel_id=UCsPsZrQySVRR6so8j5HMqRw"
      )
      .catch(console.error);

    const rawData = fs.readFileSync(`${__dirname}/../../json/video.json`);
    const jsonData = JSON.parse(rawData);
    //console.log(jsonData, data);

    if (jsonData.id !== data.items[0].id) {
      fs.writeFileSync(
        `${__dirname}/../../json/video.json`,
        JSON.stringify({ id: data.items[0].id })
      );

      const guild = await client.guilds
        .fetch("1073459808696537140")
        .catch(console.error);
      const channel = await guild.channels
        .fetch("1107870645771051078")
        .catch(console.error);

      const { title, link, id, author } = data.items[0];
      const embed = new EmbedBuilder({
        title: title,
        url: link,
        color: 14554646,
        image: {
          url: `https://img.youtube.com/vi/${id.slice(9)}/maxresdefault.jpg`,
        },
        author: {
          name: author,
          url: "https://youtube.com/channel/UCsPsZrQySVRR6so8j5HMqRw/?sub_confirmation=1",
        },
      });

      await channel
        .send({
          embeds: [embed],
          content: `@everyone <@&1073461424577335327> New video just dropped!`,
          allowedMentions: { roles: ["1073461424577335327"] },
        })
        .catch(console.error);
    }
  };
};
