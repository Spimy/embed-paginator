# Embed Paginator

Discord message embeds that are cool, but paginated ones are even cooler. Presenting Embed Paginator which will help you code paginated embeds with nothing but just a few lines of code to configure how you want your embed to look!

## Installation

```
npm install embed-paginator
or
yarn add embed-paginator
```

### To contribute

1. Fork this repo
2. Clone your fork to your local machine
3. CD into the project root directory
4. Run `npm install` or `yarn`
5. Create a new branch and make your contribution
6. Make a pull request on GitHub for me to review

## How To Use?

Feel free to play around and see what works for you! If you ever need anything that Embed Paginator does not provide, you can open an issue to request features or you can contribute and open a pull request!

Typescript Example with use of [MuseCLI](https://www.npmjs.com/package/muse-cli)

```ts
import { Message, TextChannel } from 'discord.js';
import { Command } from '../lib/commands/Command';
import { CommandExecutor } from '../lib/commands/CommandExecutor';
import { PaginatedEmbed } from 'embed-paginator';

@Command({
    name: 'test',
    aliases: ['t']
})
class implements CommandExecutor {
    execute = async (message: Message): Promise<boolean> => {
        const embed = new PaginatedEmbed({
            colours: ['RANDOM', '#c21b15'],
            descriptions: ['foo', 'bar', 'hello', 'world', 'this', 'is', 'a', 'test'],
            fields: [
                { name: 'foo', value: 'bar', inline: true },
                { name: 'hello', value: 'world', inline: true }
            ],
            duration: 60 * 1000, // in milliseconds
            itemsPerPage: 2,
            paginationType: 'description'
        })
            .setThumbnail(message.author.avatarURL({ dynamic: true, size: 2048 })!)
            .setTimestamp()
            .setTitle('Testing stuff');

        embed.send(message.channel as TextChannel, 'a test message to go along with the embed');
        return true;
    };
}
```

Common JavaScript Example

```js
const { PaginatedEmbed } = require('embed-paginator');

module.exports.execute = (client, message, args) => {
    const embed = new PaginatedEmbed({
        colours: ['RANDOM', '#c21b15'],
        descriptions: ['foo', 'bar', 'hello', 'world', 'this', 'is', 'a', 'test'],
        fields: [
            { name: 'foo', value: 'bar', inline: true },
            { name: 'hello', value: 'world', inline: true }
        ],
        duration: 60 * 1000, // in milliseconds
        itemsPerPage: 2,
        paginationType: 'description'
    })
        .setThumbnail(message.author.avatarURL({ dynamic: true, size: 2048 })!)
        .setTimestamp()
        .setTitle('Testing stuff');

    embed.send(message.channel, 'a test message to go along with the embed');
}

module.exports.info = {
    name: 'test',
    aliases: ['t']
}
```

### Result

![](https://i.imgur.com/SGBRUPw.gif)

## Author

I am Spimy, but my Discord is occasionally under a different name.

-   Discord: Spimy#6160
-   [GitHub](https://github.com/Spimy)
-   [YouTube Gaming](https://www.youtube.com/channel/UCNfE0E97k3fouJg-2nulLKg)
-   [YouTube Development](https://www.youtube.com/channel/UCEw406qZnsdCEpRgVvCJzuQ)
-   [Twitter](https://twitter.com/OfficialSpimy)

## Support Server

[![Support Server](https://discordapp.com/api/guilds/422469294786347016/widget.png?style=banner2)](https://discord.gg/865tNC4)
