/*import {registerSwitchingGroup, switchWithinGroup} from '../../scripts/behavior';

registerSwitchingGroup('det_tab', ['.outcomes.d-table', '.incomes.d-table']);
registerSwitchingGroup('det_but', ['.button-outcomes', '.button-incomes'], 'activate');

function showOutcomes(){
    switchWithinGroup('det_tab', '.outcomes.d-table');
    switchWithinGroup('det_but', '.button-outcomes');
}

function showIncomes(){
    switchWithinGroup('det_tab', '.incomes.d-table');
    switchWithinGroup('det_but', '.button-incomes');
}

setTimeout( () => showOutcomes(), 100);
*/

import {bindHandlers, switchByIndex} from '../../scripts/behavior.js';

function showOutcomes(element?: Element): void{
    switchByIndex('activeButton', 0);
    switchByIndex('tab', 0);
 }

function showIncomes(element?: Element): void{
    switchByIndex('activeButton', 1);
    switchByIndex('tab', 1);
}

bindHandlers({showOutcomes, showIncomes})
