# dieStep Increase


## How To Use
---
Add a number to the global mod box on your character sheet. Button can be found under Special Traits button on Attributes tab. You can also add conditional bonuses through the use of character effects.

To set a conditional bonus in the effect enter `flags.dieSteps.conditional.saves.[ability]` where **\[ability\]** is three letter abbreviation of ability. So for dex saves, `flags.dieSteps.conditional.saves.dex` and set it to ADD and then enter a number.

Damage Types works similarly, for "fire", you'd enter `flags.dieSteps.conditional.damageType.fire`, set to ADD and give it a number.

For Spells that have an attack, set `flags.dieSteps.conditional.onAttackMod` to your desired bonus.

The conditional bonuses are cumulative with the global bonus.

By default, this mod adds die step increases to the FIRST die expression in every damage field.
For example: 1d8 with Global Spell modifier set to 2, will output as 1d12. The steps are d4 > d6 > d8 > d10 > d12. This is the max amount of faces. After a die has reached d12 it will scale by adding a +1 for every die rolled. 1d12 becomes 1d12 + 1. 2d12 becomes 2d12 + 2 and so on.

This module does not modify die in variant field.

All data placeholders should work: @mod, @prof, etc. Any modifiers after the d[faces] should also carry over, so feel free to use r,rr,xo,x, etc. For fields with x or xo, you may want to set the exploding number to happen on whatever the max die is. You can accomplish this without maintaining by setting it to x(o)=max which will automatically replace it with the highest face on the die.

For cantrips, you can set Level Scaling to Cantrip, and it will add the correct amount of die as well as modify them. So for firebolt, simply enter 1d10 in damage field, and 1d10 in cantrip scaling field. It will output as [1/2/3/4]d[modded number] based on actor level, according to 5e rules.

For leveled spells, it's a bit more complicated as there are large variations in how spells scale. Spells set to Level Scaling and with a formula inputed will increase the amount of die rolled for EVERY level over the initial level, but only for the first damage field by default. To scale additional fields add the keyword 'scale' to the damage field at the end. This will increment the die rolled.

For example: Acid Arrow is a 2nd level spell that does 4d4 acid damage on hit and 2d4 acid damage at the end of its next turn on failed save. By default, assuming two damage fields are set, 4d4 and 2d4, both die will be incremented by the set modifier amount(2) to 4d8 and 2d8 respectively. If upcast to level 3, by default, the output will be 5d8 and 2d8. To scale the second damage field, add 'scale' to the field as in '2d4 scale' and it will output as 5d8 and 3d8.

Generally, for leveled spells the best bet is to not use level scaling at all. For spells that only scale every other level or weird intervals, set scaling to None, and then use a formula like "(floor((@item.level)-1/2))d[base number]" to increase the amount of die rolled. Here, @item.level is swapped out for the level of the spell cast, then subtracted by 1, then divided by 2, and then rounded down, so that the number of die only increments every other spell level. For instance, a spell like Spirit Shroud rolls 1 die at 3rd level, and 2 die at 5th level. As normal, the first number(s) after the 'd' in the expression will increment. So 2 steps would make this output 1d12 at level 3, and 2d12 at spell level 5.


Custom commands:
There are a couple custom commands that you can put in the damage field box
- ig  -  Ignores field. Will not apply die increases to that damage field.

- scale - For spells with Level Scaling set to Spell Level, for every level over the default spell level, it will add 1 die to total die to the first damage field only. To apply this scaling to other damage fields use this keyword.

- x=max, or xo=max - to apply exploding die to the highest face without having to change it whenver a die increase happens.

The module also takes conditional bonuses for spells with a specific save type or damage type or if a spell uses a spell attack. These bonuses can be set in effects on the character or on an item and dragging it onto a character. 
