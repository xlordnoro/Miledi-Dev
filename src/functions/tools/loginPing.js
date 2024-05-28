const nodemailer = require('nodemailer');
const axios = require('axios');
require('dotenv').config();

module.exports = async (client) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    function sendEmail(subject, text) {
        return new Promise((resolve, reject) => {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: process.env.EMAIL_USER,
                subject: subject,
                text: text
            };

            transporter.sendMail(mailOptions, (error) => {
                if (error) {
                    console.log('Error sending email:', error);
                    reject(error);
                } else {
                    console.log('Email sent successfully!');
                    resolve();
                }
            });
        });
    }

    const TELEGRAM_API_URL = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID; // Your chat ID

    async function sendTelegramMessage(message) {
        try {
            await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
                chat_id: CHAT_ID,
                text: message
            });
            console.log('Telegram message sent successfully!');
        } catch (error) {
            console.error('Error sending Telegram message:', error);
        }
    }

    const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

    async function sendDiscordMessage(message) {
        try {
            await axios.post(DISCORD_WEBHOOK_URL, {
                content: message
            });
            console.log('Discord message sent successfully!');
        } catch (error) {
            console.error('Error sending Discord message:', error);
        }
    }

    const executeLoginPing = async () => {
        if (client.user) {
            const loginMessage = `${client.user.tag} has successfully logged in.`;
            await sendEmail(`${client.user.tag} Login`, loginMessage);
            await sendTelegramMessage(loginMessage);
            await sendDiscordMessage(loginMessage);
        } else {
            console.log('Bot has not logged in yet.');
        }
    };

    client.once('ready', () => {
        executeLoginPing();
    });

    client.on('disconnect', async () => {
        const offlineMessage = `${client.user.tag} has gone offline.`;
        await sendEmail(`${client.user.tag} Offline`, offlineMessage);
        await sendTelegramMessage(offlineMessage);
        await sendDiscordMessage(offlineMessage);
    });

    client.on('error', async (error) => {
        const errorMessage = `An error occurred: ${error.message}`;
        await sendEmail(`${client.user.tag} Error`, errorMessage);
        await sendTelegramMessage(errorMessage);
        await sendDiscordMessage(errorMessage);
    });

    process.on('SIGINT', async () => {
        console.log('SIGINT received. Terminating the bot...');
        const disconnectMessage = `${client.user.tag} has been disconnected.`;
        await sendEmail(`${client.user.tag} Disconnected`, disconnectMessage);
        await sendTelegramMessage(disconnectMessage);
        await sendDiscordMessage(disconnectMessage);
        process.exit(0); // Terminate the process
    });
};