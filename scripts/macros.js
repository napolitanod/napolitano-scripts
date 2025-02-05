import {napolitano} from "./napolitano-scripts.js";
import {framework} from "./workflow.js";
import {importActorIfNotExists, moduleActive, toTitleCase, wait} from "./helpers.js";
import {DAMAGERESISTANTTYPES, DAMAGETYPES, DRAGONVESSELSLUMBERING, DRAGONVESSELSTIRRING, EXPERIMENTALELIXIRS, FAMILIARS, FAMILIARTYPES, SIZES, SPELLS, SPIRITUALWEAPONS} from "./constants.js";

export class macros extends framework {
    constructor(...args){
        super(...args)
    }

    /**
     * 
const _napOps = {
    actor: actor,
    item: item,
    speaker: speaker
}
game.napolitano.macros(args, 'createBonfire', _napOps)
     * @param {*} args 
     * @param {*} ruleset 
     * @param {*} options 
     */
    static async play(args = [], ruleset, options = {}){
        Object.assign(options, {
            dae: args.length > 1 ? args[0] : false,
            hud: options.hud ? true : false,
            itemMacro: args.length ? false : true
        })
        const macro = new macros(ruleset, args[args.length-1], options)
        await macro._initialize()
        switch(ruleset){
            case 'armorOfAgathys': await macro._armorOfAgathys(); break;
            case 'bagOfTricksGray': await macro._bagOfTricksGray(); break;
            case 'bagOfTricksTan': await macro._bagOfTricksTan(); break;
            case 'bendLuck': await macro._bendLuck(); break;
            case 'bigbysHand': await macro._bigbysHand(); break;
            case 'blight': await macro._blight(); break;
            case 'blindnessDeafness': await macro._blindnessDeafness(); break;
            case 'brazierOfCommandingFireElementals': await macro._brazierOfCommandingFireElementals(); break;
            case 'channelDivinityInvokeDuplicity': await macro._channelDivinityInvokeDuplicity(); break;
            case 'chromaticOrb': await macro._chromaticOrb(); break;
            case 'climbUpon': await macro._climbUpon(); break;
            case 'confusingGaze': await macro._confusingGaze(); break;
            case 'createBonfire': await macro._createBonfire(); break;
            case 'darkness': await macro._darkness(); break;
            case 'dawn': await macro._dawn(); break;
            case 'disarm': await macro._disarm(); break;
            case 'dislodgeFrom': await macro._dislodgeFrom(); break;
            case 'dodge': await macro._dodge(); break;
            case 'dragonsBreath': await macro._dragonsBreath(); break;
            case 'dragonVessel': await macro._dragonVessel(); break;
            case 'dreamDevourer': await macro._dreamDevourer(); break;
            case 'dustDevil': await macro._dustDevil(); break;
            case 'elementalGem': await macro._elementalGem(); break;
            case 'experimentalElixer': await macro._experimentalElixer(); break;
            case 'falseLife': await macro._falseLife(); break;
            case 'findFamiliar': await macro._findFamiliar(); break;
            case 'fireShield': await macro._fireShield(); break;
            case 'formOfDread': await macro._formOfDread(); break;
            case 'gazerEyeRays': await macro._gazerEyeRays(); break;
            case 'genericContest': await macro._genericContest(); break;
            case 'guardianOfFaith': await macro._guardianOfFaith(); break;
            case 'goodberry': await macro._goodberry(); break;
            case 'grapple': await macro._grapple(); break;
            case 'grapplingPin': await macro._grapplingPin(); break;
            case 'grapplingStrike': await macro._grapplingStrike(); break;
            case 'hex': await macro._hex(); break;
            case 'hexbladesCurse': await macro._hexbladesCurse(); break;
            case 'helpAttack': await macro._helpAttack(); break;
            case 'helpCheck': await macro._helpCheck(); break;
            case 'hide': await macro._hide(); break;
            case 'iceKnife': await macro._iceKnife(); break;
            case 'lesserRestoration': await macro._lesserRestoration(); break;
            case 'lungingAttack': await macro._lungingAttack(); break;
            case 'manifestEcho': await macro.manifestEcho(); break;
            case 'magicalTinkering': await macro._magicalTinkering(); break;
            case 'melfsMinuteMeteors': await macro._melfsMinuteMeteors(); break;
            case 'mirrorImage': await macro._mirrorImage(); break;
            case 'moonbeam': await macro._moonbeam(); break;
            case 'nathairsMischief': await macro._nathairsMischief(); break;
            case 'naturalBargainer': await macro._naturalBargainer(); break;
            case 'necroticShroud': await macro._necroticShroud(); break;
            case 'overrun': await macro._overrun(); break;
            case 'powerSurge': await macro._powerSurge(); break;
            case 'ready': await macro._ready(); break;
            case 'search': await macro._search(); break;
            case 'shadowGaze': await macro._shadowGaze(); break;
            case 'shadowTattoo': await macro._shadowTattoo(); break;
            case 'shoveToSide': await macro._shove(); break;
            case 'shoveBack': await macro._shove(); break;
            case 'shoveProne': await macro._shove(); break;
            case 'spiritualWeapon': await macro._spiritualWeapon(); break;
            case 'stormSphere': await macro._stormSphere(); break;
            case 'summonAberration': await macro._summonAberration(); break;
            case 'staffOfThePython': await macro._staffOfThePython(); break;
            case 'summonBlight': await macro._summonBlight(); break;
            case 'sustainedLife': await macro._sustainedLife(); break;
            case 'tollTheDead': await macro._tollTheDead(); break;
            case 'tumble': await macro._tumble(); break;
            case 'turnUndead': await macro._turnUndead(); break;
            case 'unseenServant': await macro._unseenServant(); break;
        }
    }

