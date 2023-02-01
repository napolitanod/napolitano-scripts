import {HUDOPTIONS} from './constants.js';
import {hudHover, hudHoverOut} from "./tooltip.js";
import {macros} from './macros.js';

export function buildHud(html, token){
    let combatactions = $('<div>').addClass("tah-actions")
    for (const [k,option] of Object.entries(HUDOPTIONS).sort(([,a],[,b]) => a.name.localeCompare(b.name))){
        combatactions.append(
            $('<div>').addClass("tah-action").addClass("toggle").addClass("active").append(
                $('<button>').data("data-id", {token: token.id, ruleset: k}).click(_run).append(
                    $('<span>').addClass("tah-action-button-content").html(option.name)
                )
            )
        )
    }          
    const titlebutton = $('<button>').addClass("tah-category-button").addClass("disable-edit").val("combatactions").attr("data-name", "Combat").append(
        $('<span>').addClass("tah-category-button-content").append(
            $('<div>').addClass("tah-category-button-text").html('Combat')
            )
        )
    const subcategory = $('<div>').addClass("tah-subcategories-wrapper").addClass("expand-down").append($('<div>').addClass("tah-subcategories").append($('<div>').addClass("tah-subcategory").attr("data-show-title","true").append($('<div>').addClass("tah-subtitle").addClass("disable-edit").attr("data-type","system").attr("id","combat_actions").attr("data-has-derived-subcategories", "false").html('Actions')).append(combatactions)))
    const category = $('<div>').addClass("tah-category").attr('id', 'tah-category-combatactions').attr('data-type', 'custom').hover(_hudCategoryHover, _hudCategoryHoverOut).append(titlebutton).append(subcategory)
    $(html).find(`div[id="tah-category-attributes"]`).after(category)
    return html
}
          
export function setHudHelp(html, token){
    if(token?.actor?.items?.size){
        for(const item of token.actor.items){
            const id = `${item.type === 'feat' ? 'feature' : (item.type ==='spell' ? 'spell' : 'item')}|${token.actor.id}|${token.id}|${item.id}`
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