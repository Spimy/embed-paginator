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

```js
const { PaginatedEmbed } = require('embed-paginator');

module.exports.execute = (client, message, args) => {
  const embed = new PaginatedEmbed({
    itemsPerPage: 2,
    paginationType: 'field',
    showFirstLastBtns: false
  })
    .setDescriptions(['This is my test embed.'])
    .setThumbnails([
      'https://i.pinimg.com/736x/85/7c/56/857c566baef4f1471f346ea13d0a5da0.jpg',
      'https://asset.vg247.com/genshin-impact-ayaka-build.jpg/BROK/thumbnail/1200x1200/quality/100/genshin-impact-ayaka-build.jpg'
    ])
    .setImages([
      'https://staticg.sportskeeda.com/editor/2022/03/a2277-16479754476161-1920.jpg',
      'https://d3fd5j8wprxn3h.cloudfront.net/wp-content/uploads/2021/07/kamisatoayaka-708x400.jpg'
    ])
    .setFields([
      { name: 'test', value: 'my awesome embed' },
      { name: 'foo', value: 'bar' },
      { name: 'hello', value: 'world' }
    ])
    .setFooters([{ text: 'Hello {page}' }, { text: 'Foo {page}' }])
    .setTitles(['First Title', 'Second Title'])
    .setAuthors([{ name: 'First Author', url: 'https://google.com' }, { name: 'Second Author' }])
    .setURLs(['https://discord.com'])
    .setTimestamp();

  await embed.send({ options: { channel: message.channel } });
};

module.exports.info = {
  name: 'foo'
};
```

### Result

![](https://i.imgur.com/aAVii4P.gif)

## Change Log

### 2.0.1

This version is mainly for addressing language support

- Add buttons to jump to first and last page
  - Can be disabled by setting `showFirstLastBtns` to `false`
  - Enabled by default
- Add ability to customise pagination button text
  - To edit the label for each button, set in the constructor:
    - `firstBtn` - Label for button to jump to first page
    - `prevBtn` - Label for button to change to previous page
    - `nextBtn` - Label for button to change to next page
    - `lastBtn` - Label for button to jump to last page
- Add `{curPage}` and `{maxPage}` variables in footer text
  - The `{page}` variable still exists (stays in English)
  - If no footer is set then `{page}` will take over
- Add ability to use emoji
  - Disabled by default
- Remove unused code for optimisation

### 2.0.0

- Update Discord.JS from v12 to v14
- Use buttons instead of reactions for pagination
- Add interaction support
  ```ts
  embed.send({ options: { interaction, followUp: true, ephemeral: true } });
  ```
  - When an interaction is provided, it will be prioritised over a provided channel
  - Depending on the state of the interaction, you may use:
    - Follow up
    - Reply
    - Ephemeral
  - If `followUp` is not provided, the interaction will instead be `reply`
- Add components support
  ```ts
  const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('test').setLabel('Test'));
  embed.send({ options: { channel: message.channel, components: [row] } });
  ```
  - Appended after the pagination buttons
- Enable pagination on other attributes:
  - New attributes that can be paginated:
    - Titles
    - Authors
    - Footers
    - URLs
    - Thumbnails
    - Images
  - The newly enabled paginated attributes depend on the pagination of fields/descriptions
  - Provide only one item to the arrays for persisting data (same text/data across all pages)
- Add editable footer support
  - If footer is not set, the embed pages will show
  - If footer is set, the embed pages will not show by default
    - Add `{page}` in the footer text in order to show embed pages as shown in the given [example](#how-to-use)
- Add `toJSON()` method

## Author

- Discord: Spimy#6160
- [GitHub](https://github.com/Spimy)
- [YouTube Gaming](https://www.youtube.com/channel/UCNfE0E97k3fouJg-2nulLKg)
- [YouTube Development](https://www.youtube.com/channel/UCEw406qZnsdCEpRgVvCJzuQ)
- [Twitter](https://twitter.com/OfficialSpimy)

## Support Server

[![Support Server](https://discordapp.com/api/guilds/422469294786347016/widget.png?style=banner2)](https://discord.gg/865tNC4)
