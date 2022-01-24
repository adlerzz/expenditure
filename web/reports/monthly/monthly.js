function showOutcomes(){
    const oel = document.querySelector('.outcomes.datatable');
    const iel = document.querySelector('.incomes.datatable');
    if(iel) {
        iel.classList.add('hidden');
    }
    if(oel) {
        oel.classList.remove('hidden');
    }

}

function showIncomes(){
    const oel = document.querySelector('.outcomes.datatable');
    const iel = document.querySelector('.incomes.datatable');
    if(oel) {
        oel.classList.add('hidden');
    }
    if(iel) {
        iel.classList.remove('hidden');
    }

}
