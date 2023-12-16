const Command = require("../../structures/Command");
const Discord = require("discord.js");


module.exports = class Poll extends Command {
  constructor(client) {
    super(client, {
      name: "poll",
      description: client.cmdConfig.poll.description,
      usage: client.cmdConfig.poll.usage,
      permissions: client.cmdConfig.poll.permissions,
      aliases: client.cmdConfig.poll.aliases,
      category: "utility",
      listed: client.cmdConfig.poll.enabled,
      slash: true,
      options: [{
        name: "question",
        description: "Question you want to ask",
        type: Discord.ApplicationCommandOptionType.String,
        required: true
      }, {
        name: "options",
        description: "List of answer options, max. 10",
        type: Discord.ApplicationCommandOptionType.String,
        required: true
      }]
    });
  }

  async run(message, args) {
    const optionEmojis = ["🇦", "🇧", "🇨", "🇩", "🇪", "🇫", "🇬", "🇭", "🇮", "🇯"];
    const optionsList = args.join(" ")
      .slice(0)
      .split("|")
      .map((s) => s.trim().replace(/\s\s+/g, " ")).filter(Boolean);
    const question = optionsList.shift();
      
    if(!question || !optionsList || optionsList?.length == 0 || optionsList?.length > 10) 
      return message.channel.send({ embeds: [this.client.utils.validUsage(this.client, message, this.client.cmdConfig.poll.usage)] });
      
    const combineOptions = optionsList.map((o, i) => `${optionEmojis[i]} ${o}`);

    let embed = new Discord.EmbedBuilder()
      .setColor(this.client.embeds.poll.color);
    if(this.client.embeds.poll.title) embed.setTitle(this.client.embeds.poll.title);
    
    if(this.client.embeds.poll.description) embed.setDescription(this.client.embeds.poll.description.replace("<author>", message.author.username)
      .replace("<optionsList>", combineOptions.join("\n"))
      .replace("<question>", question)
      .replace("<startedTime>", `<t:${Math.round(message.createdTimestamp / 1000)}:R>`));
    
    let field = this.client.embeds.poll.fields;
    for(let i = 0; i < this.client.embeds.poll.fields.length; i++) {
      embed.addFields([{ name: field[i].title, value: field[i].description.replace("<author>", message.author.username)
        .replace("<optionsList>", combineOptions.join("\n"))
        .replace("<question>", question)
        .replace("<startedTime>", `<t:${Math.round(message.createdTimestamp / 1000)}:R>`) }]);
    }
    
    if(this.client.embeds.poll.footer == true) embed.setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL() }).setTimestamp();
    if(this.client.embeds.poll.thumbnail == true) embed.setThumbnail(message.guild.iconURL());

    message.channel.send({ embeds: [embed] }).then(async(m) => {
      await this.client.database.guildData().push(`${this.client.config.general.guild}.polls`, {
        channel: message.channel.id,
        id: m.id,
        optionsList,
        question,
        author: {
          username: message.author.username,
          avatar: message.author.displayAvatarURL({ dynamic: true })
        }
      });
      combineOptions.forEach(async(_, i) => {
        await m.react(optionEmojis[i])
      })
    });
  }
  async slashRun(interaction, args) {
    const optionEmojis = ["🇦", "🇧", "🇨", "🇩", "🇪", "🇫", "🇬", "🇭", "🇮", "🇯"];
    const optionsList = interaction.options.getString("options")
      .split("|")
      .map((s) => s.trim().replace(/\s\s+/g, " ")).filter(Boolean);
    const question = interaction.options.getString("question");
      
    if(!question || !optionsList || optionsList?.length == 0 || optionsList?.length > 10) 
      return interaction.reply({ embeds: [this.client.utils.validUsage(this.client, interaction, this.client.cmdConfig.poll.usage)], ephemeral: this.client.cmdConfig.poll.ephemeral });
      
    const combineOptions = optionsList.map((o, i) => `${optionEmojis[i]} ${o}`);

    let embed = new Discord.EmbedBuilder()
      .setColor(this.client.embeds.poll.color);
    if(this.client.embeds.poll.title) embed.setTitle(this.client.embeds.poll.title);
    
    if(this.client.embeds.poll.description) embed.setDescription(this.client.embeds.poll.description.replace("<author>", interaction.user.username)
      .replace("<optionsList>", combineOptions.join("\n"))
      .replace("<question>", question)
      .replace("<startedTime>", `<t:${Math.round(interaction.createdTimestamp / 1000)}:R>`));
    
    let field = this.client.embeds.poll.fields;
    for(let i = 0; i < this.client.embeds.poll.fields.length; i++) {
      embed.addFields([{ name: field[i].title, value: field[i].description.replace("<author>", interaction.user.username)
        .replace("<optionsList>", combineOptions.join("\n"))
        .replace("<question>", question)
        .replace("<startedTime>", `<t:${Math.round(interaction.createdTimestamp / 1000)}:R>`) }]);
    }
    
    if(this.client.embeds.poll.footer == true) embed.setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() }).setTimestamp();
    if(this.client.embeds.poll.thumbnail == true) embed.setThumbnail(interaction.guild.iconURL());

    await interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.utility.poll_started, this.client.embeds.success_color)], ephemeral: this.client.cmdConfig.poll.ephemeral });
    await interaction.channel.send({ embeds: [embed] }).then(async(m) => {
      await this.client.database.guildData().push(`${this.client.config.general.guild}.polls`, {
        id: m.id,
        channel: interaction.channel.id,
        optionsList,
        question,
        author: {
          username: interaction.user.username,
          avatar: interaction.user.displayAvatarURL({ dynamic: true })
        }
      });
      combineOptions.forEach(async(_, i) => {
        await m.react(optionEmojis[i])
      });
    });
  }
};
