const Discord = require("discord.js");
const botconfig = require("../config.json");
const ms = require("ms");
const moment = require("moment");
const storage = require("../storage.js");

module.exports.run = async (bot, message, args) => {
  if (!message.content.startsWith("!")) return;
  let GiveawayRole = message.guild.roles.find(
    role => role.name === "Giveaways"
  );
  
  let Mini = message.guild.roles.find(
    role => role.name === "Mini Giveaway Host"
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
    if (message.member.roles.has(GiveawayRole.id) || message.member.hasPermission("MANAGE_MESSAGES") || message.member.roles.has(Mini.id)) {
      giveAway();
    } else {
      message.channel.send(
        ":x: **You don't have the permissions to do this!**"
      );
    }
  } else {
    if (message.member.roles.has(GiveawayRole.id) || message.member.hasPermission("MANAGE_MESSAGES") || message.member.roles.has(Mini.id)) {
      giveAway();
    } else {
      message.channel.send(
        ":x: **You don't have the permissions to do this!**"
      );
    }
  }
  function giveAway() {
    message.channel
      .send(
        ":ok_hand: **Ok,** Lets make a giveaway! What channel will our giveaway be in? \n (You can respond with `cancel` to cancel this giveaway at anytime!) \n \n Please mention the channel like <#627954967885381656>"
      )
      .then(() => {
        message.channel
          .awaitMessages(response => response.author == message.author, {
            max: 1,
            time: 60000,
            errors: ["time"]
          })
          .then(collected => {
            if (collected.first().content == "cancel") {
              message.channel.send(":x: **Cancelled!**");
            } else {
              if (!collected.first().mentions.channels.first()) {
                message.channel.send(":x: **Please mention a channel!**");
              } else {
                var channel = collected.first().mentions.channels.first();
                message.channel
                  .send(
                    `:tada: **Nice!** The giveaway will be in <#${
                      collected.first().mentions.channels.first().id
                    }>! \n :lock: Who will have access to our giveaway? \n \n Type in the name of the role such as \`Fan\` \n If you want **ALL** access, use \`everyone\``
                  )
                  .then(() => {
                    message.channel
                      .awaitMessages(
                        response => response.author == message.author,
                        {
                          max: 1,
                          time: 60000,
                          errors: ["time"]
                        }
                      )
                      .then(collected => {
                        let roleFind = message.guild.roles.find(
                          role => role.name === collected.first().content
                        );
                        if (!roleFind) {
                          if (
                            collected.first().content == "all" ||
                            collected.first().content == "everyone"
                          ) {
                            var AllowedRole = "all";
                            startTitles(AllowedRole, channel);
                          } else if (collected.first().content == "cancel") {
                            message.channel.send(":x: **Cancelled!**");
                          } else {
                            message.channel.send(
                              ":x: **Couldn't find that role!**"
                            );
                          }
                        } else {
                          var AllowedRole = collected.first().content;
                          startTitles(AllowedRole, channel);
                        }
                      })
                      .catch(err => {
                        message.channel.send(
                          ":x: **Oops!** Time ran out! Remember, you have `60 seconds` to respond to my messages!"
                        );
                      });
                  });
              }
            }
          })
          .catch(err => {
            message.channel.send(
              ":x: **Oops!** Time ran out! Remember, you have `60 seconds` to respond to my messages!"
            );
          });
      });
  }
  function startTitles(role, channel) {
    message.channel
      .send(
        ":tada: **Awesome!** The allowed role will be `" +
          role +
          "`! \n :gift: What will we **name** our giveaway?"
      )
      .then(() => {
        message.channel
          .awaitMessages(response => response.author == message.author, {
            max: 1,
            time: 60000,
            errors: ["time"]
          })
          .then(collected => {
            if (collected.first().content == "cancel") {
              message.channel.send(":x: **Cancelled!**");
            } else {
              var title = collected.first().content;
              message.channel
                .send(
                  ":gift: **Amazing!** Our giveaway will be called `" +
                    title +
                    "` \n :shrug: What should people do if they win? \n \n e.g. `DM Syntax#0003`"
                )
                .then(() => {
                  message.channel
                    .awaitMessages(
                      response => response.author == message.author,
                      {
                        max: 1,
                        time: 60000,
                        errors: ["time"]
                      }
                    )
                    .then(collected => {
                      if (collected.first().content == "cancel") {
                        message.channel.send(":x: **Cancelled!**");
                      } else {
                        var win = collected.first().content;
                        message.channel
                          .send(
                            ":tada: **Cool!** Whenever people win, I'll tell them to **" +
                              win +
                              "**! \n :pushpin: How **many** winners should there be? \n \n Please make sure to provide a **number** and not a **word**! \n e.g. `1` not `one`"
                          )
                          .then(() => {
                            message.channel
                              .awaitMessages(
                                response => response.author == message.author,
                                {
                                  max: 1,
                                  time: 60000,
                                  errors: ["time"]
                                }
                              )
                              .then(collected => {
                                if (collected.first().content == "cancel") {
                                  message.channel.send(":x: **Cancelled!**");
                                } else if (
                                  !isNaN(collected.first().content) ||
                                  parseInt(collected.first().content) == 0
                                ) {
                                  var now = parseInt(collected.first().content);
                                  message.channel
                                    .send(
                                      ":pushpin: **Fantastic!** There will be `" +
                                        now.toString() +
                                        "` winner(s)! \n :alarm_clock: How long should the giveaway last? \n \n Use the timestamp \n e.g. `2w` or `2 weeks`"
                                    )
                                    .then(() => {
                                      message.channel
                                        .awaitMessages(
                                          response =>
                                            response.author == message.author,
                                          {
                                            max: 1,
                                            time: 60000,
                                            errors: ["time"]
                                          }
                                        )
                                        .then(collected => {
                                          try {
                                            var msTime = ms(
                                              collected.first().content
                                            );
                                            var tTime = ms(
                                              ms(collected.first().content),
                                              { long: true }
                                            );
                                            message.channel
                                              .send(
                                                ":clock1: **Cool!** We will end the giveaway in `" +
                                                  tTime +
                                                  "`! \n :tada: Finally, who do you want me to ping? \n \n Please say a role name, such as `Fan` \n If you don't want a role to be pinged, respond with `nobody`"
                                              )
                                              .then(() => {
                                                message.channel
                                                  .awaitMessages(
                                                    response =>
                                                      response.author ==
                                                      message.author,
                                                    {
                                                      max: 1,
                                                      time: 60000,
                                                      errors: ["time"]
                                                    }
                                                  )
                                                  .then(collected => {
                                                    let roleFind = message.guild.roles.find(
                                                      role =>
                                                        role.name ===
                                                        collected.first()
                                                          .content
                                                    );
                                                    if (!roleFind) {
                                                      if (
                                                        collected.first()
                                                          .content == "nobody"
                                                      ) {
                                                        var ping = "";
                                                        giveEmbed(
                                                          role,
                                                          channel,
                                                          title,
                                                          win,
                                                          now,
                                                          msTime,
                                                          ""
                                                        );
                                                        message.channel.send(
                                                          ":tada: **Done!** Ok, here is our results, our giveaway is reserved for `" +
                                                            role +
                                                            "`, in " +
                                                            channel +
                                                            ", named `" +
                                                            title +
                                                            "`, and I'll tell the winner to `" +
                                                            win +
                                                            "`, there will be `" +
                                                            now.toString() +
                                                            " winner(s)`, it will last `" +
                                                            tTime +
                                                            "`, and when it starts, I won't ping anyone."
                                                        );
                                                      } else {
                                                        message.channel.send(
                                                          ":x: **That role does not exist!**"
                                                        );
                                                      }
                                                    } else {
                                                      var ping = roleFind.id;
                                                      message.channel.send(
                                                        ":tada: **Done!** Ok, here is our results: our giveaway is reserved for `" +
                                                          role +
                                                          "`, in " +
                                                          channel +
                                                          ", named `" +
                                                          title +
                                                          "`, and I'll tell the winner to `" +
                                                          win +
                                                          "`, there will be `" +
                                                          now.toString() +
                                                          " winner(s)`, it will last `" +
                                                          tTime +
                                                          "`, and when it starts, I'll ping `" +
                                                          collected.first()
                                                            .content +
                                                          "`."
                                                      );
                                                      giveEmbed(
                                                        role,
                                                        channel,
                                                        title,
                                                        win,
                                                        now,
                                                        msTime,
                                                        ping
                                                      );
                                                    }
                                                  })
                                                  .catch(err => {
                                                    message.channel.send(
                                                      ":x: **Oops!** Time ran out! Remember, you have `60 seconds` to respond to my messages!"
                                                    );
                                                  });
                                              });
                                          } catch (err) {
                                            message.channel.send(
                                              ":x: **Please use a proper time!**"
                                            );
                                          }
                                        })
                                        .catch(err => {
                                          message.channel.send(
                                            ":x: **Oops!** Time ran out! Remember, you have `60 seconds` to respond to my messages!"
                                          );
                                        });
                                    });
                                } else {
                                  message.channel.send(
                                    ":x: **Please use a number and make sure its not 0!**"
                                  );
                                }
                              })
                              .catch(err => {
                                message.channel.send(
                                  ":x: **Oops!** Time ran out! Remember, you have `60 seconds` to respond to my messages!"
                                );
                              });
                          });
                      }
                    })
                    .catch(err => {
                      message.channel.send(
                        ":x: **Oops!** Time ran out! Remember, you have `60 seconds` to respond to my messages!"
                      );
                    });
                });
            }
          })
          .catch(err => {
            message.channel.send(
              ":x: **Oops!** Time ran out! Remember, you have `60 seconds` to respond to my messages!"
            );
          });
      });
  }
  function giveEmbed(role, channel, title, win, winners, time, ping) {
    if (role == "all") {
      role = "none";
    }
    let giveawayEnded = new Discord.RichEmbed()
      .setColor("#eb3434")
      .setTitle(title)
      .setDescription(
        `This giveaway is finised! \n Role Requirements: \`${role}\` \n Number of Winners: **${winners}** \n If you win: \`${win}\``
      )
      .setFooter("Ended on")
      .setTimestamp(moment().valueOf() + time);
    let giveawayEmbed = new Discord.RichEmbed()
      .setColor("#eb3434")
      .setTitle(title)
      .setDescription(
        `React with :tada: to enter! \n Role Requirements: \`${role}\` \n Number of Winners: **${winners}** \n If you win: \`${win}\``
      )
      .setFooter("Ends on")
      .setTimestamp(moment().valueOf() + time);
    var messsage;
    if (ping !== "") {
      messsage = (`<@&${ping}> :tada: **GIVEAWAY** :tada:`);
    } else {
      messsage = (`:tada: **GIVEAWAY** :tada:`);
    }
    channel.send(messsage)
    channel.send(giveawayEmbed).then(m => {
      storage.store(m.id, winners, win, title, role, time, channel);
      m.react("🎉");
    });
  }
};

module.exports.help = {
  name: "create"
};
