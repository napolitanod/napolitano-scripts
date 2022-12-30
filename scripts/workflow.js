import {napolitano} from "./napolitano-scripts.js";
import {importActorIfNotExists, chat, choose, getActorOwner, promptTarget, getSpellData, isOwner, requestSkillCheck, useItem, wait, yesNo} from "./helpers.js";
import {CONFIGS, EVIL, INCAPACITATEDCONDITIONS, MULTIPLEDAMAGEROLLSPELLS, NAPOLITANOCONFIG, PCS, TEMPLATEMODIFICATION} from "./constants.js";
import {napolitanoScriptsSocket} from "./index.js";
import {macros} from "./macros.js";
import {contest} from './contest.js';
import {note} from "./note.js";

export class framework {
    constructor(ruleset, data, options = {}){
        this.activeEffect = {},
        this.combat= {},
        this.contestData = {
            source: {},
            target: {}
        },
        this.damageData = {
            roll: {},
            original: {}
        },
        this.data = data ?? {},
        this.failedSaves = new Set,
        this.feature = {
            dae: options.dae,
            itemMacro: options.itemMacro,
            hud: options.hud
        },
        this.firstFailedSave = {},
        this.firstHitTarget = {},
        this.firstTarget = {}, 
        this.hitTargets = new Set, //this is a set
        this.item = {},
        this.itemAddData = {
            compendium: {},
            item: {},
            name: '',
            newItems: []
        },
        this.options = options,
        this.proximityTokens = [],
        this.speaker = {},
        this.roll = {},
        this.ruleset = ruleset,
        this.rulesubset = '',
        this.scene = {},
        this.spellLevel = 0,
        this.summonData = {
            callbacks: this._warpgateCallback,
            compendium: {},
            options: {},
            summonedTokens: [],
            table: {},
            tableRollResult: {},
            updates: {}
        },
        this.tableData = {
            compendium: undefined,
            table: undefined,
            roll: undefined
        },
        this.source = {
            actor: {},
            token: {}
        },
        this.targets = new Set,
        this.templateData = {
            id: '',
            location: {}
        },
        this.upcastAmount = 0,
        this.walls = []
    }

    //getters
    get artificerInfusionOptions(){    
        const obj = {'0': 'None'}
        if([PCS.chenju, PCS.wubbub].indexOf(this.source.actor.name) !== -1) {obj['def'] = 'Enhanced Defense'};
        if([PCS.chenju].indexOf(this.source.actor.name) !== -1) {obj['arcana'] = 'Enhanced Arcane Focus'};
        if([PCS.wubbub].indexOf(this.source.actor.name) !== -1) {obj['homunculus'] = 'Homunculus Servant'};
        if([PCS.wubbub].indexOf(this.source.actor.name) !== -1) {obj['repeatingShot'] = 'Repeating Shot'};
        if([PCS.chenju].indexOf(this.source.actor.name) !== -1) {obj['repMag'] = 'Replicate Magic Item'};
        return obj
    }

    get artificerReplicateMagicItemsOptions() {
        const obj = {'0': 'None'}
        if([PCS.chenju].indexOf(this.source.actor.name) !== -1) obj['goggles'] = 'Goggles of Night';
        if([PCS.chenju].indexOf(this.source.actor.name) !== -1) obj['hat'] ='Hat of Wizardry';
        return obj
    }

    get config(){
        return this.rulesubset ? NAPOLITANOCONFIG[this.ruleset][this.rulesubset] : NAPOLITANOCONFIG[this.ruleset]
    }

    get activeEffectDelete(){
        return this.options.activeEffectDelete
    }

    get auraAnyMove0Feet(){
        return Tagger.getByTag('NAP-MOV-ANY-0*', {sceneId: this.scene.id})
    }

    get auraAnyMove10Feet(){
        return Tagger.getByTag('NAP-MOV-ANY-10*', {sceneId: this.scene.id})
    }

    get auraAnyMove15Feet(){
        return Tagger.getByTag('NAP-MOV-ANY-15*', {sceneId: this.scene.id})
    }

    get auraMoveOut(){
        return Tagger.getByTag('NAP-MOV-OUT*', {sceneId: this.scene.id})
    }

    get auraEndOfTurn0Feet(){
        return Tagger.getByTag('NAP-EOT-0*', {sceneId: this.scene.id})
    }

    get auraEndOfTurn5Feet(){
        return Tagger.getByTag('NAP-EOT-5*', {sceneId: this.scene.id})
    }

    get auraStartOfTurn0Feet(){
        return Tagger.getByTag('NAP-SOT-0*', {sceneId: this.scene.id})
    }

    get auraStartOfTurn5Feet(){
        return Tagger.getByTag('NAP-SOT-5*', {sceneId: this.scene.id})
    }

    get auraStartOfTurn10Feet(){
        return Tagger.getByTag('NAP-SOT-10*', {sceneId: this.scene.id})
    }

    get auraStartOfTurn15Feet(){
        return Tagger.getByTag('NAP-SOT-15*', {sceneId: this.scene.id})
    }

    get cantripScale(){
        return this.getCantripScale(this.sourceData.level )
    }

    get currentCombatant(){
        if(!this.hasCombat) return
        return this.combat.scene.getEmbeddedDocument("Token", this.combat.current.tokenId)
    }

    get currentCombatantPlaceable(){
        if(!this.hasCombat) return
        return canvas.tokens.get(this.combat.current.tokenId) ?? {}
    }

    get damageTotal(){
        return this.data?.damageTotal ?? 0
    }

    get failedSavesArray(){
        return Array.from(this.failedSaves)
    }

    get gridDistance(){
        return this.scene.dimensions.distance
    }

    get gridSize(){
        return this.scene.dimensions.size
    }
    
    get hasActor(){
        !Object.keys(this.source.actor).length ? false : true
    }

    get hasCombat(){
        return !Object.keys(this.combat).length ? false : true
    }

    get hasHitTargets(){
        return this.hitTargets.size ? true : false
    }

    get hasItemAddData(){
        return (!this.itemAddData.item || !Object.keys(this.itemAddData.item).length) ? false : true
    }

    get hasTargets(){
        return this.targets.size ? true : false
    }

    get hitTargetsArray(){
        return Array.from(this.hitTargets)
    }

    get hook(){
        return this.options.hook;
    }

    get in24Hours(){
        return (game.time.worldTime + 86400)
    }

    get isCritical(){
        return this.data.isCritical
    }

    get isDamageOnlyWorkflow(){
        return this.data.workflowType === 'DamageOnlyWorkflow' ? true : false
    }

    get isNewTurn(){
        if(!this.hasCombat) return
        return (this.combat.previous.round < this.combat.current.round || 
                (this.combat.previous.round === this.combat.current.round && this.combat.previous.turn < this.combat.current.turn)
            ) ? true : false
    }

    get itemData(){
        if(!this.item) return {}
        return {
            baseSpellLevel: this.item.system.level,
            damageParts: this.item.system.damage?.parts ?? [],
            damageType: this.item.system.damage?.parts?.[0]?.[1],
            dc: this.item.system.save.dc,
            isAttack: ["mwak","rwak","msak","rsak"].includes(this.item.system.actionType) ? true : false,
            isDamage: game.dnd5e.config.damageTypes[this.item.system.damage?.parts?.[0]?.[1]] ? true : false,
            isMeleeAttack: ["mwak","msak"].includes(this.item.system.actionType) ? true : false,
            isMeleeWeaponAttack: this.item.system.actionType ==="mwak" ? true : false,
            isRangedAttack: ["rwak","rsak"].includes(this.item.system.actionType) ? true : false,
            isSpell: this.item.type === 'spell' ? true : false,
            isSpellAttack: ["msak","rsak"].includes(this.item.system.actionType) ? true : false,
            isWeaponAttack: ["mwak","rwak"].includes(this.item.system.actionType) ? true : false,
            mod: this.item.system.ability,
            quantity: this.item.system.quantity,
            requiresConcentration: this.item.system.components?.concentration ? true : false,
            usesMax: this.item.system.uses?.max ?? 0,
            usesRemaining: this.item.system.uses?.value ?? 0
        }
    }

    get marker(){
        return game.settings.get(napolitano.ID, 'marker');
    }

    get moveData(){
        return this.options.moveData
    }

    get name(){
        return this.source.token?.name ?? this.source.actor.name
    }

    get now(){
        return game.time.worldTime
    }

    get previousCombatant(){
        if(!this.hasCombat) return
        return this.combat.scene.getEmbeddedDocument("Token", this.combat.previous.tokenId)
    }

    get sourceData(){
        if(!this.source.actor) return {}
        return {
            arcaneFirearm: this.source.actor.items.filter(i => i.flags[napolitano.FLAGS.NAPOLITANO]?.arcaneFirearm?.selected),
            artificerTools: this.source.actor.items.filter(i => i.flags?.['napolitano-scripts']?.rightToolForTheJob),
            artificerLevel: this.source.actor.classes.artificer?.system?.levels ?? 0,
            charismaMod: this.source.actor.system.abilities.cha.mod,
            constitutionMod: this.source.actor.system.abilities.con.mod,
            disposition: this.source.actor.prototypeToken.disposition,
            druidLevel: this.source.actor.classes.druid?.system?.levels ?? 0,
            experimentalElixirs: this.source.actor.items.filter(i => i.flags[napolitano.FLAGS.NAPOLITANO]?.experimentalElixir),
            hexWarriorWeapon: this.source.actor.items.filter(i => i.flags[napolitano.FLAGS.NAPOLITANO]?.hexWarrior?.selected),
            intelligenceMod: this.source.actor.system.abilities.int.mod,
            infusions: this.source.actor.items.filter(i => i.flags?.[napolitano.FLAGS.NAPOLITANO]?.infusion).concat(this.source.actor.items.filter(i => i.effects.find(e => e.flags?.['napolitano-scripts']?.infusion===true))),
            isConcentrating: this.hasEffect(this.source.actor, 'Concentrating'),
            isEvil: EVIL.includes(this.source.actor.system.details.alignment),
            isRaging: this.hasEffect(this.source.actor, 'Rage'),
            level: this.getLevel(), 
            maxHp: this.source.actor.system.attributes.hp.max,
            owner: getActorOwner(this.source.actor),
            prof: this.source.actor.system.attributes.prof ?? 0,
            race: this.source.actor.system.details.race,
            size: this.getSize(this.source.actor),
            spellAbility: this.source.actor.system.attributes.spellcasting,
            spellAttack: this.source.actor.system.attributes.spelldc - 8,
            spelldc: this.source.actor.system.attributes.spelldc,
            spellMod: this.source.actor.system.attributes.spelldc - this.source.actor.system.attributes.prof - 8,
            superiorityDie: this.source.actor.system.scale?.['battle-master']?.['combat-superiority-die'] ?? '1d8',
            tempHp: this.getTempHP(),
            warlockLevel: this.source.actor.classes.warlock?.system?.levels ?? 0,
            wisdomMod: this.source.actor.system.abilities.wis.mod,
            wizardLevel: this.source.actor.classes.wizard?.system?.levels ?? 0
        }
    }

    get summonedToken(){
        return this.scene.getEmbeddedDocument("Token", this.summonData.summonedTokens[0])
    }

    get summonUpdates(){
        if(!this.source.token) return this.summonData.updates
        return Object.assign(this.summonData.updates, {disposition: this.source.token.disposition})
    }

    get tableRollResult(){
        return this.tableData.roll.roll.result ?? ''
    }

    get tableRollText(){
        return this.tableData.roll.results[0]?.text ?? ''
    }

    get targetsArray(){
        return Array.from(this.targets)
    }

    get template(){
        return this.scene.getEmbeddedDocument('MeasuredTemplate',this.templateId);
    }

    get templateId(){
        return this.templateData.id ?? this.data.templateId
    }

    get templateModification(){
        return TEMPLATEMODIFICATION.find(t => t.name === this.item.name) ?? {}
    }

    get tokenData(){
        if(!this.source.token) return {}
        return {
            disposition: this.source.token.disposition,
            owner: getActorOwner(this.source.token)
        }
    }

    get userId(){
        return this.data.userId ?? game.userId
    }

    get wallData(){
        return {
            dir: this.config.wallData?.dir ?? 0,
            door: this.config.wallData?.door ?? 0,
            ds: this.config.wallData?.ds ?? 0,
            move: this.config.wallData?.move ?? 20,
            sight: this.config.wallData?.sight ?? 20,
            sound: this.config.wallData?.sound ?? 20,
            light: this.config.wallData?.light ?? 20,
            flags: this.config.wallData?.flags ?? {}
        }
    }

    get _warpgateCallback(){
        return {
            pre: async (template, update) => {
                this.generateEffect(template);
                await warpgate.wait(400);
            },
        };
    }

    //{effectName: "Advantage on Next Attack", uuid: value.actor.uuid, origin: value.actor.uuid}
    async addActiveEffect(data = {}){
        await game.dfreds.effectInterface.addEffect(data)
    }

    async addActiveEffectDerived({data = this.itemAddData.item, document = this.source.actor, message = ''}={}){
        const actor = document.actor ?? document
        if(!this.isActor(actor)) return
        const res = await napolitanoScriptsSocket.executeAsGM("addActiveEffectDerived", actor.uuid, data);
        if(res.length) this.message(message ?? `${data.label} was successfully added to ${document.name}.`, {whisper: "GM", title: "Active Effect Added"})
    }

    async addActiveEffectToItem(document, label, changes=[], options = {}){
        let copy = document.toObject();
        copy.effects.push({
            "_id": foundry.utils.randomID(16),
            "changes": changes,
            "disabled": false,
            "duration": {
                "startTime": null,
                "seconds": options.duration ? options.duration : 0
            },
            "icon": "",
            "label": label,
            "transfer": options.transfer ? options.transfer : false,
            flags: options.flags ? options.flags : {},         
            "tint": null
        })
        if(options.ignoreImport){
            copy.flags['ddbimport'] = {"ignoreItemImport": true}
        }
        this.itemAddData.newItems = await this.source.actor.createEmbeddedDocuments('Item', [copy]);
        if(this.source.actor.items.find(i => i.id=== this.itemAddData.newItems[0].id)){
            this.source.actor.deleteEmbeddedDocuments('Item', [document.id])
        }
    }

    async addHeavilyObscured(document, origin){
        if(!this.hasEffect(document, 'Blinded', origin)) {
            await this.addActiveEffect({effectName: 'Blinded', uuid: document.actor.uuid, origin: origin})
            await wait(300)
        }
        if(!this.hasEffect(document, 'Invisible', origin)) {
            await this.addActiveEffect({effectName: 'Invisible', uuid: document.actor.uuid, origin: origin})     
            await wait(300)
        }
    }

    async addInspiration(actor = this.source.actor){
        await actor.update({system:{attributes: {inspiration: true}}});
    }
    
    async addItem({data = this.itemAddData.item, document = this.source.actor, updates = this.config?.updates}={}){
        const actor = document.actor ?? document
        if(!this.isActor(actor)) return
        this.itemAddData.newItems = await napolitanoScriptsSocket.executeAsGM("addItem", actor.uuid,  updates ? Object.assign(data, updates) : data);
        if(this.itemAddData.newItems.length) this.message(`${data.name} was successfully added to ${document.name}.`, {whisper: "GM", title: "Item Added"})
    }

    async addItemName({document = this.source.actor, name = this.itemAddData.name}={}){
        if(!name) return console.log('no item name specified', this)
        if(!this.hasItemAddData) await this.getItemFromCompendium(name);
        if(!this.hasItemAddData) return 
        await this.addItem({document: document})
    }

    async addTag(tag, token = this.source.token){
        await Tagger.setTags(token, tag)
        if(token.isLinked) await Tagger.setTags(token.actor.prototypeToken, tag)
    }

    async appendMessageMQ(message){
         if(this.hook !== 'midi-qol.RollComplete'){
            const counterHookId = Hooks.on("midi-qol.RollComplete", async (workflow) => {
                if(workflow.id !== this.data.id) return
                await this._appendMessageMQ(message)
                Hooks.off("midi-qol.RollComplete", counterHookId);
            });
        } else {
            await this._appendMessageMQ(message)
        }
    }

    async _appendMessageMQ(message){
        const chatMessage = game.messages.get(this.data.itemCardId);
        if(!chatMessage.data.content) return
        let content = duplicate(chatMessage.data.content)
        const searchString =  '<div class="midi-qol-hits-display">';
        const replaceString = `<div class="flexrow 1 napolitano-chat-message-body-black-mq">${message}</div><div class="midi-qol-hits-display">`
        content = content.replace(searchString, replaceString);
        chatMessage.update({content: content});
    }

    async appendRoll(origin, roll, {sign = 1, isAttack = false, isDamage = false, mod = 0}={}){
        const total = (roll ? (roll.total * sign) : 0) + (mod * sign)
        origin._total = origin._total + total
        const operator = new OperatorTerm({operator: (sign === 1 ? "+" : "-")})
        await operator.evaluate()
        if(roll) origin.terms = origin.terms.concat([operator, ...roll.terms])
        if(mod){
            const term = new NumericTerm({number: mod})
            await term.evaluate()
            origin.terms = origin.terms.concat([operator, term])
        }
        origin = Roll.fromTerms(origin.terms)
        await this.updateMQItemCard({roll: origin, isAttack: isAttack, isDamage: isDamage})
        return origin
    }

