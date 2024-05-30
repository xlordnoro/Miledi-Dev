const nodemailer = require('nodemailer');
const axios = require('axios');
const ping = require('ping');
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
            throw error;
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
            throw error;
        }
    }

    const pendingMessages = [];
    let disconnectLogged = false;
    let reconnectLogged = false;

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

    const notifyDisconnect = () => {
        if (!disconnectLogged) {
            const offlineMessage = `${client.user.tag} has gone offline.`;
            pendingMessages.push({
                type: 'email',
                subject: `${client.user.tag} Offline`,
                text: offlineMessage
            });
            pendingMessages.push({
                type: 'telegram',
                text: offlineMessage
            });
            pendingMessages.push({
                type: 'discord',
                text: offlineMessage
            });
            console.log('Internet connection lost. Messages queued.');
            disconnectLogged = true;
            reconnectLogged = false;
        }
    };

    const notifyReconnect = async () => {
        if (!reconnectLogged) {
            const reconnectMessage = `${client.user.tag} has reconnected.`;
            pendingMessages.push({
                type: 'email',
                subject: `${client.user.tag} Reconnected`,
                text: reconnectMessage
            });
            pendingMessages.push({
                type: 'telegram',
                text: reconnectMessage
            });
            pendingMessages.push({
                type: 'discord',
                text: reconnectMessage
            });
            console.log('Internet connection restored. Messages queued.');
            reconnectLogged = true;
            await processPendingMessages();
        }
    };

    const processPendingMessages = async () => {
        while (pendingMessages.length > 0) {
            const message = pendingMessages.shift();
            try {
                if (message.type === 'email') {
                    await sendEmail(message.subject, message.text);
                } else if (message.type === 'telegram') {
                    await sendTelegramMessage(message.text);
                } else if (message.type === 'discord') {
                    await sendDiscordMessage(message.text);
                }
            } catch (error) {
                console.error('Error sending message:', error);
                pendingMessages.unshift(message); // Re-queue the message
                break;
            }
        }
    };

    const checkInternetConnectivity = async () => {
        try {
            const res = await ping.promise.probe('8.8.8.8');
            if (!res.alive) {
                console.log('Internet connection lost. Triggering disconnect...');
                notifyDisconnect();
                client.emit('disconnect');
            } else {
                if (disconnectLogged) {
                    await notifyReconnect();
                    disconnectLogged = false; // Reset the flag after processing messages
                }
            }
        } catch (error) {
            console.error('Error checking internet connectivity:', error);
        }
    };

    setInterval(checkInternetConnectivity, 600000);

    client.on('disconnect', async () => {
        if (!disconnectLogged) {
            const offlineMessage = `${client.user.tag} has gone offline.`;
            pendingMessages.push({
                type: 'email',
                subject: `${client.user.tag} Offline`,
                text: offlineMessage
            });
            pendingMessages.push({
                type: 'telegram',
                text: offlineMessage
            });
            pendingMessages.push({
                type: 'discord',
                text: offlineMessage
            });
            console.log('Bot disconnected. Messages queued.');
            disconnectLogged = true;
        }
    });

    client.on('error', async (error) => {
        const errorMessage = `An error occurred: ${error.message}`;
        pendingMessages.push({
            type: 'email',
                subject: `${client.user.tag} Error`,
            text: errorMessage
        });
        pendingMessages.push({
            type: 'telegram',
            text: errorMessage
        });
        pendingMessages.push({
            type: 'discord',
            text: errorMessage
        });
        console.log('Error occurred. Messages queued.');
    });

    process.on('SIGINT', async () => {
        console.log('SIGINT received. Terminating the bot...');
        const disconnectMessage = `${client.user.tag} has been disconnected.`;
        pendingMessages.push({
            type: 'email',
            subject: `${client.user.tag} Disconnected`,
            text: disconnectMessage
        });
        pendingMessages.push({
            type: 'telegram',
            text: disconnectMessage
        });
        pendingMessages.push({
            type: 'discord',
            text: disconnectMessage
        });
        await processPendingMessages();
        process.exit(0); // Terminate the process
    });
};