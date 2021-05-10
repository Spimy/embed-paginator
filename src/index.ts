import {
    ColorResolvable,
    MessageEmbed,
    EmbedFieldData,
    TextChannel,
    FileOptions,
    MessageAttachment,
    User,
    MessageReaction
} from 'discord.js';

const paginationTypeList = ['description', 'field', 'both'] as const;
type paginationType = typeof paginationTypeList[number];

interface EmbedItems {
    colours: ColorResolvable[];
    descriptions?: string[];
    fields?: EmbedFieldData[];
}

interface EmbedOptions extends EmbedItems {
    duration: number;
    itemsPerPage: number;
    paginationType: paginationType;
    footerImageURL?: string;
}

export class PaginatedEmbed {
    private options: EmbedOptions;

    private messageEmbed: MessageEmbed;
    private pages: EmbedItems[];

    private readonly next = '⏩';
    private readonly previous = '⏪';

    private currentPage: number = 1;

    constructor(options: EmbedOptions) {
        if (paginationTypeList.indexOf(options.paginationType) === -1) {
            throw new Error(
                'An invalid pagination type has been passed. Valid pagination types: description, field, both.'
            );
        }
        this.options = options;

        this.messageEmbed = new MessageEmbed();
        this.setupPages(options);
        this.changePage();
    }

    private async setupPages(items: EmbedItems) {
        const colours = [...items.colours];
        const descriptions = items.descriptions ? [...items.descriptions] : undefined;
        const fields = items.fields ? [...items.fields] : undefined;

        const pages: EmbedItems[] = [];

        while (colours.length > 0 || descriptions.length > 0 || fields?.length > 0) {
            let pageDescriptions;
            let pageFields;

            if (this.options.paginationType === 'field') {
                if (!this.options.fields || this.options.fields.length === 0) {
                    throw new Error('No fields have been passed for field pagination. Unable to paginate.');
                }
                descriptions?.splice(0, descriptions?.length);
                pageDescriptions = items.descriptions;
                pageFields = fields.splice(0, this.options.itemsPerPage);
            }

            if (this.options.paginationType === 'description') {
                if (!this.options.descriptions || this.options.descriptions.length === 0) {
                    throw new Error('No descriptions have been passed for description pagination. Unable to paginate.');
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
                    throw new Error('No fields/descriptions have been passed for both pagination. Unable to paginate.');
                }
                pageDescriptions = descriptions?.splice(0, this.options.itemsPerPage);
                pageFields = fields?.splice(0, this.options.itemsPerPage);
            }

            const page = {
                colours: colours.length > 0 ? colours.splice(0, 1) : pages[pages.length - 1].colours,
                descriptions: pageDescriptions,
                fields: pageFields
            };

            pages.push(page);
        }

        this.pages = pages;
    }

    private async changePage() {
        this.messageEmbed
            .setColor(this.pages[this.currentPage - 1].colours[0])
            .setFooter(
                `Page ${this.currentPage} of ${this.pages.length === 0 ? 1 : this.pages.length}`,
                this.options.footerImageURL
            );

        if (this.options.descriptions) {
            this.messageEmbed.setDescription(this.pages[this.currentPage - 1].descriptions.join('\n'));
        }

        if (this.options.fields) {
            this.messageEmbed.spliceFields(0, this.messageEmbed.fields.length, this.pages[this.currentPage - 1].fields);
        }
    }

    public setTitle(title: any) {
        this.messageEmbed.setTitle(title);
        return this;
    }

    public setAuthor(name: any, iconURL?: string, url?: string) {
        this.messageEmbed.setAuthor(name, iconURL, url);
        return this;
    }

    public setImage(url: string) {
        this.messageEmbed.setImage(url);
        return this;
    }

    public setThumbnail(url: string) {
        this.messageEmbed.setThumbnail(url);
        return this;
    }

    public setTimestamp(timestamp?: Date | number) {
        this.messageEmbed.setTimestamp(timestamp);
        return this;
    }

    public setURL(url) {
        this.messageEmbed.setURL(url);
        return this;
    }

    public attachFiles(files: (FileOptions | string | MessageAttachment)[]) {
        this.messageEmbed.attachFiles(files);
        return this;
    }

    public async send(channel: TextChannel, message?: string) {
        const msg = await channel.send(message, { embed: this.messageEmbed });
        await msg.react(this.previous);
        await msg.react(this.next);

        const filter = (reaction: MessageReaction, user: User) => {
            return (reaction.emoji.name === this.next || reaction.emoji.name === this.previous) && !user.bot;
        };

        const collector = msg.createReactionCollector(filter, { time: this.options.duration });

        collector.on('collect', async (reaction: MessageReaction, user: User) => {
            if (this.pages.length < 2) {
                this.currentPage = 1;
                await this.changePage();
                await msg.edit({ embed: this.messageEmbed });
            }

            const action = reaction.emoji.name;
            switch (action) {
                case this.next:
                    this.currentPage === this.pages.length ? (this.currentPage = 1) : this.currentPage++;
                    break;
                case this.previous:
                    this.currentPage === 1 ? (this.currentPage = this.pages.length) : this.currentPage--;
                    break;
            }

            await this.changePage();
            await msg.edit({ embed: this.messageEmbed });
            reaction.users.remove(user);
        });

        collector.on('end', () => msg.reactions.removeAll());
    }
}