    itemModifier(item = this.item, document = this.source.actor){
        if(item.system?.ability) return item.system?.ability
        const actor = document.actor ?? document
        if(!this.isActor(actor)) return 'str'
        if(item.system.properties.fin) return(actor.system.abilities.str.mod > actor.system.abilities.dex.mod) ? 'str' : 'dex'
        if(item.system.properties.fir) return 'dex'
        return 'str'
    }

    async buildBoundaryWall(document){
        const walls = []
        const boundary = {
            A: {x: document.x, y: document.y},
            B: {x: document.x + (document.width * this.gridSize), y: document.y + (document.height * this.gridSize)},
            bottom: document.elevation,
            top: document.elevation + document.flags['wall-height']?.tokenHeight ?? 5
        }
            //dangerZone.boundary(document)
        walls.push(this._wall(boundary.A, {x: boundary.B.x, y: boundary.A.y}, boundary.bottom, boundary.top))
        walls.push(this._wall({x: boundary.B.x, y: boundary.A.y}, boundary.B, boundary.bottom, boundary.top))
        walls.push(this._wall(boundary.B, {x: boundary.A.x, y: boundary.B.y}, boundary.bottom, boundary.top))
        walls.push(this._wall({x: boundary.A.x, y: boundary.B.y}, boundary.A, boundary.bottom, boundary.top))
        this.walls = await this.scene.createEmbeddedDocuments("Wall",walls)
    }
 
    cancelSourcePrompt(action = this.ruleset.action?.cancel ?? 'cancels action'){      
        ChatMessage.create({
            user : game.user.id,
            content : `<div class="napolitano-chat-message-title">Action Canceled</div><div class="napolitano-chat-message-body">${this.source.actor.name} ${action}</div>`,
            speaker : this.getSpeaker()
        });  
    }

    async choose(options = [], prompt = ``, title = '', {owner = '', img = '', document = ''} = {}){
        let choice
        if(owner === "GM"){
            choice = await napolitanoScriptsSocket.executeAsGM("choose", options, prompt, title, {img: img})
        } else {
            choice = (
                owner?.id 
                ? await napolitanoScriptsSocket.executeAsUser("choose", owner.id, options, prompt, title,  {img: img}) 
                : await choose(options, prompt, title, {img: img})
                )
        }
        return document ? {document: document, choice: choice} : choice
    }

    async contest(options = {}){
        if(this.targets.size !== 1) return this.error('Please target one token')
        this.contestData = await contest.runSkillContest(options.contestId ?? this.ruleset, this.source.token.uuid, this.firstTarget.uuid, options.overrides ?? {})
    }

    convertToTokenDocument(inSet){
        const newSet = new Set
        inSet.forEach((value) => { 
            value.document?.documentName === 'Token' ? newSet.add(value.document) : newSet.add(value) 
        });
        return newSet
    }

    async damage({
        actor = this.source.actor, 
        flavor = '', 
        token = this.source.token, 
        roll = this.roll, 
        dice = '',
        type = 'none', 
        targets = this.hitTargetsArray, 
        itemData = this.item,
        itemCardId = this.data.itemCardId ?? "new",
        critical = false,
        half = false,
        show = true
    }={}){
        this.damageData.original = dice ? await new Roll(dice).evaluate({async: true}) : roll
        if(critical) this.damageData.original = MidiQOL.doCritModify(this.damageData.original)
        if(show) await this.showRoll(this.damageData.original)
        this.damageData.roll = half ? await this.halfRoll(this.damageData.original) : this.damageData.original
        await new MidiQOL.DamageOnlyWorkflow(
            actor, 
            token, 
            this.damageData.roll.total, 
            type, 
            targets,
            this.damageData.roll, 
            {flavor: flavor ? flavor : `${this.config.name ?? 'Damage'} from ${actor.name} adds ${this.damageData.roll.result} ${type} damage${half ? ' (half ' + this.damageData.original.result + ' damage due to save)' : ''}.`, itemData: itemData, itemCardId: itemCardId }
        );
    }

    dateTimeDescription(timestamp){//returns
        const obj = SimpleCalendar.api.formatDateTime(SimpleCalendar.api.timestampToDate(timestamp));
        return obj.date + ' ' + obj.time
    }

    async deleteEffect(document = this.source.actor, effectName = this.config.name, origin = ''){
        const actor = document.actor ?? document
        if(!this.isActor(actor)) return
        actor.deleteEmbeddedDocuments("ActiveEffect", [this.getEffect(actor, effectName, origin)?.id]); 
    }

    async deleteFlag(flag = '', document = this.source.actor){
        await document.update({[`flags.${napolitano.ID}.${napolitano.FLAGS.NAPOLITANO}.-=${flag}`]: null}) 
    }

    async deleteTemplates(ids = [this.templateData.id]){
        if(this.templateData.id) await this.scene.deleteEmbeddedDocuments("MeasuredTemplate", ids)
    }

    async deleteTokens(ids = [this.firstTarget.id]){
        await this.scene.deleteEmbeddedDocuments("Token", ids)
    }

    async deleteItem({item = this.item, message} = {}){
        await napolitanoScriptsSocket.executeAsGM("deleteItem", item.uuid, message);
    }

    async destroyItem(item = this.item, time = {hours: 1}, message ){
        await napolitanoScriptsSocket.executeAsGM("destroyItem", item.uuid, time, message);
    }

    async effectEndTempHP(document = this.source.actor, name = this.config.name){
        const actor = document.actor ?? document
        if(!this.isActor(actor)) return
        new Dialog({
            title: name,
            content: `<p>${name} ends. Remove remaining Temp HP?</p>`,
            buttons: {
                confirmed: {
                    label: "Yes",
                    callback: () => {
                        this.removeTempHP(actor);
                        this.message(`${name} ceases and ${this.getTempHP(actor)} temp HP are removed from ${actor.name}.`, {title: 'Remove Temp HP'})
                    }
                },
                cancel: {
                    label: "No",
                    callback: () => {
                        this.message(`${name} ceases and ${actor.name} has chosen to manage the remaining ${this.getTempHP(actor)} temp HP manually.`, {title: 'Temp HP Expiring'})
                    }
                }
            }
            }).render(true);
    }

    async error(message){
        ui.notifications.error(message)
    }

    async getBackupCompendium(options={}){
        if(!options.compendiumBackup) return
        let compendium = await game.packs.find(p=>p.title === options.compendiumBackup)?.getDocuments()
        if(!compendium) napolitano.log(false, {message: `compendium backup not found in options`, object: this})
        return compendium
    }

    async getCompendium(options={}){
        let compendium = await game.packs.find(p=>p.title === options.compendium)?.getDocuments();
        if(!compendium) napolitano.log(false, {message: `compendium not found in options`, object: this})
        return compendium
    }

    generateEffect(target, {
            effect = this.config?.effects?.pre ?? {}, 
            sound = this.config?.sounds?.pre ?? {},
            source = this.source.token
        } = {}){     
        let s = new Sequence();
        if(sound.file){
            s = s.sound()
            .file(sound.file)
            if(sound.volume) s = s.volume(sound.volume)
        }
        if(effect.file && target){
            s = s.effect()
                .file(effect.file)
                .name(this.sequencerName(target))
                .scale(effect.scale ?? 1);
                if(effect.duration) {
                    s = effect.stretch ? s.waitUntilFinished(effect.duration) : s.duration(effect.duration).fadeOut(500)
                } else if(effect.persist) {
                    s=s.persist()
                }
                if(effect.stretch) {
                    s = s.atLocation(source)
                    .stretchTo(target)
                } else {
                    s = s.attachTo(target)
                }
                if(effect.wait) s = s.wait(effect.wait)
                if(effect.fadeIn) s = s.fadeIn(effect.fadeIn, {ease: "easeOutCubic"})
                //if(effect.fadeOut) s = s.fadeOut(effect.fadeOut, {ease: "easeOutQuint"})
                if(effect.below) s = s.elevation(target.elevation)
        }
        s.play()
    }

    getActorType(document = this.source.actor){
        const actor = document.actor ?? document
        if(!this.isActor(actor)) return
        return actor.system?.details.type?.value 
    }

    getCantripScale(level = this.sourceData.level){
        if(level >= 17) return 4
        if(level >= 11) return 3
        if(level >= 5) return 2
        return 1
    }

    getCR(document = this.source.actor){
        return (document.actor ? document.actor.system?.details?.cr : document.system?.details?.cr) ?? 0
    }  

    getDistance(tokenA, tokenB){
        return MidiQOL.getDistance(tokenA, tokenB, false, true)
    }

    getSize(document = this.source.actor){
        return (document.actor ? document.actor.system?.traits?.size : document.system?.traits?.size) ?? "med"
    }  

    getEffect(document = this.source.actor, effect = this.config.name, activeOnly = true){
        return document.effects?.find(e => (!activeOnly || (!e.isSuppressed && !e.disabled)) && e.label === effect) 
    }  

    getFlag(document, flag = {}) {
        return document.getFlag(napolitano.ID, napolitano.FLAGS.NAPOLITANO)?.[`${flag}`]
    }

    //item id or name
    getItem(item = this.config.name, document = this.source.actor, options = {}){
        const actor = document.actor ?? document
        if(!this.isActor(actor)) return
        return actor.items?.find(e => (e.id === item || e.name === item) && (!options.type || e.type === options.type))
    }

    async getItemFromCompendium(itemName = this.config?.item?.name){
        this.getItemFromWorld()
        if(this.hasItemAddData) return
        this.itemAddData.compendium = await this.getCompendium(this.config.item);
        if(this.itemAddData.compendium) this.itemAddData.item = this.itemAddData.compendium.find(t=>t.name === itemName) 
        if(!this.hasItemAddData) this.itemAddData.compendium = await this.getBackupCompendium(this.config.item);
        if(this.itemAddData.compendium) this.itemAddData.item = this.itemAddData.compendium.find(t=>t.name === itemName) 
        if(!this.hasItemAddData) console.log(`${itemName} not found in compendium`, this)
    }

    getItemFromWorld(itemName = this.config?.item?.name){
        if(itemName) this.itemAddData.item = game.items.find(t=>t.name === itemName) 
    }

    getItemUsesRemaining(item){
        return item.system.uses?.value ?? 0
    }

    getLevel(document = this.source.actor){
        const actor = document.actor ?? document
        if(!this.isActor(actor)) return
        return actor.type === "character" ? actor.system.details.level : actor.system.details.spellLevel
    }

    getLinkedTokenFromScene(actor = this.source.actor, scene = this.scene){
        return scene.tokens.find(t => t.actor?.id === actor.id && t.isLinked)
    }

    getSpeaker(){
        return Object.keys(this.speaker).length ? this.speaker : ChatMessage.getSpeaker()
    }

    getSpellData({document = this.source.actor, item = this.config.name} = {}){
        const actor = document.actor ?? document
        if(!this.isActor(actor)) return
        return getSpellData(actor, actor.items?.find(i => i.name === item))
    }

    getSpellOptions({itemName = this.config.name, document = this.source.actor }={}){
        const spell = this.getItem(itemName, document)
        if(!spell) return
        const mode = spell.system?.preparation?.mode ?? "use"
        let choices = []  
        if('atwill' === mode){
            choices = [[mode, 'At-Will']]
        }
        else if('innate' === mode && this.getItemUsesRemaining(spell)){
            choices = [[mode, 'Innate']]
        }
        else if((['always', 'pact'].includes(mode) || (mode === 'prepared' && spell.system.preparation.prepared))){
            const spellData = this.getSpellData({document: document, item: itemName})
            if(spellData.canCast){
                choices = spellData.spellLevels.filter(c => c.canCast && c.hasSlots).map(s => [s.level, s.label])
            }
        }
        else if(this.getItemUsesRemaining(spell)){
            choices = [['use', 'Item Use']]
        }
        return choices   
    }

    getSpellSlotsRemaining(level = 1, document = this.source.actor){
        const actor = document.actor ?? document
        if(!this.isActor(actor)) return
        return actor.system?.spells?.[`spell${level}`]?.value ?? 0
    }

    async getTableFromCompendium(){
        this.tableData.compendium = await this.getCompendium(this.config.table);
        if(this.tableData.compendium) this.tableData.table = this.tableData.compendium.find(t=>t.name === this.config.table.name) 
        if(!this.tableData.table) this.tableData.compendium = await this.getBackupCompendium(this.config.table);
        if(this.tableData.compendium) this.tableData.table = this.tableData.compendium.find(t=>t.name === this.config.table.name) 
    }

    getHP(document = this.source.actor){
        return (document.actor ? document.actor.system?.attributes?.hp?.value : document.system?.attributes?.hp?.value) ?? 0
    }

    getInitiative({combat = this.combat, token = this.source.token}={}){
        if(!this.combat?.combatants) return
        return combat.combatants.find(c => c.token.id === token.id)?.initiative ?? 0
    }

    getMaxHP(document = this.source.actor){
        return (document.actor ? document.actor.system?.attributes?.hp?.max : document.system?.attributes?.hp?.max) ?? 0
    }

    getTempHP(document = this.source.actor){
        return (document.actor ? document.actor.system?.attributes?.hp?.temp : document.system?.attributes?.hp?.temp) ?? 0
    }

    async halfRoll(roll = this.roll){
        roll = await new Roll(`${Math.floor(roll.total/2)}`).evaluate({async: true})
        return roll
    }

    hasEffect(document = this.source.actor, effect = this.config.name, origin = ''){
        const actor = document.actor ?? document
        if(!this.isActor(actor)) return
        return actor.effects.find(e => !e.disabled && e.label === effect && (!origin || e.origin === origin)) ? true : false
    }  

    hasImmunity(document = this.source.actor, immunity = this.config.name){
        const actor = document.actor ?? document
        if(!this.isActor(actor)) return
        return actor.system?.traits.ci.value.find(i=> i === immunity.toLowerCase()) ? true : false
    }

    //item id or name
    hasItem({itemName = this.config.name, document = this.source.actor, options = {}} = {}){
        let has = true
        const item = this.getItem(itemName, document, options)
        if(!item || (options.uses && !item.system.uses.value && item.system.uses.max)) has = false
        return has
    }

    hasMaxHP(document = this.source.actor){
        return this.getHP(document) >= this.getMaxHP(document) ? true : false
    }

    hasOccurredOnce({document = this.source.actor, flag = this.ruleset, id = this.firstHitTarget.id}={}){
        const actor = document.actor ?? document
        if(!this.isActor(actor)) return
        const last = this.getFlag(actor, flag)?.[`${id}`] 
        return (last.time > this.now || (last.time === this.now && last.turn >= this.combat.current.turn)) ? true : false
    }

    async heavilyObscure({target = this.firstTarget, origin = this.source.actor.uuid, source = this.source.token}={}){ 
        switch(this.hook){
            case 'napolitano-aura': 
                if(target.id === source.id) {
                    this.tokensInProximity(source, 0)
                    for(const token of this.scene.tokens){
                        if (token.id !== source.id) {
                            this.proximityTokens.find(t=> t.id === token.id) ? await this.addHeavilyObscured(token, origin) :  await this.removeHeavilyObscured(token, origin) 
                        }
                    }
                } else {
                    await this.addHeavilyObscured(target, origin) 
                }
                break;
            case 'createToken':
                this.tokensInProximity(source, 0)
                for(const token of this.proximityTokens){
                    if (token.id !== source.id) await this.addHeavilyObscured(token, origin) 
                }
                break;
            case 'napolitano-aura-off':
                await this.removeHeavilyObscured(target, origin) 
                break;
            case 'deleteToken':
                for(const token of this.scene.tokens){
                    await this.removeHeavilyObscured(token, origin) 
                }
                break;
        } 
    }

    async promptTarget({title = this.config.name, prompt = this.config.prompt, event = '', owner = '', origin = this.source.token}={}){
        let choice
        if(owner === "GM"){
            choice = await napolitanoScriptsSocket.executeAsGM("promptTarget", {title: title, prompt: prompt, origin: origin, event: event})
        } else {
            choice = 
            owner?.id ? await napolitanoScriptsSocket.executeAsUser("promptTarget", owner.id, {title: title, prompt: prompt, origin: origin, event: event}) 
            : await promptTarget({title: title, prompt: prompt, origin: origin, event: event})
        }
        return choice
    }

    async setOccurredOnce({document = this.source.actor, flag = this.ruleset, id = this.firstHitTarget.id}={}){
        const actor = document.actor ?? document
        if(!this.isActor(actor)) return
        await this.setFlag(actor, {[flag]: {[id]: {time: this.now, turn: this.combat.current.turn}}})      
    }

    async info(message){
        ui.notifications.info(message)
    }

    _initializePre(){
        if(!Object.keys(this.scene).length) this.scene = canvas.scene
    }

    _initializePost(){
        if(this.templateId && this.scene) Object.assign(this.templateData, {id: this.templateId, location: {x:this.template?.x, y:this.template?.y}})    
        if(this.hasTargets) this.firstTarget = this.targets.values().next().value
        if(!this.combat || !Object.keys(this.combat).length) this.combat = game.combats.find(c => c.isActive === true)
    }

    isActor(actor = {}){
        return actor?.documentName === 'Actor' ? true : false
    }

    isOwner(token = this.source.token){
        return isOwner(token)
    }
    