    //internal functions
    async _initialize(){
        super._initializePre()
        this.speaker = this.options.speaker ?? {};
        
        napolitano.log(false, `Initializing...`, this); 
        if(this.feature.hud){
            this.source.token = this.data.token;
            this.source.actor = this.source.token.actor ?? {};
            for(const target of this.data.targets){
                const t = canvas.scene.tokens.find(t => t.id === target)
                this.targets.add(t)
            }
        }
        else if(this.feature.dae){
            this.item = fromUuidSync(this.data.origin);
            this.source.actor = this.item.actor;
            const t = fromUuidSync(this.data.tokenUuid);
            this.targets.add(t)
            this.setHitTargets([t])
        } else if(this.feature.itemMacro){
            this.item = this.options.item;
            this.source.actor = this.options.actor;
        } else {
            this.item = await fromUuid(this.data.item.uuid);
            this.source.actor = this.data.actor;
            this.source.token = this.scene.getEmbeddedDocument("Token", this.data.tokenId);
            this.targets = this.data.targets ? new Set (this.data.targets) : new Set;
            this.setHitTargets(this.data.hitTargets);
            this.setFailedSaves(this.data.failedSaves)
            this.spellLevel = this.data.spellLevel ?? 1,
            this.upcastAmount = this.data.spellLevel ? this.data.spellLevel - this.itemData.baseSpellLevel: 0
            if(this.data.templateId) this.templateData.id = this.data.templateId
        }
        super._initializePost()
        napolitano.log(false, `Macros initialized ${this.ruleset}...`, this);
    }

    async _armorOfAgathys(){
        if(this.feature.dae==='on') this.generateEffect(this.firstHitTarget)
        if(this.feature.dae==='off' && this.sourceData.tempHp) this.effectEndTempHP()
    }

    

    async _bagOfTricksGray(){
        await this.summon({table: true});
        this.message(`You pull out from your gray sack a ${this.tableRollText}.`, {title: 'Gray Bag of Tricks'})
    }

    async _bagOfTricksTan(){
        await this.summon({table: true});
        this.message(`You pull out from your tan sack a ${this.tableRollText}.`, {title: 'Tan Bag of Tricks'})
    }

    async _bendLuck(){
        await this.rollDice('1d4')
        this.message(`${this.name} uses their bend luck reaction, spending 2 sorcery points and adding ${this.roll.total} to the target roll.`, {title: 'Bend Luck'})
    }

    async _bigbysHand(){
        this.summonData.updates = {
            actor: {
                system:{
                    attributes: {
                        hp: {
                            max: this.sourceData.maxHp,
                            value: this.sourceData.maxHp
                        }
                    }
                }
            },
            embedded: { 
                Item: {
                "Clenched Fist": {
                    "system":{
                        "attackBonus": `${this.sourceData.spellAttack} - @prof`,     
                        "damage.parts": [
                            [`${4 + (this.upcastAmount*2)}d8[force]`, "force"]
                        ]
                        }
                    },
                "Crushing Hand (Grappling Damage)": {
                    "system":{    
                        "damage":{
                            "parts": [
                                [`${2 + (this.upcastAmount*2)}d6[bludgeoning] + ${this.sourceData.spellMod}`, "bludgeoning"]
                            ]
                            }
                        }
                    },
                "Forceful Hand": {
                    "system":{    
                        "chatFlavor": `The hand attempts to shove the target up to ${5 + (this.sourceData.spellMod*5)} feet`
                        }
                    }
                }
            }
        }
        await this.summon();
    }

    async _blight(){
        if(!this.hasHitTargets) return
        this.generateEffect(this.firstTarget, {source: this.source.token})
        const type = this.getActorType(this.firstTarget) 
        this.roll = await new Roll(`${type==='plant' ? `${((this.spellLevel+4) * 8)}d1` : `${this.spellLevel+4}d8`}`).evaluate();   
        const saveRoll = await this.firstTarget.actor.rollAbilitySave("con", {flavor: `${CONFIG.DND5E.abilities["con"].label} DC ${this.sourceData.spelldc} Blight`, fastforward: true, disadvantage: type==='plant' ? true : false })   
        if (["undead", "construct"].includes(type)) return this.message(`${this.firstTarget.name} resists the blight because they are a ${type}`, {title: 'Blight Resisted', whisper: "GM"});
        await this.damage({type: "necrotic", targets: [this.firstTarget], half: saveRoll.total >= this.sourceData.spelldc ? true : false})
    }

    async _blindnessDeafness(){
        if(this.feature.dae!=='on' || !this.hasTargets) return 
        const choice = await this.choose(['Blind', 'Deafen'], 'Choose to blind or deafen', 'Blindness/Deafness', {owner: this.sourceData.owner, img: this.item.img})
        if(choice) await this.addActiveEffect({effectName: `${choice}ed Spell`, uuid: this.firstTarget.actor.uuid, origin: this.source.actor.uuid})
    }

    async _brazierOfCommandingFireElementals(){
        await this.summon();
        this.message( `${this.name} speaks the brazier’s command word and summons a fire elemental.`, {title: this.item.name})
    }

    async _channelDivinityInvokeDuplicity(){
        this.summonData.updates = {
            token: {
                texture: {
                    src: this.source.token.texture.src
                }
            }
        }
        await this.summon();
    }

    async _chromaticOrb(){
        if(!this.hasHitTargets) return
        const type = await this.choose(this.config.options, `Choose Damage Type : `)
        await this.rollDice(`${(this.spellLevel + 2) * (this.isCritical ? 2 : 1)}d8`)
        await this.damage({type: type, targets: [this.firstHitTarget], show: false})
    }

    async _climbUpon(){
        if(!this.firstTarget) return this.error('You must target a token!')
        const targetSize = this.getSize(this.firstTarget)
        if(SIZES[targetSize] - SIZES[this.sourceData.size] < 2) return this.error('You cannot climb onto a creature that is less than 2 sizes larger than you!')
        await this.contest()
        if(this.contestData.won){
            await wait(2000) 
            this.message(`${this.name} successfully climbs upon the hostile creatures space!`, {title: 'Climb Onto a Bigger Creature'})
        }
    }

    async _confusingGaze(){//tested v10
        if(this.feature.dae === "on"){
            const options = {}
            await this.rollTable();
            if (["5","6"].includes(this.tableRollResult)) options.direction = await this.randomDirection()
            this.generateEffect(this.firstHitTarget)
            this.message(this.stringParameterReplace(this.tableRollText, options), {title: 'Confusing Gaze'})
        }
    }

    async _createBonfire(){//tested v10
        this.summonData.updates = {
            embedded: { 
                Item: {
                    "Fire": {
                        "system.damage.parts": [[`${this.cantripScale}d8`,"fire"]],
                        "system.save": {ability:"dex", dc: this.sourceData.spelldc, scaling:"flat"}
                    }
            }}
        }
        await this.summon();
        await this.deleteTemplates();
    }

    async _darkness(){
        await this.summon();
    }

