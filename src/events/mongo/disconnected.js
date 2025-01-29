//const chalk = require("chalk");

module.exports = {
    name: "disconnected",
    async execute() {
        const chalk = (await import("chalk")).default;
        console.log(chalk.red("[Database Status]: Disconnected."));
    },
};