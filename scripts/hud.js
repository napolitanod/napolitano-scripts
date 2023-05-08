import {HUDOPTIONS} from './constants.js';
import {hudHover, hudHoverOut} from "./tooltip.js";
import {macros} from './macros.js';

export function buildHud(html, token){
    let hudActions = $('<div>').addClass("tah-actions").addClass("napolitano-tah-actions")
    for (const [k,option] of Object.entries(HUDOPTIONS).sort(([,a],[,b]) => a.name.localeCompare(b.name))){
        hudActions.append(
            $('<div>').addClass("tah-action").append(
                $('<button>').addClass("tah-action-button").data("data-id", {token: token.id, ruleset: k}).click(_run).append(
                    $('<span>').addClass("tah-action-button-content").append(
                            $('<div>').addClass("tah-action-button-text").html(option.name)
                        )
                )
            )
        )
    } 
    let combatactions = $('<div>').addClass("tah-groups").append(hudActions)        
    const titlebutton = $('<button>').addClass("tah-group-button").addClass("disable-edit").val("combatactions").attr("data-name", "Combat").append(
        $('<span>').addClass("tah-button-content").append(
            $('<div>').addClass("tah-button-text").html('Combat')
            )
        )
    const subcategory = $('<div>').addClass("tah-groups-container").addClass("expand-down").append($('<div>').addClass("tah-groups").addClass("napolitano-tah-subcategories").append($('<div>').addClass("tah-list-groups").append($('<div>').addClass("tah-group").attr("data-has-actions","true").attr("data-level","2").attr("data-type","system").attr("data-show-title","true").append($('<div>').addClass("tah-subtitle").addClass("disable-edit").attr("data-type","system").attr("id","combat_actions").attr("data-has-derived-subcategories", "false").html('Actions')).append(combatactions))))
    const category = $('<div>').addClass("tah-tab-group").attr('id', 'tah-group-combatactions').attr('data-type', 'custom').hover(_hudCategoryHover, _hudCategoryHoverOut).append(titlebutton).append(subcategory)
    $(html).find(`div[id="tah-group-attributes"]`).after(category)
    return html
}
          
export function setHudHelp(html, token){
    if(token?.actor?.items?.size){
        for(const item of token.actor.items){
            const id = `${item.type === 'feat' ? 'feature' : (item.type ==='spell' ? 'spell' : 'item')}|${item.id}` //|${token.actor.id}|${token.id}|${item.id}`
            const res = $(html).find(`button[value="${id}"]`)
            res.data("data-id", {uuid: item.uuid}).hover(hudHover, hudHoverOut)
        }
    }
    return html
}

function _run(event){
    const data = $(event.currentTarget).data("data-id");
    macros.play([{token: canvas.scene.tokens.find(t => t.id === data.token), targets: game.user.targets.ids}], data.ruleset, {hud: true})
}

function _hudCategoryHover(event){
    $(event.currentTarget).addClass('hover')
}

function _hudCategoryHoverOut(event){
    $(event.currentTarget).removeClass('hover')
}