    async _dawn(){
        this.summonData.updates = {
            embedded: { 
                Item: {
                    "Dawn Effect": {
                        "system.save": {ability:"con", dc: this.sourceData.spelldc, scaling:"flat"}
                    }
            }}
        }
        await this.summon()
    }

    async _disarm(){
        this.message(`${this.name} attempts to disarm their opponent!`, {title: 'Disarm Attempt Initiated'})
        const weapons = this.source.actor.items.filter(i => i.type === 'weapon')
        const choice = await this.choose(weapons.map(w => [w.id, w.name]), 'Choose the weapon to make the disarming attack with.', `${this.name} choose weapon`)
        const item = weapons.find(w => w.id === choice)
        if(!item) return
        this.contestData.source.roll = await item.rollAttack({fastForward: true})
        this.contestData.target.roll = await this.rollSkill(['ath', 'acr'], 'Choose skill to counteract the disarm attempt', this.firstTarget)
        await wait(4000) 
        this.message(`${this.name} ${this.contestData.source.roll.total > this.contestData.target.roll.total ? 'succeeds at ' : 'fails at '} disarming their opponent`, {title: 'Disarm Attempt Result'})
    }

    async _dislodgeFrom(){
        if(!this.firstTarget) return this.error('You must target a token!')
         await this.contest()
        if(this.contestData.won){
            await wait(2000) 
            this.message(`${this.name} successfully dislodges the hostile creature!`, {title: 'Dislodge Creature'})
        }
    }

    async _dodge(){
        await this.addActiveEffect({effectName: "Dodge", uuid: this.source.actor.uuid, origin: this.source.actor.uuid})
    }

    async _dragonsBreath(){
        const choice = await this.choose(this.config.options, `Choose Breath Type : `)
        if(choice){
            await this.addItem({document: this.firstTarget, data : {
                "name": `${toTitleCase(choice)} Breath`,
                "type": "weapon",
                "system": {
                    "source": `Dragons Breath Spell`,
                    "quantity": 1,
                    "activation": {
                        "type": "action",
                        "cost": 1,
                        "condition": ""
                    },
                    "target": {
                        "value": 15,
                        "width": null,
                        "units": "ft",
                        "type": "cone"
                    },
                    "ability": this.sourceData.spellAbility,
                    "actionType": "save",
                    "attackBonus": 0,
                    "chatFlavor": "",
                    "critical": null,
                    "damage": {
                        "parts": [
                            [
                                `${this.spellLevel + 1}d6`,
                                `${choice}`
                            ]
                        ],
                    },
                    "save": {
                        "ability": "dex",
                        "dc": this.sourceData.spelldc,
                        "scaling": "flat"
                    },
                    "weaponType": "natural",
                    "proficient": true,
                    "equipped":true
                },
                "img": "icons/magic/acid/projectile-smoke-glowing.webp",
                "flags": {
                    "ddbimporter": {"ignoreItemImport": true}, 
                    "napolitano-scripts":{'dragonsBreath': true}
                }
            }})
            this.generateEffect(this.firstTarget)
        }
    }

    async _dragonVessel(){
        const currentLiquid = this.source.actor.items.find(i => i.flags?.['napolitano-scripts']?.dragonVessel)
        if (currentLiquid){
            let expired = (currentLiquid.flags?.['napolitano-scripts'].dragonVessel >= this.now) ? 'If the liquid had magical properties, these have since been lost.' : ''
            return this.warn(`Dragon vessel is already filled with ${currentLiquid.name}. ${expired}`)
        }
        let options;
        switch(this.item.name){
            case 'Dragon Vessel (Slumbering)':
                options = DRAGONVESSELSLUMBERING;
                break;
            case 'Dragon Vessel (Stirring)':
                options = DRAGONVESSELSTIRRING;
                break;
        } 
        const choice = await this.choose(Object.entries(options).sort(([,a],[,b]) => a.localeCompare(b)), 'Choose a liquid to fill the vessel with:')
        if(choice){
            this.itemAddData.name = options[choice]
            await this.addItemName()
            const newItem = this.itemAddData.newItems?.[0]
            if(newItem) await this.updateItem({name: newItem.name + ' (Dragon Vessel)', flags: {'napolitano-scripts':{dragonVessel: this.in24Hours}, "ddbimporter": {"ignoreItemImport": true}}, system: {activation: {condition: `Loses any magical properties ${this.dateTimeDescription(this.in24Hours)}`}}},newItem)
            this.message(`${this.source.actor.name} fills their ${this.item.name} with ${options[choice]}.`, {title: 'Dragon Vessel'})
        }
    }

    async _dreamDevourer(){
        const choice = await this.choose(DAMAGERESISTANTTYPES, `Select the power that the dream yields to you: `)
        let damage = choice.toLowerCase()
        if(!DAMAGETYPES.find(d => d[0] === damage)) damage = 'psychic';
        const data = {
            "changes": [
                {
                    "key": `system.traits.dr.value`,
                    "mode": 0,
                    "value": `${damage}`,
                    "priority": "20"
                },
                {
                    "key": "system.bonuses.All-Damage",
                    "mode": 2,
                    "value": `+ ${this.sourceData.constitutionMod}[${damage}]`,
                    "priority": "20"
                }
            ],
            "disabled": false,
            "duration": {"startTime": null},
            "icon": "icons/magic/nature/tree-spirit-blue.webp",
            "name": "Dream Devourer",
            "origin": this.item.uuid,
            "transfer": false,
            "flags": {
                "dae": {
                    "stackable": "none",
                    "macroRepeat": "none",
                    "specialDuration": [],
                    "transfer": false
                },
                "dnd5e-helpers": {
                    "rest-effect": "Long Rest"
                }
            },
            "tint": ""
        };
        await this.addActiveEffectDerived({data: data, message: `${this.name} devours a dream and gains power in ${damage}.`})
    }

    async _dustDevil(){
        this.summonData.updates = {
            embedded: { 
                Item: {
                    "Dust Devil Bludgeoning": {
                        "system.damage.parts": [[(this.spellLevel - 1) + "d8[bludgeoning]","bludgeoning"]],
                        "system.save": {ability:"str", dc: this.sourceData.spelldc, scaling:"flat"}
                    }
                }
            }
        }
        await this.summon();
    }

    async _elementalGem(){
        switch(this.item.name){
            case 'Elemental Gem (Red Corundum)':
                this.rulesubset = 'redCorundum'
                this.generateEffect(this.source.token, {effect: this.config.effects.intro, 
                    sound: this.config.sounds.intro})
                await this.summon();
                await this.deleteItem()
                this.message( `You break the Red Corundum, releasing the elemental. The gem's magic is lost`, {title: this.item.name})
        }
    }

