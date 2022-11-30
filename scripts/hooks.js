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
    //if(!game.settings.get("napolitano-scripts", "dnd5e-posthooks")) return
    //const hook = "napolitano.postRollAbilitySave", data = {actor: actor, roll: roll, ability: ability, options: {}};//, results = [];
    /*if(game.settings.get("napolitano-scripts", "silvery-barbs")){
        results.push(workflow.playAsync('silveryBarbs', data, {hook: hook}))
    }
    await Promise.all(results)*/
}

export async function postRollSkill(actor, roll, skill){
    if(!game.settings.get("napolitano-scripts", "dnd5e-posthooks")) return
    const hook = "napolitano.postRollSkill", data = {actor: actor, roll: roll, ability: skill, options: {}};//, results = [];
    //await Promise.all(results)
    if(game.settings.get("napolitano-scripts", "cutting-words")) await workflow.playAsync('cuttingWords', data, {hook: hook})
}

export async function postRollAbilityTest(actor, roll, ability){
    if(!game.settings.get("napolitano-scripts", "dnd5e-posthooks")) return
    const hook = "napolitano.postRollAbilityTest", data = {actor: actor, roll: roll, ability: ability, options: {}};//, results = [];
    //await Promise.all(results)
    if(game.settings.get("napolitano-scripts", "cutting-words")) await workflow.playAsync('cuttingWords', data, {hook: hook})
}

export async function postContest(contest){
    const hook = "napolitano.postContest", data = contest, results = [];
    if(game.settings.get("napolitano-scripts", "silvery-barbs")){
        results.push(workflow.playAsync('silveryBarbs', data, {hook: hook}))
    }
    await Promise.all(results)
}
