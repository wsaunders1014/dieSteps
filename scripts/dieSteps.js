import { MODULE_NAME } from "./main.js";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
      function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
      function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
export class DieSteps {
    static get settings() {
        return mergeObject(this.defaultSettings, game.settings.get(MODULE_NAME, 'settings'));
    }
    /** 
     * Is module active
    */
    static isEnabled() {
        return game.settings.get(MODULE_NAME, 'dieStepEnabled');
    }
    static actorEnabled(actor){
        return actor.getFlag(MODULE_NAME, 'enableForActor');
    }
   /**
   * Adds a tracker to character sheet instead of using one of the three Resource Boxes.
   * 
   * @param app - The application object.
   * @param html - The HTML of the Actor sheet.
   * @param data - The data object passed to the sheet.
   * @returns The return value is the html_checkbox variable.
   */
    static addConfigButton(app, data){
        console.log(app.element.find('a.dieStepConfig').length)
        if(app.element.find('a.dieStepConfig').length === 0){
            app.element.find('.traits').append('<div class="form-group"><label>Die Step Increases</label><a class="config-button dieStepConfig" data-action="dieStep" data-tooltip="Configure Die Step Increases"><i class="fas fa-cog"></i></a></div>')
            app.element.find('.dieStepConfig').on('click', (e)=>{
            //   e.preventDefault();
            if($('#dieStep-config').length === 0)
                new DieStepConfig(app.actor).render(true);
            })
        }
    }
    /*
    *  Take a formula like '1d4r<3 + 4' and break it down into number of die rolled, number of faces and mods.
    *
    */
    static breakdownFormula(formula,level=1){
        //separate die from bonuses.
        let baseDie = formula.match(/\dd\d+/);
        
        let match = formula.split('d');
        let dIndex = formula.match(/d/).index;
      
      
         let num =  formula.slice(0,dIndex); // match[0]; // the 1 in 1d4. Could also be an expression like(floor((@item.level)-1)/2)
         formula = formula.slice(dIndex+1); //remove num and "d" from expression.
         let faces = parseInt(formula.match(/\d+/)[0]); // the 4 in 1d4
         formula = formula.slice(formula.match(/\d+/)[0].length)
         let mods =  (formula.match(/^([^\s+-]+)/)===null) ? '':formula.match(/^([^\s+-]+)/)[0]; // everything that comes after 1d4.
         let bonuses = (formula.match(/(\s*\+\s*.+)/)===null)? '':formula.match(/(\s*\+\s*.+)/)[0];
       
        
        if(baseDie === null){
            //formula doesn't conform to xdX format(1d4,etc) like for spells that scale every two levels
            let exp = num;        
            exp = num.replace('ceil(','Math.ceil').replace('floor','Math.floor').replace('@item.level',level)
            num = eval(exp);                  
        }
        return {num:parseInt(num),faces:faces, mods:mods, bonuses:bonuses}
    }
    /*
        Returns the number of die for a cantrip based on 5e rules. level 5: 1, level 11: 2, level 17:3.
    */
    static getCantripNum(actor){
        return Math.max(actor.system.attributes.prof - 3,0);
    }
    static assembleFormula(num,faces,mods,perDieBonus="", bonuses=""){
        return `${num}d${faces}${mods}${ (perDieBonus) ? " + "+(num * perDieBonus):""}${bonuses}`;
    }
    static getGlobalSpellMod(actor){
        return actor.getFlag(MODULE_NAME,'globalSpellMod');
    }
    
    static getSaveSpellMod(actor,save){
        let obj = actor.getFlag(MODULE_NAME,'conditional');
        return (obj.hasOwnProperty('saves') && obj.saves?.hasOwnProperty(save)) ? obj.saves[save]:0;
    }
    static getDamageSpellMod(actor,damageType){
        let obj = actor.getFlag(MODULE_NAME, 'conditional');

        return (obj.hasOwnProperty('damage') && obj.damage?.hasOwnProperty(damageType)) ? obj.damage[damageType]:0;

    }
    static getOnAttackMod(actor){
        let obj = actor.getFlag(MODULE_NAME,'conditional');
        return (obj.hasOwnProperty('onAttackMod')) ? obj.onAttackMod:0;
    }
    static getBaseDie(exp){
        return exp.split('d')[0] || false;
    }
    static getBaseFaces(exp){
        return exp.split('d')[1].match(/\d+/)[0] || false;
    }
    static getDieMods(exp){
        //returns the die expression after the initial xdX value if any.

        let match = exp.match(/\d+d\d+/);
        let mods = '';
        if (match !== null)
            mods = exp.slice(match[0].length);
        else
            mods = exp.split('d')[1].slice( exp.split('d')[1].match(/\d+/)[0].length)
        
        return mods;
    }
   /**
   * @param type - Type of item, i.e. Spell or Weapon
   * @param baseDie - Array of the die parameters, [numbr of die, faces]. Example: 4d6 = [4,6];
   * @param dieMod - Number of die step increases. Each step increments by 2;
   * Each step over d12, adds +1 per number of die rolled. so 1d12, incremented by 1, becomes 1d12 + 1
   * Returns object { faces, perDieBonus}
   * */
    static getModdedFace(type="spell",faces, dieIncrement) {
        if(type==='spell'){
            let bonus = 0;
            let newFaces = faces;
            if(faces + (dieIncrement*2) <= 12){
                //no extra math needed;
                newFaces = faces + (dieIncrement*2);
            }else{
                let remainingInc = (faces + (dieIncrement*2))-12; 
                bonus = (remainingInc/2);
                newFaces = 12;
            }
         
            return {newFaces:newFaces, perDieBonus:bonus}
        }
    }
}


export class DieStepConfig extends FormApplication {
    constructor(object, options) {
        super(object, options);
       
        this.clone = this.object.clone();
       
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
          title: 'Die Step Configuration',
          id: 'dieStep-config',
          classes: ["dnd5e", "dieStepConfig"],
          template: `modules/${MODULE_NAME}/templates/dieStep-config.hbs`,
          width: 500,
          height: "auto",
          sheetConfig: false,
          closeOnSubmit: true,
         
        });
    }
    async getData(options) {
      
        return {
           dieSteps: this.object.flags[MODULE_NAME],
           isCharacter: this.object.type === "character"
        };
    }
   async _updateObject(event, formData) {
        const dieSteps = foundry.utils.expandObject(formData).dieSteps;
        dieSteps.globalSpellMod = (dieSteps.globalSpellMod == null) ? 0: dieSteps.globalSpellMod;
        await this.object.setFlag(MODULE_NAME, 'globalSpellMod', dieSteps.globalSpellMod);
        await this.object.setFlag(MODULE_NAME, 'enableForActor', dieSteps.enableForActor);
        if(!this.object.flags[MODULE_NAME].hasOwnProperty('conditional')){
            await this.object.setFlag(MODULE_NAME, 'conditional', {
                damageType: {},
                onAttackMod: 0,
                saves: {}
            });
        }
    }
    activateListeners(html) {
        super.activateListeners(html);

        html.on('click', "[data-action]", this._handleButtonClick.bind(this));
    }
    async _handleButtonClick(event) {
        const clickedElement = $(event.currentTarget);
        const action = clickedElement.data().action;

        switch(action){
         
            default:{
                break;
            }
        }

      }
}