//const chalk = require("chalk");

module.exports = {
    name: "err",
    async execute(err) {
        const chalk = (await import("chalk")).default;
        console.log(chalk.red(`An error occured with the database connection:\n${err}`));
    },
};