    isResponsive(document = this.source.actor){
        const actor = document.actor ?? document
        if(!this.isActor(actor)) return
        return actor.effects.find(e => !e.disabled && INCAPACITATEDCONDITIONS.includes(e.label)) ? false : true
    } 

    async killIn(tokens, time){
        await napolitanoScriptsSocket.executeAsGM("killIn", tokens, time);
    }

    async logNote(message){
        note.record(message);
    }

    message(message, options = {}){    
        message =`<div class="napolitano-chat-message-body">${message}</div>`;
        if(options.title) message = `<div class="napolitano-chat-message-title">${options.title}</div>` + message 
        chat(message, {user : this.userId, speaker : this.getSpeaker(), ...options})
    }

    async randomDirection(){
        const directionRoll = await new Roll(`1d8`).evaluate({async: true})
        switch(directionRoll.result){
            case '1': return 'north';
            case '2': return 'northeast';
            case '3': return 'east';
            case '4': return 'southeast';
            case '5': return 'south';
            case '6': return 'southwest';
            case '7': return 'west';
            case '8': return 'northwest';
        }
    }

    async recheckHits(){
        await this.data.checkHits();
        await this.data.displayAttackRoll(true);
        await this.data.displayHits(false, true);
    }

    async recurItemUse(maxTargets = 2, item = this.item){
        const targetSets = [];
        let remainingTargets = maxTargets - this.targets.size, more = true, warning = '';
        if(game.user.targets.size) targetSets.push(game.user.targets.ids)
        while(remainingTargets > 0 && more){
            const response = await this.yesNo({title: `${item.name} Targets`, time: 0, prompt: `${warning}${maxTargets - remainingTargets} targets acquired.<br>You have ${remainingTargets} targets left.<br>Choose your next target and select 'Yes'.`})
            if(response){
                if(remainingTargets - game.user.targets.size < 0){
                    warning = `You currently have too many targets selected on the canvas (${game.user.targets.size}).<br>`
                } else {
                    warning = ''
                    remainingTargets = remainingTargets - game.user.targets.size
                    if(game.user.targets.size) targetSets.push(game.user.targets.ids)
                }
            }
            else {
                more = false;
                game.user.updateTokenTargets([])
            }
        }
        game.user.updateTokenTargets(targetSets.pop())
        const counterHookId = Hooks.on("midi-qol.RollComplete", async (workflow) => {
            if(workflow.id !== this.data.id) return
            for(const target of targetSets){
                game.user.updateTokenTargets(target)
                await this.useItem(item, '', {configureDialog: false, notCast: true}, {consumeSpellSlot: false, consumeSpellLevel: false})
            }
            Hooks.off("midi-qol.RollComplete", counterHookId);
        });
    }

    async removeConcentration(document = this.source.actor){
        await this.deleteEffect(document, "Concentrating")
    }

    async removeHeavilyObscured(document, origin){
        if(this.hasEffect(document, 'Blinded', origin)) {
            await this.deleteEffect(document.actor, 'Blinded', origin)
            await wait(300)
        }
        if(this.hasEffect(document, 'Invisible', origin)) {
            await this.deleteEffect(document.actor, 'Invisible', origin) 
            await wait(300) 
        }  
    }

    async removeTag(tag, token = this.source.token){
        await Tagger.removeTags(token, tag)
        if(token.isLinked) await Tagger.removeTags(token.actor.prototypeToken, tag)
    }

    async removeTempHP(document = this.source.actor){
        await document.update({"system.attributes.hp.temp" : 0});
    }
    
    static async _removeTokenAnimation(sequencerName) {
        Sequencer.EffectManager.endEffects({name: sequencerName})
    }

    async rollBardicInspiration({document = this.source.actor, show=true}={}){
        const actor = document.actor ?? document
        if(!this.isActor(actor)) return
        const dice = `1${actor.system.scale.bard.inspiration}`
        const result = await new Roll(dice).evaluate({async: true})
        if(show) this.showRoll(result)
        return result
    }

    async rollCheck(document = this.firstTarget, {dc = this.sourceData.spelldc, source = this.item.name, type = 'str', chatMessage = false, show = false, fastforward = true, disadvantage = false, advantage = false, flavor = ''} = {}){
        const checkName = CONFIG.DND5E.abilities[type];
        const actor = document.actor ?? document
        if(!this.isActor(actor)) return
        const checkRoll = await actor.rollAbilityTest(type, {flavor: flavor ?? `${checkName} DC ${dc} ${source}`, chatMessage:chatMessage, fastForward: fastforward, advantage: advantage, disadvantage: disadvantage })  
        const success = checkRoll.total >= dc ? true : false
        if(show) await this.showRoll(checkRoll)
        this.message(`${document.name} ${success ? 'succeeds' : 'fails'} their ${checkName} check with a roll of ${checkRoll.total}`, {title: `${source} Ability Check Result`}) 
        return {success: success, roll: checkRoll, document: document, actor: actor}
    }

    async rollDice(dice, {show=true, toWorkflow=true}={}){
        const roll = await new Roll(dice).evaluate({async: true})
        if(toWorkflow) this.roll = roll
        if(show) this.showRoll(roll)
        return roll
    }

    async rollSave(document = this.firstTarget, {dc = this.sourceData.spelldc, source = this.item.name, type = 'str', chatMessage = false, show = false, fastforward = true, disadvantage = false, advantage = false, flavor = ''} = {}){
        const saveName = CONFIG.DND5E.abilities[type];
        const actor = document.actor ?? document
        if(!this.isActor(actor)) return
        const saveRoll = await actor.rollAbilitySave(type, {flavor: flavor ?? `${saveName} DC ${dc} ${source}`, chatMessage:chatMessage, fastForward: fastforward, advantage: advantage, disadvantage: disadvantage })  
        const success = saveRoll.total >= dc ? true : false
        if(show) await this.showRoll(saveRoll)
        this.message(`${document.name} ${success ? 'succeeds' : 'fails'} their ${saveName} save with a roll of ${saveRoll.total}`, {title: `${source} Saving Throw Result`}) 
        return {success: success, roll: saveRoll, document: document, actor: actor}
    }

    async rollSaveDamage(document = this.firstTarget, {damage = 'half', dc = this.sourceData.spelldc, source = this.item.name, type = 'str', fastforward = true, disadvantage = false, advantage = false, flavor = ''} = {}, damageData){
        const result = await(this.rollSave(document, {dc: dc, source: source, type:type, fastforward: fastforward, disadvantage: disadvantage, advantage: advantage, flavor: flavor}))
        if(result.success && damage === 'none') return result
        if(damageData && (!result.success || damage !== 'none')) await this.damage(Object.assign(damageData, {half: result.success && damage === 'half' ? true : false}))
        return result
    }

    async rollSkill(options, prompt, document = this.source.actor){
        const actor = document.actor ?? document
        if(!this.isActor(actor)) return
        const owner = getActorOwner(actor)
        if(owner === 'GM'){
            this.roll = await napolitanoScriptsSocket.executeAsGM( "requestSkillCheck",actor.uuid, options, prompt) 
        } else {
            this.roll = (owner ? await napolitanoScriptsSocket.executeAsUser("requestSkillCheck", owner.id, actor.uuid, options, prompt) : await requestSkillCheck(actor.uuid, options, prompt))
        }
        if(this.roll.class) this.roll = Roll.fromData(this.roll) 
        return this.roll
    }

    async rollSuperiorityDie({show=true}={}){
        const result = await new Roll(this.sourceData.superiorityDie).evaluate({async: true})
        if(show) this.showRoll(result)
        return result
    }
    
    async rollTable(){
        if(!this.tableData.table) await this.getTableFromCompendium()
        if(this.tableData.table) {
            this.tableData.roll = await this.tableData.table.roll()
            this.showTableRoll()
        }
    }

    async say(){
        if(this.config.saying?.macro) await tokenSays.says(this.source.token.id, this.source.actor.id, this.config.saying.macro)
    }

    async setFlag(document, flag = {}) {
        await document.setFlag(napolitano.ID, napolitano.FLAGS.NAPOLITANO,flag)
    }

    setFailedSaves(failedSaves){
        const t = Array.isArray(failedSaves) ? new Set (failedSaves) : failedSaves
        this.failedSaves = this.convertToTokenDocument(t)
        if(this.failedSaves.size) this.firstFailedSave = this.failedSaves.values().next().value
    }

    setHitTargets(hitTargets){
        const t = Array.isArray(hitTargets) ? new Set (hitTargets) : hitTargets
        this.hitTargets = this.convertToTokenDocument(t)
        if(this.hasHitTargets) this.firstHitTarget = this.hitTargets.values().next().value
    }

    setItem(item = this.config.name, document = this.source.actor){
        this.item = this.getItem(item, document)
        return this.item
    }

    setMidiRollAdvantage(){
        this.data.advantage = true
    }

    setMidiRollDisadvantage(){
        this.data.disadvantage = true
    }

    setMidiRollIsCritical(){
        this.data.rollOptions.critical = true
    }

    sequencerName(target){
        return `${target.name}_${target.id}_napolitanoScripts_${this.ruleset}`
    }

    async setInitiative({token = this.source.token, combat = this.combat, initiative = 0}={}){
        if(!Object.keys(this.combat).length) return
        if(!combat.combatants.find(c => c.token.id === token.id)) await canvas.tokens.get(token.id).toggleCombat(this.combat)
        await combat.setInitiative(combat.combatants.find(c => c.token.id === token.id).id, initiative)
    }

    setUserTargetsWithTargets(){
        game.user.updateTokenTargets(this.targetsArray.map(c => c.id))
    }

    async showRoll(roll = this.roll){
        await game.dice3d?.showForRoll(roll)
    }

    async showTableRoll(){
        await game.dice3d?.showForRoll(this.tableData.roll.roll)
    }

    stringParameterReplace(string, options = {}){
        return string.replace('@firstTarget.name', this.firstTarget.name ?? '')
            .replace('@direction', options.direction ?? '')
    }

    async summon(options={}){
        let actor = options.name ?? this.config.name
        if(options.table) {
            await this.rollTable()
            actor = this.tableRollText
        }
        await importActorIfNotExists(actor);     
        this.summonData.summonedTokens = this.templateData.id ? await warpgate.spawnAt({x: this.templateData.location.x + (this.gridSize * game.actors.getName(actor).prototypeToken.width/2), y: this.templateData.location.y + (this.gridSize * game.actors.getName(actor).prototypeToken.height/2)}, actor, this.summonUpdates, this.summonData.callbacks, this.summonData.options) : await warpgate.spawn(actor, this.summonUpdates, this.summonData.callbacks, this.summonData.options);
        napolitano.log(false, `Summon ${actor}...`,this);
        if(this.config.killIn) this.killIn(this.summonData.summonedTokens, this.config.killIn)
    }

    targetWithTemplate(){
        MidiQOL.selectTargetsForTemplate({x: this.template.data.x, y: this.template.data.y, shape: this.template.object.shape, distance: this.template.data.distance })
    }

    //used to add documents to tokens a player doesn't own
    async tokenCreateEmbeddedDocuments(token, document, data){
        await napolitanoScriptsSocket.executeAsGM("tokenCreateEmbeddedDocuments", token, document, data);
    }

    tokensInProximity(target = this.firstHitTarget, prox = 5){
        const d = this.gridSize / (this.gridDistance / prox);
        const A = {x: target.x - d, y: target.y - d, z: target.elevation - prox};
        const B = {x: target.x + ((this.gridSize * target.width) + d), y: target.y + ((this.gridSize * target.height) + d), z: target.elevation + prox}
        this.proximityTokens = dangerZone.tokensInBoundary(A, B);
    }

    async updateActor({document = this.source.actor, data = {}} = {}){
        await napolitanoScriptsSocket.executeAsGM("updateActor", document.actor?.uuid ?? document.uuid, data);
    }

    async updateActorSpellLevel(amt, lvl, document = this.source.actor){
        const actor = document.actor ?? document
        if(!this.isActor(actor)) return
        const path = `${lvl === 'pact' ? 'pact' : 'spell' + lvl}`;
        const after = actor.system.spells[path].value + amt
        if(after > actor.system.spells[path].max || after < 0) return console.log(`Spell level update bypassed due to update being outside of the min or max threshold`)
        await napolitanoScriptsSocket.executeAsGM("updateActor", actor.uuid, {system: {spells: {[path]: {value: after}}}});
        return after
    }

    async updateItem(data, item = this.item){
        await napolitanoScriptsSocket.executeAsGM("updateItem", item.uuid, {_id: item.id, ...data});
    }

    async updateItemUses(amt, item = this.item){
        const after = item.system.uses.value + amt;
        if(after > item.system.uses.max || after < 0) return console.log(`Item use update bypassed due to update putting outside of threshold`)
        await napolitanoScriptsSocket.executeAsGM("updateItem", item.uuid, {_id: item.id, system: {uses: {value: after}}});
        return after
    }

    async updateMQItemCard({roll = this.roll, isAttack = false, isDamage = false}={}){
        if(isAttack) {
            this.data.attackTotal = roll._total
            await this.data.setAttackRoll(roll)
            await this.data.displayAttackRoll(true, { GMOnlyAttackRoll: true });
        }
        if(isDamage) {
            await this.data.setDamageRoll(roll)
            await this.data.displayDamageRoll(true)
        }
    }

    async updateSpellUse(amt, slot, {itemName = this.config.name, document = this.source.actor}={}){
        const actor = document.actor ?? document
        if(!this.isActor(actor)) return
        const spell = this.getItem(itemName, actor)
        const lvl = !['atwill', 'innate', 'use'].includes(slot) ? (slot === 'pact' ? actor.system.spells.pact.level : Number(slot)) : spell.system.level
        const updated = spell.system.preparation.mode === 'atwill' ? 1 : (spell.system.preparation.mode.includes(['innate','use']) ? await this.updateItemUses(amt, spell) :  await this.updateActorSpellLevel(amt, slot, actor))             
        return {updated: updated, lvl: lvl}
    }

    async revertDetection({document = this.source.token ?? this.source.actor, trackingId = ''}={}){
        function updateData(oldFlag, detectionModes){
            const diff = detectionModes.find(d => d.id === oldFlag.new.id && d.range === oldFlag.new.range && d.enabled === oldFlag.new.enabled) 
            return !diff ? false : (Object.keys(oldFlag.old).length ? oldFlag.old : {id: oldFlag.new.id, delete: true})
        }
        const flag = {[`${napolitano.ID}.detectionModes.-=${trackingId}`]: null}
        const actor = document.actor ?? document
        if(!this.isActor(actor)) return
        const actorFlag = actor.flags[`${napolitano.ID}`]?.detectionModes?.[`${trackingId}`]

        if(document.documentName === 'Token') {
            const tokenFlag = document.flags[`${napolitano.ID}`]?.detectionModes?.[`${trackingId}`] ?? actorFlag
            if(tokenFlag){
                const tokenData = updateData(tokenFlag, document.detectionModes)
                if (tokenData) await this._updateDetectionToken({document: document, data: tokenData, trackingId: trackingId, flag: flag})
            }
            if(!document.isLinked) return
        }

        if(actorFlag){
            const actorData = updateData(actorFlag, actor.prototypeToken.detectionModes)
            if (actorData) await this._updateDetectionActor({document: actor, data: actorData, trackingId: trackingId, flag: flag})
        }
    }

    async updateDetection({document = this.source.token ?? this.source.actor, data={}, trackingId = '', flag = ''}={}){
        if(document.documentName === 'Token') {
            await this._updateDetectionToken({document: document, data: data, trackingId: trackingId, flag: flag})
            if(!document.isLinked) return
        }
        await this._updateDetectionActor({document: document, data: data, trackingId: trackingId, flag: flag})
    }

    async _updateDetectionActor({document = this.source.actor, data={}, trackingId = '', flag = ''}={}){
        const actor = document.actor ?? document
        if(!this.isActor(actor)) return
        const actorFlag = flag ? flag : {[`${napolitano.ID}`]: {detectionModes: {[`${trackingId}`]: {
            new: data,
            old: deepClone(actor.prototypeToken.detectionModes.find(d => d.id === data.id) ?? {})
        }}}}
        const retain = actor.prototypeToken.detectionModes.filter(d => d.id !== data.id)
        const detectionModes = data.delete ? retain : [...retain, data]
        if(trackingId) await this.updateActor({document: actor, data: {_id: actor.id, flags: actorFlag}})
        await this.updatePrototypeToken({document: actor, data: {_id: actor.id, detectionModes: detectionModes}})
    }

    async _updateDetectionToken({document = this.source.token, data={}, trackingId = '', flag = ''}={}){
        const tokenFlag = flag ? flag : {[`${napolitano.ID}`]: {detectionModes: {[`${trackingId}`]: {
            new: data,
            old: deepClone(document.detectionModes.find(d => d.id === data.id) ?? {})
        }}}}
        const retain = document.detectionModes.filter(d => d.id !== data.id)
        const detectionModes = data.delete ? retain : [...retain, data]
        const tokenUpdate = trackingId ? {flags: tokenFlag, detectionModes: detectionModes} : {detectionModes: detectionModes}
        await this.updateToken({document: document, data: {_id: document.id, ...tokenUpdate}})
    }

