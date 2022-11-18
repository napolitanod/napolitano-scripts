import {HUDOPTIONS} from './constants.js';
import {hudHover, hudHoverOut} from "./tooltip.js";
import {macros} from './macros.js';

export function buildHud(html, token){
    let combatactions = $('<div>').addClass("tah-actions")
    for (const [k,option] of Object.entries(HUDOPTIONS).sort(([,a],[,b]) => a.name.localeCompare(b.name))){
        combatactions.append($('<div>').addClass("tah-action").append($('<button>').data("data-id", {token: token.id, ruleset: k}).click(_run).append($('<span>').addClass("tah-action-name").html(option.name))))
    }
    const titlebutton = $('<button>').addClass("tah-title-button").val("combatactions").html('Combat')
    const subcategory = $('<div>').addClass("tah-subcategory").append($('<div>').addClass("tah-subtitle-wrapper").append($('<div>').addClass("tah-subtitle").html('Actions'))).append(combatactions)
    const content = $('<div class="tah-content" style="background: #00000000"></div>').append(subcategory)
    const category = $('<div>').addClass("tah-category").attr('id', 'tah-category-combatactions').hover(_hudCategoryHover, _hudCategoryHoverOut).append(titlebutton).append(content)
    $(html).find(`div[id="tah-category-checks"]`).after(category)
    return html
}

export function setHudHelp(html, token){
    if(token?.actor?.items?.size){
        for(const item of token.actor.items){
            const id = `${item.type === 'feat' ? 'feat' : (item.type ==='spell' ? 'spell' : 'item')}|${token.id}|${item.id}`
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