    async _experimentalElixer(){
        new Dialog({
            title: this.config.name,
            buttons: {
                rest: {
                    icon: "<i class='fas fa-bed'></i>",
                    label: `Long Rest`,
                    callback: async () => {
                        await this.rollDice(`1d6`)
                        this.message(`${this.source.actor.name} rolls a ${this.roll.total} while brewing an elixir.` , {title: 'Experimental Elixer'}) 
                        this.itemAddData.name = EXPERIMENTALELIXIRS[this.roll.total]
                        if(this.itemAddData.name) this._experimentalElixerBrew();
                        }     
                    },
                slot: {
                    icon: "<i class='fas fa-magic'></i>",
                    label: `Spell Slot`,
                    callback: () => {
                        new Dialog({
                            title: `Enter the spell level for the slot you wish to use.`,
                            content: `
                            <form>
                                <div class="form-group">
                                    <label>Level:</label>
                                    <select id="spell-level" name="spell-level">
                                    ${ Object.entries(SPELLS).sort(([,a],[,b]) => a.localeCompare(b)).map(arr=> {return `\t<option value="${arr[0]}">${arr[1]}</option>`}).join('\n')}
                                    </select>
                                </div>
                            </form>
                            `,
                            buttons: {
                                submit: {
                                    icon: "<i class='fas fa-magic'></i>",
                                    label: `Expend Slot`,
                                    callback: (html) => {
                                        const spellIndex = parseInt(html.find('[name="spell-level"]')[0].value);
                                        if(!this.getSpellSlotsRemaining(spellIndex)) return this.message(`${this.name} does not have any spell slots left at level ${spellIndex}`, {title: 'Experimental Elixer'})
                                        this.updateActor({data: {system: {spells:{[`spell${spellIndex}`]:{value: this.getSpellSlotsRemaining(spellIndex)-1}}}}}); 
                                        this.message(`One spell slot deducted from ${this.source.actor.name} at level ${spellIndex}`, {title: 'Experimental Elixer'});
                                        new Dialog({
                                            title: this.config.name,
                                            content: `
                                                <form>
                                                    <div class="form-group">
                                                        <label>Choose Elixir:</label>
                                                        <select id="choice" name="choice">
                                                        ${ Object.entries(EXPERIMENTALELIXIRS).sort(([,a],[,b]) => a.localeCompare(b)).map(arr=> {return `\t<option value="${arr[0]}">${arr[1]}</option>`}).join('\n')}
                                                        </select>
                                                    </div>
                                                </form>
                                                `,
                                            buttons: {
                                                yes: {
                                                    icon: "<i class='fas fa-check'></i>",
                                                    label: `Brew Elixir`,
                                                    callback: (html) => {
                                                            const ix = html.find('[name="choice"]')[0].value || '0';
                                                            if(ix==='0') return this.cancelSourcePrompt('chooses to not continue with brewing an elixir.')
                                                            this.itemAddData.name = EXPERIMENTALELIXIRS[ix]
                                                            if(this.itemAddData.name) this._experimentalElixerBrew()          
                                                        }
                                                    },
                                                no: {
                                                    icon: "<i class='fas fa-times'></i>",
                                                    label: `Cancel Changes`,
                                                    callback: () => this.cancelSourcePrompt('chooses to not continue with brewing an elixir.')
                                                    }
                                            },
                                            default: "yes" 
                                        }).render(true);
                                        }  
                                    },
                                no: {
                                    icon: "<i class='fas fa-times'></i>",
                                    label: `Cancel`,
                                    callback: () => this.cancelSourcePrompt('chooses to not continue with brewing an elixir.')
                                    }
                            },
                            default: "yes" 
                        }).render(true);  
                    }},
                no: {
                    icon: "<i class='fas fa-times'></i>",
                    label: `Cancel`,
                    callback: () => this.cancelSourcePrompt('chooses to not continue with brewing an elixir.')
                    }
            },
            default: "yes" 
        }).render(true);
    }

    async _experimentalElixerBrew(){
        await this.addItemName() 
        this.message(`${this.source.actor.name} taps into their artificer powers, magically brewing an elixir! ${this.itemAddData.name} has been added to ${this.source.actor.name}.`, {title: 'Experimental Elixer'} )  
    }

    async _falseLife(){
        if(this.feature.dae==='on') this.generateEffect(this.firstHitTarget)
        if(this.feature.dae==='off' && this.sourceData.tempHp) this.effectEndTempHP()
    }

    async _findFamiliar(){ //tested v10
        new Dialog({
            title: `Cast Find Familiar`,
            content: `
                <form>
                    <div class="form-group">
                        <label>Familiar:</label>
                        <select id="familiar" name="familiar">
                        ${
                            FAMILIARS.map(n => {
                            return `\t<option value="${n}">${n}</option>`;
                            }).join('\n')
                        }
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Type:</label>
                        <select id="familiar-type" name="type">
                        ${
                            FAMILIARTYPES.map(t => {
                            return `\t<option value="${t}">${t}</option>`;
                            }).join('\n')
                        }
                        </select>
                    </div>
                </form>
                `,

            buttons: {
                yes: {
                    icon: "<i class='fas fa-check'></i>",
                    label: `Find Familiar`,
                    callback: async (html) => {
                        const typeIndex = html.find('[name="type"]')[0].value || 'Fey', familiarIndex = html.find('[name="familiar"]')[0].value || 'Bat';
                        if(!typeIndex || !familiarIndex) return console.log('error with find familiar')
                        const famActor = game.actors.getName(`${this.source.actor.name}'s Familiar`);
                        await importActorIfNotExists(familiarIndex)
                        const actorUpdateData = Object.assign(foundry.utils.duplicate(game.actors.getName(familiarIndex)),{
                            folder: famActor.folder?._id,
                            name: famActor.name,
                            prototypeToken: {name: famActor.name, actorLink: true},
                            ownership: foundry.utils.duplicate(famActor.ownership),
                            system: {details: {type: {value: typeIndex.toLowerCase()}}}
                        });
                        const newA = await Actor.create(actorUpdateData);
                        if(newA){
                            this.message(`You call forth your familiar, a ${typeIndex} creature in the form of a ${familiarIndex}.`, {title: 'Find Familiar'})
                            await famActor.delete()
                        }
                    }
                },
                no: {
                    icon: "<i class='fas fa-times'></i>",
                    label: `Cancel`,
                    callback: () => this.cancelSourcePrompt()
                },  
            },
            default: "yes"
        }).render(true);
    }

