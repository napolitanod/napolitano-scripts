/***
 * Add to rollSkill after pre and the die roll: 
 *      if(game.modules.get('napolitano-scripts')?.active){
		    await game.napolitano.postRollSkill(this, roll, skillId);
	    }
 * Add to rollAbilitySave 
        if(game.modules.get('napolitano-scripts')?.active){
		await game.napolitano.postRollAbilityTest(this, roll, abilityId);
	}
 * Add to rollAbilityTest
    if(game.modules.get('napolitano-scripts')?.active){
		await game.napolitano.postRollAbilitySave(this, roll, abilityId);
	}
 */
import { workflow } from "./workflow.js";

export async function postRollAbilitySave(actor, roll, ability){
    if(!game.settings.get("napolitano-scripts", "dnd5e-posthooks")) return
    const hook = "napolitano.postRollAbilitySave", data = {actor: actor, roll: roll, ability: ability, options: {}}
}

export async function postRollSkill(actor, roll, skill){
    if(!game.settings.get("napolitano-scripts", "dnd5e-posthooks")) return
    const hook = "napolitano.postRollSkill", data = {actor: actor, roll: roll, ability: skill, options: {}}
    if(game.settings.get("napolitano-scripts", "cutting-words")) await workflow.playAsync('cuttingWords', data, {hook: hook})
}

export async function postRollAbilityTest(actor, roll, ability){
    if(!game.settings.get("napolitano-scripts", "dnd5e-posthooks")) return
    const hook = "napolitano.postRollAbilityTest", data = {actor: actor, roll: roll, ability: ability, options: {}}
    if(game.settings.get("napolitano-scripts", "cutting-words")) await workflow.playAsync('cuttingWords', data, {hook: hook})
}