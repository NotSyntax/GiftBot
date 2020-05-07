const express = require("express");
const app = express();
const config = require("./config.json");
const Discord = require("discord.js");
const bot = new Discord.Client();
const fs = require("fs");
const storage = require("./storage.js");
const styx = require("styx.js"); // senior
const data = styx.init("data/storage.json");
const moment = require("moment");
bot.commands = new Discord.Collection();
bot.aliases = new Discord.Collection();

fs.readdir("./commands/", (err, files) => {
  if (err) console.log(err);

  let jsfile = files.filter(f => f.split(".").pop() === "js");
  if (jsfile.length <= 0) {
    console.log("Couldn't find commands!");
    return;
  }

  jsfile.forEach((f, i) => {
    let props = require(`./commands/${f}`);
    console.log(`${f} loaded!`);
    bot.commands.set(props.help.name, props);
    if (props.help.aliases)
      props.help.aliases.forEach(a => bot.aliases.set(a, props.help.name));
  });
});

bot.on("ready", async () => {
  //Logs ready to console
  console.log(`${bot.user.username} has started!`);

  bot.user.setActivity(` your gifts`, { type: "WATCHING" });
  setInterval(() => {
    var Giveaways = JSON.parse(data.get());
    Giveaways.forEach(item => {
      console.log("listening");
      if (item.ends < Date.now() && item.ended == false) {
        item.ended = true;

        while (
          JSON.parse(data.get()).find(x => x.id == item.id).ended == false
        ) {
          console.log("not saved");
          data.save(JSON.stringify(Giveaways));
        }

        console.log(data.get());
        console.log("saved");

        const channel = bot.channels.get(item.channel);
        const m = channel.fetchMessage(item.id);
        var people = randomPerson(item.id);
        if (people.length == 1) {
          if (bot.users.get(people[0]) == undefined) {
            return channel.send(
              `Giveaway for \`${item.title}\` has ended! \n:disappointed: **Nobody won!**`
            );
            let giveawayEnded = new Discord.RichEmbed()
              .setColor("#eb3434")
              .setTitle("ENDED" + item.title)
              .setDescription(
                `This giveaway is finised! \n Role Requirements: \`${item.role}\` \n Number of Winners: **${item.winners}** \n If you win: \`${item.message}\``
              )
              .setFooter("Ended on")
              .setTimestamp(moment().valueOf() + item.time);

            m.edit(giveawayEnded);
          }
          bot.users
            .get(people[0])
            .send(
              ":tada: **Congratulations**! You won the giveaway named `" +
                item.title +
                "`! Now that you've won, you should `" +
                item.message +
                "`!"
            );
          channel.send(
            `Giveaway for \`${item.title}\` has ended! \n The winner is: <@${
              people[0]
            }>`
          );
        } else if (people.length == 0) {
          m.channel.send(
            "**Nobody** won the giveaway for ***" + item.title + "***..."
          );
        } else {
          var str =
            "Giveaway for `" + item.title + "` has ended! \n The winners are: ";
          var i = 0;
          people.forEach(person => {
            bot.users
              .get(person)
              .send(
                ":tada: **Congratulations**! You won the giveaway named `" +
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
              channel.send(str);
            } else {
              str = str + ", <@" + person + ">";
            }
          });

          let giveawayEnded = new Discord.RichEmbed()
            .setColor("#eb3434")
            .setTitle("(ENDED) " + item.title)
            .setDescription(
              `This giveaway is finised! \n Role Requirements: \`${item.role}\` \n Number of Winners: **${item.winners}** \n If you win: \`${item.message}\``
            )
            .setFooter("Ended on")
            .setTimestamp(moment().valueOf() + item.time);
          const edit = channel.fetchMessage(item.id);
          channel.fetchMessages({ around: item.id, limit: 1 }).then(msg => {
            const fetchedMsg = msg.first();
            fetchedMsg.edit(giveawayEnded);
          });
        }
      }
    });
  }, 1000);
});

bot.on("message", async message => {
  if (message.guild === null) {
    //return;
  }
  if (message.author.bot) return;
  let prefix = config.prefix;
  let messageArray = message.content.split(" ");
  let cmd = messageArray[0].toLowerCase();
  let args = messageArray.slice(1);

  let commandfile =
    bot.commands.get(cmd.slice(prefix.length)) ||
    bot.commands.get(bot.aliases.get(cmd.slice(prefix.length)));
  if (commandfile) commandfile.run(bot, message, args);

  if (!message.content.startsWith("!")) return;
});

app.use(express.static("public"));

const events = {
  MESSAGE_REACTION_ADD: "messageReactionAdd",
  MESSAGE_REACTION_REMOVE: "messageReactionRemove"
};

bot.on("raw", async event => {
  if (!events.hasOwnProperty(event.t)) return;

  const { d: data } = event;
  const user = bot.users.get(data.user_id);
  const channel = bot.channels.get(data.channel_id) || (await user.createDM());

  if (channel.messages.has(data.message_id)) return;

  const message = await channel.fetchMessage(data.message_id);
  const emojiKey = data.emoji.id
    ? `${data.emoji.name}:${data.emoji.id}`
    : data.emoji.name;
  let reaction = message.reactions.get(emojiKey);

  if (!reaction) {
    const emoji = new Discord.Emoji(bot.guilds.get(data.guild_id), data.emoji);
    reaction = new Discord.MessageReaction(
      message,
      emoji,
      1,
      data.user_id === bot.user.id
    );
  }

  bot.emit(events[event.t], reaction, user);
});

bot.on("messageReactionAdd", (r, u) => {
  if (u.bot) {
    return console.log("bot");
  }
  var role = storage.role(r.message.id);
  console.log(role);
  if (role == 500) {
  } else if (role == 600) {
    storage.react(r.message.id, u.id);
  } else {
    if (r.message.guild.member(u.id).roles.find(r => r.name === role)) {
      storage.react(r.message.id, u.id);
    } else {
      r.remove(u.id);
      u.send(
        "**You cannot join that giveaway!** You do not have the role `" +
          role +
          "`!"
      );
    }
  }
});

bot.on("messageReactionRemove", (r, u) => {
  if (u.bot) {
    return console.log("bot");
  }
  storage.remove(r.message.id, u.id);
});

app.get("/", function(request, response) {
  response.sendFile(__dirname + "/views/index.html");
});

const listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});

bot.login(process.env.token);

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

const save = (Array.prototype.save = function(data) {
  fs.writeFileSync(this[0], data, function(err) {
    if (err) throw err;
    return data;
  });
});
