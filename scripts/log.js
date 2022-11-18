import {napolitano} from "./napolitano-scripts.js";

export class log {
    constructor(message){
        this.message = message,
        this.journalName = game.settings.get(napolitano.ID, "log");
        this.pageName = game.settings.get(napolitano.ID, "log-page") ? game.settings.get(napolitano.ID, "log-page") : `${this.journalName} Text`
    }

    get content(){
        return this.page.text?.content ? this.page.text?.content : ''
    }

    get contentNew(){
        return this.time ? '[' + this.time.date + ' ' + this.time.time + '] ' + this.message : this.message
    }

    get journal() {
        return game.journal.getName(this.journalName);
    }

    get time(){
        return SimpleCalendar.api.formatDateTime(SimpleCalendar.api.timestampToDate(SimpleCalendar.api.dateToTimestamp({})));
    }

    get page() {
        return this.journal.pages.find(p => p.name === this.pageName)
    }

    async createlog() {
        await JournalEntry.create({name: this.journalName},{renderSheet: false, activate: false });
    }

    async createPage() {
        await this.journal.createEmbeddedDocuments("JournalEntryPage", [{name: this.pageName, type: "text"}]);
    }

    static async recordChat(message) {
        const timeEnd = message.indexOf(']');
        const journal = new log(message.slice(timeEnd+1))
        await journal._record()
    }

    static async record(message){
        const journal = new log(message)
        await journal._record()
    }

    async _record() {
        if (!this.journal) await this.createlog();
        if (!this.page) await this.createPage();
        await this.page.update({text:{content: this.content + this.contentNew + '<br><br>'}});
        ui.notifications?.info(game.i18n.localize("EN.alerts.logged"));
        napolitano.log(false,{text: `New content added to ${this.pageName} journal ${this.journalName}`, this: this})
    }
}

