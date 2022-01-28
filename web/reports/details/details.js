const ot = document.querySelector('.outcomes.d-table');
const it = document.querySelector('.incomes.d-table');
const ob = document.querySelector('.button-outcomes');
const ib = document.querySelector('.button-incomes');

function showOutcomes(){
    it.classList.add('hidden');
    ot.classList.remove('hidden');

    ib.classList.remove('active');
    ob.classList.add('active');
}

function showIncomes(){
    ot.classList.add('hidden');
    it.classList.remove('hidden');

    ib.classList.add('active');
    ob.classList.remove('active');
}

setTimeout( () => showOutcomes(), 0);
