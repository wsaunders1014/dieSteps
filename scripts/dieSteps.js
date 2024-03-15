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
   /**
   * Adds a tracker to character sheet instead of using one of the three Resource Boxes.
   * 
   * @param app - The application object.
   * @param html - The HTML of the Actor sheet.
   * @param data - The data object passed to the sheet.
   * @returns The return value is the html_checkbox variable.
   */
    static addConfigButton(app, data){
        
        app.element.find('.traits').append('<div class="form-group"><label>Die Step Increases</label><a class="config-button dieStepConfig" data-action="dieStep" data-tooltip="Configure Die Step Increases"><i class="fas fa-cog"></i></a></div>')
        app.element.on('click','.dieStepConfig', (e)=>{
         //   e.preventDefault();
            new DieStepConfig(app.actor).render(true);
        })
    }

    static getGlobalSpellMod(actor){
        return actor.getFlag(MODULE_NAME,'dieSteps.spellGlobal');
    }
    /**
   * @param type - Type of item, i.e. Spell or Weapon
   * @param baseDie - Array of the die parameters, [numbr of die, faces]. Example: 4d6 = [4,6];
   * @param dieMod - Number of die step increases. Each step increments by 2;
   * Each step over d12, adds +1 per number of die rolled. so 1d12, incremented by 1, becomes 1d12 + 1
   * Returns array [number of die, faces, bonus].
   * */
    static getModdedDie(type="spell",baseDie,dieMod){
        if(type==='spell'){
            let faces = baseDie[1];

            if(faces + (dieMod*2) <= 12){
                //no extra math needed;
                return [baseDie[0],faces + (dieMod*2)]
            }else{
                let remainingInc = (faces + (dieMod*2))-12; 
                remainingInc = (remainingInc/2)* baseDie[0];
                return [baseDie[0],12,remainingInc]
            }
           
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
           dieSteps: this.object.flags[MODULE_NAME].dieSteps,
           isCharacter: this.object.type === "character"
        };
    }
   async _updateObject(event, formData) {
        const dieSteps = foundry.utils.expandObject(formData).dieSteps;
        console.log('test', dieSteps)
        await this.object.setFlag(MODULE_NAME, 'dieSteps', mergeObject(this.object.getFlag(MODULE_NAME,'dieSteps'),dieSteps));

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