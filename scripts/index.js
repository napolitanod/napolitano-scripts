import {napolitano} from "./napolitano-scripts.js";
import {log} from "./log.js";
import {api} from "./api.js";
import {initiateLinking} from "./link-item-resource.js";
import {CONFIGS, EFFECTCONDITIONS, HOOKIDS, setConfigs} from "./constants.js";
import {tokenCreateEmbeddedDocuments, addActiveEffectDerived, addItem, choose, deleteItem, destroyItem, isOwner, killIn, logIt, requestSkillCheck, updateActor, updateItem, updatePrototypeToken, updateToken, useItem, yesNo} from "./helpers.js";
import { workflow } from "./workflow.js";
export let napolitanoScriptsSocket; //var for socketlib
import {HideNPCNames} from "./hideNames.js"
import {buildHud, setHudHelp} from "./hud.js";

Hooks.once('init', async function() { 
    const module = 'napolitano-scripts';
    
    api.register();

    console.log("Napolitano Scripts | Patching rollAbilitySave")
    libWrapper.register(module, "CONFIG.Actor.documentClass.prototype.rollAbilitySave", function(wrapped, ...args) {return wrapped(...args);}, "WRAPPER");
    console.log("Napolitano Scripts | Patching rollAbilityTest")
    libWrapper.register(module, "CONFIG.Actor.documentClass.prototype.rollAbilityTest", function(wrapped, ...args) {return wrapped(...args);}, "WRAPPER");
    console.log("Napolitano Scripts | Patching rollSkill")
    libWrapper.register(module, "CONFIG.Actor.documentClass.prototype.rollSkill", function(wrapped, ...args) {return wrapped(...args);}, "WRAPPER");

    function register(id, name){
        game.settings.register(module, id, { name: name, scope: "world",config: true, default: true, type: Boolean });    
    }
    game.settings.register(module, "log", {
        name: game.i18n.localize("EN.setting.log.label"),
        scope: "world",
        config: true,
        default: "DM Chat Log",
        type: String
    });
    game.settings.register(module, "log-page", {
        name: game.i18n.localize("EN.setting.log-page.label"),
        scope: "world",
        config: true,
        default: '',
        type: String
    });
    game.settings.register(module, "hide-names", {
        name: game.i18n.localize("EN.setting.hide-names.label"),
        scope: "world",
        config: true,
        default: true,
        type: Boolean,
		requiresReload: true
    });
    game.settings.register(module, "marker", {
        name: game.i18n.localize("Turn Marker"),
        hint: game.i18n.localize("Choose turn marker."),
        scope: "world",
        config: true,
        default: '',
        type: String,
        filePicker: "imagevideo"
    });
    game.settings.register(module, "marker-scale", {
        name: game.i18n.localize("Turn Marker Scale"),
        scope: "world",
        config: true,
        default: 1.0,
        type: Number,
        range: {
            min: 0.1,
            max: 10.0,
            step: 0.1
        }
    });
    for(const config of CONFIGS){
        register(config.id, config.name)
    }
 });

