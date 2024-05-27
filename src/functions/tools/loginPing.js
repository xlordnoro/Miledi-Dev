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

    function sendTelegramMessage(message) {
        return axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
            chat_id: CHAT_ID,
            text: message
        })
        .then(() => {
            console.log('Telegram message sent successfully!');
        })
        .catch(error => {
            console.error('Error sending Telegram message:', error);
        });
    }

    const executeLoginPing = async () => {
        // Check if client.user is available
        if (client.user) {
            const loginMessage = `${client.user.tag} has successfully logged in.`;
            await sendEmail(`${client.user.tag} Login`, loginMessage);
            sendTelegramMessage(loginMessage);
        } else {
            console.log('Bot has not logged in yet.');
        }
    };

    // Listen for the 'ready' event before executing login ping
    client.once('ready', () => {
        executeLoginPing();
    });

    // Listen for the 'disconnect' event to notify when the bot goes offline
    client.on('disconnect', async () => {
        const offlineMessage = `${client.user.tag} has gone offline.`;
        await sendEmail(`${client.user.tag} Offline`, offlineMessage);
        await sendTelegramMessage(offlineMessage);
    });

    // Listen for the 'error' event to notify when an error occurs
    client.on('error', async (error) => {
        const errorMessage = `An error occurred: ${error.message}`;
        await sendEmail(`${client.user.tag} Error`, errorMessage);
        await sendTelegramMessage(errorMessage);
    });

    // Listen for the SIGINT signal to simulate disconnect
    process.on('SIGINT', async () => {
        console.log('SIGINT received. Terminating the bot...');
        const disconnectMessage = `${client.user.tag} has been disconnected.`;
        await sendEmail(`${client.user.tag} Disconnected`, disconnectMessage);
        await sendTelegramMessage(disconnectMessage);
        process.exit(0); // Terminate the process
    });
};