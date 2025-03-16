# Text-To-Minecraft
>
> A bot to help you with all your Minecraft-related needs!

TextToMinecraft is a bot that uses AI to build structures for you in-game based on your prompt! It is also equipped with other features like some basic pathfinding and the ability to execute in-game commands.

> ### WARNING
>
> This project is still very much a work-in-progress, so use with caution if you plan on testing it in a Minecraft world. The bot can build some really cool things, but it could destroy preexisting landscapes and buildings in the process.
<!--
![](header.png)

## Installation

OS X & Linux:

```sh
npm install my-crazy-module --save
```

Windows:

```sh
edit autoexec.bat
```
-->
## Usage example

### "$build a snowman"

**Result:**\
<img src="assets/he_built_a_snowman.png" width=60%>

## Setup

0. The dependencies for this program are NodeJS, Python, and you need to have Minecraft, of course (version 1.20.4).
1. Clone the repository on your machine.
2. Run **setup.bat** either in the command line or by clicking on it. This will create a virtual environment and install all the dependencies for you.
3. Substitute an OpenAI API key in ``.env.sample`` and rename that file to ``.env``. The bot uses this API to generate structures so it is necessary.
4. Have fun with the bot! Be aware of the pricing for OpenAI API access when you run the program. However, in my experience it doesn't cost much, at least for GPT-4o, which is what we're currently using.

## Connecting the bot to your world

The bot works by connecting to a LAN world hosted on your machine. The process is outlined here:

1. Run the program by running **run.bat** (or by running src/main.py directly with Python) and you should see a controller window asking for the server port.
2. Launch Minecraft 1.20.4 and open a singleplayer world.
3. In the pause menu, click **Open to LAN**. In the following menu, set the Gamemode to **Creative** and Allow Cheats to **On**. Feel free to choose your own port or leave it as the default. Open the LAN server.
4. You should see the port for the LAN world show up in the chat. Copy this port and paste it in the controller window's port field.
5. Click the connect button and the bot should join your world and say hello!
6. Once you're done interacting with it, use the "\$exit" command to disconnect the bot, then close the controller window.

## Resources used

- **[Mineflayer (Prismarine.js)](https://github.com/prismarinejs)** : Mineflayer is a Minecraft bot library that makes this project possible, and it is part of a larger Minecraft framework called Prismarine.js. It is written in JavaScript and it is possible to use in Python via the JS-Python Bridge.
- **[LangChain/OpenAI](https://python.langchain.com/docs/introduction/)** : LangChain is used with the OpenAI API to generate the code that programatically builds structures in-game.
- **[Flet](https://flet.dev/)** : The cross-platform, Flutter-based Python framework used for the bot controller GUI.

## Future ideas and known issues

- The program could use a better logging system for both the controller window and command line output
- Potentially moving some bot functionality/utilities to other files because ``bot.py`` is getting long
- The program does not properly handle entering an invalid host/port in the controller window
- Generally, needs better and more consistent error handling
- Better permission system for the bot so unwanted people can't command it
- There is a deprecation warning for the "punycode" library when running the program
- The bot has little to no awareness of its surroundings which is dangerous on more populated worlds
- Potentially making a version of the bot that is more friendly for survival mode
- Since Mineflayer is a JavaScript library, using it in Python has some drawbacks such as no intellisense. Perhaps it would be better to code the bot in JavaScript or TypeScript

<!--
## Release History

* 0.2.1
  * CHANGE: Update docs (module code remains unchanged)
* 0.2.0
  * CHANGE: Remove `setDefaultXYZ()`
  * ADD: Add `init()`
* 0.1.1
  * FIX: Crash when calling `baz()` (Thanks @GenerousContributorName!)
* 0.1.0
  * The first proper release
  * CHANGE: Rename `foo()` to `bar()`
* 0.0.1
  * Work in progress
-->
## Meta

Ryan Hardy – <ryyhardy@gmail.com>

[https://github.com/ryyHardy/text-to-minecraft](https://github.com/ryyHardy/text-to-minecraft)

## Contributing

1. Fork it (<https://github.com/ryyHardy/text-to-minecraft/fork>)
2. Create your feature branch (`git checkout -b feature/fooBar`)
3. Commit your changes (`git commit -am 'Add some fooBar'`)
4. Push to the branch (`git push origin feature/fooBar`)
5. Create a new Pull Request
