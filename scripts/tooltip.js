export function hudHover(event){
    tooltip.hudHover(event)
}

export function hudHoverOut(event){
    tooltip.hudHoverOut(event)
}

export class tooltip {
    constructor(uuid){
        this.html = '',
        this.uuid = uuid;
        this.item = fromUuidSync(this.uuid);
    }

    get abilityActionType(){
        return this.activation.type ? game.dnd5e.config.abilityActivationTypes[this.activation.type] : ''
    }

    get abilityActionInstructions(){
        switch(this.abilityActionType){
            case 'Days':
            case 'Hours':
            case 'Minutes':
                return `Takes ${this.activation.cost ?? 1} ${this.abilityActionType.toLowerCase()}`
            case 'None':
            case 'Special':
                return `Non-Action`
            default:
                return `${this.abilityActionType}`
        }
    }

    get actionInstructions(){
        if(!this.actionType) return 'Item or Ability Use'
        switch(this.actionType){
            case 'Healing':
                return 'Heal'
            case 'Other':
            case 'Utility':
                return 'Item or Ability Use'
            case 'Ability Check':
            case 'Saving Throw':
                return `Force ${this.actionType}`
            default:
                return `${this.actionType}`
        }
    }

    get activation(){
        return this.system.activation ?? {}
    }

    get actionType(){
        return this.system.actionType ? game.dnd5e.config.itemActionTypes[this.system.actionType] : ''
    }

    get finesseMessage(){
        return this.properties.fin ? ' Hold [SHIFT] if using with two hands.' : ''
    }

    get distanceRangeMessage(){
        let mssg = `${this.range.value ? this.range.value + ' ' : ''}${this.rangeDistanceUnits.toLowerCase()}${this.range.long ? ' (' + this.range.long + ' ' + this.rangeDistanceUnits.toLowerCase() +' with disadvantage).' : ''}`
        if(this.properties.thr) mssg = `5 feet or, if thrown, within ` + mssg
        return mssg
    }

    get mainInstructions(){
        return OVERRIDES[this.item.name] ? OVERRIDES[this.item.name] : this.targetInstructions + this.rangeInstructions + this.finesseMessage
    }

    get system(){
        return this.item.system
    }

    get properties(){
        return this.system.properties ?? {}
    }

    get range(){
        return this.system.range ?? {}
    }

    get rangeDistanceUnits(){
        return this.rangeUnits ? game.dnd5e.config.distanceUnits[this.rangeUnits] : ''
    }

    get rangeInstructions(){
        switch(this.rangeUnits){
            case 'ft':
            case 'km':
            case 'm':
            case 'mi':
            case 'spec':
                return ` within ${this.distanceRangeMessage} of this token.`
            case 'self':
                return this.target.type === 'self' ? '' : ` with this token as the source.` 
            case 'touch':
                return this.target.type === 'self' ? '' : ` within this token's reach.`
            default: return this.range.value ? ` within ${this.range.value} feet.` : ` within range.`
        }
    }

    get rangeUnits(){
        return this.range.units ?? ''
    }

    get target(){
        return this.system.target ?? {}
    }

    get targetAmount(){
        return this.target.value ?? 0
    }

    get targetDistanceUnits(){
        return this.targetUnits ? game.dnd5e.config.distanceUnits[this.targetUnits] : ''
    }

    get targetInstructions(){
        const rollItem = ROLLITEMTHEN.find(i => i === this.item.name)
        if(!this.target.type) return `${rollItem ? 'Roll item then t' : 'T'}arget 1 token`
        switch(this.target.type){
            case 'cone':
            case 'cube':
            case 'cylinder':
            case 'line':
            case 'sphere':
            case 'square':
            case 'wall':
                return `${rollItem ? 'Roll item then t' : 'P'}lace a ${this.target.type} template${this.targetMeasure}`
            case 'radius':
                return `${rollItem ? 'Roll item then t' : 'P'}lace a radius-defined circle template${this.targetMeasure}`
            case 'self':
                return `${this.rangeUnits === 'touch' ? 'Touch' : 'Target'} yourself (happens automatically)`
            case 'none':
                return `${rollItem ? 'Roll item then t' : 'T'}arget nothing`
            case 'object':
            case 'space':
                return `${rollItem ? 'Roll item then t' : 'T'}arget ${this.targetAmount ? (this.targetAmount === 1 ? this.targetAmount : 'up to ' + this.targetAmount): 'a'} ${this.target.type}${this.targetPlural}`
            default: return `${rollItem ? 'Roll item then t' : 'T'}arget ${this.targetAmount ? (this.targetAmount === 1 ? this.targetAmount : 'up to ' + this.targetAmount) : 'a'} ${this.target.type === 'creature' ? '' : this.target.type + ' '} token${this.targetPlural}`
        }
    }

    get targetMeasure(){
        return this.targetAmount && ['ft', 'km', 'm', 'mi'].includes(this.targetUnits) ? ` measuring ${this.targetAmount} ${this.targetDistanceUnits.toLowerCase()}` : ''
    }

    get targetPlural(){
        return this.targetAmount !== 1 ? 's' : ''
    }

    get targetType(){
        return this.target.type ? game.dnd5e.config.targetTypes[this.target.type] : ''
    }

    get targetUnits(){
        return this.target.units ?? ''
    }