Hooks.once('ready', async function() { 
    setConfigs()

    HOOKIDS['dnd5e.preRollSkill'] = Hooks.on("dnd5e.preRollSkill", async (actor, roll, ability) => {
        const hook = "dnd5e.preRollSkill", data = {actor: actor, roll: roll, ability: ability, options: {}}
        if(ability === 'ste') roll = workflow.play('passWithoutTrace', data, {hook: 'preRollSkill'})
     });

    HOOKIDS['dnd5e.rollSkill'] = Hooks.on("dnd5e.rollSkill", async (actor, roll, ability) => {
        const hook = "dnd5e.rollSkill", data = {actor: actor, roll: roll, ability: ability, options: {}}
        workflow.play('checkRoll', data, {hook: 'checkRoll'})
     });

    HOOKIDS['dnd5e.rollAbilitySave'] = Hooks.on("dnd5e.rollAbilitySave", async (actor, roll, ability) => {
        workflow.play('checkRoll', {actor: actor, roll: roll, ability: ability, options: {}}, {hook: 'checkRoll'})
     });
    
    HOOKIDS['dnd5e.rollAbilityTest'] = Hooks.on("dnd5e.rollAbilityTest", async (actor, roll, ability) => {
        const hook = "dnd5e.rollAbilityTest", data = {actor: actor, roll: roll, ability: ability, options: {}}
        workflow.play('checkRoll', data, {hook: 'checkRoll'})
    });

    HOOKIDS['dnd5e.restCompleted'] = Hooks.on('dnd5e.restCompleted', async (actor, options) => {
        const hook = "dnd5e.restCompleted";
        if(options.longRest && game.settings.get("napolitano-scripts", "long-rest")){
            workflow.play('longRest', actor, {hook:hook}); 
        }
        else if(game.settings.get("napolitano-scripts", "short-rest")){
            workflow.play('shortRest', actor, {hook:hook}); 
        }
    }); 

    HOOKIDS['dnd5e.useItem'] = Hooks.on("dnd5e.useItem", async (item, options, data) => {
        const hook = "dnd5e.useItem";
        if(['Counterspell', 'Dispell Magic'].includes(item.name)) workflow.play('powerSurge', {item: item}, {hook: hook})    
    });

    HOOKIDS['napolitano.postRollAbilityTest'] = Hooks.on("napolitano.postRollAbilityTest", async (actor, roll, ability) => {
        const hook = "napolitano.postRollAbilityTest", data = {actor: actor, roll: roll, ability: ability, options: {}}
        if(game.settings.get("napolitano-scripts", "cutting-words")){
            await workflow.playAsync('cuttingWords', data, {hook: hook})
         }
    });

    HOOKIDS['napolitano.postRollSkill'] = Hooks.on("napolitano.postRollSkill", async (actor, roll, ability) => {
        const hook = "napolitano.postRollSkill", data = {actor: actor, roll: roll, ability: ability, options: {}}
        if(game.settings.get("napolitano-scripts", "cutting-words")){
            await workflow.playAsync('cuttingWords', data, {hook: hook})
         }
    });

    HOOKIDS['renderTokenActionHUD'] = Hooks.on('renderTokenActionHUD', async function(hud, html, options = {}){
        const token = canvas.scene.tokens.find(t => t.id === options.actions?.tokenId)
        if(!token) return
        html = setHudHelp(html, token)
        html = buildHud(html, token)
     });

    if(game.user.isGM && game.settings.get("napolitano-scripts", "link-items")) initiateLinking()

    napolitanoScriptsSocket.executeAsGM("logIt", `Napolitano Scripts | ${game.user?.name ?? game.userId} ${socketlib?.modules?.has('napolitano-scripts') ? 'has registered their sockets baby.' : 'failed to register sockets'}`) 
    napolitanoScriptsSocket.executeAsGM("logIt", `Napolitano Scripts | ${game.user?.name ?? game.userId} hooks: `, HOOKIDS) 
});

