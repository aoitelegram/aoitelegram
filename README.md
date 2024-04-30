# AoiTelegram

[![NPM Version](https://img.shields.io/npm/v/aoitelegram)](https://www.npmjs.com/package/aoitelegram)
[![Bot API](https://img.shields.io/badge/Bot%20API-v.7.2-00aced.svg?style=flat-square&logo=telegram)](https://core.telegram.org/bots/api)
[![NPM Downloads](https://img.shields.io/npm/dt/aoitelegram.svg?maxAge=3600)](https://www.npmjs.com/package/aoitelegram)
[![License](https://img.shields.io/npm/l/aoitelegram)](https://github.com/Sempai-07/aoitelegram/blob/v1/LICENSE)

`aoitelegram` is a `JavaScript/TypeScript` library for creating `Telegram` bots with ease. It simplifies the process of building and managing `Telegram` bot functionality, similar to aoijs but tailored for `Telegram`.

## Features

- **Over 200 Pre-built Functions:** aoitelegram comes equipped with more than 200 pre-built functions, empowering you to effortlessly create dynamic and interactive Telegram bots.

- **Built-in Customizable Local Database:** With aoitelegram, you have a robust customizable local database right out of the box.

- **Built-in Custom Function System:** aoitelegram offers an easy way to create your custom functions if something is missing. Additionally, it includes the `PluginManager` class out of the box, aiding you in interacting with other `npm` packages containing custom functions for `aoitelegram`.

- **User-Friendly Design:** aoitelegram is perfect for beginners with its straightforward function interface. The `$` prefix simplifies command writing, ensuring a swift launch for your bot. 🚀

> The syntax of `aoitelegram` and versions above `0.5.0` has been completely changed. Now the code is read from bottom to top, and the standard `$if` is used as `if: "old"` in `aoi.js` (there is no need to specify the `if: "old"` option, it is set by default).

## Installation

To use `aoitelegram` in your project, you can install it via npm:

```shell
npm install aoitelegram
```

## Usage

Here's a quick example of how to use `aoitelegram` to create a Telegram bot:

```javascript
const { AoiClient, LoadCommands } = require("aoitelegram");

const bot = new AoiClient({
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
    /** The available database type to be used is MongoDB, with KeyValue as the default **/
    type: "KeyValue",
    /** The link for connecting to MongoDB **/
    url: "mongodb+srv:...",
    /** The file path to the database storage. */
    path: "./database/",
    /** An array of table names within the database.*/
    tables: ["main"],
    /** The file extension name used for the database file. */
    extname: ".sql",
  },
  /** Functions that will be removed from the library's loading functions. **/
  disableFunctions: [],
  /** Adds native functions to the command handler **/
  native: [],
  /** An array of AoiExtension functions **/
  extension: [],
  /** For the error handler of functions **/
  functionError: true,
  /** To disable text errors **/
  sendMessageError: true,
  /** Disabled built-in database. **/
  disableAoiDB: false,
  /** Outputting system messages to the console. **/
  logging: true,
  /** Checks for available package updates and performs an update if enabled (beta) **/
  autoUpdate: {
    /** Displaying messages about new versions. **/
    aoiWarning: true,
    /**  Whether automatic updates are enabled. **/
    autoUpdate: true,
    /** Whether to enable development versions. **/
    enableDev: true,
    /** Whether to enable beta versions. **/
    enableBeta: true,
  },
});

bot.functionErrorCommand({
  code: `$sendMessage[Sorry, but there was an error in the $handleError[function] function within the $handleError[command] command: $handleError[error]]`,
});

bot.readyCommand({
  code: `$print[Starting @$clientUsername]`,
});

bot.messageCommand({
  code: `$print[Message Handle]`,
});

bot.callbackQueryCommand({
  code: `$print[Action Handle]`,
});

// Define a command to print a message.
bot.addCommand({
  name: "say",
  code: `$sendMessage[$message]`,
});

// Define a command to check the bot's ping.
bot.addCommand({
  name: "ping",
  code: `$replyMessage[Bot ping: $pingms]`,
});

// Define a command to display bot information.
bot.addCommand({
  name: "botinfo",
  code: `
$replyMessage[
Bot ID: $clientId
Name: $clientFirstName
Username: $clientUsername
Ping: $pingms
]`,
});

const loader = new LoadCommands(bot);
loader.loadCommands("./command/");
loader.loadVariables("./variables/");

// Set user variables in a table.
bot.variables(
  {
    sempai: 10,
    string: "Hello, world!",
    aoijs: true,
    webapp: false,
    mz: [],
  },
  "main",
);

bot.connect();
```

## Documentation

For detailed documentation and usage instructions, please refer to the [aoitelegram Wiki](https://aoitelegram.vercel.app/).

## License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/Sempai-07/aoitelegram/blob/main/LICENSE) file for details.

## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvements, please create a GitHub issue or submit a pull request.

<table>
  <td><image src="https://avatars.githubusercontent.com/u/101444750?v=4"><a href="https://github.com/Asayukiii">Asayukiii</a></td>
  <td><image src="https://avatars.githubusercontent.com/u/141875262?v=4"><a href="https://github.com/gdeVanezus">gdeVanezus</a></td>
</table>