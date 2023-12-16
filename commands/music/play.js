const Command = require("../../structures/Command");
let { ApplicationCommandOptionType } = require("discord.js");

module.exports = class Play extends Command {
	constructor(client) {
		super(client, {
			name: "play",
			description: client.cmdConfig.play.description,
			usage: client.cmdConfig.play.usage,
			permissions: client.cmdConfig.play.permissions,
      aliases: client.cmdConfig.play.aliases,
			category: "music",
			listed: client.cmdConfig.play.enabled,
      slash: true,
      options: [{
        name: "song",
        type: ApplicationCommandOptionType.String,
        description: "Song/Link to play",
        required: true
      }]
		});
	}

  async run(message, args) {
    let song = args.join(" ");
    if(!args[0]) return message.channel.send({ embeds: [this.client.utils.validUsage(this.client, message, this.client.cmdConfig.play.usage)] });
  
    const guildQueue = this.client.player.nodes.get(message.guild.id);
  
    const channel = message.member.voice.channel;
  
    if(!channel)
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.music.title, this.client.language.music.play.not_voice, this.client.embeds.error_color)] });
  
    if(guildQueue && channel.id !== message.guild.members.me.voice.channelId)
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.music.title, this.client.language.music.play.diff_voice, this.client.embeds.error_color)] });
  
    let m = await message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.music.title, this.client.language.music.play.searching.replace("<song>", song), this.client.embeds.general_color)] });

    let result = await this.client.player.search(song, { requestedBy: message.author }).catch(() => {});
    if (!result || !result.tracks.length)
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.music.title, this.client.language.music.play.not_found.replace("<song>", song), this.client.embeds.error_color)] });
  
    let queue;
      
    if (guildQueue) {
      queue = guildQueue;
      queue.metadata = message;
    } else {
      queue = await this.client.player.nodes.create(message.guild, {
        metadata: message
      });
    }
  
    try {
      if (!queue.connection) {
        await queue.connect(channel);
        queue.node.setVolume(queue.node.volume);
      }
    } catch (error) {
      console.log(error);
      queue.delete();
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.music.cannot_join, this.client.embeds.error_color)] });
    }

    if(result.playlist) {
      if(queue.node.isPlaying()) {
        m.edit({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.music.title, this.client.language.music.play.pl_added
          .replace("<title>", result.playlist.title)
          .replace("<tracks>", result.tracks.length)
          .replace("<author>", result.playlist.author.name), this.client.embeds.success_color).setThumbnail(result.playlist.thumbnail ? result.playlist.thumbnail.url : null)] });
      } else {
        m.edit({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.music.title, this.client.language.music.play.pl_playing
          .replace("<title>", result.playlist.title)
          .replace("<tracks>", result.tracks.length)
          .replace("<author>", result.playlist.author.name), this.client.embeds.success_color).setThumbnail(result.playlist.thumbnail ? result.playlist.thumbnail.url : null)] });
      }
    } else {
      if(queue.node.isPlaying()) {
        m.edit({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.music.title, this.client.language.music.play.song_added
          .replace("<title>", result.tracks[0].title)
          .replace("<duration>", result.tracks[0].duration)
          .replace("<author>", result.tracks[0].author), this.client.embeds.success_color).setThumbnail(result.tracks[0]?.thumbnail ? result.tracks[0]?.thumbnail : null)] });
      } else {
        m.edit({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.music.title, this.client.language.music.play.song_playing
          .replace("<title>", result.tracks[0].title)
          .replace("<duration>", result.tracks[0].duration)
          .replace("<author>", result.tracks[0].author), this.client.embeds.success_color).setThumbnail(result.tracks[0]?.thumbnail ? result.tracks[0]?.thumbnail : null)] });
      }
    }

    result.playlist ? queue.addTrack(result.tracks) : queue.addTrack(result.tracks[0]);
  
    if (!queue.node.isPlaying()) await queue.node.play();
  }

  async slashRun(interaction, args) {
    let song = interaction.options.getString("song");

    const guildQueue = this.client.player.nodes.get(interaction.guild.id);

    const channel = interaction.member.voice.channel;

    if(!channel)
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.music.title, this.client.language.music.play.not_voice, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.play.ephemeral });

    if(guildQueue && channel.id !== interaction.guild.members.me.voice.channelId)
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.music.title, this.client.language.music.play.diff_voice, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.play.ephemeral });

    await interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.music.title, this.client.language.music.play.searching.replace("<song>", song), this.client.embeds.general_color)], ephemeral: this.client.cmdConfig.play.ephemeral });
    let result = await this.client.player.search(song, { requestedBy: interaction.user }).catch(() => {});
    if (!result || !result.tracks.length)
      return interaction.editReply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.music.title, this.client.language.music.play.not_found.replace("<song>", song), this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.play.ephemeral });

    let queue;
    
    if (guildQueue) {
      queue = guildQueue;
      queue.metadata = interaction;
    } else {
      queue = await this.client.player.nodes.create(interaction.guild, {
        metadata: interaction
      });
    }

    try {
      if (!queue.connection) {
        await queue.connect(channel);
        queue.node.setVolume(queue.node.volume);
      }
    } catch (error) {
      console.log(error);
      queue.delete();
      return interaction.followUp({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.music.cannot_join, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.play.ephemeral });
    }

    if(result.playlist) {
      if(queue.node.isPlaying()) {
        await interaction.editReply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.music.title, this.client.language.music.play.pl_added
          .replace("<title>", result.playlist.title)
          .replace("<tracks>", result.tracks.length)
          .replace("<author>", result.playlist.author.name), this.client.embeds.success_color).setThumbnail(result.playlist.thumbnail ? result.playlist.thumbnail.url : null)] });
      } else {
        await interaction.editReply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.music.title, this.client.language.music.play.pl_playing
          .replace("<title>", result.playlist.title)
          .replace("<tracks>", result.tracks.length)          
          .replace("<author>", result.playlist.author.name), this.client.embeds.success_color).setThumbnail(result.playlist.thumbnail ? result.playlist.thumbnail.url : null)] });
      }
    } else {
      if(queue.node.isPlaying()) {
        await interaction.editReply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.music.title, this.client.language.music.play.song_added
          .replace("<title>", result.tracks[0].title)
          .replace("<duration>", result.tracks[0].duration)
          .replace("<author>", result.tracks[0].author), this.client.embeds.success_color).setThumbnail(result.tracks[0]?.thumbnail ? result.tracks[0]?.thumbnail : null)] });
      } else {
        await interaction.editReply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.music.title, this.client.language.music.play.song_playing
          .replace("<title>", result.tracks[0].title)
          .replace("<duration>", result.tracks[0].duration)
          .replace("<author>", result.tracks[0].author), this.client.embeds.success_color).setThumbnail(result.tracks[0]?.thumbnail ? result.tracks[0]?.thumbnail : null)] });
      }
    }

    result.playlist ? queue.addTrack(result.tracks) : queue.addTrack(result.tracks[0]);

    if (!queue.node.isPlaying()) await queue.node.play();
  }
};