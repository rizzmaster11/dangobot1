const Command = require("../../structures/Command");
const Discord = require("discord.js");


module.exports = class AddMoney extends Command {
  constructor(client) {
    super(client, {
      name: "addmoney",
      description: client.cmdConfig.addmoney.description,
      usage: client.cmdConfig.addmoney.usage,
      permissions: client.cmdConfig.addmoney.permissions,
      aliases: client.cmdConfig.addmoney.aliases,
      category: "administration",
      listed: client.cmdConfig.addmoney.enabled,
      slash: true,
      options: [{
        name: "user",
        description: "User to who to add money",
        type: Discord.ApplicationCommandOptionType.User,
        required: true,
      }, {
        name: "type",
        description: "Where to add money, to wallet or bank",
        type: Discord.ApplicationCommandOptionType.String,
        choices: [{
          name: "Wallet",
          value: "wallet"
        }, {
          name: "Bank",
          value: "bank"
        }],
        required: true,
      }, {
        name: "money",
        description: "Amount of money to add",
        type: Discord.ApplicationCommandOptionType.Integer,
        required: true,
      }]
    });
  }

  async run(message, args) {
    const user = message.mentions.users.first() || message.guild.members.cache.get(args[0]);
    const type = args[1];
    const money = args[2];

    if(!user || !money || money.includes("-") || isNaN(money) || !["wallet", "bank"].includes(type?.toLowerCase()))
      return message.channel.send({ embeds: [this.client.utils.validUsage(this.client, message, this.client.cmdConfig.addmoney.usage)] });

    let total;
    if(type == "wallet") {
      await this.client.database.usersData().add(`${user.id}.money`, parseInt(money));
    } else if(type == "bank") {
      await this.client.database.usersData().add(`${user.id}.bank`, parseInt(money));
    }

    const userData = await this.client.database.usersData().get(user.id);
    total = type == "wallet" ? userData.money : userData.bank;
    
    message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.administration.money_added.replace("<user>", user.username).replace("<money>", parseInt(money)).replace("<type>", type).replace("<total>", total), this.client.embeds.general_color)] });

    await this.client.utils.serverLogs(this.client, {
      date: new Date().toLocaleString("en-GB"),
      author_id: message.author.id,
      author: message.author.username,
      user_id: user.id,
      user: user.username,
      value: money,
      message: `money_add`
    });
  }
  async slashRun(interaction, args) {
    const user = interaction.options.getUser("user");
    const type = interaction.options.getString("type");
    const money = interaction.options.getInteger("money");

    let total;
    if(type == "wallet") {
      await this.client.database.usersData().add(`${user.id}.money`, parseInt(money));
    } else if(type == "bank") {
      await this.client.database.usersData().add(`${user.id}.bank`, parseInt(money));
    }

    const userData = await this.client.database.usersData().get(user.id);
    total = type == "wallet" ? userData.money : userData.bank;
    
    interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.administration.money_added.replace("<user>", user.username).replace("<money>", parseInt(money)).replace("<type>", type).replace("<total>", total), this.client.embeds.general_color)], ephemeral: this.client.cmdConfig.addmoney.ephemeral });

    await this.client.utils.serverLogs(this.client, {
      date: new Date().toLocaleString("en-GB"),
      author_id: interaction.user.id,
      author: interaction.user.username,
      user_id: user.id,
      user: user.username,
      value: money,
      message: `money_add`
    });
  }
};
