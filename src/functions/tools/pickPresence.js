//Loads the required modules

const { ActivityType } = require("discord.js");

//Creates an array containing the various statuses to display

module.exports = (client) => {
  client.pickPresence = async () => {
    const options = [
      {
        type: ActivityType.Watching,
        text: "Over O-kun",
        status: "online",
      },
      {
        type: ActivityType.Listening,
        text: "A raging sadistic Pirate Queen who won't take no for an answer",
        status: "online",
      },
      {
        type: ActivityType.Playing,
        text: "With O-kun... Wait, what are you trying to get me to say!?",
        status: "online",
      },
    ];

//Uses a math.random function to determine which option to pick for the day and sets the presence.

    const option = Math.floor(Math.random() * options.length);

    client.user.setPresence({
      activities: [
        {
          name: options[option].text,
          type: options[option].type,
        },
      ],
      status: options[option].status,
    });
  };
};