    async revertSight({document = this.source.token ?? this.source.actor, trackingId = ''}={}){
        function updateData(oldFlag, sight){
            const diff = Object.fromEntries(Object.entries(oldFlag.new).filter(n => n[1] === sight[n[0]]))
            return Object.fromEntries(Object.entries(oldFlag.old).filter(o => diff[o[0]] !== undefined))
        }
        const flag = {[`${napolitano.ID}.sight.-=${trackingId}`]: null}
        const actor = document.actor ?? document
        if(!this.isActor(actor)) return
        const actorFlag = actor.flags[`${napolitano.ID}`]?.sight?.[`${trackingId}`]

        if(document.documentName === 'Token') {
            const tokenFlag = document.flags[`${napolitano.ID}`]?.sight?.[`${trackingId}`] ?? actorFlag
            if(tokenFlag){
                const tokenData = updateData(tokenFlag, document.sight)
                if(Object.keys(tokenData).length) await this._updateSightToken({document: document, data: tokenData, trackingId: trackingId, flag: flag})
            }
            if(!document.isLinked) return
        }

        if(actorFlag){
            const actorData = updateData(actorFlag, actor.prototypeToken.sight)
            if(Object.keys(actorData).length) await this._updateSightActor({document: actor, data: actorData, trackingId: trackingId, flag: flag})
        }
    }

    async updateSight({document = this.source.token ?? this.source.actor, data={}, trackingId = '', flag = ''}={}){
        if(document.documentName === 'Token') {
            await this._updateSightToken({document: document, data: data, trackingId: trackingId, flag: flag})
            if(!document.isLinked) return
        }
        await this._updateSightActor({document: document, data: data, trackingId: trackingId, flag: flag})
    }

    async _updateSightActor({document = this.source.actor, data={}, trackingId = '', flag = ''}={}){
        const actor = document.actor ?? document
        if(!this.isActor(actor)) return
        const actorFlag = flag ? flag : {[`${napolitano.ID}`]: {sight: {[`${trackingId}`]: {
            new: data,
            old: JSON.parse(JSON.stringify(actor.prototypeToken.sight))
        }}}}
        if(trackingId) await this.updateActor({document: actor, data: {_id: actor.id, flags: actorFlag}})
        await this.updatePrototypeToken({document: actor, data: {_id: actor.id, sight: data}})
    }

    async _updateSightToken({document = this.source.token, data={}, trackingId = '', flag = ''}={}){
        const tokenFlag = flag ? flag : {[`${napolitano.ID}`]: {sight: {[`${trackingId}`]: {
            new: data,
            old: JSON.parse(JSON.stringify(document.sight))
        }}}}
        const tokenUpdate = trackingId ? {flags: tokenFlag, sight: data} : {sight: data}
        await this.updateToken({document: document, data: {_id: document.id, ...tokenUpdate}})
    }

    async updatePrototypeToken({document = this.source.actor, data = {}} = {}){
        await napolitanoScriptsSocket.executeAsGM("updatePrototypeToken", document.actor?.uuid ?? document.uuid, data);
    }

    async updateToken({document = this.source.token, data = {}} = {}){
        await napolitanoScriptsSocket.executeAsGM("updateToken", document.uuid, data);
    }

    async useItem(item, owner = '', options = {}, config = {}){
        let result
        if(owner === "GM"){
            result = await napolitanoScriptsSocket.executeAsGM("useItem", item.uuid, options, config)
        } else {
            result = 
            owner?.id ? await napolitanoScriptsSocket.executeAsUser("useItem", owner.id, item.uuid, options, config) 
            : await useItem(item.uuid, options, config)
        }
        return result
    }

    _wall(start, end, bottom = 0, top = 0){
        let wall = {
            c:[start.x, start.y, end.x, end.y],
            dir: this.wallData.dir,
            door: this.wallData.door,
            ds: 0,
            move: this.wallData.move,
            sight: this.wallData.sense,
            sound: this.wallData.sound,
            light: this.wallData.light,
            flags: this.wallData.flags
        }
        if(bottom || top) wall.flags['wallHeight'] = {wallHeightTop: top-1, wallHeightBottom: bottom}
        return wall;
    } 

    async warn(message){
        ui.notifications.warn(message)
    }

    async rerollReplace(origin, {keep = 'highest', isAttack = false, isDamage = false} = {}){
        const newRollResult = await this.rollDice('1d20', {toWorkflow: false})
        const currentDieIndex = origin.terms.findIndex(d => d.faces === 20)
        const currentDie = origin.terms[currentDieIndex]
        if(keep === 'lowest' && currentDie && currentDie.total > newRollResult.total) {
            origin._total = origin._total - (currentDie.total - newRollResult.total)
            origin.terms[currentDieIndex] = newRollResult.terms[0]
            origin = Roll.fromTerms(origin.terms)
            await this.updateMQItemCard({roll: origin, isAttack: isAttack, isDamage: isDamage})
        }
        return {origin: origin, new: newRollResult}
    }

    async wrapRoll(origin, {mod = 2, isAttack = false, div = false}={}){
        const numerator = new NumericTerm({number: origin.total})
        await numerator.evaluate()
        const operator = new OperatorTerm({operator: (div ? "/" : "*")})
        await operator.evaluate()
        const term = new NumericTerm({number: mod})
        await term.evaluate()
        origin.terms = [numerator,operator, term]
        origin = Roll.fromTerms(origin.terms)
        await this.updateMQItemCard({roll: origin, isAttack: isAttack, isDamage: isDamage})
        return origin
    }

    async yesNo({title = this.config.name, prompt = this.config.prompt, owner = '', document = false, img = this.item?.img, time = 20000}={}){
        let choice
        if(owner === "GM"){
            choice = await napolitanoScriptsSocket.executeAsGM("yesNo",title, prompt, {img: img, time: time})
        } else {
            choice = 
            owner?.id ? await napolitanoScriptsSocket.executeAsUser("yesNo", owner.id, title, prompt, {img: img, time: time}) 
            : await yesNo(title, prompt, {img: img, time: time})
        }
        return document ? {document: document, yes: choice} : choice
    }
}

/**
 * Workflow handles auto generated / hook based flows
 */
export class workflow extends framework {
    constructor(...args){
        super(...args)
    }

    //internal functions
    async _initialize(){
        super._initializePre()
        switch(this.hook){
            case 'midi-qol.preTargeting':
                this.targets = this.convertToTokenDocument(game.user.targets);
                this.item = this.data.item ?? {};
                this.source.token = this.scene.getEmbeddedDocument("Token", this.data.tokenId);
                this.source.actor = this.data.actor ?? {};
                break
            case 'midi-qol.preItemRoll':
            case 'midi-qol.preambleComplete':
            case 'midi-qol.preAttackRoll':
            case 'midi-qol.preAttackRollComplete':
            case 'midi-qol.AttackRollComplete':
            case 'midi-qol.preCheckHits':
            case 'midi-qol.preDamageRoll':
            case 'midi-qol.preDamageRollComplete':
            case 'midi-qol.DamageRollComplete': 
            case 'midi-qol.RollComplete': 
            case 'midi-qol.preApplyDynamicEffects':  
                    this.targets = this.convertToTokenDocument(this.data.targets);
                    this.setHitTargets(this.data.hitTargets);
                    this.setFailedSaves(this.data.failedSaves)
                    this.item = this.data.item ?? {};
                    this.source.token = this.scene.getEmbeddedDocument("Token", this.data.tokenId);
                    this.source.actor = this.data.actor ?? {};
                    this.spellLevel = this.data.spellLevel === undefined ? (this.data.itemLevel ?? 0) : this.data.spellLevel;
                    this.upcastAmount = this.spellLevel ? this.spellLevel - this.itemData.baseSpellLevel: 0;
                break;
            case 'preCreateActiveEffect':
            case 'createActiveEffect':
            case 'deleteActiveEffect':
            case 'updateActiveEffect':
                    this.activeEffect = this.data;
                    this.scene = this.data.parent?.token?.parent ?? this.scene,
                    this.source.actor = this.data.parent ?? {} 
                    this.source.token = this.data.parent?.token ? this.data.parent.token : this.getLinkedTokenFromScene()
                break;
            case 'updateCombat': 
                    this.combat = this.data;
                    this.scene = this.combat.scene ?? canvas.scene;
                    this.source.token = this.scene.getEmbeddedDocument("Token", this.combat.current.tokenId);
                    this.source.actor = this.source.token.actor ?? {};
                break;
            case 'deleteCombat': 
                    this.combat = this.data;
                    this.scene = this.combat.scene ?? canvas.scene;
                break;
            case 'updateActor':
                    this.source.actor = this.data ?? {};
                break;
            case 'updateItem':
                    this.item = this.data;
                    this.source.actor = this.item.actor;
                    this.source.token = this.getLinkedTokenFromScene()
                break;
            case 'updateToken':
            case 'createToken':
            case 'deleteToken':
                    this.source.token = this.data ?? {};
                    this.source.actor = this.source.token.actor ?? {};
                break;
            case 'dnd5e.useItem':
                    this.item = this.data.item;
                    this.source.actor = this.item.actor
                break;
            case 'dnd5e.restCompleted': 
                    this.source.actor = this.data ?? {};
                break;
            case 'dnd5e.preRollSkill':
            case 'dnd5e.preRollAbilityTest':
            case 'dnd5e.preRollAbilitySave':
            case 'dnd5e.rollSkill':
            case 'dnd5e.rollAbilitySave':
            case 'dnd5e.rollAbilityTest':
            case 'napolitano.postRollSkill':
            case 'napolitano.postRollAbilityTest':
            case 'napolitano.postRollAbilitySave':
                    this.source.actor = this.data.actor ?? {};
                    this.source.token = this.scene.tokens.find(t => t.actor?.id === this.source.actor.id)
                    this.roll = this.data.roll;
                    break;
            case 'checkRoll':
                    this.source.actor = this.data.actor ?? {};
                    this.roll = this.data.roll;
                break;
            case 'napolitano.postContest':
                break;
            default:
                    if(this.data.scene) this.scene = this.data.scene
                    if(this.data.tokenId) this.source.token = this.scene.getEmbeddedDocument("Token", this.data.tokenId);
                    if(this.source.token?.id) this.source.actor = this.source.token?.actor ? this.source.token.actor : (this.data.actorId  ? game.actors.get(this.data.actorId) : {})
                    if(this.data.itemId) this.item = this.getItem(this.data.itemId)
                    if(this.data.targets) this.targets = this.convertToTokenDocument(this.data.targets);
                    if(this.data.hitTargets) this.setHitTargets(this.data.hitTargets);
                break;
        }
        super._initializePost()
        napolitano.log(false, `Workflow initialized ${this.ruleset}...`, this);  
    }

    static async playAsync(ruleset, data, options = {}){
        if(data?.workflowOptions?.isOverTime) return
        const flow = new workflow(ruleset, data, options)
        flow._initialize()
        switch(ruleset){
            case 'arcaneFirearm': await flow._arcaneFirearm(); break;
            case 'counterspell': await flow._counterspell(); break;
            case 'cuttingWords': await flow._cuttingWords(); break;
            case 'eldritchBlast': await flow._eldritchBlast(); break;
            case 'guidedStrike': await flow._guidedStrike(); break;
            case 'magicMissile': await flow._magicMissile(); break;
            case 'parry': await flow._parry(); break;
            case 'potentSpellcasting': await flow._potentSpellcasting(); break;
            case 'precisionAttack': await flow._precisionAttack(); break;
            case 'rayOfEnfeeblement': await flow._rayOfEnfeeblement(); break;
            case 'scorchingRay': await flow._scorchingRay(); break;
            case 'shield': await flow._shield(); break;
            case 'silveryBarbs': await flow._silveryBarbs(); break;
            case 'wardingFlare': await flow._wardingFlare(); break;
        }
    }

    static play(ruleset, data, options = {}){
        if(data?.workflowOptions?.isOverTime) return
        const flow = new workflow(ruleset, data, options)
        flow._initialize()
        switch(ruleset){
            case 'ancestralProtectors': flow._ancestralProtectors(); break;
            case 'animateDead': flow._animateDead(); break;
            case 'armorOfAgathys': flow._armorOfAgathys(); break;
            case 'auraOfVitality': flow._auraOfVitality(); break;
            case 'blessedStrikes': flow._blessedStrikes(); break;
            case 'boomingBlade': flow._boomingBlade(); break;
            case 'chardalyn': flow._chardalyn(); break;
            case 'checkRoll': flow._checkRoll(); break;
            case 'clearCombatantReactions': flow._clearCombatantReactions(); break;
            case 'cloakOfFlies': flow._cloakOfFlies(); break;
            case 'cloudOfDaggers': flow._cloudOfDaggers(); break;
            case 'colorSpray': flow._colorSpray(); break;
            case 'colossusSlayer': flow._colossusSlayer(); break;
            case 'combatTurnUpdateEvents': flow._combatTurnUpdateEvents(); break;
            case 'combatRoundUpdateEvents': flow._combatRoundUpdateEvents(); break;
            case 'darkness': flow._darkness(); break;
            case 'deleteCombat': flow._deleteCombat(); break;
            case 'disarmingAttack': flow._disarmingAttack(); break;
            case 'dragonsBreath': flow._dragonsBreath(); break;
            case 'dustDevil': flow._dustDevil(); break;
            case 'echoingMind': flow._echoingMind(); break;
            case 'fangedBite': flow._fangedBite(); break;
            case 'fogCloud': flow._fogCloud(); break;
            case 'formOfDread': flow._formOfDread(); break;
            case 'grease': flow._grease(); break;
            case 'greenFlameBlade': flow._greenFlameBlade(); break;
            case 'haloOfSpores': flow._haloOfSpores(); break;
            case 'heatedBody': flow._heatedBody(); break;
            case 'hex': flow._hex(); break;
            case 'hexbladesCurse': flow._hexbladesCurse(); break;
            case 'hungryJaws': flow._hungryJaws(); break;
            case 'intrusiveEchoes': flow._intrusiveEchoes(); break;
            case 'layOnHands': flow._layOnHands(); break;
            case 'longRest': flow._longRest(); break;
            case 'marker': flow._marker(); break;
            case 'message': flow._message(); break;
            case 'melfsAcidArrow': flow._melfsAcidArrow(); break;
            case 'moonbeam': flow._moonbeam(); break;
            case 'motivationalSpeech': flow._motivationalSpeech(); break;
            case 'nathairsMischiefHook': flow._nathairsMischiefHook(); break;
            case 'necroticShroud': flow._necroticShroud(); break;
            case 'packTactics': flow._packTactics(); break;
            case 'pan': flow._pan(); break;
            case 'passWithoutTrace': flow._passWithoutTrace(); break;
            case 'powerSurge': flow._powerSurge(); break;
            case 'produceFlame': flow._produceFlame(); break;
            case 'relentless': flow._relentless(); break;
            case 'relentlessEndurance': flow._relentlessEndurance(); break;
            case 'shortRest': flow._shortRest(); break;
            case 'sleep': flow._sleep(); break;
            case 'spikeGrowth': flow._spikeGrowth(); break;
            case 'spiritGuardians': flow._spiritGuardians(); break;
            case 'tasteOfTheStones': flow._tasteOfTheStones(); break;
            case 'templateTargeting': flow._templateTargeting(); break;
            case 'toggleEffectEffects': flow._toggleEffectEffects(); break;
            case 'tokenMovement': flow._tokenMovement(); break;
            case 'torch': flow._torch(); break;
            case 'whisperingAura': flow._whisperingAura(); break;
            case 'wildSurgeRetribution': flow._wildSurgeRetribution(); break;
            case 'witchBolt': flow._witchBolt(); break;
        }
    }

    /**
     * Tested: v10
     * Handles adding effect for Ancestral Protectors on hit and also with adding resistance if not attack origin
     * @returns 
     */
    async _ancestralProtectors(){
        if(!this.source.actor || !this.itemData.isAttack) return
        if(this.hook === 'midi-qol.DamageRollComplete') {
            if(!this.hasHitTargets) return
            if(this.sourceData.isRaging && this.hasItem()){
                const lastFlag = this.getFlag(this.source.actor, 'ancestralProtectors')
                if(!lastFlag || lastFlag < this.now) {
                    await this.addActiveEffect({effectName: "Ancestral Protectors", uuid: this.firstHitTarget.actor.uuid, origin: this.source.actor.uuid})
                    await this.setFlag(this.source.actor, {ancestralProtectors: this.now})
                }
            }
        }
        if(this.hook === 'midi-qol.preItemRoll') {
            if(!this.hasTargets) return
            if(this.hasEffect(this.source.actor, "Ancestral Protectors")){
                let eff = this.getEffect(this.source.actor, "Ancestral Protectors")
                if(this.firstTarget.actor.uuid !== eff.origin) {
                    this.setMidiRollDisadvantage()
                    await this.addActiveEffect({effectName: "Ancestral Protectors - Targeted", uuid: this.firstTarget.actor.uuid, origin: this.source.actor.uuid})
                }
            }
        }
    } 

    async _animateDead(){
        const max = (1 + (2 * this.upcastAmount))
        for(let i = 0; i < 1 + (2 * this.upcastAmount); i++){
            let decision = await this.yesNo({title: 'Use Spell to Animate?', prompt: `You have <span class="napolitano-label">${max - i}</span> Animate Dead uses. Would you like to use ${i ? 'another ' : ''}one to animate dead?`, img: this.getItem()?.img})
            if(!decision) return this.message( `${this.name} chooses to not animate ${i ? 'any more ' : ''}dead and can reassert control over ${max - i} undead.`, 'Animate Dead');
            let choice = await this.choose(this.config.options, this.config.prompt, this.config.name)
            let undead = choice === 'Bones' ? 'Skeleton' : 'Zombie'
            await this.summon({name: undead}) 
            this.message( `${this.name} animates ${choice === 'Bones' ? 'a pile of bones' : 'a corpse'} and a ${undead} rises!`, 'Animate Dead')
        }
    }

