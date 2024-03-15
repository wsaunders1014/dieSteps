export const MODULE_NAME = 'dieSteps';
//import { Instructions } from "./dieSteps.js";}

import { DieSteps } from "./dieSteps.js";
CONFIG.debug.hooks = true;
Hooks.on('init', () => {
    game.settings.register(MODULE_NAME, "dieStepEnabled", {
        name: "Enable dieStep increases",
        hint: "Enables or disables dieStep functionality.",
        scope: "world",
        config: true,
        default: false,
        type: Boolean
    });
})
Hooks.on('renderApplication',(app,html)=>{
    html.find('section[data-tab="dieSteps"]').append(`<div class="form-group"><div>

    <h4>How To Use</h4>

    <p>Add a number to the global mod box on your character sheet. Button can be found under Special Traits button on Attributes tab.</p>
   <p>By default, this mod adds die step increases to the FIRST die expression in every damage field.<br/>
    For example: 1d8 with Global Spell modifier set to 2, will output as 1d12. The steps are d4 > d6 > d8 > d10 > d12. This is the max amount of faces. After a die has reached d12 it will scale by adding a +1 for every die rolled. 1d12 becomes 1d12 + 1. 2d12 becomes 2d12 + 2 and so on.
    </p>
    <p>This module does not modify die in variant or other fields.</p>

    <p>All data placeholders should work: @mod, @prof, etc. Any modifiers after the d[faces] should also carry over, so feel free to use r,rr,xo,x, etc. For fields with x or xo, you may want to set the exploding number to happen on whatever the max die is. You can accomplish this without maintaining by setting it to x(o)=max which will automatically replace it with the highest face on the die.</p>

    <p>For cantrips, you can set Level Scaling to Cantrip, and it will add the correct amount of die as well as modify them. So for firebolt, simply enter 1d10 in damage field, and 1d10 in cantrip scaling field. It will output as [1/2/3/4]d[modded number] based on actor level, according to 5e rules.
</p>
    <p>For leveled spells, it's a bit more complicated as there are large variations in how spells scale. Spells set to Level Scaling and with a formula inputed will increase the amount of die rolled for EVERY level over the initial level, but only for the first damage field by default. To scale additional fields add the keyword 'scale' to the damage field at the end. This will increment the die rolled.
</p>
    <br/>For example: Acid Arrow is a 2nd level spell that does 4d4 acid damage on hit and 2d4 acid damage at the end of its next turn on failed save. By default, assuming two damage fields are set, 4d4 and 2d4, both die will be incremented by the set modifier amount(2) to 4d8 and 2d8 respectively. If upcast to level 3, by default, the output will be 5d8 and 2d8. To scale the second damage field, add 'scale' to the field as in '2d4 scale' and it will output as 5d8 and 3d8.
    </p>
   <p> Generally, for leveled spells the best bet is to not use level scaling at all. For spells that only scale every other level or weird intervals, set scaling to None, and then use a formula like "(floor((@item.level)-1/2))d[base number]" to increase the amount of die rolled. Here, @item.level is swapped out for the level of the spell cast, then subtracted by 1, then divided by 2, and then rounded down, so that the number of die only increments every other spell level. For instance, a spell like Spirit Shroud rolls 1 die at 3rd level, and 2 die at 5th level. As normal, the first number(s) after the 'd' in the expression will increment. So 2 steps would make this output 1d12 at level 3, and 2d12 at spell level 5.
</p>
<p>
    Custom commands:
    There are a couple custom commands that you can put in the damage field box
<ol>
    <li>ig  -  Ignores field. Will not apply die increases to that damage field.
</li>
    <li> scale - For spells with Level Scaling set to Spell Level, for every level over the default spell level, it will add 1 die to total die to the first damage field only. To apply this scaling to other damage fields use this keyword.
</li>
    <li> x=max, or xo=max to apply exploding die to the highest face without having to change it whenver a die increase happens.
    </li>
    </p>
    </div></div>`);
})
Hooks.on("renderActorSheet5eCharacter", (app, data) => {
    if(DieSteps.isEnabled()){
        //add die step config to Special Traits config.
        console.log(app,data)
        console.log(typeof app.actor.flags[MODULE_NAME])
        if(typeof app.actor.flags[MODULE_NAME]?.dieSteps === 'undefined'){
            console.log('test2');
            app.actor.setFlag(MODULE_NAME, `dieSteps`, {spellGlobal:0});
        }
        DieSteps.addConfigButton(app, data);
    }
});
Hooks.on('dnd5e.preUseItem',  (item,data,options)=>{
    if(DieSteps.isEnabled()){
       
        if(item.type==="spell"){
            const damages = structuredClone(item.system.damage.parts)
          
            if (item.flags.hasOwnProperty(MODULE_NAME) === false || typeof item.flags.dieSteps?.baseFormula === 'undefined'){
                console.error('test')
              item.flags[MODULE_NAME] = {baseFormula:damages,scaling:item.system.scaling.formula};
            }
        }
    }
})
Hooks.on('updateItem', (item)=>{
    if(DieSteps.isEnabled()){
       
        if(item.type==="spell"){
            const damages = structuredClone(item.system.damage.parts)            
            item.flags[MODULE_NAME] = {baseFormula:damages,scaling:item.system.scaling.formula};
        }
    }
})
Hooks.on('dnd5e.preRollDamage',(item,data) =>{
    //get the item's damage
    if(DieSteps.isEnabled()){
       
        if(item.type==="spell"){
            const damages = item.system.damage.parts;

            if (item.flags.hasOwnProperty(MODULE_NAME) === false || typeof item.flags.dieSteps?.baseFormula === 'undefined'){
                console.error('test')
          
              item.flags[MODULE_NAME] = {baseFormula:damages,scaling:item.system.scaling.formula};
            }

            damages.forEach((curr,i)=>{
                // curr = [damage formula, damageType]
                let defaultFormula = curr[0];
                if (defaultFormula.includes('ig')) return; //ignore field.
                let newFormula;
             
                //separate die from bonuses.
                let baseDie = defaultFormula.match(/\dd\d+/);
                let dieArray;
                let match = defaultFormula.split('d');

                if(baseDie === null){
                    //formula doesn't conform to xdX format(1d4,etc) like for spells that scale every two levels
                    
                    let exp = match[0];
                    
                    exp = match[0].replace('ceil(','Math.ceil').replace('floor','Math.floor').replace('@item.level',data.data.item.level)

                    let evalExp = eval(exp);


                    
                    dieArray = [parseInt(evalExp), parseInt(match[1].match(/\d+/)[0])]

                }else{
                    //if it matches
                    baseDie = baseDie[0];
                    dieArray = [parseInt(match[0]),parseInt(match[1].match(/\d+/)[0])]
                    
                }
                //get globalMod if any
                let dieMod = DieSteps.getGlobalSpellMod(item.actor);
              
                let newDie, expression, leveledSpellAdd=false;
                switch(item.system.scaling.mode){
                    case 'cantrip':
                        
                        if(item.actor.system.details.level >= 5) dieArray[0] = dieArray[0]+1;
                        if(item.actor.system.details.level >= 11) dieArray[0] = dieArray[0]+1;
                        if(item.actor.system.details.level >= 17) dieArray[0] = dieArray[0]+1;
                      
                        break;
                    case 'level':
                     
                        if(item.system.scaling.formula !==''){
                            if(i === 0 || defaultFormula.includes('scale')){
                                let upscale =  data.data.item.level - item.system.level;
                                dieArray[0] = dieArray[0]+upscale;
                            }
                          
                        }
                        break;
                    case `none`:
                        break;
                    default:
                      
                      
                        break;
                }
                newDie = DieSteps.getModdedDie('spell',dieArray,dieMod); //[number of die, die face, bonus damage per num of die if any]

              
                //replace match[1] number with newDie[1]. match[1] contains number and all die modifiers like r,rr,x,xo, etc
                match[0] = newDie[0];
                match[1] = match[1].replace(/\d+/,newDie[1])
                expression = match.join('d');
             
                newFormula = expression;

            
                // Add bonus damage per die num if exists
                if(newDie.length > 2)
                    newFormula = newFormula + ' + '+newDie[2];

                //Replace exploding die num with max number;
                if (newFormula.includes('x=max'))
                    newFormula = newFormula.replace('x=max','x'+newDie[1])
                if(newFormula.includes('xo=max'))
                    newFormula = newFormula.replace('xo=max','xo'+newDie[1])
                //set the formula for rolling in future hooks
                data.parts[i] = newFormula;
                data.data.item.damage.parts[i][0] = newFormula;
                item.system.damage.parts[i][0] = newFormula;
            })

        }
    }
})
Hooks.on('dnd5e.rollDamage',(item,roll)=>{
   
    if(DieSteps.isEnabled()){
        if(item.type==="spell"){
            
            setTimeout(function(){
                item.system.damage.parts = item.flags[MODULE_NAME].baseFormula;
                item.system.scaling.formula = item.flags[MODULE_NAME].scaling;
            },100);
            
           
        }
    }
})