const fs = require('fs');
const https = require('https');
const { EmbedBuilder } = require('discord.js');
require('dotenv').config();
const cron = require("node-cron");

const twitchClientId = process.env.TWITCH_CLIENT_ID;
const twitchClientSecret = process.env.TWITCH_CLIENT_SECRET;
let twitchAccessToken = process.env.TWITCH_ACCESS_TOKEN;
let accessTokenExpiry = 0;
const twitchRefreshToken = process.env.TWITCH_REFRESH_TOKEN;
const twitchUserId = process.env.TWITCH_PMG_USER_ID;
const tokenRefreshInterval = 60 * 24 * 60 * 60 * 1000; // 60 days in milliseconds

module.exports = async (client) => {
  async function refreshToken() {
    // Check if the access token is expired
    if (Date.now() > accessTokenExpiry) {
      // Refresh the access token using the refresh token
      const data = JSON.stringify({
        grant_type: 'refresh_token',
        refresh_token: twitchRefreshToken,
        client_id: twitchClientId,
        client_secret: twitchClientSecret,
      });

      const options = {
        hostname: 'id.twitch.tv',
        port: 443,
        path: '/oauth2/token',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length,
        },
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          const tokenData = JSON.parse(body);
          twitchAccessToken = tokenData.access_token;
          accessTokenExpiry = Date.now() + tokenData.expires_in * 1000;

          // Update the .env file with the new access token
          updateEnvFile('TWITCH_ACCESS_TOKEN', twitchAccessToken);

          console.log('Twitch API Access Token has been refreshed.');
        });
      });

      req.on('error', (error) => {
        console.error('Error refreshing Twitch API access token:', error);
      });

      req.write(data);
      req.end();
    }
  }

  // Call refreshToken every 60 days (tokenRefreshInterval)
  setInterval(refreshToken, tokenRefreshInterval);

  async function checkLiveStatus() {
    try {
      const options = {
        headers: {
          'Client-ID': twitchClientId, // Replace with your Twitch Client ID
          'Authorization': `Bearer ${twitchAccessToken}`,
        },
      };

      https.get(`https://api.twitch.tv/helix/streams?user_id=${twitchUserId}`, options, (response) => {
        let data = '';
        response.on('data', (chunk) => {
          data += chunk;
        });

        response.on('end', async () => {
          try {
            const liveStreams = JSON.parse(data).data;

            // Check if liveStreams is not empty
            if (liveStreams && liveStreams.length > 0) {
              const videoId = liveStreams[0].id;
              const publishedAt = liveStreams[0].started_at;

              // Load the existing data from the JSON file
              let liveStatus = {};
              if (fs.existsSync(`${__dirname}/../../json/live_status_twitch_PMG.json`)) {
                const rawContent = fs.readFileSync(`${__dirname}/../../json/live_status_twitch_PMG.json`);
                liveStatus = JSON.parse(rawContent);
              }

              // Check if the video is already announced as live
              if (!liveStatus[videoId] || liveStatus[videoId] !== publishedAt) {
                // Send notification
                await sendLiveNotification(videoId);

                // Log the video ID and publish date in the JSON file
                liveStatus[videoId] = publishedAt;
                fs.writeFileSync(`${__dirname}/../../json/live_status_twitch_PMG.json`, JSON.stringify(liveStatus, null, 2));

                console.log(`New live stream detected! Video ID: ${videoId}`);
              }
            }
          } catch (error) {
            console.error('Error parsing Twitch API response:', error);
          }
        });
      });
    } catch (err) {
      console.error('Error checking live status:', err);
    }
  }

  async function sendLiveNotification(videoId) {
    const liveEmbed = new EmbedBuilder()
      .setTitle('🔴 Pyle is now live on Twitch!')
      .setDescription(`Watch the stream [here](https://www.twitch.tv/videos/${videoId}).`)
      .setColor('#ff0000') // You can customize the color
      .setTimestamp();

    // Replace DISCORD_TEXT_CHANNEL_ID with the actual ID of your Discord text channel
    const guild = await client.guilds.fetch('1073459808696537140').catch(console.error);
    if (!guild) return;

    const channel = await guild.channels.fetch('1158958077203197952').catch(console.error);
    if (channel) {
      await channel.send({ content: '@everyone <@&1073461424577335327> Pyle is now live on Twitch!', embeds: [liveEmbed], allowedMentions: { roles: ["1073461424577335327"] } });
    }
  }

  // Schedule the checkLiveStatus function to run on every hour
  cron.schedule("0 * * * *", () => {
    checkLiveStatus();
  });
};

// Function to update .env file with new values
function updateEnvFile(key, value) {
  // Read the existing .env file
  const envPath = './.env'; // Update with the path to your .env file
  const data = fs.readFileSync(envPath, 'utf8');

  // Replace the existing value with the new value
  const updatedData = data.replace(new RegExp(`${key}=.*$`, 'm'), `${key}=${value}`);

  // Write the updated content back to the .env file
  fs.writeFileSync(envPath, updatedData, 'utf8');

  console.log(`Updated .env file with ${key}.`);
}
