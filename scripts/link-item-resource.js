import {CONSUMINGRESOURCETYPES, LINKDATA} from './constants.js';
async function _performResourceLinking(actor)
{   
    const resourceLinkingList = [];
    const resourceAttributeLinkingList = [];
    const items = await actor.items.filter(i => CONSUMINGRESOURCETYPES.includes(i.type));
    ui.notifications?.info(`linking resources and items for ${actor.name}`);

    for(const item of items) {
        for(const linkitem of LINKDATA) {  
            if (item.type === linkitem.matchOn && item.name.includes(linkitem.item)) {
                let n = 0; let found = 0;
                do {
                    let resource = !linkitem.amount ? '' : actor.items.find(i => CONSUMINGRESOURCETYPES.includes(i.type) && i.name === linkitem.resources[n].target && i.type === linkitem.retrieve)?.id; 
                    if((resource && !item.system.consume?.target) || linkitem.amount===0){
                        resourceLinkingList.push({_id: item.id, system: {consume: {type: (!linkitem.amount ? '' : linkitem.resources[n].type), target: resource, amount: linkitem.amount}}})
                        console.log("linking " + item.name + " with resource to consume " + linkitem.resources[n].target);
                        found = 1;
                        }
                    n += 1;   
                }
                while (!found && n < linkitem.resources.length)
            }
        }
    }
    if(resourceLinkingList.length > 0) await actor.updateEmbeddedDocuments("Item", resourceLinkingList);

    //add resources as consumable
    let charResources = actor.system.resources;
    if (charResources ) {
        const itemsNoResources = await actor.items.filter(i => (i.type === 'weapon' || i.type === 'feat') && i.name && i.id);
        for (var r in itemsNoResources){
            let itm = itemsNoResources[r];
            let tName = '';
            if(charResources.primary?.label && itm.name === charResources.primary.label){tName = 'resources.primary.value'}
            else if(charResources.secondary?.label && itm.name === charResources.secondary.label){tName = 'resources.secondary.value'} 
            else if (charResources.tertiary?.label && itm.name === charResources.tertiary.label){tName = 'resources.tertiary.value'} 
            if(tName){
                resourceAttributeLinkingList.push({_id: itm.id, system: {consume: {type: 'attribute', target: tName, amount: null}}})
                console.log("linking " + itm.name + " with resource to consume " + tName);
                }
        }
        
        if(resourceAttributeLinkingList.length > 0){await actor.updateEmbeddedDocuments("Item", resourceAttributeLinkingList);}
    }
}

export async function initiateLinking(){
    const choice = await new Promise((resolve, reject) => {
        new Dialog({
        title: 'Resource Linking',
        content: `<p>Initiate Resource Linking?</p>`,
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
    if(!choice) return
    ui.notifications?.info(game.i18n.localize("EN.alerts.linking-begin"));
    const actors = game.actors.filter(a => a.type==="character")
    for(let i=0; i<actors.length; i++) {  
        await _performResourceLinking(actors[i]);
    }
    ui.notifications?.info(game.i18n.localize("EN.alerts.linking-complete"));
}

export async function linkActor(actor){
    ui.notifications?.info(game.i18n.localize("EN.alerts.linking-begin"));
    await performResourceLinking(actor);
    ui.notifications?.info(game.i18n.localize("EN.alerts.linking-complete"));
}