    /**
     * Tested: v10
     * Adds the Hex Warrior Weapon setting from the character
     */
     async _arcaneFirearm(){
        if(this.hook === 'midi-qol.preDamageRollComplete'){
            if(this.itemData.isSpell && this.itemData.isDamage && this.sourceData.arcaneFirearm.length) {
                if( MULTIPLEDAMAGEROLLSPELLS.includes(this.item.name)) {
                    if(this.hasHitTargets) this.info(`${this.item.name} rolls multiple damage rolls, roll Arcane Firearm damage separately after spell completes and decide on which target to it applies to.`)
                    return
                }
                const roll = await this.rollDice('1d8')
                await this.appendRoll(this.data.damageRoll, roll, {sign: 1, isDamage: true})
                this.appendMessageMQ(`+${roll.total} ${this.itemData.damageType} damage due to Arcane Firearm.`)
            }
        } else {
            if(this.sourceData.arcaneFirearm.length) {
                this.message(`Arcene firearm benefit has expired from ${this.sourceData.arcaneFirearm.map(i => i.name).join(', ')} for ${this.name} following a long rest.`, {title: 'Arcane Firearm Expired'})
                for(const item of this.sourceData.arcaneFirearm){
                    await this.updateItem( {flags: {[napolitano.FLAGS.NAPOLITANO]: {arcaneFirearm: {selected: false}}}}, item)
                }
            }
            this.setItem()
            if(this.hasItem()){
                const items = this.source.actor.items.filter(i => i.name.includes('wand') || i.name.includes('staff') || i.name.includes('rod'))
                if(items.length) {
                    const choice = await this.choose(items.map(i => [i.id, i.name]), 'Pick Arcane Firearm')
                    const changeItem = items.find(i => i.id === choice)
                    if(changeItem){
                        await this.updateItem( {flags: {[napolitano.FLAGS.NAPOLITANO]: {arcaneFirearm: {selected: true}}}}, changeItem)
                        this.message(`Arcane Firearm benefit added to ${changeItem.name} for ${this.name} following a long rest.`, {title: 'Arcane Firearm'})
                        }
                    } else {
                    this.warn(`${this.name} has no rod, staff or wand that can be assigned with Arcane Firearm at end of long rest.`)
                }
            }
        }
    }


    /**
     * Tested: v10
     * Checks for presence of AoA and hit, executes damage back to attacker
     * @returns 
     */
    async _armorOfAgathys(){
        if(!this.hasHitTargets || !this.itemData.isMeleeWeaponAttack){return}
        let damage = 0;
        this.hitTargets.forEach((value) => { 
          if (value.actor && this.getTempHP(value) && this.hasEffect(value.actor, this.config.name)){
              const lvl = this.getEffect(value.actor, this.config.name).changes.find(k => k.key = "macro.itemMacro" && k.priority === 1)?.value;
              if(lvl) damage += (lvl * 5)
              this.generateEffect(value)
          }
        });
        if(damage) {
            this.roll = await new Roll(`${damage}d1`).evaluate({async: true})
            await this.damage({type: "cold", targets: [this.source.token], itemData: this.getItem(), itemCardId: "new"})
            this.message(`The Armor of Agathys from the targets that were attacked deals ${damage} cold damage to ${this.source.actor.name}.`, {title: 'Armor of Agathys'}) //no itemcard so flavor is messaged in chat
        }
    }

    async _auraEffects({auraTokens = [], distance = 10, turnEnd = false, tag = 'NAP-SOT-10'} = {}) {
        let target;
        if(this.moveData) {
            target = this.source.token
        } else {
            target = turnEnd ? this.previousCombatant : this.currentCombatant
        } 
        this.tokensInProximity(target, distance)
        const effectors = distance >= 0 ? auraTokens.filter(a => this.proximityTokens.find(u => u.id === a.id) && target.id !== a.id) : auraTokens.filter(a => !this.proximityTokens.find(u => u.id === a.id) && target.id !== a.id)
        switch(tag){
            case 'NAP-MOV-ANY-0':
                await this._auraEffectsWorkflow(effectors.filter(u => u.name === 'Cloud of Daggers'), [target], 'cloudOfDaggers')
                await this._auraEffectsWorkflow(effectors.filter(u => u.name === 'Darkness'), [target], 'darkness')
                await this._auraEffectsWorkflow(effectors.filter(u => u.name === 'Fog Cloud'), [target], 'fogCloud')
                await this._auraEffectsWorkflow(effectors.filter(u => u.name === 'Grease'), [target], 'grease')
                await this._auraEffectsWorkflow(effectors.filter(u => u.name === 'Moonbeam'), [target], 'moonbeam')
                await this._auraEffectsWorkflow(effectors.filter(u => u.name === 'Spike Growth'), [target], 'spikeGrowth')
                break;
            case 'NAP-MOV-ANY-10':
                await this._auraEffectsWorkflow(effectors.filter(u => u.actor?.items.find(i => i.name === 'Halo of Spores')), [target], 'haloOfSpores')
                break;
            case 'NAP-MOV-ANY-15':
                await this._auraEffectsWorkflow(effectors.filter(u => u.actor?.effects.find(i => i.label === 'Spirit Guardians')), [target], 'spiritGuardians')
                break;
            case 'NAP-MOV-OUT':
                await target.name === 'Fog Cloud' ? this._auraEffectsWorkflow([target], [target], 'fogCloud') : this._auraEffectsWorkflow(effectors.filter(u => u.name === 'Fog Cloud'), [target], 'fogCloud', 'napolitano-aura-off')
                await target.name === 'Darkness' ? this._auraEffectsWorkflow([target], [target], 'darkness') :this._auraEffectsWorkflow(effectors.filter(u => u.name === 'Darkness'), [target], 'darkness', 'napolitano-aura-off')
               break;
            case 'NAP-EOT-0':
                await this._auraEffectsWorkflow(effectors.filter(u => u.name === 'Grease'), [target], 'grease')
                break;
            case 'NAP-EOT-5':
                await this._auraEffectsWorkflow(effectors.filter(u => u.name === 'Dust Devil'), [target], 'dustDevil')
                break;
            case 'NAP-SOT-0':
                await this._auraEffectsWorkflow(effectors.filter(u => u.name === 'Cloud of Daggers'), [target], 'cloudOfDaggers')
                await this._auraEffectsWorkflow(effectors.filter(u => u.name === 'Moonbeam'), [target], 'moonbeam')
                break;
            case 'NAP-SOT-5':
                await this._auraEffectsWorkflow(effectors.filter(u => u.actor?.effects.find(i => i.label === 'Cloak of Flies')), [target], 'cloakOfFlies')
                await this._auraEffectsWorkflow(auraTokens.filter(u => u.id === target.id && u.actor?.items.find(i => i.name === 'Whispering Aura')), this.proximityTokens.filter(t => t.id !== target.id), 'whisperingAura')
                break;
            case 'NAP-SOT-10':
                await this._auraEffectsWorkflow(effectors.filter(u => u.actor?.items.find(i => i.name === 'Halo of Spores')), [target], 'haloOfSpores')
                break;
            case 'NAP-SOT-15':
                await this._auraEffectsWorkflow(effectors.filter(u => u.actor?.effects.find(i => i.label === 'Spirit Guardians')), [target], 'spiritGuardians')
                break;
        }
    }

    async _auraEffectsWorkflow(sources, targets, ruleSet, hook = 'napolitano-aura'){
        for (const source of sources) {
            await workflow.play(ruleSet, {actorId: source.actor?.id, scene: this.scene, tokenId: source.id, hitTargets: targets, targets: targets}, {hook: hook})
        }
    }

    async _auraOfVitality(){
        this.item = this.source.actor.items.find(i => i.flags[napolitano.FLAGS.NAPOLITANO]?.auraOfVitality)
        if(this.item.id) await this.deleteItem()
    }

    /**
     * Tested: v10
     * Adds radiant damage for first cantrip damage of the round.
     * @returns 
     */
    async _blessedStrikes(){
        if(this.item?.name === 'Blessed Strikes' || !this.hasItem() || !this.hasHitTargets || !this.damageTotal || !this.source.actor.id || !this.item.id) return
        if(!(this.getFlag(this.source.actor, 'blessedStrikes') >= this.now) && ((this.itemData.isSpell && this.itemData.baseSpellLevel === 0) || this.itemData.isWeaponAttack)){
            const useBlessedStrikes = await this.yesNo()
            if(useBlessedStrikes){
                await this.rollDice(`${this.isCritical ? 2 : 1}d8`)
                await this.setFlag(this.source.actor, {'blessedStrikes': this.now})
                await this.damage({type: 'radiant', targets: [this.firstTarget], show: false, itemData: this.getItem(), itemCardId: "new"})
                this.generateEffect(this.firstTarget)
            }
        }
    }

    async _boomingBlade(){
        if(this.hasEffect(this.source.actor, 'Booming Blade')){
            let eff = this.getEffect(this.source.actor, "Booming Blade")
            const source = fromUuidSync(eff.origin)
            if(source){
                const item = this.getItem('Booming Blade', source)
                const scale = this.getCantripScale(this.getLevel(source))
                await this.deleteEffect(this.source.actor, 'Booming Blade')
                await this.damage({actor: source, targets: [this.source.token], type: 'thunder', dice: `${scale}d8`, itemData:item})
                this.generateEffect(this.source.token, {effect: NAPOLITANOCONFIG.boomingBlade.effects.pre, sound: NAPOLITANOCONFIG.boomingBlade.sounds.pre})
                this.message(`${this.name} moves and sustains ${this.damageData.roll.result} thunder damage (${this.damageData.roll.formula}) from Booming Blade.`, {title: 'Booming Blade'})
            }
        }
    }

    /**
     * Tested: v10
     * Rolls d6 and on 1 does some token says and visual indicators of chardalyn possession
     */
    async _chardalyn(){
        if(this.hasActor){
            const items = this.source.actor.items.filter(i => ['weapon', 'equipment'].includes(i.type) && i.name.search(/chardalyn/i) !== -1)
            if(items.length){
                await this.rollDice(`${items.length}d6`)
                if(this.roll.dice.find(d=>d.faces === 6).results.find(r => r.result === 1)) {
                    this.generateEffect(this.source.token)
                    await this.say()
                }
            }
        }
    }

    /**
     * Tested: v10
     * Checks incoming roll for abilities that fire from roll results.
     * @returns 
     */
    _checkRoll(){
        switch(this.roll?.dice?.[0]?.total){
            case 20:
                break;
            case 1:
                if(game.settings.get("napolitano-scripts", "intrusive-echoes")) workflow.play('intrusiveEchoes', this.data, {hook: this.hook})
                break;
          case 13:
                if(game.settings.get("napolitano-scripts", "echoing-mind")) workflow.play('echoingMind', this.data, {hook: this.hook})
                break;
        }
        if(game.settings.get("napolitano-scripts", "taste-of-the-stones") && ["ins","prc"].includes(this.data.ability)) workflow.play('tasteOfTheStones', this.data, {hook: this.hook})
      }

    async _clearCombatantReactions(){
        if(this.hasActor && this.getFlag(this.source.actor, `reaction`)) await this.deleteFlag('reaction')
    }

    async _cloakOfFlies(){
        switch(this.hook){
            case 'napolitano-aura':
                this.setItem()
                this.generateEffect(this.firstTarget)
                await this.damage({targets: [this.firstTarget], dice: `${this.sourceData.charismaMod}`, type: 'poison'})
                this.message(`${this.firstTarget.name} sustains ${this.damageData.roll.result} damage from a cloak of flies.`, {title: 'Cloak of Flies'})
                break;
            case 'deleteActiveEffect':
                await this.removeTag('NAP-SOT-5-CLOAKOFFLIES')
                break;
            case 'createActiveEffect':
                await this.addTag('NAP-SOT-5-CLOAKOFFLIES')
                break;
        } 
    }

    async _cloudOfDaggers(){
        this.setItem()
        if(this.hasOccurredOnce()) return
        await this.damage({targets: [this.firstHitTarget], dice: this.itemData.damageParts[0][0], type: 'slashing'})
        this.message(`${this.firstHitTarget.name} sustains ${this.damageData.roll.result} damage from a cloud of daggers on a ${this.damageData.roll.formula} roll!`, {title: 'Cloud of Daggers'})
        await this.setOccurredOnce() 
    }

    /**
     * Tested: v10
     */
    async _colorSpray(){
        if(this.damageTotal){
            this.targets = new Set(this.targetsArray.filter(i=> this.getHP(i.actor)).sort((a, b) => this.getHP(this.scene.tokens.get(a.id)) < this.getHP(this.scene.tokens.get(b.id)) ? -1 : 1))
            let remainingColorHp = this.damageTotal;
            this.targets.forEach((target) => {      
                if (remainingColorHp >= this.getHP(target) && !this.hasImmunity(target, "Blinded") & !this.hasEffect(target, "Blinded")) {
                    remainingColorHp -= this.getHP(target);
                    let effectData = [{
                            label: this.config.name,
                            icon: "icons/magic/water/bubbles-air-water-pink.webp",
                            origin: this.data.uuid,
                            disabled: false,
                            duration: { rounds: 1, turns: 2, seconds: 60, startRound: game.combat ? game.combat.round : 0, startTime: this.now},
                            changes: [
                                { key: `macro.CE`, mode: 0, value: 'Blinded', priority: 0 }
                            ]
                        }];
                    MidiQOL.socket().executeAsGM("createEffects", { actorUuid: target.actor.uuid, effects: effectData });
                    this.generateEffect(target)
                    this.message(`${target.name} is blinded by color!`, {title: 'Color Spray'})
                } 
            }); 
        } 
    }

    /**
     * Tested: v10
     * @returns 
     */
    async _colossusSlayer(){
        if(!this.hasHitTargets || !this.source.actor || !this.data.attackRoll?.dice || !this.itemData.isWeaponAttack || !this.hasItem()) return
        const hp = this.data.damageList.find(t => t.tokenId === this.firstHitTarget.id)?.oldHP;
        const maxHp = this.firstHitTarget.actor?.system?.attributes?.hp?.max;
        if (hp !== undefined && maxHp !== undefined && hp >= maxHp) return;
        if(this.getFlag(this.source.actor, 'colossusSlayer') >= this.now) return
        this.roll = await new Roll(`${this.isCritical ? 2 : 1}d8`).evaluate({async: true})
        await this.damage({type: this.itemData.damageParts[0]?.[1] ?? "", targets: [this.firstHitTarget.id], itemData: this.getItem(), itemCardId: "new"})
        await this.setFlag(this.source.actor,{'colossusSlayer': this.now})
    }

    async _combatTurnUpdateEvents(){
        await this._clearCombatantReactions()
        if(this.auraStartOfTurn0Feet.length) await this._auraEffects({auraTokens: this.auraStartOfTurn0Feet, distance: 0, turnEnd: false, tag: 'NAP-SOT-0'})
        if(this.auraStartOfTurn5Feet.length) await this._auraEffects({auraTokens: this.auraStartOfTurn5Feet, distance: 5, turnEnd: false, tag: 'NAP-SOT-5'})
        if(this.auraStartOfTurn10Feet.length) await this._auraEffects({auraTokens: this.auraStartOfTurn10Feet, distance: 10, turnEnd: false, tag: 'NAP-SOT-10'})
        if(this.auraStartOfTurn15Feet.length) await this._auraEffects({auraTokens: this.auraStartOfTurn15Feet, distance: 15, turnEnd: false, tag: 'NAP-SOT-15'})
        if(this.auraEndOfTurn0Feet.length) await this._auraEffects({auraTokens: this.auraEndOfTurn0Feet, distance: 0, turnEnd: true, tag: 'NAP-EOT-0'})
        if(this.auraEndOfTurn5Feet.length) await this._auraEffects({auraTokens: this.auraEndOfTurn5Feet, distance: 5, turnEnd: true, tag: 'NAP-EOT-5'})
    }

    async _combatRoundUpdateEvents(){
        
    }

