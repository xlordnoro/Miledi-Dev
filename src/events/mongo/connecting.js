//const chalk = require("chalk");

module.exports = {
    name: "connecting",
    async execute() {
        const chalk = (await import("chalk")).default;
        console.log(chalk.cyan("[Database Status]: Connecting..."));
    },
};