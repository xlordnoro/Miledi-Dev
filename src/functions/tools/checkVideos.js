const { EmbedBuilder } = require("discord.js");
const https = require("https");
const fs = require("fs");
require("dotenv").config(); // Load environment variables from .env file

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

          const rawData = fs.readFileSync(`${__dirname}/../../json/video.json`);
          const jsonData = JSON.parse(rawData);

          if (jsonData.publishedAt === latestVideoPublishedAt) {
            console.error("Existing video found.");
            return; // Exit if the message is a duplicate
          }

          fs.writeFileSync(
            `${__dirname}/../../json/video.json`,
            JSON.stringify({ id: latestVideoId, publishedAt: latestVideoPublishedAt })
          );

          const guild = await client.guilds.fetch("1073459808696537140").catch(console.error);
          const channel = await guild.channels.fetch("1107870645771051078").catch(console.error);

          const { title, thumbnails, channelTitle } = latestVideoData.snippet;
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

  const scheduleVideoChecks = () => {
    const now = new Date();
    const scheduledTime7am = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 7, 1, 0); // Set scheduled time to 7:01 a.m.
    const scheduledTime7_05am = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 7, 6, 0); // Set scheduled time to 7:06 a.m.
    const delay7am = scheduledTime7am - now;
    const delay7_05am = scheduledTime7_05am - now;
  
    if (delay7am < 0) {
      scheduledTime7am.setDate(scheduledTime7am.getDate() + 1); // If it's already past 7:01 a.m. today, schedule it for 7:01 a.m. tomorrow
    }
  
    if (delay7_05am < 0) {
      scheduledTime7_05am.setDate(scheduledTime7_05am.getDate() + 1); // If it's already past 7:06 a.m. today, schedule it for 7:06 a.m. tomorrow
    }
  
    setTimeout(() => {
      checkVideo2();
      setInterval(checkVideo2, 24 * 60 * 60 * 1000); // Repeat every 24 hours
    }, delay7am);
  
    setTimeout(() => {
      checkVideo2();
      setInterval(checkVideo2, 24 * 60 * 60 * 1000); // Repeat every 24 hours
    }, delay7_05am);
  };
  
  module.exports = { scheduleVideoChecks };
};