    async _counterspell(){
        let cancel = false
        if(this.item.type === 'spell' || this.itemData.isSpell) {
            const results = []
            for(const token of this.scene.tokens) {
                if(
                    !this.hasEffect(token, 'Reaction') 
                    && this.isResponsive(token) 
                    && this.tokenData.disposition !== token.disposition 
                    && this.hasItem({document: token, options: {uses: true}}) 
                    && this.getDistance(token, this.source.token) <= 60
                ){
                    let choices = this.getSpellOptions({document: token})
                    if(choices.length) results.push(this.choose(choices, `${token.name}, a spell is being cast within range. Cast Counterspell?`, 'Counterspell', {owner: getActorOwner(token), document: token, img: this.getItem("Counterspell", token)?.img}))                
                }
            }
            await Promise.all(results).then(async (values)=>{
                const casts = values.filter(v => v.choice)
                if(casts.length){
                    const counterHookId = Hooks.on("midi-qol.preambleComplete", async (workflow) => {
                        if(workflow.id !== this.data.id) return
                        const spellLvl = workflow.itemLevel ?? 0
                        for (const value of casts){
                            const updated = await this.updateSpellUse(-1, value.choice, {document: value.document})
                            if(updated.updated >= 0){
                                this.message(`${value.document.name} spell level ${value.choice} reduced by one.`, {title: "Counterspell Cast", whisper: "GM"})
                                if(updated.lvl >= spellLvl) {cancel = true}
                                else {
                                    const dc = 10 + spellLvl
                                    const check = await this.rollCheck(value.document, {dc: dc, show: true, source: this.config.name, type: value.document.actor.system.attributes.spellcasting})
                                    if(check.success) cancel = true
                                }
                                this.message(`${value.document.name} casts counterspell at level ${updated.lvl} and the spell is ${cancel ? 'successfully' : 'not successfully'} canceled`, {title: "Counterspell"})
                                this.addActiveEffect({effectName: 'Reaction', uuid: value.document.actor.uuid, origin: value.document.actor.uuid})
                            } else {
                                this.message(`${value.document.name} does not have any remaining uses at the ${value.choice} level.`, {title: "Counterspell Not Cast"})
                            }    
                        }
                        if(cancel){
                            workflow.options.createMessage = false
                            workflow.aborted = true
                        }
                        Hooks.off("dnd5e.preambleComplete", counterHookId);
                        return !cancel;
                    });
                }
            })
        }
    }

    async _cuttingWords(){
        let type, originalRollTotal = 0, rollSource; 
        switch(this.hook){
            case 'midi-qol.preAttackRollComplete':
                type = 'attack'
                originalRollTotal = this.data.attackRoll?.terms[0]?.total ?? 0
                rollSource = this.data.attackRoll
                break;
            case 'midi-qol.preDamageRollComplete':
                type = 'damage'
                originalRollTotal = this.data.damageRoll?.terms[0]?.total ?? 0
                rollSource = this.data.damageRoll
                break;
            default:
                type = 'ability'
                originalRollTotal = this.roll?.terms[0]?.total ?? 0
                rollSource = this.data.roll
                break;
        }
        if(originalRollTotal && rollSource) {
            const results = []
            const avail = this.scene.tokens.filter(t => 
                                this.hasItem({document: t}) 
                                && this.isResponsive(t)
                                && this.hasEffect(t) 
                                && !this.hasEffect(t, 'Reaction')
                                && this.tokenData.disposition !== t.disposition
                                && this.hasItem({itemName: "Bardic Inspiration", document: t, options: {uses: true}}) 
                                && this.getDistance(t, this.source.token) <= 60
                                )
            if(!avail.length) return

            for(const token of avail) {
                results.push(this.yesNo({title: 'Cutting Words', prompt: `The ${type} roll is <span class="napolitano-label">${originalRollTotal}</span>. Will ${token.name} use Cutting Words to roll a bardic inspiration die and reduce the amount by that roll?`, owner: getActorOwner(token), document: token, img: this.getItem("Cutting Words", token)?.img}))
            }
            await Promise.all(results).then(async (values)=>{
                for (const value of values){
                    if(value.yes){
                        const insp = this.getItem('Bardic Inspiration', value.document);
                        this.updateItemUses(-1, insp)
                        this.message(`Bardic Inspiration reduced by one on ${value.document.name}.`,{whisper: "GM"})
                        if(this.hasImmunity(this.source.token, "Charmed") ){
                            this.message(`${value.document.name} uses Cutting Words, but it seems to have no effect on the target's behavior.`, {title: "Cutting Words"})    
                        }
                        else {
                            const roll = await this.rollBardicInspiration({document: value.document})
                            await this.appendRoll(rollSource, roll, {sign: -1, isAttack: type === 'attack' ? true : false, isDamage: type === 'damage' ? true : false})
                            if(type !== 'ability') this.appendMessageMQ(`-${roll.total} to ${type} due to Cutting Words.`)
                            this.message(`${value.document.name} uses Cutting Words, reducing the ${type} roll of ${originalRollTotal} by ${roll.total}.`, {title: "Cutting Words"})    
                        }
                        this.addActiveEffect({effectName: 'Reaction', uuid: value.document.actor.uuid, origin: value.document.actor.uuid})
                    }
                }
            })
        }
    }

    async _darkness(){
        if(this.hook === 'createToken') {
            await this.buildBoundaryWall(this.source.token)
            if(game.modules.get('token-attacher')?.active) await tokenAttacher.attachElementsToToken(this.walls, this.source.token.id)
        }
        await this.heavilyObscure()
    }

    async _deleteCombat(){
        for(const token of this.scene.tokens){
            workflow.play('clearCombatantReactions', {scene: this.scene, tokenId: token.id}, {hook: 'clearReactions'})
        }
        
    }

    async _disarmingAttack(){
        if(!this.hasHitTargets || !this.itemData.isWeaponAttack || !this.hasEffect()) return
        const supItem = this.getItem('Superiority Dice')
        if(!this.getItemUsesRemaining(supItem)) return this.error(`Disarming attack ignored - ${this.name} does not have any remaining superiority dice.`)
        const sup = await this.rollSuperiorityDie()
        const dc = sup.total + this.damageTotal
        const result = await this.rollSave(this.firstHitTarget, {dc: dc})
        this.message(`${this.name} attempts to disarm their target forcing a strength saving throw against a DC ${dc} (${this.damageTotal} damage + ${sup.total} superiority die roll). The target ${result.success ? 'succeeds' : 'fails'} their save.`, {title: 'Disarming Attack'})
        await this.updateItemUses(-1, supItem)
        this.message(`Superiority Dice reduced by one on ${this.name}.`,{whisper: "GM"})
    }

    async _dragonsBreath(){
        this.item = this.source.actor.items.find(i => i.flags[napolitano.FLAGS.NAPOLITANO]?.dragonsBreath)
        if(this.item.id) await this.deleteItem({})
    }

    async _dustDevil(){
        this.rulesubset = 'aura'
        this.setItem('Dust Devil Bludgeoning', this.source.actor)
        if(!this.item.id) return
        await this.rollSaveDamage(this.firstHitTarget, {dc: this.itemData.dc}, {type: 'bludgeoning', dice: this.itemData.damageParts[0][0]})
    }

    /**
     * Tested: v10
     * Rolls Echoing Mind table (on 13)
     * @returns 
     */
    async _echoingMind(){
        this.setItem()
        if(!this.item?.id) return
        if(this.spellLevel >= 4) this.rulesubset = this.ruleset + 'Lvl4'
        await this.rollTable()
        switch(this.tableRollResult){
            case "1":
                switch(this.spellLevel){
                    case 4:
                    case 5:
                    case 6: 
                    case 7:
                        this.message(`Echoing Mind: Walking speed increases 10 feet on ${this.source.actor.name} and they are not effected by difficult terrain.`, {title: 'Echoing Mind'})
                        await this.addActiveEffect({effectName: "Echoing Mind Walking Speed",uuid: this.source.actor.uuid, origin: this.source.actor.uuid})
                        break;
                    default: 
                        this.message(`Echoing Mind: Walking speed increases 10 feet on ${this.source.actor.name}.`, {title: 'Echoing Mind'})
                        await this.addActiveEffect({effectName: "Echoing Mind Walking Speed",uuid: this.source.actor.uuid, origin: this.source.actor.uuid})
                        break;
                    }
                break;
            case "2":
                await this.addInspiration()
                this.message(`Echoing Mind: ${this.source.actor.name} gains inspiration.`, {title: 'Echoing Mind'})
                break;
            case "8":
                await this.addActiveEffect({effectName: "Echoing Mind Return Item", uuid: this.source.actor.uuid, origin: this.source.actor.uuid})
                this.message(`Echoing Mind: ${this.tableRollText}`, {title: 'Echoing Mind'})
                break;
            default: 
                this.message(`Echoing Mind: ${this.tableRollText}`, {title: 'Echoing Mind'})
                this.message(`Apply effects manually`, {whisper: "GM", title: 'Echoing Mind'})
      }
    }

    async _eldritchBlast(){
        if(this.hook === 'midi-qol.preDamageRollComplete'){
            if(!this.hasHitTargets) return
            if(this.hasItem({itemName: 'Eldritch Invocations: Agonizing Blast'})){
                await this.appendRoll(this.data.damageRoll, false, {sign: 1, isDamage: true, mod: this.sourceData.charismaMod})
                await this.appendMessageMQ(`+${this.sourceData.charismaMod} force damage from Agonizing Blast.`)
            }
        }
        else if(this.hook === 'midi-qol.preambleComplete'){
            if(!this.item.name === 'Eldritch Blast') return
            const maxTargets = this.cantripScale
            await this.recurItemUse(maxTargets)
        }
    }

    async _fangedBite(){
        if(this.isDamageOnlyWorkflow) return
        if(this.hook === 'midi-qol.preAttackRoll') {
            if(Math.floor(100 * ((this.getMaxHP() - this.getHP()) / this.getMaxHP())) >= 50) this.setMidiRollAdvantage()
            return 
        }
        if(!this.hasHitTargets || ['undead', 'construct'].includes(this.getActorType(this.firstHitTarget))) return
        this.generateEffect(this.firstHitTarget)
        new Dialog({
            title: `Empowerment`,
            content: `<p>Empower yourself?</p>`,
            buttons: {
            hitpoints: {
                label: "Regain HP",
                callback: () => {
                    this.damage({type: 'healing', targets: [this.source.token], dice: `${this.damageTotal}d1`, flavor: `${this.name} drinks deep and gains ${this.damageTotal} HP.`, show: false})
                }
            },
            bonus: {
                label: "Bonus on Roll",
                callback: async () => {
                    const data = {
                        "changes": [
                            {
                                "key": "system.bonuses.abilities.check",
                                "mode": 2,
                                "value": `+ ${this.damageTotal}`,
                                "priority": "20"
                            },
                            {
                                "key": "system.bonuses.All-Attacks",
                                "mode": 2,
                                "value": `+ ${this.damageTotal}`,
                                "priority": "20"
                            }
                        ],
                        "disabled": false,
                        "duration": {"startTime": null},
                        "icon": "icons/skills/wounds/bone-broken-tooth-fang-red.webp",
                        "label": "Fanged Bite: Empowered",
                        "origin": this.item.uuid,
                        "transfer": false,
                        "flags": {
                            "dae": {
                                "stackable": "none",
                                "macroRepeat": "none",
                                "specialDuration": [
                                    "1Attack",
                                    "isCheck",
                                    "isSkill"
                                ],
                                "transfer": false
                            }
                        },
                        "tint": ""
                    };
                    await this.addActiveEffectDerived({data: data, message: `${this.name} gains +${this.damageTotal} to their next attack roll or ability check roll.`})
                }
            },
            cancel: {
                label: "No"
            }
            }
        }).render(true);
    }

    async _fogCloud(){
        if(this.hook === 'createToken') {
            await this.buildBoundaryWall(this.source.token)
            if(game.modules.get('token-attacher')?.active) await tokenAttacher.attachElementsToToken(this.walls, this.source.token.id)
        }
        await this.heavilyObscure()
    }

    async _formOfDread(){
        if(!this.hasHitTargets || !this.hasEffect(this.source.actor, "Form of Dread") || this.getFlag(this.source.actor, 'formOfDread') >= this.now) return
        this.setItem()
        const useForm = await this.yesNo();
        if (useForm) { 
            await this.setFlag(this.source.actor, {'formOfDread': this.now})
            this.generateEffect(this.firstHitTarget)
            const save = await this.rollSave(this.firstHitTarget, {type: 'wis', dc: (8 + this.sourceData.prof + this.sourceData.charismaMod), chatMessage: true})
            if(!save.success) await this.addActiveEffect({effectName: `Frightened (End of Source's Next Turn)`, uuid: this.firstHitTarget.actor.uuid, origin: this.source.actor.uuid})
        }
    }

    async _grease(){
        this.setItem('Grease Effect', this.source.actor)
        if(!this.item.id) return
        const saveRoll = await this.rollSave(this.firstHitTarget, {dc: this.itemData.dc, type: "dex"})
        if(!saveRoll.success) await this.addActiveEffect({effectName: "Prone", uuid: this.firstTarget.actor.uuid, origin: this.source.actor})
    }

    async _greenFlameBlade(){
        if(!this.hasHitTargets || !this.hasEffect() || !this.itemData.isMeleeWeaponAttack) return
        if(this.cantripScale > 1) {
            await this.damage({dice: `${this.cantripScale - 1}d8`, type: 'fire', itemData: this.getItem(), itemCardId: "new" })
            this.generateEffect(this.firstHitTarget)
        }
        new Dialog({
            title: `${this.config.name}`,
            content: `<div class="napolitano-chat-message-title">Fire Leap</div><div class="napolitano-chat-message-body">Target a new victim that you can see within 5 feet of your original target then choose <span class="napolitano-label">Damage Target</span>.</div>`,
            buttons: {
                yes: {
                    icon: '<i class="fas fa-check"></i>',
                    label: "Damage Target",
                    callback: async () => {
                        const target = game.user.targets?.find(t => t.id !== this.firstHitTarget.id)
                        if(!target) return this.cancelSourcePrompt('Green-Flame Blade leaping damage was canceled or the original target was the only target selected.')
                        const tdc = this.cantripScale > 1 ? `${this.cantripScale - 1}d8 + ${this.sourceData.spellMod}` : `${this.sourceData.spellMod}`
                        this.generateEffect(target)
                        if(target) await this.damage({dice: tdc, type: 'fire', targets: [target], flavor: 'The green flame leaps and does additional damage to a nearby target!', itemData: this.getItem(), itemCardId: "new" })
                    }
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: "Cancel",
                    callback: () => {this.cancelSourcePrompt('Green-Flame Blade leaping damage was canceled')}
                }
            },
            default: "cancel"
        }).render(true);
    }

    async _guidedStrike(){
        const itm = this.getItem('Channel Divinity: Guided Strike')
        if(!itm || !this.hasEffect(this.source.actor, 'Channel Divinity: Guided Strike') || !this.data.attackTotal) return
        const divinity = this.getItem('Channel Divinity');
        if(!this.getItemUsesRemaining(divinity)) return
        const originalRollTotal = this.data.attackTotal
        const response = await this.yesNo({ title: 'Guided Strike', prompt: `Your attack total is <span class="napolitano-label">${this.data.attackTotal}</span>. Use Guided Strike?`, owner: this.sourceData.owner, img: itm.img})
        if(response){
            this.generateEffect(this.source.token, {effect: NAPOLITANOCONFIG.guidedStrike.effects.pre})
            await this.appendRoll(this.data.attackRoll, false, {sign: 1, isAttack: true, mod: 10})
            this.message(`${this.name} uses guided strike, increasing their attack roll from ${originalRollTotal} to ${this.data.attackTotal}.`, {title: 'Guided Strike'})
            this.appendMessageMQ(`+10 to attack roll due to Guided Strike.`)
            this.updateItemUses(-1, divinity)
            this.message(`Channel Divinity reduced by one on ${this.name}.`,{whisper: "GM"})
        }
    }

    async _haloOfSpores(){
        this.setItem()
        if(!this.hasItem() || this.sourceData.disposition === this.firstHitTarget.disposition || this.hasEffect(this.source.actor, 'Reaction')) return
        const proceed = this.sourceData.owner ? await this.yesNo({owner: this.sourceData.owner}) : await this.yesNo()
        if(proceed){
            let dice = this.source.actor.system.scale['circle-of-spores']?.['halo-of-spores'] ?? '1d4'
            if(this.hasEffect(this.source.actor, 'Symbiotic Entity')) dice = dice.replace('1d','2d')
            this.generateEffect(this.firstHitTarget)
            const result = await this.rollSaveDamage(this.firstHitTarget, {damage: 'none', dc: (8 + this.sourceData.wisdomMod + this.sourceData.prof), type: 'con'}, {targets: [this.firstHitTarget], dice: dice, type: 'necrotic'})
            const text = result.success ? `${this.firstHitTarget.name} succeeds their saving throw and avoids the noxious spores!` : `${this.firstHitTarget.name} sustains ${this.damageData.roll.result} damage from halo of spores on a ${this.damageData.roll.formula} roll!`
            this.message(text, {title: 'Halo of Spores'})
            this.addActiveEffect({effectName: 'Reaction', uuid: this.source.actor.uuid, origin: this.source.actor.uuid})
        }
    }

    /**
 * Tested: v10
 * Checks for presence of AoA and hit, executes damage back to attacker
 * @returns 
 */
    async _heatedBody(){
        if(this.hasHitTargets && this.itemData.isMeleeWeaponAttack){
            this.hitTargets.forEach((value) => { 
                if (value.actor && this.hasItem({document: value.actor}) && this.getDistance(value, this.source.token) <= 5){
                    const item = this.getItem(this.config.name, value.actor)
                    if(item) {
                        const parts = item.system?.damage?.parts
                        this.damage({type: parts[0][1], targets: [this.source.token], dice: parts[0][0], flavor: `${this.name} takes damage from the target's heated body!`, itemData: item})
                        this.generateEffect(this.source.token)
                    }                    
                }
            })
        }
    }

