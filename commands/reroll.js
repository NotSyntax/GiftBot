const styx = require("styx.js");
const data = styx.init("data/storage.json");
const Discord = require("discord.js");
const botconfig = require("../config.json");
const ms = require("ms");
const moment = require("moment");
const storage = require("../storage.js");

var bruhs = [];

module.exports.run = async (bot, message, args) => {
  function randomPerson(id) {
    var Giveaways = JSON.parse(data.get());

    var i;
    var winners = [];
    for (i = 0; i < parseInt(Giveaways.find(x => x.id === id).winners); i++) {
      winners.push(
        Giveaways.find(x => x.id === id).entered[
          Math.floor(
            Math.random() * Giveaways.find(x => x.id === id).entered.length
          )
        ]
      );
    }
    return winners;
  }

  if (!message.content.startsWith("!")) return;
  let GiveawayRole = message.guild.roles.find(
    role => role.name === "Giveaways"
  );
  if (!GiveawayRole) {
    message.channel.send(
      "**Couldn't find a giveaway role**: creating one right now..."
    );
    return (GiveawayRole = await message.guild.createRole({
      name: "Giveaways",
      color: "#03fc39",
      permissions: []
    }));
    if (
      message.member.roles.has(GiveawayRole.id) ||
      message.member.hasPermission("MANAGE_MESSAGES")
    ) {
      reroll();
    } else {
      message.channel.send(
        ":x: **You don't have the permissions to do this!**"
      );
    }
  } else {
    if (
      message.member.roles.has(GiveawayRole.id) ||
      message.member.hasPermission("MANAGE_MESSAGES")
    ) {
      reroll();
    } else {
      message.channel.send(
        ":x: **You don't have the permissions to do this!**"
      );
    }
  }
  function reroll() {
    var useChannel;
    if (args[1] !== "") {
      useChannel = true;
    } else {
      useChannel = false;
    }
    if (message.channel.fetchMessage(args[0]) == undefined && useChannel == false) {
      message.channel.send(":x: **That message does not exist!**");
    } else {
      var people = randomPerson(args[0]);
      var Giveaways = JSON.parse(data.get());
      var item = Giveaways.find(x => x.id === args[0]);
      var channel;
      if (useChannel == false) {
        channel = message.channel
      } else {
        channel = bot.channels.get(args[1]);
      }
      if (people.length == 1) {
        let person = people[0]
        if (bot.users.get(person) == undefined) {
          return channel.send(
            `Giveaway for \`${item.title}\` has been rerolled! \n:disappointed: **Nobody won!**`
          );
        }
        bot.users
          .get(person)
          .send(
            ":tada: **Congratulations**! You won the rerolled giveaway named `" +
              item.title +
              "`! Now that you've won, you should `" +
              item.message +
              "`!"
          );
        channel.send(
          `Giveaway for \`${
            item.title
          }\` has been rerolled! \n The new winner is: <@${person}>`
        );
      } else if (people.length == 0) {
        channel.send(
          "**Nobody** won the giveaway for ***" + item.title + "***..."
        );
      } else {
        var str =
          "Giveaway for `" +
          item.title +
          "` has been rerolled! \n The new winners are: ";
        var i = 0;
        people.forEach(person => {
          bot.users
            .get(person)
            .send(
              ":tada: **Congratulations**! You won the reroll for the giveaway named `" +
                item.title +
                "`! Now that you've won, you should `" +
                item.message +
                "`!"
            );
          i++;
          if (i == 1) {
            str = str + "<@" + person + ">";
          } else if (i == people.length) {
            str = str + ", and <@" + person + ">";
          } else {
            str = str + ", <@" + person + ">";
          }
        });
      }
    }
  }
};

module.exports.help = {
  name: "reroll"
};
