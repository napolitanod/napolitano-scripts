//pirated from CUB for personal use and extension. Do not claim ownership or give to anybody else.

export class HideNPCNames {

    static _onRenderCombatTracker(app, html, data) {
        const combatants = app?.viewed?.combatants?.contents;
        if (!combatants || !combatants?.length) return;
        const tokens = combatants.filter(c => c.token).map(c => c.token);
        
        const npcs = tokens.filter(t => {
            const actor = t.actor || game.actors.get(t.actorId);
            if (actor?.hasPlayerOwner === false) return true;
        });
        if (!npcs.length) return;

        const hideNPCs = npcs.filter(n => HideNPCNames.shouldReplaceName(n.actor)).map(npc => {
            const replacementName = HideNPCNames.getReplacementName(npc.actor);
            return {
                id: npc.id ?? npc.id,
                name: npc.name,
                replacement: replacementName,
                isOwner: npc.actor.isOwner
            }
        });
        if (!hideNPCs.length) return;

        const combatantListElement = html.find("li");
        for (const el of combatantListElement) {
            const combatantId = el.dataset.combatantId;
            const combatant = game.combat.combatants.get(combatantId);
            const npcToken = hideNPCs.find(n => n.id === combatant?.token?.id);
            if (!npcToken) continue;
            if (game.user.isGM || npcToken.isOwner) {
                const $icon = $(`<span> <i class="fas fa-mask" title="${npcToken.replacement}"></i></span>`);
                $(el).find(".token-name").children().first().append($icon);
                continue;
            }
            $(el).find(".token-name h4").text(npcToken.replacement);
            $(el).find(".token-image").attr("title", npcToken.replacement);            
        }
    }

    static async _onRenderChatMessage(message, html, data) {
        const name = data?.alias ?? null;
        const speaker = message.speaker;
        if (!name || !speaker) return;

        const actor = ChatMessage.getSpeakerActor(speaker);
        if (!actor || game.user.isGM || actor?.isOwner || actor?.hasPlayerOwner) return 

        const replacementName = HideNPCNames.getReplacementName(actor);
        if (!HideNPCNames.shouldReplaceName(actor)) return;

        let matchString = null;
        if (name.includes(" ")) {
            const parts = name.trim().split(/\s/).filter(w => w.length);
            const terms = HideNPCNames.getTerms(parts);
            if (terms.length) {
                if (terms[0] !== name) terms[0] = name;
                matchString = terms
                    .map(t => {
                        t = t.trim();
                        t = HideNPCNames.escapeRegExp(t);
                        return t;
                    })
                    .filter(t => t.length)
                    .join("|");
            }
        }
        
        matchString = matchString ?? HideNPCNames.escapeRegExp(name);
        const regex = `(${matchString})(?=\\s|[\\W]|s\\W|'s\\W|$)`;
        const pattern = new RegExp(regex, "gim");
        HideNPCNames.replaceOnDocument(pattern, replacementName, {target: html[0]});
        const cardFooter = html.find(".card-footer");
        return cardFooter.prop("hidden", true);
    }

    static _onRenderImagePopout(app, html, data) {
        const windowTitle = html.find(".window-title");
        if (windowTitle.length === 0) return;
        const actor = app.options?.uuid?.startsWith("Actor") ? game.actors.get(app.options?.uuid.replace("Actor.", "")) : null;
        if (!actor || actor.hasPlayerOwner || !HideNPCNames.shouldReplaceName(actor)) return;
        const replacement = HideNPCNames.getReplacementName(actor);

        if (!game.user.isGM || !actor.isOwner) {
            windowTitle.text(replacement);
            const imgDiv = html.find("div.lightbox-image");
            if (!imgDiv.length) return;
            imgDiv.attr("title", replacement);
        } else {
            const icon = `<span> <i class="fas fa-mask" title="${replacement}"></i></span>`;
            windowTitle.append(icon);
        }
    }

    static escapeRegExp(string) {
        return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&');
    }

     static getTerms(arr) {
        const terms = [];
        const rejectTerms = ["of", "its", "the", "a", "it's", "if", "in", "for", "on", "by", "and"];
        for ( let i of arr.keys() ) {
            let len = arr.length - i;
            for ( let p=0; p<=i; p++ ) {
                let part = arr.slice(p, p+len);
                if (part.length === 1 && rejectTerms.includes(part[0])) {
                    continue;
                } 
                terms.push(part.join(" "));
            }
        }
        return terms;
    }

    static replaceOnDocument(pattern, string, {target = document.body} = {}) {
        [target,...target.querySelectorAll("*:not(script):not(noscript):not(style)")]
        .forEach(({childNodes: [...nodes]}) => nodes
        .filter(({nodeType}) => nodeType === document.TEXT_NODE)
        .forEach((textNode) => textNode.textContent = textNode.textContent.replace(pattern, string)));
    };

    static shouldReplaceName(actor) {
        return true
    }

    static getReplacementName(actor) {
        return 'Creature';
    }
}