    /**
     * Tested: v10
     * @returns 
     */
    async _hex(){
        if(!this.source.actor || this.item?.name === 'Hex' || !this.data.attackRoll?.dice?.length || !this.hasItem()) return
        let hitTargets=[];
        this.hitTargets.forEach((value) => { 
            if (value.actor && value.actor.effects.find(e => e.origin === this.getItem().uuid)) {
                hitTargets.push(canvas.tokens.get(value.id))
                this.generateEffect(value)
            }
        });
        if(hitTargets.length){
            this.roll = await new Roll(`1d6`).evaluate({async: true})
            await this.damage({flavor: `The lasting hex from ${this.source.actor.name} adds ${this.roll.result} necrotic damage.`, type: "necrotic", targets: hitTargets, itemData: this.getItem(), itemCardId: "new"})
        }
    }

    /**
     * Tested: v10
     * @returns 
     */
    async _hexbladesCurse(){
        if(!this.source.actor || !this.hasItem() || this.item?.name === "Hexblade's Curse" ) return
        if(this.hook === 'midi-qol.preAttackRoll' &&  this.firstTarget.actor.effects.find(e => e.origin === this.getItem().uuid)){
            if(this.data.d20AttackRoll === 19) this.setMidiRollIsCritical()
            return
        }
        if(this.data?.damageRoll && this.hook === 'midi-qol.RollComplete'){
            let hitTargets=[];
            this.hitTargets.forEach((value) => { 
                if (value.actor && value.actor.effects.find(e => e.origin === this.getItem().uuid)) {
                    hitTargets.push(value);
                    this.generateEffect(value)
                }
            });
            if(hitTargets.length){
                this.roll = await new Roll(`${this.sourceData.prof}d1`).evaluate({async: true})
                await this.damage({flavor: `The hexblade curse from ${this.source.actor.name} adds ${this.roll.result} damage.`, type: "none", targets: hitTargets, itemData: this.getItem(), itemCardId: "new"})
                const roll = await new Roll(`${this.sourceData.charismaMod + this.sourceData.warlockLevel}d1`).evaluate({async: true})
                if(hitTargets.find(t => this.getHP(t) <= 0)) await this.damage({roll: roll, flavor: `The hexblade curse heals ${this.source.actor.name} ${roll.result} due to the death of their target.`, type: "healing", targets: [this.source.token], itemData: this.getItem(), itemCardId: "new"})
            }
        }
    }

    
    /**
     * Tested: v10
     * Adds the Hex Warrior Weapon setting from the character
     */
     async _hexWarriorWeapon(){
        if(this.sourceData.hexWarriorWeapon.length) {
            this.message(`Hex warrior benefit has expired from ${this.sourceData.hexWarriorWeapon.map(i => i.name).join(', ')} for ${this.source.actor.name} following a long rest.`, {title: 'Hex Warrior Expired'})
            for(const item of this.sourceData.hexWarriorWeapon){
                await this.updateItem( {system: {ability: item.flags[napolitano.FLAGS.NAPOLITANO]?.hexWarrior?.priorValue ?? ''}, flags: {[napolitano.FLAGS.NAPOLITANO]: {hexWarrior: {}}}}, item)
            }
        }
        if(this.hasItem({itemName:"Hex Warrior"})){
            const items = this.source.actor.items.filter(i => i.type === 'weapon' && i.system.proficient && !i.system.properties?.two)
            if(items.length) {
                const choice = await this.choose(items.map(i => [i.id, i.name]), 'Pick Hex Warrior Weapon')
                const changeItem = items.find(i => i.id === choice)
                await this.updateItem( {system: {ability: 'cha'}, flags: {[napolitano.FLAGS.NAPOLITANO]: {hexWarrior: {selected: true, priorValue: changeItem.system.ability}}}}, changeItem)
                this.message(`Hex warrior benefit added to ${changeItem.name} for ${this.source.actor.name} following a long rest.`, {title: 'Hex Warrior Weapon'})
            }
        }
    }

    /**
     * Tested:v10
     */
    async _hungryJaws(){
        if(this.hasHitTargets && this.item.name === 'Hungry Jaws' && this.sourceData.race === 'Lizardfolk' && this.sourceData.tempHp < 2){
            await this.source.actor.update({data:{attributes: {hp: {temp: this.sourceData.prof}}}})
            this.message(`${this.source.token.name} satiates their hunger by eating their victim's flesh. They gain 2 temporary hp.`, {title: 'Hungry Jaws'})
            this.generateEffect(this.firstHitTarget)
        }
    }

    /**
     * Tested: v10
     * Rolls Intrusive Echoes table (on 1)
     * @returns 
     */
    async _intrusiveEchoes(){
        if(!this.setItem()) return
        await this.rollTable()
        await this.updateItemUses(-1)
        this.message(`Intrusive Echoes: ${this.tableRollText}`, {title: 'Intrusive Echoes'})
      }

    async _layOnHands(){
        if(!this.source.actor.id || !this.source.token.id || !this.targets.size) return
        this.setItem('Lay on Hands Pool')
        if(!this.itemData.usesRemaining) return this.warn('Selected hero must have "Lay on Hands" feat.')
        let maxHeal = Math.clamped(this.itemData.usesRemaining, 0, this.getMaxHP(this.firstTarget) - this.getHP(this.firstTarget))
        new Dialog({
            title: "Lay on Hands Healing",
            content: `<p><em>${this.source.token.name} lays hands on ${this.firstTarget.name}.</em></p>
                        <p>How many HP do you want to restore to ${this.firstTarget.name}?</p>
                        <form>
                            <div class="form-group">
                                <label for="num">HP to Restore: (Max = ${maxHeal})</label>
                                <input id="num" name="num" type="number" min="0" max="${maxHeal}"></input>
                            </div>
                        </form>`,      
            buttons: {
                heal: { 
                    label: "Heal!", 
                    callback: (html) => {
                        let number = Math.floor(Number(html.find('#num')[0].value)); 
                        if (number < 1 || number > maxHeal) return this.warn(`Invalid number of charges entered = ${number}. Aborting action.`);
                        this.damage({dice: `${number}d1[healing]`, type: 'healing', targets: [this.firstTarget], flavor: `${this.source.token.name} lays hands on ${this.firstTarget.name} for ${number} HP.`})
                        this.updateItemUses(number * -1)   
                    }
                },
                cancel: { label: "Cancel", callback: () => this.cancelSourcePrompt() }
            },
            default: "Heal!"
        }).render(true);
    }

    /**
     * Tested: v10
     */
    async _longRest() {
        await this._removeInfusions();
        await workflow.playAsync('arcaneFirearm', this.data, {hook: this.hook})
        await this._hexWarriorWeapon();
        await this._powerSurge();
    } 

    async _marker(){
        await Sequencer.EffectManager.endEffects({origin: this.origin})
        if(this.hook === 'deleteCombat') return
        let s = new Sequence()
        const token = this.currentCombatant
        if(token) {
            s = s.effect()
                .file(this.marker)
                .scaleToObject(game.settings.get(napolitano.ID, 'marker-scale'))
                .origin('napolitano_token_marker')
                .persist()
                .attachTo(token, {bindVisibility:true})
                .belowTokens()
        }
        s.play()
    }

    async _magicMissile(){
        if(!this.item.name === 'Magic Missile') return
        if(!this.data.options?.notCast && this.hook === 'midi-qol.preambleComplete'){
            const maxTargets = 3 + this.upcastAmount
            await this.recurItemUse(maxTargets)
        } 
        if(this.data.options?.notCast && this.hook === 'midi-qol.DamageRollComplete'){
            if(this.hasEffect(this.firstTarget, 'Shield') && this.data.damageDetail.length) {
                this.appendMessageMQ(`The shield blocks the magic missile.`)
                this.data.damageDetail[0].damage = 0
                this.generateEffect(this.firstTarget, {effect: NAPOLITANOCONFIG.shield.effects.pre})
            }
        }
    }

    async _melfsAcidArrow(){
         if(!this.DamageOnlyWorkflow && this.hasTargets && !this.hasHitTargets) await this.damage({type: 'acid', half: true, roll: this.data.damageRoll, targets: [this.firstTarget], flavor: `${this.firstTarget.name} sustains acid damage from a missed acid arrow attack.`})
    }

    async _message(){
        game.whisperSweetNothings.whisperSweetNothings()
    }

    async _moonbeam(){
        this.setItem()
        if(this.hasOccurredOnce()) return
        await this.rollSaveDamage(this.firstHitTarget, {type: 'con'}, {targets: [this.firstHitTarget], dice: this.itemData.damageParts[0][0], type: 'radiant'})
        this.message(`${this.firstHitTarget.name} sustains ${this.damageData.roll.result} damage from moonbeam on a ${this.damageData.roll.formula} roll!`, {title: 'Moonbeam'})
        await this.setOccurredOnce()      
    }

    /**
     * Tested: v10
     * @returns 
     */
    async _motivationalSpeech(){
        if(!this.hasHitTargets) return
        this.hitTargets.forEach((value) => { 
            if (value.actor && this.hasEffect(value.actor, "Motivational Speech")){
                if(!this.getTempHP(value)) {
                    this.deleteEffect(value.actor)
                } else {
                    this.generateEffect(value)  
                    this.addActiveEffect({effectName: "Advantage on Next Attack", uuid: value.actor.uuid, origin: value.actor.uuid})
                }
            }
        });
    }

    /**
     * Tested: v10
     * @returns 
     */
    async _nathairsMischiefHook(){
        if(!this.sourceData.isConcentrating) return
        const source = await fromUuid(this.getEffect(this.source.actor, "Concentrating")?.origin);
        if (source.name === this.config.name){
            this.templateData.id = canvas.scene.templates.find(t => t.flags?.[napolitano.ID]?.['nathairs-mischief']?.userId === game.userId && t.flags?.[napolitano.ID]?.['nathairs-mischief']?.source === this.source.actor.id)?.id
            if(this.templateData.id){
                const doIt = await this.yesNo({title: `Nathair's Mischief`, prompt: `Move Nathair's Mischief cube template up to 10 feet then select Yes`, owner: this.sourceData.owner})
                if(doIt){
                    const flag = this.template.flags[napolitano.ID]['nathairs-mischief'];
                    macros.play([{actor: this.source.actor, item: this.getItem(), templateId: this.template.id, userId: flag.userId}], 'nathairsMischief', {hook: 'none'})
                }
            }
        }
    }

    async _necroticShroud(){
        if(!this.hasHitTargets || !this.hasEffect(this.source.actor, "Necrotic Shroud Damage") || this.getFlag(this.source.actor, 'necroticShroud') >= this.now || this.item.name === "Necrotic Shroud" || this.item.name === "Necrotic Shroud Damage") return
        const useShroud = await this.yesNo();
        if (useShroud) { 
            await this.setFlag(this.source.actor, {'necroticShroud': this.now})
            this.generateEffect(this.firstTarget)
            await this.damage({targets: [this.firstHitTarget], dice: `${this.sourceData.level}d1[necrotic]`, type: 'necrotic', show: false})
            this.message( `${this.name} deals an additional ${this.damageData.roll.total} necrotic damage with Necrotic Shroud!`, {title: `Necrotic Shroud Additional Damage`})
        }
    }

    /**
     * Tested: v10
     * @returns 
     */
    _packTactics(){
        if (this.hasItem() && this.itemData.isAttack){
            this.tokensInProximity(this.firstTarget) 
            const bud = this.proximityTokens.find(t => t.id !== this.source.token.id && t.id !== this.firstTarget.id && !t.actor?.effects?.find(e => !e.disabled && INCAPACITATEDCONDITIONS.includes(e.label)) && t.disposition === this.tokenData.disposition)
            if(bud) {
                const options = {title: "Pack Tactics"}
                if(getActorOwner(this.source.actor) === 'GM' && this.tokenData.disposition !== 1) options.whisper = "GM"
                this.message(`${this.source.token.name} gains advantage due to ${bud.name}'s proximity to ${this.firstTarget.name}`, options)
                return this.setMidiRollAdvantage()
            }
        }
    }

    async _pan(){
        const token = this.currentCombatantPlaceable
        if(game.user.isGM || this.token.isVisible){
            canvas.animatePan({x: token?.center.x, y: token?.center.y, duration: 500});
        }
    }

    async _parry(){
        const originalRollTotal = this.data.damageRoll?.total  ?? 0
        if(!this.itemData.isWeaponAttack || !originalRollTotal) return 
        const results = []
        const avail = this.hitTargetsArray.filter(t => 
                            this.hasItem({document: t, itemName: 'Maneuvers: Parry'}) 
                            && this.isResponsive(t)
                            && this.hasEffect(t, 'Maneuvers: Parry') 
                            && !this.hasEffect(t, 'Reaction')
                            && this.hasItem({itemName: "Superiority Dice", document: t, options: {uses: true}}) 
                            )
        if(!avail.length) return
        for(const token of avail) {
            results.push(this.yesNo({title: 'Parry', prompt: `The damage is <span class="napolitano-label">${originalRollTotal}</span>. Will ${token.name} use Parry to roll a superiority die and reduce the amount by that roll?`, owner: getActorOwner(token), document: token, img: this.getItem('Maneuvers: Parry', token)?.img}))
        }
        await Promise.all(results).then(async (values)=>{
            for (const value of values){
                if(value.yes){
                    const roll = await this.rollSuperiorityDie({document: value.document})
                    const mod = value.document.actor.system.abilities.dex.mod
                    await this.appendRoll(this.data.damageRoll, roll, {sign: -1, isDamage: true, mod: mod})
                    const supItem = this.getItem('Superiority Dice', value.document);
                    this.message(`${value.document.name} uses Parry, reducing the damage dealt of ${originalRollTotal} by ${roll.total + mod}.`, {title: "Parry"})
                    this.appendMessageMQ(`-${roll.total + mod} to damage due to Parry.`)
                    this.updateItemUses(-1, supItem)
                    this.addActiveEffect({effectName: 'Reaction', uuid: value.document.actor.uuid, origin: value.document.actor.uuid})
                    this.message(`Superiority Dice reduced by one on ${value.document.name}.`,{whisper: "GM"})
                }
            }
        })
    }

    _passWithoutTrace(){
        this.tokensInProximity(this.source.token, 30)
        const bud = this.proximityTokens.find(t => this.hasEffect(t) && t.disposition === this.tokenData.disposition)
        if(bud) {
            this.data.roll.data.steCheckBonus = "10"
            this.generateEffect(this.source.token) 
            this.message(`${this.name} gains a +10 bonus to their stealth roll due to Pass without Trace effect from ${bud.name}`, {title: 'Pass without Trace'})
        }
        return this.data.roll
    }

    async _potentSpellcasting(){
        if(!this.hasItem() || !this.hasHitTargets || !this.damageTotal || !this.source.actor.id || !this.item.id || !(this.itemData.isSpell && this.itemData.baseSpellLevel === 0)) return
        await this.appendRoll(this.data.damageRoll, false, {sign: 1, isDamage: true, mod: this.sourceData.wisdomMod})
        await this.appendMessageMQ(`+${this.sourceData.wisdomMod} additional damage from Potent Spellcasting.`)
        this.generateEffect(this.firstTarget)
    }

    async _powerSurge(){
        const item = this.getItem('Power Surge')
        if(item){
            if(this.ruleset === 'longRest' || (this.ruleset === 'shortRest' && !item.system.uses.value)) {
                await this.updateItem({_id: item.id, system: {uses:{value: 1}}}, item)
            } else {
                const result = await this.updateItemUses(1, item)
                if(result) this.message(`Power surge uses for ${this.name} updated by 1 to ${result}`, {title: 'Power Surged'})
            }
         }
    }

    async _precisionAttack(){
        const itm = this.getItem('Maneuvers: Precision Attack')
        if(!itm || !this.hasEffect(this.source.actor, 'Maneuvers: Precision Attack') || !this.data.attackTotal) return
        const supItem = this.getItem('Superiority Dice');
        if(!this.getItemUsesRemaining(supItem)) return
        const originalRollTotal = this.data.attackTotal
        const response = await this.yesNo({ title: 'Precision Attack', prompt: `Your attack total is <span class="napolitano-label">${this.data.attackTotal}</span>. Use Precision Attack?`, owner: this.sourceData.owner, img: itm.img})
        if(response){
            const sup = await this.rollSuperiorityDie()
            await this.appendRoll(this.data.attackRoll, sup, {sign: 1, isAttack: true})
            this.message(`${this.name} uses precision attack, increasing their attack roll from ${originalRollTotal} to ${this.data.attackTotal}.`, {title: 'Precision Attack'})
            this.appendMessageMQ(`+${sup.total} to attack roll due to Precision Attack.`)
            this.updateItemUses(-1, supItem)
            this.message(`Superiority Dice reduced by one on ${this.name}.`,{whisper: "GM"})
        }
    }

    async _produceFlame(){
        if(this.hasTargets){
            if(this.firstTarget.id !== this.source.token.id && this.hasEffect()){
                await this.deleteEffect()
            }
        } else {
            if(!this.hasEffect()) await this.addActiveEffect({effectName: 'Produce Flame', origin: this.source.actor.uuid, uuid: this.source.actor.uuid})
        }
    }

    async _rayOfEnfeeblement(){
        if (this.data.damageRoll?.formula && this.hasEffect() && this.itemData.isWeaponAttack && this.itemModifier() === 'str'){
            await this.wrapRoll(this.data.damageRoll, {mod: 2, div: true})
            this.appendMessageMQ(`Damage halved due to Ray of Enfeeblement.`)
        }
    }

