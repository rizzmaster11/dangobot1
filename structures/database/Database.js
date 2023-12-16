const { QuickDB, MySQLDriver } = require("quick.db");
const chalk = require("chalk");
const MongoDatabase = require("./MongoDatabase");

module.exports = class Database {
  database;
  tables = {
    users: null,
    tickets: null,
    suggestions: null,
    guild: null,
    gw: null
  };
  constructor(client, type = "sqlite") {
    this.client = client;
    this.type = type;

    this.initDatabase();
  }

  async initDatabase() {
    if(this.type == "sqlite" || this.type == "mysql") {
      if(this.type == "sqlite") {
        this.database = new QuickDB();
        console.log(chalk.green("[DATABASE] ") + "Starting with 'SQLite' database type.");
      } else if(this.type == "mysql") {
        console.log(chalk.green("[DATABASE] ") + "Starting with 'MySQL' database type.");
        const mysqlDriver = new MySQLDriver({
          host: this.client.config.general.database.mysql.host,
          user: this.client.config.general.database.mysql.user,
          password: this.client.config.general.database.mysql.password,
          database: this.client.config.general.database.mysql.database,
        });
  
        await mysqlDriver.connect().then(() => {
          console.log(chalk.green("[DATABASE] ") + "Connection to MySQL established.");
        });
  
        this.database = new QuickDB({ driver: mysqlDriver });
      }

      this.tables.users = this.database.table("users");
      this.tables.tickets = this.database.table("tickets");
      this.tables.suggestions = this.database.table("suggestions");
      this.tables.guild = this.database.table("guild");
      this.tables.gw = this.database.table("giveaway");
    } else if(this.type == "mongo") {
      console.log(chalk.green("[DATABASE] ") + "Starting with 'MongoDB' database type.");
      
      this.database = new MongoDatabase(this.client);

      this.tables.users = this.database.usersData();
      this.tables.tickets = this.database.ticketsData();
      this.tables.suggestions = this.database.suggestionsData();
      this.tables.guild = this.database.guildData();
      this.tables.gw = this.database.gwData();
    }
  }

  usersData() {
    return this.tables.users;
  }

  ticketsData() {
    return this.tables.tickets;
  }

  suggestionsData() {
    return this.tables.suggestions;
  }

  gwData() {
    return this.tables.gw;
  }

  guildData() {
    return this.tables.guild;
  }
}