Hooks.once("midi-qol.midiReady", () => {
    
    HOOKIDS['midi-qol.preItemRoll'] = Hooks.on('midi-qol.preItemRoll', async function(data){
        const hook = "midi-qol.preItemRoll";
        if(game.settings.get("napolitano-scripts", "counterspell") && !data.options?.notCast){
            await workflow.playAsync('counterspell', data, {hook: hook});
        }
        if(game.settings.get("napolitano-scripts", "pack-tactics")){
            workflow.play('packTactics', data, {hook: hook});
        }
        if(game.settings.get("napolitano-scripts", "ancestral-protectors")){
            workflow.play('ancestralProtectors', data, {hook: hook});
        }
    });
    
    HOOKIDS['midi-qol.preambleComplete'] = Hooks.on('midi-qol.preambleComplete', async function(data){
        const hook = "midi-qol.preambleComplete", results = [];
        if(data.templateId && game.settings.get("napolitano-scripts", "template-targeting")){
            workflow.play('templateTargeting', data, {hook: hook});   
        }
        switch(data.item?.name) {
            case 'Eldritch Blast': if(!data.options?.notCast) results.push(workflow.playAsync('eldritchBlast', data, {hook: hook})); break;
            case 'Magic Missile': if(!data.options?.notCast) results.push(workflow.playAsync('magicMissile', data, {hook: hook})); break;
            case 'Scorching Ray': if(!data.options?.notCast) results.push(workflow.playAsync('scorchingRay', data, {hook: hook})); break;
        }
        await Promise.all(results)  
    });

    HOOKIDS['midi-qol.preAttackRoll'] = Hooks.on('midi-qol.preAttackRoll', async function(data){
        const hook = "midi-qol.preAttackRoll";
        if(data.item?.name !== "Hexblade's Curse" && game.settings.get("napolitano-scripts", "hexblades-curse")){
            workflow.play('hexbladesCurse', data, {hook: hook})
        }
        switch(data.item?.name){
            case 'Fanged Bite': workflow.play('fangedBite', data, {hook: hook}); break
        }  
        if(game.settings.get("napolitano-scripts", "warding-flare")){
            await workflow.playAsync('wardingFlare', data, {hook: hook})
        }  
    });

    HOOKIDS['midi-qol.preAttackRollComplete'] = Hooks.on('midi-qol.preAttackRollComplete', async function(data){
        const hook = "midi-qol.preAttackRollComplete", results = [];
        if(game.settings.get("napolitano-scripts", "precision-attack")){
            results.push(workflow.playAsync('precisionAttack', data, {hook: hook}))
        }
        if(game.settings.get("napolitano-scripts", "guided-strike")){
            results.push(workflow.playAsync('guidedStrike', data, {hook: hook}))
        }
        await Promise.all(results)  
        if(game.settings.get("napolitano-scripts", "cutting-words")){
           await workflow.playAsync('cuttingWords', data, {hook: hook})
        }
    });

    HOOKIDS['midi-qol.AttackRollComplete'] = Hooks.on('midi-qol.AttackRollComplete', async function(data){
        const hook = "midi-qol.AttackRollComplete";
    });

    HOOKIDS['midi-qol.preDamageRollComplete'] = Hooks.on("midi-qol.preDamageRollComplete", async (data) => {
        const hook = "midi-qol.preDamageRollComplete", results = [];

        switch(data.item?.name){
             case 'Eldritch Blast': workflow.playAsync('eldritchBlast', data, {hook: hook}); break;
        }

        //wraps damage, do last
        if(game.settings.get("napolitano-scripts", "rayOfEnfeeblement")) results.push(workflow.playAsync('rayOfEnfeeblement', data, {hook: hook}))
                
        if(game.settings.get("napolitano-scripts", "cutting-words")) results.push(workflow.playAsync('cuttingWords', data, {hook: hook}))
        if(game.settings.get("napolitano-scripts", "parry")) results.push(workflow.playAsync('parry', data, {hook: hook}))
        
        await Promise.all(results)
    });

    HOOKIDS['midi-qol.DamageRollComplete'] = Hooks.on("midi-qol.DamageRollComplete", async (data) => {
        const hook = "midi-qol.DamageRollComplete";
        if(data.item?.name !== "Armor of Agathys" && game.settings.get("napolitano-scripts", "armor-of-agathys")){
            workflow.play('armorOfAgathys', data, {hook: hook})
        }
        if(data.item?.name !== "Wild Surge: Retribution" && game.settings.get("napolitano-scripts", "wild-surge")){
            workflow.play('wildSurgeRetribution', data, {hook: hook})
        }
        if(game.settings.get("napolitano-scripts", "ancestral-protectors")){
            workflow.play('ancestralProtectors', data, {hook: hook})
        }
        if(data.item?.name !== "Necrotic Shroud" && game.settings.get("napolitano-scripts", "necrotic-shroud")){
            workflow.play('necroticShroud', data, {hook: hook})
        }
        if(data.item?.name !== "Form of Dread" && game.settings.get("napolitano-scripts", "form-of-dread")){
            workflow.play('formOfDread', data, {hook: hook})
        }
        if(data.item?.name !== "Green-Flame Blade" && game.settings.get("napolitano-scripts", "green-flame-blade")){
            workflow.play('greenFlameBlade', data, {hook: hook})
        }
        if(game.settings.get("napolitano-scripts", "disarming-attack")){
            workflow.play('disarmingAttack', data, {hook: hook}); 
        }
        switch(data.item?.name){
             case 'Hungry Jaws': if(game.settings.get("napolitano-scripts", "hungry-jaws")) workflow.play('hungryJaws', data, {hook: hook}); break;
        }
     });
     
     HOOKIDS['midi-qol.preApplyDynamicEffects'] = Hooks.on('midi-qol.preApplyDynamicEffects', async function(data){
         const hook = "midi-qol.preApplyDynamicEffects";
         switch(data.item?.name){
            case 'Color Spray': workflow.play('colorSpray', data, {hook: hook}); break;
            case 'Lay on Hands': case 'Lay on Hands Pool': workflow.play('layOnHands', data, {hook: hook}); break; 
            case 'Message': workflow.play('message', data, {hook: hook}); break;     
            case 'Sleep': workflow.play('sleep', data, {hook: hook}); break;    
         }     
     });
    
     HOOKIDS['midi-qol.RollComplete'] = Hooks.on("midi-qol.RollComplete", async (data) => {
         const hook = "midi-qol.RollComplete";
         if(data.item?.name !== "Blessed Strikes" && game.settings.get("napolitano-scripts", "blessed-strikes")){
             workflow.play('blessedStrikes', data, {hook: hook});  
         }
        if(data.item?.name !== "Hex" && game.settings.get("napolitano-scripts", "hex")){
            workflow.play('hex', data, {hook: hook})
        }
        if(data.item?.name !== "Hexblade's Curse" && game.settings.get("napolitano-scripts", "hexblades-curse")){
            workflow.play('hexbladesCurse', data, {hook: hook})
        }
        if(data.item?.name !== "Colossus Slayer" && game.settings.get("napolitano-scripts", "colossus-slayer")){
            workflow.play('colossusSlayer', data, {hook: hook})
        }
        if(game.settings.get("napolitano-scripts", "motivational-speech")){
            workflow.play('motivationalSpeech', data, {hook: hook})
        }
        switch(data.item?.name){
             case 'Animate Dead': workflow.play('animateDead', data, {hook: hook}); break;
             case 'Halo of Spores': workflow.play('haloOfSpores', data, {hook: hook}); break;
             case 'Fanged Bite': workflow.play('fangedBite', data, {hook: hook}); break;
             case "Melf's Acid Arrow": workflow.play('melfsAcidArrow', data, {hook: hook}); break;
        }
        workflow.play('checkRoll', {actor: data.actor, roll: data.attackRoll}, {hook: 'checkRoll'})
     });
});

