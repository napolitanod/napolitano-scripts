
import {napolitano} from "./napolitano-scripts.js";
import {log} from "./log.js";
import {napolitanoScriptsSocket} from "./index.js";
import {macros} from "./macros.js";
import {contest} from "./contest.js";
import {postRollSkill, postRollAbilitySave, postRollAbilityTest} from "./hooks.js"

export class api {

    static register() {
        api.set();
    }
    
    static settings() {

    }

    static set() {
        this._registerWindow();
        window[napolitano.NAME] = {
            contest: contest.play,
            postRollAbilitySave: postRollAbilitySave,
            postRollAbilityTest: postRollAbilityTest,
            postRollSkill: postRollSkill,
            logNote : api._logNote,
            macros: macros.play,
            tokenCreateEmbeddedDocuments: api._tokenCreateEmbeddedDocuments,
            tooltip : api._tooltip
        }
        game[napolitano.NAME] = {
            contest: contest.play,
            postRollAbilitySave: postRollAbilitySave,
            postRollAbilityTest: postRollAbilityTest,
            postRollSkill: postRollSkill,
            logNote : api._logNote,
            macros: macros.play,
            tokenCreateEmbeddedDocuments: api._tokenCreateEmbeddedDocuments,
            tooltip : api._tooltip
        }
    }

    /**
     * Adds the highlight of the zone to the given scene within the highlight layer
     * @param {string} zoneName - the zone's title
     * @param {string} sceneId - the scene id
     * @param {string} identifier - an identifier that user provides that differentiates this highlight layer from other highlight layers created for this zone
     */
    static async _logNote(message){
        log.record(message);
    }

    static async _tokenCreateEmbeddedDocuments(token, document, data){
        await napolitanoScriptsSocket.executeAsGM("tokenCreateEmbeddedDocuments", token, document, data);
    }
    
    static _registerWindow() {
        $("#napolitano-tooltip-window").remove();
        $("body").append($('<div>').attr('id','napolitano-tooltip-window'));
    }
    
    static async _tooltip(tip){
        const innerHtml = tip ? $('<div>').addClass('app').append(tip) : ''
        $("#napolitano-tooltip-window").html(innerHtml);
        $(innerHtml).fadeIn(200);
    }
}
