export class napolitano {
    static ID = 'napolitano-scripts';
    static NAME = 'napolitano';
    
    static FLAGS = {
      NAPOLITANO: 'napolitano-scripts' 
    }
    
    static TEMPLATES = { }

    /**
     * A small helper function which leverages developer mode flags to gate debug logs.
     * @param {boolean} force - forces the log even if the debug flag is not on
     * @param  {...any} args - what to log
    */
    static log(force, ...args) {  
    
      if (force || (game.user.isGM && game.settings.get(napolitano.ID, 'logging'))) {
        console.log(this.ID, '|', ...args);
      }
    }

    static async moveCombatantToCurrentScene(combatantId){
      const combat = game.combats.find(c => c.isActive === true)
      if(!combat) return ui.notifications.info('There is no current combat'); 
      const combatant = combat.combatants.find(c => c.id === combatantId)
      if(!combatant) return ui.notifications.info('There is no current combat');
      const token = combatant.token;
      const scene = token.parent;
      ui.notifications?.info('Choose location to place token on the scene');
      const xy = await warpgate.crosshairs.show({size: token.width})
      const tokenObj = duplicate(token);
      Object.assign(tokenObj, {x: xy.x, y: xy.y})
      const tokens = await canvas.scene.createEmbeddedDocuments('Token', [tokenObj])
      const newToken = canvas.tokens.get(tokens[0].id);
      await newToken.toggleCombat(combat);
      await combat.setInitiative(combat.combatants.find(c => c.token.id === newToken.id).id,combatant.initiative)
      await combatant.delete();
      await scene.deleteEmbeddedDocuments('Token', [token.id]);
    }   
}