    async _fireShield(){
        const choice = await this.choose(['Warm', 'Chill'], 'Choose shield type.', 'Fire Shield', {owner: this.sourceData.owner, img: this.item.img})
        if(choice) await this.addActiveEffect({effectName: `Fire Shield - ${choice}`, uuid: this.source.actor.uuid, origin: this.source.actor.uuid})
    }
    
    async _formOfDread(){
        const tempHp = 10 + this.sourceData.warlockLevel
        if(tempHp > this.sourceData.tempHp) {
            await this.source.actor.update({data:{attributes: {hp: {temp: tempHp}}}})
            this.message(`${this.name} gains ${tempHp} temp HP`,{title: 'Form of Dread'})
        }
    }

    async _gazerEyeRays(){
        await this.rollTable();
        this.message(`${this.name} Rolls a ${this.tableRollResult} when choosing which eye stalk to unleash a ray from`, {title: 'Eye Ray Selected'})
        await this.useItem(this.getItem(this.tableRollText))
    }

    async _genericContest(){
        await this.contest()
    }

    async _goodberry(){
        this.itemAddData.name = this.config.item.name
        await this.addItemName({document: this.firstTarget})
        await this.destroyItem(this.itemAddData.newItems[0], {hours: 24}, 'The batch of goodberries expire')
    }

    async _grapple(options = {}){
        if(!this.firstTarget) return this.error('You must target a token!')
        const targetSize = this.getSize(this.firstTarget)
        if(SIZES[targetSize] - SIZES[this.sourceData.size] > 1) return this.error('You cannot grapple a target that is over 1 size larger than you!')
        if(this.name === "Bigby's Hand" && SIZES[targetSize] <= 2) options['overrides'] = {source: {advantage: true}}
        const bypass = this.hasEffect(this.firstTarget, 'Incapacitated')
        if(!bypass) await this.contest(options)
        if(bypass || this.contestData?.won){
            await wait(2000) 
            this.addActiveEffect({effectName: "Grappled", uuid: this.firstTarget.actor.uuid, origin: this.source.actor.uuid})
            this.message(`${this.firstTarget.name} is grappled!`, {title: 'Grapple Result'})
        }
        return ((bypass || this.contestData?.won) ? true : false)
    }

    async _grapplingPin(){
        const success = await this._grapple({contestId: 'grapple'})
        if(success){
            this.addActiveEffect({effectName: "Restrained", uuid: this.firstTarget.actor.uuid, origin: this.source.actor.uuid})
            this.addActiveEffect({effectName: "Restrained", uuid: this.source.actor.uuid, origin: this.source.actor.uuid})
            this.message(`${this.firstTarget.name} is pinned!`, {title: 'Pin Result'})
        }
    }

    async _grapplingStrike(){
        await this._grapple({contestId: 'grapple', overrides:{source:{parts: [this.sourceData.superiorityDie]}}})
    }

    async _guardianOfFaith(){//tested v10
        this.summonData.updates = {
            embedded: { 
                Item: {
                    "Guardian of Faith Aura": {
                        "system.save": {dc: this.sourceData.spelldc}
                    }
                }
            }
        }
        await this.summon();
    }

    async _hex(){//tested v10
        if(!this.hasHitTargets) return
        let secs = 3600;
        if(this.spellLevel >= 5){secs = 86400} else if(this.spellLevel >= 3){secs = 28800};
        new Dialog({
            title: `Hexed Ability`,
            content: `
            <form>
                <p>Select the ability to be hexed</p>
                <div class="form-group">
                    <label>Ability</label>
                    <select id="ability" name="ability">
                        <option value="str">Strength</option>
                        <option value="dex">Dexterity</option>
                        <option value="con">Constitution</option>
                        <option value="int">Intelligence</option>
                        <option value="wis">Wisdom</option>
                        <option value="cha">Charisma</option>
                    </select>
                </div>
            </form>
            `,
            buttons: {
                hitpoints: {
                    label: "Submit",
                    callback: (html) => {
                        const effectData = {
                            changes: [
                                {key: `flags.midi-qol.disadvantage.ability.check.${html.find('[name="ability"]')[0].value || 'str'}`, mode: 2, value: `1`, priority: 0}
                            ],
                            origin: this.item.uuid, //flag the effect as associated to the spell being cast
                            disabled: false,
                            duration: {rounds: null, seconds: secs, startRound: null, startTime: null, startTurn: null, turns: null},
                            icon: "icons/magic/perception/silhouette-stealth-shadow.webp",
                            name: "Hexed"
                        }
                        this.tokenCreateEmbeddedDocuments(this.firstHitTarget.id, "ActiveEffect", [effectData]);
                    }
                },
                cancel: {
                    label: "Cancel"
                }
            },
            default: "Submit"
        }).render(true);
    }

    async _hexbladesCurse(){//tested v10
        if(!this.hasHitTargets) return
        const effectData = {
            changes: [],
            origin: this.item.uuid, //flag the effect as associated to the feature being used
            disabled: false,
            duration: {rounds: null, seconds: 60, startRound: null, startTime: null, startTurn: null, turns: null},
            icon: "icons/magic/death/projectile-skull-flaming-green.webp",
            name: "Hexblade Cursed"
        }
        this.generateEffect(this.firstHitTarget)
        await this.tokenCreateEmbeddedDocuments(this.firstHitTarget.id, "ActiveEffect", [effectData]);              
    }

    async _helpAttack(){
        if(this.targets.size !== 1 || this.firstTarget.id === this.source.token.id) return this.error('Please target one token that is not yourself')
        await this.addActiveEffect({effectName: "Advantage on Next Attack", uuid: this.firstTarget.actor.uuid, origin: this.source.actor.uuid})
        this.message(`${this.name} helps ${this.firstTarget.name} with their next attack by feinting or distracting their opponent.`, {title: 'Help'})
    }

    async _helpCheck(){
        if(this.targets.size !== 1 || this.firstTarget.id === this.source.token.id) return this.error('Please target one token that is not yourself')
        await this.addActiveEffect({effectName: "Advantage on Next Ability Check", uuid: this.firstTarget.actor.uuid, origin: this.source.actor.uuid})
        this.message(`${this.name} helps ${this.firstTarget.name} with a task.`, {title: 'Help'})
    }

