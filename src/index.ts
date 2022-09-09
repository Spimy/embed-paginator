import {
  ColorResolvable,
  EmbedBuilder,
  ButtonInteraction,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  Interaction,
  Message,
  TextChannel,
  ComponentType,
  APIEmbedField,
  MessageActionRowComponentBuilder,
  MessageActionRowComponentData,
  ActionRowData,
  JSONEncodable,
  APIActionRowComponent,
  APIMessageActionRowComponent,
  EmbedFooterOptions
} from 'discord.js';

const paginationTypeList = ['description', 'field', 'both'] as const;
type paginationType = typeof paginationTypeList[number];

interface EmbedItems {
  colours?: ColorResolvable[];
  descriptions?: string[];
  fields?: APIEmbedField[];
  images?: string[];
  thumbnails?: string[];
}

interface EmbedOptions extends EmbedItems {
  duration?: number;
  itemsPerPage: number;
  paginationType: paginationType;
}

interface SendOptions {
  message?: string;
  options: {
    interaction?: Interaction;
    ephemeral?: boolean;
    followUp?: boolean;
    channel?: TextChannel;
    components?: (
      | JSONEncodable<APIActionRowComponent<APIMessageActionRowComponent>>
      | ActionRowData<MessageActionRowComponentData | MessageActionRowComponentBuilder>
      | APIActionRowComponent<APIMessageActionRowComponent>
    )[];
  };
}

export class PaginatedEmbed {
  private options: EmbedOptions & { footer?: EmbedFooterOptions };
  private messageEmbed: EmbedBuilder;
  private pages: EmbedItems[] = [];

  private currentPage: number = 1;
  private paginate: boolean = true;

  private embedMsg: Message;

  constructor(options: EmbedOptions) {
    if (paginationTypeList.indexOf(options.paginationType) === -1) {
      throw new Error('An invalid pagination type has been passed. Valid pagination types: description, field, both.');
    }

    this.options = options;
    this.messageEmbed = new EmbedBuilder();

    this.setupPages(options);
    this.changePage();
  }

  private async setupPages(items: EmbedItems) {
    const colours = items.colours ? [...items.colours] : [];
    const descriptions = items.descriptions ? [...items.descriptions] : [];
    const fields = items.fields ? [...items.fields] : [];
    const images = items.images ? [...items.images] : [];
    const thumbnails = items.thumbnails ? [...items.thumbnails] : [];
    const pages: EmbedItems[] = [];

    while (colours.length > 0 || descriptions.length > 0 || fields?.length > 0) {
      let pageDescriptions;
      let pageFields;

      if (this.options.paginationType === 'field') {
        if (!this.options.fields || this.options.fields.length < this.options.itemsPerPage) {
          this.paginate = false;
        } else {
          this.paginate = true;
        }

        descriptions?.splice(0, descriptions?.length);
        pageDescriptions = items.descriptions;
        pageFields = fields.splice(0, this.options.itemsPerPage);
      }

      if (this.options.paginationType === 'description') {
        if (!this.options.descriptions || this.options.descriptions.length < this.options.itemsPerPage) {
          this.paginate = false;
        } else {
          this.paginate = true;
        }

        fields?.splice(0, fields?.length);
        pageDescriptions = descriptions.splice(0, this.options.itemsPerPage);
        pageFields = items.fields;
      }

      if (this.options.paginationType === 'both') {
        if (
          (!this.options.descriptions || this.options.descriptions.length === 0) &&
          (!this.options.fields || this.options.fields.length === 0)
        ) {
          this.paginate = false;
        } else {
          this.paginate = true;
        }

        pageDescriptions = descriptions?.splice(0, this.options.itemsPerPage);
        pageFields = fields?.splice(0, this.options.itemsPerPage);
      }

      const page = {
        colours: colours.length > 0 ? colours.splice(0, 1) : pages[pages.length - 1]?.colours || ['Random'],
        descriptions: pageDescriptions,
        fields: pageFields,
        images: images.length > 0 ? images.splice(0, 1) : pages[pages.length - 1]?.images || [undefined],
        thumbnails: thumbnails.length > 0 ? thumbnails.splice(0, 1) : pages[pages.length - 1]?.thumbnails || [undefined]
      };

      pages.push(page);
    }

    this.pages = pages;
  }

  private async changePage() {
    this.messageEmbed.setColor(this.pages[this.currentPage - 1]?.colours[0] || 'Random');

    const pageNumber = `Page ${this.currentPage} of ${this.pages.length === 0 ? 1 : this.pages.length}`;
    this.messageEmbed.setFooter({
      text: this.options.footer?.text.replace(/{page}/gi, pageNumber) || pageNumber,
      iconURL: this.options.footer?.iconURL
    });

    if (this.options.descriptions) {
      this.messageEmbed.setDescription(this.pages[this.currentPage - 1].descriptions!.join('\n'));
    }

    if (this.options.fields) {
      this.messageEmbed.spliceFields(
        0,
        this.messageEmbed.data.fields?.length || 0,
        ...this.pages[this.currentPage - 1].fields!
      );
    }

    if (this.options.thumbnails) {
      this.messageEmbed.setThumbnail(this.pages[this.currentPage - 1].thumbnails![0]);
    }

    if (this.options.images) {
      this.messageEmbed.setImage(this.pages[this.currentPage - 1].images![0]);
    }
  }

  public setTitle(title: string) {
    this.messageEmbed.setTitle(title);
    return this;
  }

