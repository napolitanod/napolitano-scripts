import {CONTESTS} from './constants.js';
import {chat, getActorOwner, requestSkillCheck} from './helpers.js'
import {napolitano} from "./napolitano-scripts.js";
import {napolitanoScriptsSocket} from "./index.js";
export class contest {
    constructor(source, target, title){
        this.requests = [],
        this.source={
            actor: source.document.actor ?? source.document,
            dice: source.dice ?? {},
            type: source.type ?? 'skill',
            options: source.options ?? [],
            owner: getActorOwner(source.document),
            prompt: `You initiate a ${title} contest!`,
            roll: {}
        },
        this.target={
            actor: target.document.actor ?? target.document,
            dice: target.dice ?? {},
            type: target.type ?? 'skill',
            options: target.options ?? [],
            owner: getActorOwner(target.document),
            prompt: `You are recipient to a ${title} contest!`,
            roll: {}
        },
        this.title = title
    }

    get won(){
        return this.source.roll.total > this.target.roll.total ? true : false
    }

    _message(message, options = {}){    
        message =`<div class="napolitano-chat-message-body">${message}</div>`;
        if(options.title) message = `<div class="napolitano-chat-message-title">${options.title}</div>` + message 
        chat(message, options)
    }

    async _rollSkill(data){
        if(data.owner === "GM"){
            data.roll = await napolitanoScriptsSocket.executeAsGM("requestSkillCheck",data.actor.uuid, data.options, data.prompt, data.dice) 
        } else {
            data.roll = ( 
                data.owner?.id 
                ? await napolitanoScriptsSocket.executeAsUser("requestSkillCheck", data.owner.id, data.actor.uuid, data.options, data.prompt, data.dice) 
                : await requestSkillCheck(data.actor.uuid, data.options, data.prompt, data.dice) 
            )
        }
        if(data.roll.class) data.roll = Roll.fromData(data.roll)
    }

    static async play(source = {}, target = {}, title){
        const c = new contest(source, target, title)
        await c._run()
        return c
    }

    async _run() {
        this._message(`A contest is initiated by ${this.source.actor.name}!`, {title: this.title})
        this.requests.push(this._rollSkill(this.source))
        this.requests.push(this._rollSkill(this.target))
        await Promise.all(this.requests);
        this._message(`${this.source.actor.name} rolls ${this.source.roll.total}${this.source.owner !== "GM" ? ' (' + this.source.roll.result + ')' : ''} and their contestant rolls ${this.target.roll.total}${this.target.owner !== "GM"  ? ' (' + this.target.roll.result + ')' : ''}. ${this.source.actor.name} ${this.won ? 'wins' : 'loses'} the contest!`, {title: this.title})
        napolitano.log(false,{text: `Contest complete`, this: this})
        return this
    }

    static async runSkillContest(contestId, sourceUuid, targetUuid, overrides = {}){
        if(!CONTESTS[contestId]) return
        const result = await contest.play({
                dice: Object.assign(CONTESTS[contestId].source.dice ?? {}, overrides.source ?? {}),
                document: fromUuidSync(sourceUuid), 
                type: 'skill', 
                options: CONTESTS[contestId].source.options
            }, 
            {
                dice: Object.assign(CONTESTS[contestId].target.dice ?? {}, overrides.target ?? {}),
                document: fromUuidSync(targetUuid), 
                type: 'skill', 
                options: CONTESTS[contestId].target.options
            }, 
            CONTESTS[contestId].name
            )
        return result
    }    
}