    async _hide(){
        await this.rollSkill(['ste'], 'Roll stealth for hiding.')
        this.message(`${this.name} attempts to hide, rolling ${this.roll.total} (${this.roll.result})!`, {title: 'Hide'})
    }

    async _iceKnife(){
        if (!this.hasTargets) return
        this.tokensInProximity(this.firstTarget)
        this.targets = new Set(this.proximityTokens);
        this.targets.forEach((value) => { 
            this.rollSaveDamage(value, {damage: 'none', source: "Ice Knife Explosion", type: 'dex'}, {dice: `${1 + this.spellLevel}d6[cold]`, targets: [value]})
          })
    }


    async _lesserRestoration(){
        if(!this.hasTargets) return this.warn('You must first target a token.')
        const choice = await this.choose(this.config.options, 'Choose the condition to remove.', this.name, {img: this.item.img})
        if(choice) {
            await this.deleteEffect(this.firstTarget, choice)
            this.generateEffect(this.firstTarget)
            this.message(`${choice} was removed from ${this.firstTarget.name} if present.`)
        }
    }
    
    async _lungingAttack(){
        this.message(`${this.name} lunges at their opponent!`, {title: 'Lunging Attack Initiated'})
        const weapons = this.source.actor.items.filter(i => i.type === 'weapon')
        const choice = await this.choose(weapons.map(w => [w.id, w.name]), 'Choose the weapon to make the lunging attack with.', `${this.name} choose weapon`)
        const data = weapons.find(w => w.id === choice).toObject()
        data.system.range.value = data.system.range.value + 5;
        data.system.damage.parts.push([this.sourceData.superiorityDie,'none'])
        const item = new CONFIG.Item.documentClass(data, { parent: this.source.actor }) 
        await this.useItem(item)
    }

    async _magicalTinkering(){
        const tinker = await this.choose(this.config.options, 'What ye be tinkering?', 'Magical Tinkering', {owner: this.sourceData.owner, img: this.item.img})
        switch(tinker){
            case `Light: External Object`:
                await dangerZone.triggerZone('Magical Tinkering: Imbue Light')
                break;
            case 'Light: On Self':
                await this.addActiveEffect({effectName: 'Magical Tinkering: Imbue Light', uuid: this.source.actor.uuid, origin: this.source.actor.uuid})
                break;
            case 'Light: On Target': 
                this.hasTargets ? await this.addActiveEffect({effectName: 'Magical Tinkering: Imbue Light', uuid: this.firstTarget.actor.uuid, origin: this.source.actor.uuid}) : this.warning('You must target a token first if imbuing a light on a target.')
                break;
            case 'Other: External Object':
                await dangerZone.triggerZone('Magical Tinkering: Imbue Object')
                break;
            default:
                this.info('Roleplay the effects and take notes on items/journal as applicable.')
        }
        this.message(`${this.name} uses magical tinkering and imbues ${tinker}` , {title: 'Magical Tinkering'})
    }

    async manifestEcho(){
        this.summonData.updates = {
            actor: {
                system:{
                    abilities: this.source.actor.system.abilities,
                    traits: {
                        size: this.getSize(this.source.actor)
                    },
                    details: {
                        cr: this.sourceData.level
                    }
                }
            },
            token: {texture: {src: this.tokenData.img}},
            embedded: { 
                Item: this.source.actor.items.filter(i => i.type === 'weapon').reduce( (obj, item) => Object.assign(obj, { [item.name]: item }), {})
            }
        }
        await this.summon();
    }

    async _melfsMinuteMeteors(){
        this.itemAddData.name = this.config.name
        await this.addItemName()
        const newItem = this.itemAddData.newItems?.[0]
        const bonusUses = this.upcastAmount * 2
        const totalUses = (6+bonusUses)
        if(newItem && bonusUses) await this.updateItem({system: {uses: {value: totalUses, max: totalUses}}},  newItem)
        this.message(`${this.name} adds ${totalUses} meteors to their inventory.`, {title: `Melf's Minute Meteors`})
    }

    async _mirrorImage(){
        this.generateEffect(this.source.token)

        const positions = [];
        const numberOfImages = 3;
        const angles = [...Array(120).keys()].map(x => x * 3);
        for (let i = 0; i < numberOfImages; i++) {
            var centerOffset = 10 + Math.random() * 120;
            var rotationOffset = angles.length / numberOfImages * i;
            const trig = (formula) => {
                const pos = angles.map(angle => centerOffset * Math[formula](angle * (Math.PI / 180)));
                return [...pos.slice(rotationOffset), ...pos.slice(0, rotationOffset)];
            }
            positions.push({
                x: trig('cos'),
                y: trig('sin'),
            });
        }
        const seq = new Sequence()
        positions.forEach((position, index) => {
            seq.effect()
                .from(this.source.token)
                .fadeIn(1000)
                .attachTo(this.source.token)
                .loopProperty("sprite", "position.x", {
                    values: index % 2 ? position.x : position.x.slice().reverse(),
                    duration: 200,
                    pingPong: false,
                })
                .loopProperty("sprite", "position.y", {
                    values: index % 3 ? position.y : position.y.slice().reverse(),
                    duration: 200,
                    pingPong: false,
                })
                .persist()
                .scaleOut(0, 300, { ease: "easeInExpo" })
                .opacity(0.5)
                .name(`MirrorImage-${this.source.token.id}-${index}`);
        });
        seq.play()  
    }

    async _moonbeam(){//tested v10
        this.summonData.updates = {
            embedded: { 
                Item: {
                    "Moonbeam": {
                        "system.damage.parts": [[`${this.spellLevel}d10`,"radiant"]],
                        "system.save": {dc: this.sourceData.spelldc}
                    }
                }
            }
        }
        await this.summon();
    }