/**
* Register sockets
*/
Hooks.once("socketlib.ready", () => {
    napolitanoScriptsSocket = socketlib.registerModule('napolitano-scripts');
    napolitanoScriptsSocket.register("tokenCreateEmbeddedDocuments", tokenCreateEmbeddedDocuments);
    napolitanoScriptsSocket.register("addActiveEffectDerived", addActiveEffectDerived);
    napolitanoScriptsSocket.register("addItem", addItem);
    napolitanoScriptsSocket.register("choose", choose);
    napolitanoScriptsSocket.register("deleteItem", deleteItem);
    napolitanoScriptsSocket.register("destroyItem", destroyItem);
    napolitanoScriptsSocket.register("killIn", killIn);
    napolitanoScriptsSocket.register("logIt", logIt);
    napolitanoScriptsSocket.register("requestSkillCheck", requestSkillCheck);
    napolitanoScriptsSocket.register("updateActor", updateActor);
    napolitanoScriptsSocket.register("updateItem", updateItem);
    napolitanoScriptsSocket.register("updatePrototypeToken", updatePrototypeToken);
    napolitanoScriptsSocket.register("updateToken", updateToken);
    napolitanoScriptsSocket.register("useItem", useItem);
    napolitanoScriptsSocket.register("yesNo", yesNo);
});

