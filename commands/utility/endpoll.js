const Command = require("../../structures/Command");
const Discord = require("discord.js");


module.exports = class EndPoll extends Command {
  constructor(client) {
    super(client, {
      name: "endpoll",
      description: client.cmdConfig.endpoll.description,
      usage: client.cmdConfig.endpoll.usage,
      permissions: client.cmdConfig.endpoll.permissions,
      aliases: client.cmdConfig.endpoll.aliases,
      category: "utility",
      listed: client.cmdConfig.endpoll.enabled,
      slash: true,
      options: [{
        name: "message_id",
        description: "Message ID of the Poll",
        type: Discord.ApplicationCommandOptionType.String,
        required: true
      }]
    });
  }

  async run(message, args) {
    const messageId = args[0];
    const optionEmojis = ["🇦", "🇧", "🇨", "🇩", "🇪", "🇫", "🇬", "🇭", "🇮", "🇯"];
    let pollData = (await this.client.database.guildData().get(`${message.guild.id}.polls`)) || [];
    pollData = pollData.find((x) => x.id == messageId);

    if(!messageId || !pollData) 
      return message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.utility.invalid_poll, this.client.embeds.error_color)] });

    const pollChannel = message.guild.channels.cache.get(pollData.channel);
    const pollMsg = await pollChannel.messages.fetch(messageId);

    if(!pollMsg || pollMsg?.reactions?.cache?.size == 0)
      return message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.utility.invalid_poll, this.client.embeds.error_color)] });

    const combineOptions = pollData.optionsList.map((o, i) => `${optionEmojis[i]} ${o}`);

    const pollResults = pollData.optionsList.map((o, i) => {
      const emojiCount = pollMsg.reactions.cache.get(optionEmojis[i]);
      return `${optionEmojis[i]} ${o} - **${Math.floor(emojiCount.count - 1)} votes**`
    })

    let embed = new Discord.EmbedBuilder()
      .setColor(this.client.embeds.poll_ended.color);
    if(this.client.embeds.poll_ended.title) embed.setTitle(this.client.embeds.poll_ended.title);
    
    if(this.client.embeds.poll_ended.description) embed.setDescription(this.client.embeds.poll_ended.description.replace("<author>", pollData.author.username)
      .replace("<optionsList>", combineOptions.join("\n"))
      .replace("<resultsList>", pollResults.join("\n"))
      .replace("<question>", pollData.question)
      .replace("<endedTime>", `<t:${Math.round(message.createdTimestamp / 1000)}:R>`));
    
    let field = this.client.embeds.poll_ended.fields;
    for(let i = 0; i < this.client.embeds.poll_ended.fields.length; i++) {
      embed.addFields([{ name: field[i].title, value: field[i].description.replace("<author>", pollData.author.username)
        .replace("<optionsList>", combineOptions.join("\n"))
        .replace("<resultsList>", pollResults.join("\n"))
        .replace("<question>", pollData.question)
        .replace("<endedTime>", `<t:${Math.round(message.createdTimestamp / 1000)}:R>`) }]);
    }
    
    if(this.client.embeds.poll_ended.footer == true) embed.setFooter(pollMsg.embeds[0].footer).setTimestamp();
    if(this.client.embeds.poll_ended.thumbnail == true) embed.setThumbnail(message.guild.iconURL());

    message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.utility.poll_ended, this.client.embeds.success_color)] });
    await pollMsg.edit({ embeds: [embed] }).then(async(msg) => {
      await msg.reactions.cache.forEach(async(r) => {
        await r.remove();
      })
    });
    pollData = (await this.client.database.guildData().get(`${message.guild.id}.polls`)).filter((p) => p.id != messageId);
    await this.client.database.guildData().set(`${message.guild.id}.polls`, pollData);
  }
  async slashRun(interaction, args) {
    const messageId = args[0];
    const optionEmojis = ["🇦", "🇧", "🇨", "🇩", "🇪", "🇫", "🇬", "🇭", "🇮", "🇯"];
    let pollData = (await this.client.database.guildData().get(`${interaction.guild.id}.polls`)) || [];
    pollData = pollData.find((x) => x.id == messageId);

    if(!messageId || !pollData) 
      return interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.utility.invalid_poll, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.endpoll.ephemeral });

    const pollChannel = interaction.guild.channels.cache.get(pollData.channel);
    const pollMsg = await pollChannel.messages.fetch(messageId);

    if(!pollMsg || pollMsg?.reactions?.cache?.size == 0)
      return interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.utility.invalid_poll, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.endpoll.ephemeral });

    const combineOptions = pollData.optionsList.map((o, i) => `${optionEmojis[i]} ${o}`);

    const pollResults = pollData.optionsList.map((o, i) => {
      const emojiCount = pollMsg.reactions.cache.get(optionEmojis[i]);
      return `${optionEmojis[i]} ${o} - **${Math.floor(emojiCount.count - 1)} votes**`
    })

    let embed = new Discord.EmbedBuilder()
      .setColor(this.client.embeds.poll_ended.color);
    if(this.client.embeds.poll_ended.title) embed.setTitle(this.client.embeds.poll_ended.title);
    
    if(this.client.embeds.poll_ended.description) embed.setDescription(this.client.embeds.poll_ended.description.replace("<author>", pollData.author.username)
      .replace("<optionsList>", combineOptions.join("\n"))
      .replace("<resultsList>", pollResults.join("\n"))
      .replace("<question>", pollData.question)
      .replace("<endedTime>", `<t:${Math.round(interaction.createdTimestamp / 1000)}:R>`));
    
    let field = this.client.embeds.poll_ended.fields;
    for(let i = 0; i < this.client.embeds.poll_ended.fields.length; i++) {
      embed.addFields([{ name: field[i].title, value: field[i].description.replace("<author>", pollData.author.username)
        .replace("<optionsList>", combineOptions.join("\n"))
        .replace("<resultsList>", pollResults.join("\n"))
        .replace("<question>", pollData.question)
        .replace("<endedTime>", `<t:${Math.round(interaction.createdTimestamp / 1000)}:R>`) }]);
    }
    
    if(this.client.embeds.poll_ended.footer == true) embed.setFooter(pollMsg.embeds[0].footer).setTimestamp();
    if(this.client.embeds.poll_ended.thumbnail == true) embed.setThumbnail(interaction.guild.iconURL());

    interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.utility.poll_ended, this.client.embeds.success_color)], ephemeral: this.client.cmdConfig.endpoll.ephemeral });
    await pollMsg.edit({ embeds: [embed] }).then(async(msg) => {
      await msg.reactions.cache.forEach(async(r) => {
        await r.remove();
      })
    });
    pollData = (await this.client.database.guildData().get(`${interaction.guild.id}.polls`)).filter((p) => p.id != messageId);
    await this.client.database.guildData().set(`${interaction.guild.id}.polls`, pollData);
  }
};
