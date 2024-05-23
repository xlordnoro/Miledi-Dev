const nodemailer = require('nodemailer');
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

    const executeLoginPing = async () => {
        // Check if client.user is available
        if (client.user) {
            // Call sendEmail function to execute
            await sendEmail(`${client.user.tag} Login`, `${client.user.tag} has successfully logged in.`);
        } else {
            console.log('Bot has not logged in yet.');
        }
    };

    // Listen for the 'ready' event before executing login ping
    client.once('ready', () => {
        executeLoginPing();
    });

    // Listen for the 'disconnect' event to notify when the bot goes offline
    client.on('disconnect', () => {
        sendEmail(`${client.user.tag} Offline`, `${client.user.tag} has gone offline.`);
    });

    // Listen for the 'error' event to notify when an error occurs
    client.on('error', (error) => {
        sendEmail(`${client.user.tag} Error`, `An error occurred: ${error.message}`);
    });

    // Listen for the SIGINT signal to simulate disconnect
    process.on('SIGINT', async () => {
        console.log('SIGINT received. Terminating the bot...');
        // Send email notification when terminating the bot
        await sendEmail(`${client.user.tag} Disconnected`, `${client.user.tag} has been disconnected.`);
        process.exit(0); // Terminate the process
    });
};
