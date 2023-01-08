import { napolitano } from "./napolitano-scripts.js"; 
import {SKILLS} from './constants.js';
import {napolitanoScriptsSocket} from "./index.js";

export async function addActiveEffectDerived(actorUuid, data){
    const document = await fromUuid(actorUuid)
    const actor = document?.actor ?? document
    if(actor?.documentName !== 'Actor') return
    let newEffects = await actor.createEmbeddedDocuments('ActiveEffect', [data])
    return newEffects
}

export async function addItem(actorUuid, data){
    const document = await fromUuid(actorUuid)
    const actor = document?.actor ?? document
    if(actor?.documentName !== 'Actor') return
    let newItems = await actor.createEmbeddedDocuments('Item', [data])
    return newItems
}

export function chat(message, options = {}){     
    const data =  {
        user : options.user ?? game.userId,
        content : message,
        speaker : options.speaker ?? ChatMessage.getSpeaker()
    }
    if(options.whisper) data.whisper = ChatMessage.getWhisperRecipients("GM") 
    ChatMessage.create(data)
}

export async function choose(options = [], prompt = ``, title = 'Please choose', {img = '', gm = false, player = ''}={}){
    let dialog, result, time = 20000, alteredTitle = title + (player ? ` (${player} Prompted)` : '');
    const query = new Promise((resolve) => {
        const dialog_options = (options[0] instanceof Array)
            ? options.map(o => `<option value="${o[0]}">${o[1]}</option>`).join(``)
            : options.map(o => `<option value="${o}">${o}</option>`).join(``);  
        const content = `<form><div><div class="napolitano-choose-title">${prompt}</div><div class="napolitano-choose-body"><select id="choice">${dialog_options}</select></div></div></form>`;
    
        dialog = new Dialog({
            title: alteredTitle,
            content, 
            buttons : { 
                OK : {
                    label : `OK`, 
                    icon: '<i class="fas fa-check"></i>',
                    callback : async (html) => { resolve(html.find('#choice').val()); } 
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: "Cancel",
                    callback: () => {resolve(false)}
                }
                },
                default: "cancel" 
        }).render(true);
    });
    closeDialog(dialog, time)
    if(gm) {
        result = await query
        return result
    } 

    const races = [query]
    if(!game.user.isGM){
        if(game.settings.get("napolitano-scripts", "ping-dm")) {
            races.push(napolitanoScriptsSocket.executeAsGM("choose", options, prompt, title, {img: img, gm: true, player: game.user.name}))
        } else {
            napolitanoScriptsSocket.executeAsGM("chat", `${game.user.name} prompted: ${alteredTitle}`, {whisper: true})
        }  
    } 
    if(time) races.push(wait(time))
    await Promise.race(races).then((value) => {result = value})
    return result
}

async function closeDialog(dialog, time){
    await wait(time)
    dialog?.close()
}

export async function deleteItem(itemUuid, message){
    const itm = await fromUuid(itemUuid)
    if(itm){
        await itm.actor.deleteEmbeddedDocuments('Item',[itm.id]);
        chat(message ?? `${itm.name} has been deleted from ${itm.actor.name}`, {whisper: "GM"});
    }
}

export async function destroyItem(itemUuid, time = {hours: 1}, message ){
    game.Gametime.doIn(time, async () => {
        await deleteItem(itemUuid, message)
    });
}

export function getActorOwner(document){
    const actor = document.actor ?? document
    const activePlayers = game.users?.players.filter(p => p.active)
    if(!actor?.id || !actor?.ownership || !activePlayers || !activePlayers.length) return "GM"
    let user;
    if (actor.hasPlayerOwner) user = activePlayers.find(u => u.character === actor.id);
    if (!user) user = activePlayers.find(p => actor.ownership[p.id] === CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER)
    if (!user && actor.ownership.default === CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER) user = activePlayers[0]
    return user ?? "GM" 
}

//taken from dnd5e
export function getSpellData(actor, item = {}) {
    if(!item.system || !actor.system) return
    const lvl = item.system.level ?? 0;
    const consumeSpellSlot = (lvl > 0) && CONFIG.DND5E.spellUpcastModes.includes(item.system.preparation?.mode);
    let lmax = 0;
    const spellLevels = Array.fromRange(10).reduce((arr, i) => {
      if ( i < lvl || !i ) return arr;
      const label = CONFIG.DND5E.spellLevels[i];
      const l = actor.system.spells[`spell${i}`] || {max: 0, override: null};
      let max = parseInt(l.override || l.max || 0);
      let slots = Math.clamped(parseInt(l.value || 0), 0, max);
      if ( max > 0 ) lmax = i;
      arr.push({
        level: i,
        label: i > 0 ? game.i18n.format("DND5E.SpellLevelSlot", {level: label, n: slots}) : label,
        canCast: max > 0,
        hasSlots: slots > 0
      });
      return arr;
    }, []).filter(sl => sl.level <= lmax);

    // If this character has pact slots, present them as an option for casting the spell.
    const pact = actor.system.spells.pact;
    if (pact.level >= lvl) {
      spellLevels.push({
        level: "pact",
        label: `${game.i18n.format("DND5E.SpellLevelPact", {level: pact.level, n: pact.value})}`,
        canCast: true,
        hasSlots: pact.value > 0
      });
    }
    const canCast = spellLevels.some(l => l.hasSlots);
    return {canCast: canCast, consumeSpellSlot: consumeSpellSlot, spellLevels: spellLevels}
}

