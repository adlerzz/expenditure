registerSwitchingGroup('rep_cat', ['.outcomes.categories', '.incomes.categories']);
registerSwitchingGroup('rep_but', ['.button.button-outcomes', '.button.button-incomes'], 'activate');

function showOutcomes(){
    switchWithinGroup('rep_cat', '.outcomes.categories');
    switchWithinGroup('rep_but', '.button.button-outcomes');
}

function showIncomes(){
    switchWithinGroup('rep_cat', '.incomes.categories');
    switchWithinGroup('rep_but', '.button.button-incomes');
}

const its = document.querySelectorAll('.incomes.categories>.category');
const ots = document.querySelectorAll('.outcomes.categories>.category');

function showBrief(){

}

let state = 'expanded';
function toggle(){
    switch(state) {
        case 'collapsed': {
            console.log('collapsed -> expanded');
            ots.forEach(el => {
                el.querySelector('.articles').classList.remove('hidden')
            });

            state = 'expanded';
        } break;

        case 'expanded': {
            console.log('expanded -> collapsed');
            ots.forEach(el => {
                el.querySelector('.articles').classList.add('hidden')
            })

            state = 'collapsed';
        } break;
    }
}

setTimeout( () => showOutcomes(), 0);