    /**
     * Tested: v10
     * This sets out the template and performs the roll. There is also a hook feature in workflow
     * @returns 
     */
    async _nathairsMischief(){
        if(!this.source.actor.id || !this.item.id || !this.template?.id || !this.userId) return
        await this.rollTable()
        this.message(`A ${this.tableRollResult} was rolled for Nathair's Mischief. ${this.tableRollText}`, {title: "Nathair's Mischief"})
        game.users.get(this.userId).updateTokenTargets([])
        this.targetWithTemplate();
        const tokens = game.users.get(this.userId).targets;
        if(!tokens.size) return

        if(["1", "2", "3"].includes(this.tableRollResult)){
          for (const t of tokens) {
                const save = await this.rollSaveDamage(t, {type: this.tableRollResult === '2' ? 'dex' : 'wis'});
                if(!save.success) {
                    let eff;
                    switch(this.tableRollResult == 1){
                        case "1": eff = "Charmed"; break;
                        case "2": eff = "Blinded"; break;
                        default: eff = "Incapacitated";
                    }
                    await t.actor.createEmbeddedDocuments("ActiveEffect",[{
                        "changes": [{"key": "macro.CE","mode": 0, "value": eff,"priority": "0"}],
                        "disabled": false,
                        "duration": {"rounds": 1, "turns": 1},
                        "name": eff,
                        "origin": this.source.actor.uuid,
                        "tint": "",
                        "transfer": false,
                        "flags": {
                            "dae": {"transfer": false,"macroRepeat": "none","specialDuration": ["turnStartSource"]},
                        }
                    }]);
                }
            }
            if(moduleActive("enhanced-terrain-layer")) await this.template.setFlag('enhanced-terrain-layer', 'multiple', 1)
        } else {
            if(moduleActive("enhanced-terrain-layer")) await this.template.setFlag('enhanced-terrain-layer', 'multiple', 2)
        }      
        await this.template.setFlag(napolitano.ID, 'nathairs-mischief', {'source': this.source.actor.id, 'userId': this.userId, 'item': this.item.id})
    } 

    async _naturalBargainer(){
        await this.rollDice('1d4')
        this.message(`${this.name} uses their natural bargaining, adding ${this.roll.total} to their skill check.`, {title: 'Natural Bargainer'})
    }

    async _necroticShroud(){
        await this.addActiveEffect({effectName: "Necrotic Shroud Damage", uuid: this.source.actor.uuid, origin: this.source.actor.uuid})
        await wait(10000)
        await this.deleteTemplates()
    }
    
    async _overrun(){
        if(!this.firstTarget) return this.error('You must target a token!')
        const targetSize = this.getSize(this.firstTarget)
        const diff = SIZES[targetSize] - SIZES[this.sourceData.size]
        const options = diff > 0 ? {overrides: {source: {disadvantage: true}}} : (diff < 0 ? {overrides: {source: {advantage: true}}} : {})
        await this.contest(options)
        if(this.contestData.won){
            await wait(2000) 
            this.message(`${this.name} successfully forces their way through the hostile creature's space!`, {title: 'Overrun Result'})
        }
    }

    async _powerSurge(){
        if(this.hasTargets) await this.damage({targets: [this.firstTarget], dice: `${Math.floor(this.sourceData.wizardLevel/2)}d1`, type: 'force'})
    }

    async _ready(){
        await this.addActiveEffect({effectName: "Ready", uuid: this.source.actor.uuid, origin: this.source.actor.uuid})
    }

    async _search(){
        await this.rollSkill(['prc', 'inv'], 'Roll for searching (DM will let you know which skill).')
        this.message(`${this.name} attempts to search, rolling ${this.roll.total} (${this.roll.result})!`, {title: 'Search'})
    }

    async _shadowGaze(){//tested v10
        if(this.feature.dae === "on"){
            const options = {}
            await this.rollTable();
            if (["5","6"].includes(this.tableRollResult)) options.direction = await this.randomDirection()
            this.message(this.stringParameterReplace(this.tableRollText, options), {title: 'Shadow Gaze'})
            this.generateEffect(this.firstHitTarget)
            if(this.tableRollResult === '4') await this.addActiveEffect({effectName: "Shadow Blindness", uuid: this.firstHitTarget.actor.uuid, origin: this.source.actor.uuid})
        }
    }

    async _shadowTattoo(){//tested v10
        await this.summon();
    }

    async _shove(){
        const options = {}
        if(!this.firstTarget) return this.error('You must target a token!')
        const targetSize = this.getSize(this.firstTarget)
        if(SIZES[targetSize] - SIZES[this.sourceData.size] > 1) return this.error('You cannot shove a target that is over 1 size larger than you!')
        if(this.name === "Bigby's Hand" && SIZES[targetSize] <= 2) options['overrides'] =  {source: {advantage: true}}
        const bypass = this.hasEffect(this.firstTarget, 'Incapacitated')
        if(!bypass) await this.contest(options)
        if(bypass || this.contestData.won){   
            await wait(2000) 
            if(this.ruleset === 'shoveProne') {
                this.addActiveEffect({effectName: "Prone", uuid: this.firstTarget.actor.uuid, origin: this.source.actor.uuid})
                this.message(`${this.firstTarget.name} is knocked prone by the shove!`, {title: 'Shove Prone Result'})
            } else if(this.ruleset === 'shoveToSide') {
                this.message(`${this.firstTarget.name} is pushed to the side 5 feet by the shove!`, {title: 'Shove Aside Result'})
            } else {
                this.message(`${this.firstTarget.name} is pushed back 5 feet by the shove!`, {title: 'Shove Back Result'})
            }
        }
    }

    async _spiritualWeapon(){//tested v10
        const weapon = await this.choose([['sword', 'Sword'], ['mace', 'Mace'], ['scythe', 'Scythe'], ['maul', 'Maul']] , 'Choose the form the spectral weapon takes:', 'Weapon Type')
        const color = await this.choose([['blue', 'Blue'], ['green', 'Green'], ['orange', 'Orange'], ['purple', 'Purple'], ['red', 'Red']], 'Choose the color of the weapon', 'Weapon Color')
        const path = (weapon && color) ? `modules/jb2a_patreon/Library/2nd_Level/Spiritual_Weapon/SpiritualWeapon_${SPIRITUALWEAPONS[weapon][color]}_${weapon === 'scythe' ? '300x300' : (['greatAxe', 'greatSword', 'greatClub','rapier', 'scythe', 'spear', 'trident', 'warhammer'].includes(weapon)? '400x400' : '200x200')}.webm` : `modules/jb2a_patreon/Library/2nd_Level/Spiritual_Weapon/SpiritualWeapon_Mace01_01_Spectral_Blue_200x200.webm`; 
        this.summonData.updates = {
            token: {texture: {src: path}},
            embedded: { 
                Item: {
                    "Attack": {
                        "system.damage.parts": [[`${Math.floor(this.upcastAmount/2) + 1}d8 + ${this.sourceData.spellMod}`,"force"]]
                    }
                }
            }
        }
        await this.summon();
    }