export async function importActorIfNotExists(actorName){
    if(!game.actors.getName(actorName)){
        const pack = game.packs.get("napolitano-compendium.napolitano-monsters");
        const actorId = pack.index.getName(actorName)?._id;
        if(actorId){
            const actorData = await pack.getDocument(actorId);
            await Actor.create(actorData.toObject())
            napolitano.log(false, `${actorName} actor add from compendium`)
        }
    }
}

export function isOwner(token){
    if(!token) return
    return (token.isOwner && ((game.user.isGM && !token.hasPlayerOwner) || (!game.user.isGM && token.hasPlayerOwner))) ? true : false
}

export async function killIn(tokens, time){
    const del = tokens
    game.Gametime.doIn(time, async () => {
        const find_summons = canvas.tokens.placeables.filter(t=>del.includes(t.id));
        if (find_summons.length){
            await canvas.scene.deleteEmbeddedDocuments('Token', del);
        }
    });
}

export async function promptTarget({title = 'Choose target', origin = '', event = 'New Target', prompt = 'Select the target then hit OK'}={}){
    const targets = await new Promise((resolve) => {
        new Dialog({
            title: title,
            content: `<div class="napolitano-chat-message-title">${event}</div><div class="napolitano-chat-message-body">${prompt}</div>`,
            buttons: {
                yes: {
                    icon: '<i class="fas fa-check"></i>',
                    label: "OK",
                    callback: async () => resolve(game.user.targets?.ids ?? [])
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: "Cancel",
                    callback: () => resolve([])
                }
            },
            default: "cancel"
        }).render(true);
    });
    return {origin: origin, targets: targets}
}

export function logIt(message, data = {}){
    console.log(message, data)
}

export function moduleActive(module){
    return game.modules.get(module)?.active ? true : false
}

export async function requestSkillCheck(actorUuid, options, prompt = 'Select a skill to roll', dice = {}){
    const document = fromUuidSync(actorUuid)
    const actor = document?.actor ?? document
    if(actor?.documentName !== 'Actor') return
    const skill = options.length > 1 ? await choose(SKILLS.filter(s => options.includes(s[0])), prompt + ' What will you roll?', `${actor.name} please choose`) : options[0]
    if(!skill) return {}
    const result = await actor.rollSkill(skill, {fastForward: true, ...dice})
    return result
}

export async function tokenCreateEmbeddedDocuments (tokenId, document, data){
    const token = canvas.scene.tokens.get(tokenId)
    await token.actor.createEmbeddedDocuments(document, data);
} 

export function toTitleCase(str) {
    return str.replace(/(?:^|\s)\w/g, function(match) {
        return match.toUpperCase();
    });
}

export async function updateActor(actorUuid, data){
    const document = await fromUuid(actorUuid)
    const actor = document.actor ?? document
    if(actor?.documentName !== 'Actor') return
    await actor.update(data)
}

export async function updatePrototypeToken(actorUuid, data){
    const document = await fromUuid(actorUuid)
    const actor = document.actor ?? document
    if(actor?.documentName !== 'Actor') return
    await actor.prototypeToken.update(data)
}

export async function updateToken(tokenUuid, data){
    const document = await fromUuid(tokenUuid)
    if(document.parent?.documentName === 'Scene') await document.parent.updateEmbeddedDocuments("Token", [data])
}

export async function updateItem(itemUuid, data){
    const item = await fromUuid(itemUuid)
    if(item.actor) await item.actor.updateEmbeddedDocuments("Item", [data])
}

export async function useItem(itemUuid, options = {}, config = {}){
    const item = fromUuidSync(itemUuid)
    const result = await MidiQOL.completeItemUse(item, config, options)
    return result
}

export const wait = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

export async function yesNo(title = '', prompt = 'Continue?', {img = '', gm = false, player = '', time = 20000}={}){
    let dialog, result, alteredPrompt = prompt + (player ? ` (${player} Prompted)` : '');
    const finalPrompt = img ? `<div class="napolitano-yes-no-img"><img src="${img}"/><div>${alteredPrompt}</div></div>` : `<p>${alteredPrompt}</p>`
    const query = new Promise((resolve, reject) => {
        dialog = new Dialog({
        title: title,
        content: finalPrompt,
        buttons: {
            one: {
                icon: '<i class="fas fa-check"></i>',
                label: "Yes",
                callback: () => resolve(true)
            },
            two: {
                icon: '<i class="fas fa-times"></i>',
                label: "No",
                callback: () => {resolve(false)}
            }
            },
            default: "two"
        }).render(true);
    });
    if(time) closeDialog(dialog, time)
    if(gm) {
        result = await query
        return result
    }
    const races = [query]
    if(!game.user.isGM){
        if(game.settings.get("napolitano-scripts", "ping-dm")) {
            races.push(napolitanoScriptsSocket.executeAsGM("yesNo", title, prompt, {img: img, gm: true, player: game.user.name}))
        } else {
            napolitanoScriptsSocket.executeAsGM("chat", `${game.user.name} prompted: ${alteredPrompt}`, {whisper: true})
        }  
    } 
    if(time) races.push(wait(time)) 
    await Promise.race(races).then((value) => {result = value})
    return result
}
