## CHANGELOG

- 0.0.1 - Initial launch.
- 0.0.2 - Added conditional bonuses, bug fixes.
- 0.0.3 - Added support for Other fields and non damage spells, more bugfixes.
- 0.0.4 -
    - Refactored the flag setting to not rely on controlling token, instead it saves it on config update. 
    - Bugfixes: Fixed error message when spell uses a flat number such as Aid, and any other edge case where formula doesn't include a 'd.' Fixed scaling issue where spells that upcast with multiple die wouldn't roll the correct amount of die after the spell + 1 level. Also, got rid of a bug that caused multiple spell die configs to open on click.