    /**
     * Tested: v10
     * @returns 
     */
    async _relentless(){
        if(!this.hasItem({options: {uses: true}})) return
        const doIt = await this.yesNo({prompt: `${this.name}, Use Relentless?`, owner: this.sourceData.owner})
        if(doIt){
            await this.updateActor({data: {"system.attributes.hp.value": 1}})
            this.setItem()
            await this.updateItemUses(-1)
            this.message(`${this.name} rises back up after dropping to 0 HP!`, {title: 'Relentless'})
        }
    }

    /**
     * Tested: v10
     * @returns 
     */
    async _relentlessEndurance(){
        if(!this.hasItem({options: {uses: true}})) return
        const doIt = await this.yesNo({prompt: `${this.name}, Use Relentless Endurance?`, owner: this.sourceData.owner})
        if(doIt){
            await this.updateActor({data: {"system.attributes.hp.value": 1}})
            this.setItem()
            await this.updateItemUses(-1)
            this.message(`${this.name} rises back up after dropping to 0 HP!`, {title: 'Relentless Endurance'})
        }
    }
    
    /**
     * Tested: v10
     * Deletes the Experimental Elixer from the character
     */
    async _removeInfusions(){
        if (this.sourceData.experimentalElixirs.length) {
            this.message(`${this.sourceData.experimentalElixirs.map(i => i.name).join(', ')} has been deleted from ${this.source.actor.name} following a long rest.`, {title: 'Artificer Infusions Expired'})
            await this.source.actor.deleteEmbeddedDocuments('Item', this.sourceData.experimentalElixirs.map(i => i.id));
        }
    }

    async _scorchingRay(){
        if(!this.item.name === 'Scorching Ray') return
        const maxTargets = 3 + this.upcastAmount
        await this.recurItemUse(maxTargets)
    }

    async _shield(){
        if(this.hasHitTargets && (this.itemData.isAttack || this.item.name === 'Magic Missile')){
            const results = []
            for(const token of this.hitTargetsArray) {
                if( 
                    this.isResponsive(token)
                    && !this.hasEffect(token, 'Reaction')
                    && this.hasItem({document: token,  options: {uses: true, type: 'spell'}}) 
                ){
                    let choices = this.getSpellOptions({document: token})
                    if(choices.length) results.push(this.choose(choices, `${token.name}, ${this.item.name === 'Magic Missile' ? 'you are targeted by magic missile': 'the attack roll is a ' + this.data.attackRoll?.terms[0]?.total }. Cast Shield?`, 'Shield', {owner: getActorOwner(token), document: token, img: this.getItem("Shield", token, {type: 'spell'})?.img}))                
                }
            }
            await Promise.all(results).then(async (values)=>{
                let cast = false
                for (const value of values.filter(v => v.choice)){
                    const updated = await this.updateSpellUse(-1, value.choice, {document: value.document})
                    if(updated.updated >= 0){
                        cast = true
                        this.message(`${value.document.name} spell level ${value.choice} reduced by one.`, {title: "Shield Cast", whisper: "GM"})
                        await this.addActiveEffect({effectName: 'Shield', uuid: value.document.actor.uuid, origin: value.document.actor.uuid})
                        await this.addActiveEffect({effectName: 'Reaction', uuid: value.document.actor.uuid, origin: value.document.actor.uuid})
                    } else {
                        this.message(`${value.document.name} does not have any remaining uses at the ${value.choice} level.`, {title: "Counterspell Not Cast"})
                    }    
                }
                if(cast && this.itemData.isAttack) await this.recheckHits();
            })
        } 
    }

    async _shortRest() {
        await this._powerSurge();
    } 

    async _silveryBarbs(){
        let type, originalRollTotal, rollSource, success = true
        switch(this.hook){
            case 'midi-qol.AttackRollComplete':
                type = 'attack'
                rollSource = this.data.attackRoll
                if(!this.hasHitTargets) success = false
                break;
            case 'napolitano.postContest':
                type = 'ability check'
                const winner = this.data.won ? this.data.source : this.data.target
                rollSource = winner.roll
                this.source.token = winner.token
                this.source.actor = winner.actor
                break;
            default:
                type = 'saving throw'
                rollSource = this.roll
                break;
        }
        if(!rollSource?.terms?.[0] || !this.source.token?.id) return
        originalRollTotal = rollSource.terms[0]?.total ?? 0
        if(!success || !rollSource.terms.find(d => d.faces === 20)) return 
        const results = []
        for(const token of this.scene.tokens) {
            if(
                !this.hasEffect(token, 'Reaction') 
                && this.isResponsive(token) 
                && this.tokenData.disposition !== token.disposition 
                && this.hasItem({document: token, options: {uses: true}}) 
                && this.getDistance(token, this.source.token) <= 60
            ){
                let choices = this.getSpellOptions({document: token})
                if(choices.length) results.push(this.choose(choices, `${token.name}, The creature's ${type} roll succeeds with a <span class="napolitano-label">${originalRollTotal}</span>. Cast Silvery Barbs?`, 'Silvery Barbs', {owner: getActorOwner(token), document: token, img: this.getItem("Silvery Barbs", token)?.img}))        
            }
        }
        if(results.length){
            await Promise.all(results).then(async (values)=>{
                const casts = values.filter(v => v.choice)
                if(casts.length){
                    const adv = []
                    for (const value of casts){
                        const updated = await this.updateSpellUse(-1, value.choice, {document: value.document})
                        if(updated.updated >= 0){
                            this.message(`${value.document.name} spell level ${value.choice} reduced by one.`, {title: "Silvery Barbs Cast", whisper: "GM"})
                            const result = await this.rerollReplace(rollSource, {keep: 'lowest', isAttack: type === 'attack' ? true : false})
                            this.message(`${value.document.name} casts Silvery Barbs at level ${updated.lvl}. They roll a ${result.new.terms[0]?.total} and ${result.new.terms[0]?.total < originalRollTotal ? 'replace' : 'keep'} the original roll of ${originalRollTotal}.`, {title: "Silvery Barbs"})
                            this.addActiveEffect({effectName: 'Reaction', uuid: value.document.actor.uuid, origin: value.document.actor.uuid})
                            adv.push(this.promptTarget({title: 'Silvery Barbs Advantage', origin: value.document.actor.uuid, owner: getActorOwner(value.document), event: 'Grant Silvery Barbs Advantage', prompt: `Select a target to grant advantage to on their next attack roll, saving throw or ability check.`}))
                            if(type === 'attack'){
                                await recheckHits();
                            }
                        } else {
                            this.message(`${value.document.name} does not have any remaining uses at the ${value.choice} level.`, {title: "Silvery Barbs Not Cast"})
                        }    
                    }
                    await Promise.all(adv).then(async (grantees)=>{
                        for (const grantee of grantees){
                            if(grantee.targets[0]){
                                const target = this.scene.tokens.find(t => t.id === grantee.targets[0])
                                if(target) this.addActiveEffect({effectName: 'Silvery Barbs Advantage', origin: grantee.origin, uuid: target.actor.uuid})
                            }
                        }
                    });
                }
            })
        }
    }

    /**
     * Tested: v10
     */
    async _sleep(){
        if(this.damageTotal){
            this.targets = new Set(this.targetsArray.filter(i=> this.getHP(i.actor)).sort((a, b) => this.getHP(this.scene.tokens.get(a.id)) < this.getHP(this.scene.tokens.get(b.id)) ? -1 : 1))
            let remainingHp = this.damageTotal;
            this.targets.forEach((target) => {      
                if (remainingHp >= this.getHP(target) && !this.hasImmunity(target, "Charmed") & !this.hasEffect(target, "Unconscious")) {
                    remainingHp -= this.getHP(target);
                    this.addActiveEffect({effectName: "Unconscious", uuid: target.uuid, origin: this.source.actor.uuid})
                    this.generateEffect(target)
                    this.message(`${target.name} is taken by sleep and falls unconscious!`, {title: 'Sleep'})
                } 
            }); 
        } 
    }

    async _spikeGrowth(){
        await this.damage({targets: [this.firstHitTarget], itemData: this.getItem('Spike Growth Effect'), dice: '2d4', type: 'piercing'})
        this.message(`${this.firstHitTarget.name} walks across spiky terrain and sustains ${this.damageData.roll.result} damage!`, {title: 'Spike Growth'})
    }

    async _spiritGuardians(){
        switch(this.hook){
            case 'napolitano-aura':
                if(this.tokenData.disposition === this.firstTarget.disposition || this.getFlag(this.source.actor, `spiritGuardians`)?.[`${this.firstHitTarget.id}`] >= this.now) return
                this.setItem()
                this.generateEffect(this.firstTarget)
                this.spellLevel = this.getEffect()?.changes?.[0]?.value ?? 3
                await this.rollSaveDamage(this.firstHitTarget, {type: 'wis'}, {targets: [this.firstHitTarget], dice: `${this.spellLevel}d8`, type: this.sourceData.isEvil ? 'necrotic' : 'radiant'})
                this.message(`${this.firstTarget.name} sustains ${this.damageData.roll.result} damage from spirit guardians.`, {title: 'Spirit Guardians'})
                await this.setFlag(this.source.actor, {spiritGuardians: {[this.firstHitTarget.id]: this.now}})
                break;
            case 'deleteActiveEffect':
                await this.removeTag(['NAP-SOT-15-SPIRITGUARDIANS','NAP-MOV-ANY-15-SPIRITGUARDIANS'])
                break;
            case 'createActiveEffect':
                await this.addTag(['NAP-SOT-15-SPIRITGUARDIANS','NAP-MOV-ANY-15-SPIRITGUARDIANS'])
                break;
        } 
    }
    
    /**
     * Tested: v10
     * @returns 
     */
    async _tasteOfTheStones(){
        if(!this.hasItem()) return
        this.setItem()
        this.message(`Dreamer ${this.source.actor.name} has made a perception or insight check. Are they dreaming?`, {whisper: "GM", title: 'Taste of the Stones'})
    }

    /**
     * Tested: v10
     */
    _templateTargeting(){
        const rule = this.templateModification
        if(Object.keys(rule).length){
            const targets = new Set()
            this.targets.forEach (function(value) {
                if(rule.removeSelf && value.id === this.source.token.id) return
                if(rule.friendly && value.disposition === this.tokenData.disposition) targets.add(value)
                if(rule.foe && value.disposition !== this.tokenData.disposition) targets.add(value)
              }, this)
            this.targets = targets;
            this.setUserTargetsWithTargets()
        }
    }

    async _tokenMovement(){
        if(this.auraAnyMove0Feet.length) await this._auraEffects({auraTokens: this.auraAnyMove0Feet, distance: 0, tag: 'NAP-MOV-ANY-0'})
        if(this.auraAnyMove10Feet.length) await this._auraEffects({auraTokens: this.auraAnyMove10Feet, distance: 10, tag: 'NAP-MOV-ANY-10'})
        if(this.auraAnyMove15Feet.length) await this._auraEffects({auraTokens: this.auraAnyMove15Feet, distance: 15, tag: 'NAP-MOV-ANY-15'})
        if(this.auraMoveOut.length) await this._auraEffects({auraTokens: this.auraMoveOut, distance: -1, tag: 'NAP-MOV-OUT'})
    }

    /**
     * Tested: v10
     * @returns 
     */
    async _toggleEffectEffects(){
        if(this.hook === 'updateItem') this.activeEffect = this.getEffect(this.source.actor, this.item.name, !this.activeEffectDelete) 
        if(!this.activeEffect) return
        const trackingId = {trackingId: this.activeEffect.label.replace(/\s+/g, '-').replace(/\W+/g, '')}
        switch(this.activeEffect.label){
            case 'Blind':
            case 'Blinded':
                this.rulesubset = 'blind';
                !this.activeEffectDelete ? await this.updateSight({data: {enabled: false}, ...trackingId}) : await this.revertSight(trackingId) 
                break;
            case 'Darkvision':
            case 'Goggles of Night':
                !this.activeEffectDelete ? await this.updateSight({data: {range: 60, visionMode: "darkvision"}, ...trackingId}) : await this.revertSight(trackingId) 
                break;
            case 'True Seeing':
                !this.activeEffectDelete ? await this.updateDetection({data: {id: "seeAll", enabled: true, range: 120}, ...trackingId}) : await this.revertDetection(trackingId) 
                break;
            case 'Tether Sense':
                if(!this.activeEffectDelete) {
                    await this.updateSight({data: {range: 30, visionMode: "tremorsense"}, ...trackingId})
                    await this.updateDetection({data: { id: "feelTremor", enabled: true, range: 30}, ...trackingId})
                } else {
                    await this.revertSight(trackingId)
                    await this.revertDetection(trackingId) 
                }
                break;
        }
        if(this.source.token && this.config?.animate) this.activeEffectDelete ? await this._removeTokenAnimation(this.sequencerName(this.source.token)) : await this._addTokenAnimation(this.generateEffect(this.source.token))
    }

    async _torch(){
        this.setItem('Torch')
        if (this.item?.id && !this.itemData.quantity) await this.deleteItem({message: "Torch is removed from " + this.source.actor.name + "'s inventory due to 0 quantitiy"}) 
    }

    async _wardingFlare(){
        if(!this.hasTargets || !this.itemData.isAttack) return
        const results = []
        this.targets.forEach((value) => {
            if (this.hasEffect(value) && !this.hasEffect(value, 'Reaction') && this.hasItem({document: value, options: {uses: true}}) && this.getDistance(value, this.source.token) <= 30) results.push(this.yesNo({title: 'Warding Flare', prompt: `${value.name}, Use Improved Flare?`, owner: getActorOwner(value), document: value, img: this.getItem(this.config.name, value)?.img}))
        })
        const improved = this.scene.tokens.filter(t => 
            this.hasEffect(t, "Improved Flare") 
            && this.isResponsive(t)
            && t.disposition !== this.tokenData.disposition 
            && !this.hasEffect(t, 'Reaction')
            && this.hasItem({itemName: "Warding Flare", document: t, options: {uses: true}}) 
            && this.getDistance(t, this.source.token) <= 30 
            && !this.targetsArray.find(a => a.id === t.id)
            )
        for(const improve of improved) {results.push(this.yesNo({title: 'Improved Flare', prompt: `${improve.name}, Use Improved Flare?`, owner: getActorOwner(improve), document: improve, img: this.getItem("Improved Flare", improve)?.img}))}
        await Promise.all(results).then(async (values)=>{
            for (const value of values){
                if(value.yes){
                    await this._wardingFlareGenerate(value.document)
                }
            }
        })
    }

    async _wardingFlareGenerate(token){
        this.generateEffect(token)
        this.updateItemUses(-1, this.getItem('Warding Flare', token))
        this.message(`${token.name} throws up a Warding Flare!`, {title: 'Warding Flare'})
        this.data.disadvantage = true, this.data.rollOptions.disadvantage = true;
        this.addActiveEffect({effectName: 'Reaction', uuid: token.actor.uuid, origin: token.actor.uuid})
    }

    async _whisperingAura(){
        if(!this.targets.size) return
        this.setItem()
        const results = []
        let failures = []
        this.targets.forEach((value) => {
            this.generateEffect(value)
            results.push(this.rollSave(value, {dc: this.itemData.dc, type: 'wis'}))
        })
        await Promise.all(results).then(async (values)=>{
            failures = values.filter(r => !r.success).map(r => r.document)
            if(failures.length) await this.damage({targets: failures, type: this.itemData.damageParts[0][1], dice: this.itemData.damageParts[0][0]})    
            })
        this.message( `The aura from ${this.name} extends out to those around it requiring a saving throw. ${failures.length ? failures.map(f => f.name).join(', ') + (failures.length === 1 ? ' fails their saving throw and takes ': ' fail their saving throws and take ') + this.damageData.roll.total + ' psychic damage.': 'All creatures in range make their saving throws.'}`, {title: 'Whispering Aura'})
    }

    /**
     * Tested: v10
     */
    async _wildSurgeRetribution(){
        if(!this.hasHitTargets) return
        let hit = false;
        this.hitTargets.forEach((value) => { 
          if (value.actor && this.hasEffect(value.actor, "Rage") && this.hasEffect(value.actor, this.config.name)){
              hit = true;
              this.generateEffect(value)
          }
        });
        if(hit) {
            this.roll = await new Roll(`1d6`).evaluate({async: true})
            await this.damage({type: "force", targets: [this.source.token], itemData: this.getItem(), itemCardId: "new"})
            this.message(`The Wild Magic Surge from the targets that were attacked deals ${this.roll.total} force damage to ${this.source.actor.name}.`, {title: 'Wild Magic Surge'})
        }
    }

    async _witchBolt(){
        if(this.hasItem() && this.sourceData.isConcentrating){
            this.setItem()
            this.setHitTargets(this.scene.tokens.filter(t => this.hasEffect(t.actor) && this.item.uuid === this.getEffect(t.actor)?.origin))
            if(!this.hasHitTargets) return
            this.spellLevel = this.getEffect(this.firstHitTarget.actor).changes[0].value
            const doIt = await this.yesNo({title: 'Witch Bolt', prompt: `${this.name}, Continue concentrating?`, owner: this.sourceData.owner})
            if(doIt){
                this.generateEffect(this.firstHitTarget)
                this.roll = await new Roll(`${this.spellLevel}d12`).evaluate({async: true})
                await this.damage({type: 'lightning'})
            } else{
                await this.removeConcentration()
            }
        }
    }
}