//const chalk = require("chalk");

module.exports = {
    name: "connected",
    async execute() {
        const chalk = (await import("chalk")).default;
        console.log(chalk.green("[Database Status]: Connected."));
    },
};