/**
 * Register debug flag with developer mode's custom hook
 */
Hooks.once('devModeReady', ({ registerPackageDebugFlag }) => {
    registerPackageDebugFlag('napolitano-scripts');
});

HOOKIDS['renderChatMessage'] = Hooks.on('renderChatMessage', (message, html, data) => {
    if(game.user.isGM){
        const btn = $(`<a class="" style=""><i class="fas fa-feather" title="${game.i18n.localize('EN.log.button-title')}"></i></a>`);
        html.find('.message-metadata').append(btn);
        btn.click(async e => {
            log.recordChat(message.export());
            btn.css('color', 'Green');
        });
    }
    if(game.settings.get("napolitano-scripts", "hide-names")) HideNPCNames._onRenderChatMessage(message, html, data);
});

HOOKIDS['renderImagePopout'] = Hooks.on("renderImagePopout", (app, html, data) => {
    if(game.settings.get("napolitano-scripts", "hide-names")) HideNPCNames._onRenderImagePopout(app, html, data);
});

HOOKIDS['renderCombatTracker'] = Hooks.on("renderCombatTracker", (app, html, data) => {
    if(game.settings.get("napolitano-scripts", "hide-names")) HideNPCNames._onRenderCombatTracker(app, html, data);
});

HOOKIDS['createToken'] = Hooks.on("createToken", async (document, options, userId) => {
    if(game.user.isGM){
        const hook = "createToken";
        switch(document.name){
            case 'Darkness': workflow.play('darkness', document, {hook: hook}); break;
            case 'Fog Cloud': workflow.play('fogCloud', document, {hook: hook}); break;
        }
    }
});

HOOKIDS['preUpdateToken'] = Hooks.on("preUpdateToken", async (token, update, options, id) => {
    if (game.user.isGM && ("x" in update || "y" in update || "elevation" in update) && token) {
        options[`${napolitano.FLAGS.NAPOLITANO}`] = {start: {x: token.x, y: token.y}, end: {x: (update.x ?? token.x), y: (update.y ?? token.y)}}
    }
});

HOOKIDS['updateToken'] = Hooks.on("updateToken", async (token, update, options, id) => {
    if (game.user.isGM && ("x" in update || "y" in update || "elevation" in update) && options[`${napolitano.FLAGS.NAPOLITANO}`]) {
        workflow.play('tokenMovement', token, {hook: 'updateToken', moveData: options[`${napolitano.FLAGS.NAPOLITANO}`], update: update});
    }
});

HOOKIDS['deleteToken'] = Hooks.on("deleteToken", async (document, options, userId) => {
    if(game.user.isGM){
        const hook = "deleteToken";
        switch(document.name){
            case 'Darkness': workflow.play('darkness', document, {hook: hook}); break;
            case 'Fog Cloud': workflow.play('fogCloud', document, {hook: hook}); break;
        }
    }
});

HOOKIDS['updateActor'] = Hooks.on("updateActor", async (document, data, diff, userId) => {
    const hook = "updateActor"
    if(game.user.isGM){
        if(game.settings.get("napolitano-scripts", "relentless") && diff.oldHpVal && diff.dhp <= -10 && diff.oldHpVal + diff.dhp <= 0){
            workflow.play('relentless', document, {hook: hook});
        }               
        if(game.settings.get("napolitano-scripts", "relentless-endurance") && diff.oldHpVal && diff.dhp !== undefined && diff.oldHpVal + diff.dhp <= 0){
            workflow.play('relentlessEndurance', document, {hook: hook});
        }
    }
});
   
HOOKIDS['updateItem'] = Hooks.on("updateItem", async (data, change, options, userId) => {
    if(game.user.isGM){
        const hook = "updateItem";
        if(game.settings.get("napolitano-scripts", "condition-effects") && EFFECTCONDITIONS.includes(data.name)){
            if("equipped" in change?.system) workflow.play('toggleEffectEffects', data, {hook: hook, activeEffectDelete: !change.system.equipped});
        }
    }
});