    _appendLine(str, options){
        if(str) this.html += `<div ${options.class ? 'class="'+ options.class + '"' : ''}>${str}</div>`
    }

    _buildHTML(){
        this._appendLine(`<label class="napolitano-label">To Use: </label>${this.item.name}`, {class: 'napolitano-tooltip-title'})
        this._appendLine(this.mainInstructions, {class: 'napolitano-tooltip-body'})
        this._appendLine(this.abilityActionInstructions + '  |  ' + this.actionInstructions, {class: 'napolitano-tooltip-footer'})
    }

    go(){
        this._buildHTML()
        this._output()
    }

    _output(){
        window.napolitano.tooltip(this.html);
    }
    
    static hudHover(event){
        const data = $(event.currentTarget).data()?.dataId;
        if(data?.uuid){
            const hv = new tooltip(data.uuid)
            hv.go()
        }
    }
    
    static hudHoverOut(event){
        window.napolitano.tooltip('');
    }

}

const OVERRIDES = {
    'Armor of Agathys': 'Roll this item to apply armor. The damage dealt by the armor will be applied automatically when condition is met.'
    ,'Aura of Vitality': 'Roll this item. A new item "Aura of Vitality Healing" will appear in your inventory which you can then use to facilitate the bonus action healing.'
    ,'Bardic Inspiration': 'Target an ally and roll this item. If you have an enhanced form of bardic inspiration (e.g. magical inspiration) be sure to roll that one instead.'
    ,'Compelled Duel': 'Roll ability to mark a target within 30 feet. None of the spell rules are automated.'
    ,'Eldritch Blast': 'Target a creature then roll item. You will then be prompted to select the remainder of the available targets (based on spell level) one at a time.'
    ,'Form of Dread': 'Roll this item to apply the effect to your token. You will be prompted automatically when saving throw opportunity arises during an attack.'
    ,'Form of Dread: Transform': 'Roll this item to apply the effect to your token. You will be prompted automatically when saving throw opportunity arises during an attack.'
    ,'Green-Flame Blade': 'Roll this item before making a melee weapon attack. On your next melee attack you will then gain the benefits of this spell and you will be prompted for any spreading damage.'
    ,'Halo of Spores': "No roll required. You will be prompted to use this ability when the opportunity arises and if you haven't yet used this reaction since your last turn."
    ,"Hexblade's Curse": "Target a creature and then roll this item. The curse will be automatically accounted for when you roll attacks and damage."
    ,'Improved Flare': 'For each attack made against a friendly create not you, you will be prompted as to whether or not you wish to use your warding flare. Confirming that you wish to use will apply the disadvantage to the attack roll. Disable or enable the prompt by toggling the active effect for this item.'    ,'Maneuvers: Disarming Attack': 'Roll item to indicate your desire to use disarming attack on your next hit. This will mark your token. On your next damage roll disarming attack will be invoked and at that time your superiority die will be used.'
    ,'Magic Missile': 'Target a creature then roll item. You will then be prompted to select the remainder of the available targets (based on spell level) one at a time.'
    ,'Maneuvers: Grappling Strike': 'Target a creature and then roll this item in order to initiate the grapple'
    ,'Maneuvers: Lunging Attack': 'Target a creature and then roll this item. You will be prompted for weapon to use and then the attack will automatically be rolled.'
    ,'Maneuvers: Precision Attack': 'For each attack made you will be prompted as to whether or not you wish to use your precision attack. Confirming that you wish to use will include the roll with your attack. Disable or enable the prompt by toggling the active effect for this item.'
    ,'Pack Tactics': 'Pack tactics are applied automatically. You do not need to roll this item before making any attack.'
    ,'Power Surge': 'Target 1 token within 5 feet and roll item. Rests and qualifying spell usages will automatically update Power Surge item uses remaining.'
    ,'Message': 'Roll item then you will be prompted for message and target.'
    ,'Misty Step': 'Roll this item and then select a space within range (radius will be displayed on scene).'
    ,'Produce Flame': 'To use as attack, target a creature then roll item. To use as a light source, untarget all creatures and cast.'
    ,'Scorching Ray': 'Target a creature then roll item. You will then be prompted to select the remainder of the available targets (based on spell level) one at a time.'
    ,'Silvery Barbs': 'If an enemy creature succeeds on an attack or contest you will be automatically prompted. For other situations (e.g. saving throws), roll this item to cast.'
    ,'Song of Rest': 'Players will have the option to use song of rest automatically as part of their short rest. You do not need to roll this item.'
    ,'Symbiotic Entity': 'Roll this item in order to invoke the effect start. Additional damage will be add/modified automatically during your attacks while the effect is in place.'
    ,'Warding Flare': 'For each attack made against you, you will be prompted as to whether or not you wish to use your warding flare. Confirming that you wish to use will apply the disadvantage to the attack roll. Disable or enable the prompt by toggling the active effect for this item.'    ,'Maneuvers: Disarming Attack': 'Roll item to indicate your desire to use disarming attack on your next hit. This will mark your token. On your next damage roll disarming attack will be invoked and at that time your superiority die will be used.'
}

const ROLLITEMTHEN = ['Accursed Specter', 'Create Eldritch Cannon', 'Dust Devil', 'Flaming Sphere', 'Mage Hand', 'Spiritual Weapon', 'Summon Shadowspawn', 'Unseen Servant']
