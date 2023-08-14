const { EmbedBuilder } = require("discord.js");
const https = require("https");
const fs = require("fs");
require("dotenv").config(); // Load environment variables from .env file
const cron = require("node-cron");
const he = require("he"); // Import the he library

module.exports = async (client) => {
  const checkVideo2 = async () => {
    const channelId = "UCsPsZrQySVRR6so8j5HMqRw"; // YouTube channel ID
    const apiKey = process.env.YOUTUBE_API_KEY; // Use the YouTube API key from .env file

    const url = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=1`;

    const options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    };

    const request = https.request(url, options, async (response) => {
      let data = "";
      response.on("data", (chunk) => {
        data += chunk;
      });

      response.on("end", async () => {
        try {
          const responseJson = JSON.parse(data);
          if (!responseJson.items || responseJson.items.length === 0) {
            console.error("No videos found.");
            return;
          }

          const latestVideoData = responseJson.items[0];
          const latestVideoId = latestVideoData.id.videoId;
          const latestVideoPublishedAt = latestVideoData.snippet.publishedAt;

          const rawData = fs.readFileSync(`${__dirname}/../../json/video_Noro.json`);
          const jsonData = JSON.parse(rawData);

          if (jsonData.publishedAt === latestVideoPublishedAt) {
            return; // Exit if the message is a duplicate
          }

          fs.writeFileSync(
            `${__dirname}/../../json/video_Noro.json`,
            JSON.stringify({ id: latestVideoId, publishedAt: latestVideoPublishedAt })
          );

          const guild = await client.guilds.fetch("1073459808696537140").catch(console.error);
          const channel = await guild.channels.fetch("1107870645771051078").catch(console.error);

          const { title: encodedTitle, thumbnails, channelTitle } = latestVideoData.snippet;
          const title = he.decode(encodedTitle); // Decode the HTML-encoded title
          
          const videoUrl = `https://www.youtube.com/watch?v=${latestVideoId}`;
          const thumbnailUrl = thumbnails.maxres?.url || thumbnails.high?.url || thumbnails.default?.url || "";
          const embed = new EmbedBuilder({
            title: title,
            url: videoUrl,
            color: 14554646,
            image: {
              url: thumbnailUrl,
            },
            author: {
              name: channelTitle,
              url: `https://youtube.com/channel/${channelId}/?sub_confirmation=1`,
            },
          });

          await channel.send({
            embeds: [embed],
            content: `@everyone <@&1073461424577335327> New video just dropped!`,
            allowedMentions: { roles: ["1073461424577335327"] },
          }).catch(console.error);
        } catch (error) {
          console.error("Failed to parse YouTube channel videos data:", error);
        }
      });
    });

    request.on("error", (error) => {
      console.error("Failed to fetch YouTube channel videos:", error);
    });

    request.end();
  };

  // Schedule the checkVideo2 function to run at 7:04 a.m., 7:09 a.m., and 10:04 p.m. every day
  cron.schedule("4 7 * * *", () => {
    checkVideo2();
  });

  cron.schedule("9 7 * * *", () => {
    checkVideo2();
  });

  cron.schedule("4 22 * * *", () => {
    checkVideo2();
  });
};