HOOKIDS['createActiveEffect'] = Hooks.on("createActiveEffect", async (data, change, options, userId) => {
    if(game.user.isGM){
        const hook = "createActiveEffect";
        if(!data.isSuppressed){
            if(game.settings.get("napolitano-scripts", "condition-effects") && EFFECTCONDITIONS.includes(data.label)) workflow.play('toggleEffectEffects', data, {hook: hook, activeEffectDelete: false});
            switch(data.label){
                case "Cloak of Flies": workflow.play('cloakOfFlies', data, {hook: hook, activeEffectDelete: false}); break;
                case "Spirit Guardians": workflow.play('spiritGuardians', data, {hook: hook, activeEffectDelete: false}); break;
            }
        } 
    }   
});

HOOKIDS['updateActiveEffect'] = Hooks.on("updateActiveEffect", async (data, change, options, userId) => {
    if(game.user.isGM){
        const hook = "updateActiveEffect";
        if(game.settings.get("napolitano-scripts", "condition-effects") && EFFECTCONDITIONS.includes(data.label)){
            if(("disabled" in change || ("label" in change && !data.disabled)) && !data.isSuppressed){
                workflow.play('toggleEffectEffects', data, {hook: hook, activeEffectDelete: change.disabled});
            }
        }
    }
});

HOOKIDS['deleteActiveEffect'] = Hooks.on("deleteActiveEffect", async (data, options, userId) => {
    if(game.user.isGM){
        const hook = "deleteActiveEffect";
        if (game.settings.get("napolitano-scripts", "condition-effects") && EFFECTCONDITIONS.includes(data.label)) workflow.play('toggleEffectEffects', data, {hook: hook, activeEffectDelete: true});
        switch(data.label){
            case "Aura of Vitality": workflow.play('auraOfVitality', data, {hook: hook, activeEffectDelete: true}); break;
            case "Cloak of Flies": workflow.play('cloakOfFlies', data, {hook: hook, activeEffectDelete: true}); break;
            case "Dragon's Breath": workflow.play('dragonsBreath', data, {hook: hook, activeEffectDelete: true}); break;
            case "Spirit Guardians": workflow.play('spiritGuardians', data, {hook: hook, activeEffectDelete: true}); break;
            case 'Torch': workflow.play('torch', data, {hook: hook, activeEffectDelete: true}); break;
        }
    }
});

HOOKIDS['updateCombat'] = Hooks.on('updateCombat', async (combat, update, time, combatId) => {
    if(!combat.started) return
    const hook = "updateCombat";
    workflow.play('pan', combat, {hook:hook}); 
    if(game.user.isGM){
        workflow.play('marker', combat, {hook:hook}); 
        if(game.settings.get("napolitano-scripts", "witch-bolt")) workflow.play('witchBolt', combat, {hook:hook}); 
        if(game.settings.get("napolitano-scripts", "nathairs-mischief")) workflow.play('nathairsMischiefHook', combat, {hook:hook}); 
        if(game.settings.get("napolitano-scripts", "chardalyn")) workflow.play('chardalyn', combat, {hook:hook}); 
        if(time.direction === 1){
            workflow.play('combatTurnUpdateEvents', combat, {hook:hook})
            if(time.advanceTime) workflow.play('combatRoundUpdateEvents', combat, {hook:hook})
        }
    }
});  

HOOKIDS['deleteCombat'] = Hooks.on('deleteCombat', async(combat, options, id) => {
	if(game.user.isGM){
        const hook = "deleteCombat";
        workflow.play('marker', combat, {hook:hook}); 
        workflow.play('deleteCombat', combat, options, {hook:hook})
    }
});

HOOKIDS['getCombatTrackerEntryContext'] = Hooks.on('getCombatTrackerEntryContext', async (html, actionArray) => {
    actionArray.push({
        name: 'EN.context.move-combatant-to-scene.label',
        icon: '<i class="fas fa-arrow-right-to-bracket"></i>',
        condition: (li) => {
          return game.user?.isGM;
        },
        callback: async (li) => {
            await napolitano.moveCombatantToCurrentScene(li.data("combatantId"))
        }
    })
});
