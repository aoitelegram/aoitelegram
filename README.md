# aoitelegram

[![NPM Version](https://img.shields.io/npm/v/aoitelegram)](https://www.npmjs.com/package/aoitelegram)
[![Bot API](https://img.shields.io/badge/Bot%20API-v.6.9-00aced.svg?style=flat-square&logo=telegram)](https://core.telegram.org/bots/api)
[![NPM Downloads](https://img.shields.io/npm/dt/aoitelegram.svg?maxAge=3600)](https://www.npmjs.com/package/aoitelegram)
[![License](https://img.shields.io/npm/l/aoitelegram)](https://github.com/Sempai-07/aoitelegram/blob/main/LICENSE)

`aoitelegram` is a `JavaScript/TypeScript` library for creating `Telegram` bots with ease. It simplifies the process of building and managing `Telegram` bot functionality, similar to aoijs but tailored for `Telegram`.

## Features

- Easy setup and configuration for Telegram bot integration.
- Event-driven approach for handling ready events and messages.
- Command management for defining and executing bot commands.
- User session management with variables and tables.

## Installation

To use `aoitelegram` in your project, you can install it via npm:

```shell
npm install aoitelegram
```

## Usage

Here's a quick example of how to use `aoitelegram` to create a Telegram bot:

```javascript
const { AoiClient, LoadCommands } = require("aoitelegram");

const aoijs = new AoiClient({
  token: "YOUR_BOT_TOKEN_HERE",
  telegram: {
    /** The maximum number of updates to fetch at once. Defaults to 100. */
    limit: 100,
    /** The timeout for long polling in seconds. Defaults to 60 seconds. */
    timeout: 60000,
    /** An array of allowed update types to receive. Defaults to all updates. */
    allowed_updates: [],
    /** An optional session object for managing user sessions  */
    session: {},
  },
  database: {
    /** The file path to the database storage. */
    path: "./database/",
    /** An array of table names within the database.*/
    table: ["main"],
    /** The file extension name used for the database file. */
    extname: ".sql",
  },
  /** Outputting system messages to the console. */
  console: true,
  /** Displaying messages about new versions. */
  aoiwarning: true,
});

aoijs.readyCommand({
  code: `$print[Starting @$client[username]]`,
});

aoijs.messageCommand({
  code: `$print[Message Handle]`,
});

aoijs.callbackQueryCommand({
  code: `$print[Action Handle]`,
});

// Define a command to print a message.
aoijs.command({
  name: "say",
  code: `$sendMessage[$message]`,
});

// Define a command to check the bot's ping.
aoijs.command({
  name: "ping",
  code: `$replyMessage[Bot ping: $ping ms]`,
});

// Define a command to display bot information.
aoijs.command({
  name: "botinfo",
  code: `
$replyMessage[
Bot ID: $client[id]
Name: $client[first_name]
Username: $client[username]
Ping: $ping ms]`,
});

const loader = new LoadCommands(bot).loadCommands("./command/");

// Set user variables in a table.
aoijs.variables(
  {
    sempai: 10,
    string: "Hello, world!",
    aoijs: true,
    webapp: false,
    mz: {},
  },
  "main",
);

// Connect to the Telegram service.
aoijs.connect();
```

## Documentation

For detailed documentation and usage instructions, please refer to the [aoitelegram Wiki](https://aoitelegram-dev.surge.sh/).

## License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/Sempai-07/aoitelegram/blob/main/LICENSE) file for details.

## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvements, please create a GitHub issue or submit a pull request.

## Important

`aoitelegram` utilizes the source code of the [bds.js](https://www.npmjs.com/package/bds.js) library.