    async _staffOfThePython(){//tested v10
        if(!this.hasTargets) await this.summon();
    }

    async _stormSphere(){//tested v10
        this.summonData.updates = {
            embedded: { 
                Item: {
                "Attack": {
                    "system.damage.parts": [[`${this.spellLevel}d6`,"lightning"]]
                }
            },
            ActiveEffect: {
                "Storm Sphere": {
                    changes: [
                        {
                            key: "flags.midi-qol.OverTime",
                            mode: 5,
                            priority: 20,
                            value: `turn=end,saveAbility=str,damageRoll=${this.spellLevel-2}d6,type=bludgeoning,saveDC=@attributes.spelldc,saveMagic=true,label=Storm Sphere`
                        }
                    ]
                }}
            }
        }
        await this.summon();
        await this.deleteTemplates();
    } 

    async _summonAberration(){
        const choice = await this.choose([['beholderkin','Beholderkin'],['slaad','Slaad'],['starSpawn','Star Spawn']], 'Choose your aberration', 'Summon Aberration')
        this.summonData.updates = {
            actor: {
                system:{
                    attributes: {
                        ac: {
                            base: 11 + this.spellLevel,
                            flat: 11 + this.spellLevel,
                            value: 11 + this.spellLevel
                        },
                        hp: {
                            max: 40 + (10 * (this.upcastAmount)),
                            value: 40 + (10 * (this.upcastAmount))
                        },
                        movement: {
                            fly: choice === 'beholderkin' ? 30 : 0,
                            hover: choice === 'beholderkin' ? true : false
                        }
                    },
                    details: {
                        cr: this.sourceData.level
                    }
                }
            },
            token: {
                dispoisition: 1
            },
            embedded: { Item: {
                "Multiattack": {
                    "system.description.value": `<p>The aberration makes a number of attacks equal to half this spell’s level (${Math.floor(this.spellLevel/2)}).</p>`
                },
                "Claws": {
                    "system.attackBonus": this.sourceData.spellAttack - 3 -this.sourceData.prof, 
                    "system.damage.parts": [
                        [`1d10[slashing] + 3 + ${this.spellLevel}`, "slashing"]
                    ]
                },
                "Eye Ray": {
                    "system.attackBonus": this.sourceData.spellAttack - 3 -this.sourceData.prof, 
                    "system.damage.parts": [
                        [`1d8[psychic] + 3 + ${this.spellLevel}`, "psychic"]
                    ]
                },
                "Psychic Slam": {
                    "system.attackBonus": this.sourceData.spellAttack - 3 -this.sourceData.prof, 
                    "system.damage.parts": [
                        [`1d8[psychic] + 3 + ${this.spellLevel}`, "psychic"]
                    ]
                },
                "Whispering Aura": {
                    "system.save.dc": this.sourceData.spelldc
                }
            }}
        };

        if(choice !== "slaad") {
            this.summonData.deletes.item.push("Regeneration").push ("Claws")
        }
       if(choice !== "beholderkin") {
           this.summonData.deletes.item.push("Eye Ray")
       }
       if(choice !== "starSpawn") {
           this.summonData.deletes.item.push("Whispering Aura").push ("Psychic Slam")
       }
       await this.summon()
       if(choice === 'starSpawn') await this.addTag('NAP-SOT-5', this.summonedToken)
       await this.setInitiative({token: this.summonedToken, initiative: this.getInitiative()})
   }

    async _summonBlight(){//tested v10
        await this.summon({table: true});
        this.message(`A ${this.tableRollText} rises from the putrid earth.`, {title: 'Summon Blight'})
    }

    /**
     * Tested: v10
     * Spawns a shadow to the canvas based on 3 of select flavors
     */
    
    async _sustainedLife(){
        const hd = {}, options = []
        for(const [k, cl] of Object.entries(this.source.actor.classes) ) {
            if(cl.system.levels > cl.system.hitDiceUsed) {
                options.push([k, `${cl.name} (${cl.system.hitDice})`])
                hd[k] = cl
            }
        }
        if(!options.length) return this.error(`${this.name} has no remaining hit dice to use`)
        const choice = await this.choose(options, 'Choose hit die:')
        if(choice){
            await this.updateItem({hitDiceUsed: hd[choice].system.hitDiceUsed + 1}, hd[choice])
            await this.rollDice(`1${hd[choice].system.hitDice}`)
            this.message(`${this.name} uses one of their ${hd[choice].name} Hit Die to add ${this.roll.total} to their saving throw`, {title: 'Sustained Life'})
        }
    }

    async _tollTheDead(){
        if (!this.failedSaves.size) return
        this.roll = await new Roll(`${this.cantripScale}d${this.hasMaxHP(this.firstFailedSave) ? 8 : 12}[${"necrotic"}]`).evaluate();
        await this.damage({type: "necrotic", critical: this.isCritical})
    }
    
    async _tumble(){
        if(!this.firstTarget) return this.error('You must target a token!')
        await this.contest()
        if(this.contestData.won){
            await wait(2000) 
            this.message(`${this.name} successfully tumbles through the hostile creatures space!`, {title: 'Tumble Result'})
        }
    }
    
    /**
     * Tested: v10
     * Deletes template on call. For undead that fail saving throw, deletes those that do not meet the CR threshold on effect on
     * @returns 
     */
    async _turnUndead(){
        if(this.feature.dae === 'on'){
            const destroy = this.source.actor.system?.scale?.cleric?.['destroy-undead']?.formula;
            const cr = this.getCR(this.firstTarget)
            if(!destroy || !cr) return;
            
            let del = false;
            switch(destroy){
                case "CR 1/2 or Lower":
                    if(cr <= 0.5) del = true 
                    break;
                case "CR 1 or Lower":
                    if(cr <= 1) del = true 
                    break;
                case "CR 2 or Lower":
                    if(cr <= 2) del = true 
                    break;
                case "CR 3 or Lower":
                    if(cr <= 3) del = true 
                    break;
                case "CR 4 or Lower":
                    if(cr <= 4) del = true 
                    break;
            }
            if(del) {
                this.generateEffect(this.firstTarget)
                await wait(2000)
                await this.deleteTokens()
                this.message(`The ${this.firstTarget.name} is destroyed by Turn Undead!`, {title: 'Turn Undead'})
            }
        }
        await this.deleteTemplates();
    }

    async _unseenServant(){//tested v10
        await this.summon();
    }
}