  public setDescriptions(descriptions: string[]) {
    this.options.descriptions = descriptions;
    this.setupPages(this.options);

    if (!this.embedMsg || !this.embedMsg.editedAt) {
      this.changePage();
    }
    return this;
  }

  public setFields(fields: APIEmbedField[]) {
    this.options.fields = fields;
    this.setupPages(this.options);

    if (!this.embedMsg || !this.embedMsg.editedAt) {
      this.changePage();
    }
    return this;
  }

  public setColours(colours: ColorResolvable[]) {
    this.options.colours = colours;
    this.setupPages(this.options);

    if (!this.embedMsg || !this.embedMsg.editedAt) {
      this.changePage();
    }
    return this;
  }

  public spliceFields(index: number, deleteCount: number, fields?: APIEmbedField[]) {
    this.options.fields.splice(index, deleteCount, ...(fields || []));
    this.setupPages(this.options);

    if (!this.embedMsg || !this.embedMsg.editedAt) {
      this.changePage();
    }
    return this;
  }

  public setFooter(options: EmbedFooterOptions) {
    this.options.footer = options;

    if (!this.embedMsg || !this.embedMsg.editedAt) {
      this.changePage();
    }
    return this;
  }

  public setImages(urls: string[]) {
    this.options.images = urls;

    if (!this.embedMsg || !this.embedMsg.editedAt) {
      this.changePage();
    }
    return this;
  }

  public setThumbnails(urls: string[]) {
    this.options.thumbnails = urls;

    if (!this.embedMsg || !this.embedMsg.editedAt) {
      this.changePage();
    }
    return this;
  }

  public setAuthor(name: string, iconURL?: string, url?: string) {
    this.messageEmbed.setAuthor({
      name,
      iconURL,
      url
    });
    return this;
  }

  public setTimestamp(timestamp?: Date | number) {
    this.messageEmbed.setTimestamp(timestamp);
    return this;
  }

  public setURL(url: string) {
    this.messageEmbed.setURL(url);
    return this;
  }

  public toJSON() {
    return this.pages.reduce((acc, page, index) => {
      acc[`${index + 1}`] = page;
      return acc;
    }, {});
  }

  public get fields() {
    return this.options.fields;
  }

  public get descriptions() {
    return this.options.descriptions;
  }

  public get colours() {
    return this.options.colours;
  }

  public async send({ message, options: { interaction, ephemeral, followUp, channel, components } }: SendOptions) {
    if (interaction && !interaction.isRepliable()) throw new Error('Interaction cannot be replied to.');
    channel = (interaction?.channel as TextChannel) || channel;

    if (!channel) {
      throw new Error('Please provide either an interaction or channel.');
    }

    const btnsRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId('prevBtn').setLabel('Back').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('nextBtn').setLabel('Next').setStyle(ButtonStyle.Primary)
    );

    let msg: Message;
    if (interaction) {
      if (interaction.isRepliable()) {
        if (followUp) {
          msg = (await interaction.followUp({
            content: message,
            embeds: [this.messageEmbed],
            components: this.paginate ? [btnsRow, ...(components || [])] : [...(components || [])],
            ephemeral
          })) as Message;
        } else {
          msg = (await interaction!.reply({
            content: message,
            embeds: [this.messageEmbed],
            components: this.paginate ? [btnsRow, ...(components || [])] : [...(components || [])],
            fetchReply: true,
            ephemeral
          })) as Message;
        }
      } else {
        throw new Error(`The interaction ${interaction.id} passed as argument cannot be replied to.`);
      }
    } else {
      msg = await channel.send({
        content: message,
        embeds: [this.messageEmbed],
        components: this.paginate ? [btnsRow, ...(components || [])] : [...(components || [])]
      });
    }
    if (!this.paginate) return msg;

    const filter = (i: ButtonInteraction) => {
      return (
        (i.customId === 'nextBtn' || i.customId === 'prevBtn') &&
        (typeof interaction !== 'undefined' ? i.user.id === interaction.user.id : !i.user.bot)
      );
    };

    let collector = msg.createMessageComponentCollector({
      filter,
      componentType: ComponentType.Button
      // time: 15000
    });

    if (this.options.duration) {
      collector = msg.createMessageComponentCollector({
        filter,
        componentType: ComponentType.Button,
        time: this.options.duration
      });
    } else {
      collector = msg.createMessageComponentCollector({
        filter,
        componentType: ComponentType.Button
      });
    }

    collector.on('collect', async (i: ButtonInteraction) => {
      if (this.pages.length < 2) {
        this.currentPage = 1;

        await this.changePage();

        if (interaction) {
          await i.editReply({
            embeds: [this.messageEmbed]
          });
        } else {
          await msg.edit({
            embeds: [this.messageEmbed]
          });
        }
      }

      const action = i.customId;
      switch (action) {
        case 'nextBtn':
          this.currentPage === this.pages.length ? (this.currentPage = 1) : this.currentPage++;
          await i.update({ embeds: [this.messageEmbed] });
          break;
        case 'prevBtn':
          this.currentPage === 1 ? (this.currentPage = this.pages.length) : this.currentPage--;
          await i.update({ embeds: [this.messageEmbed] });
          break;
      }

      await this.changePage();
      if (interaction) {
        await i.editReply({
          embeds: [this.messageEmbed]
        });
      } else {
        await msg.edit({
          embeds: [this.messageEmbed]
        });
      }
    });

    collector.on('end', (i, reason) => {
      if (reason === 'messageDelete') return;
      i.forEach((int) => int.editReply({ components: [] }));
    });

    this.embedMsg = msg;
    return msg;
  }
}
