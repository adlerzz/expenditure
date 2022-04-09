import {bindHandlers,switchByIndex} from '../../scripts/behavior.js';
import {getData} from '../../scripts/databus.js';
import {Chart, registerables} from '../../scripts/node_modules/chart.js/chart.esm.js';
import {
    WARM_PALETTE_SET, COLD_PALETTE_SET,
    isMobileView,
} from '../../scripts/draw.js';

Chart.register(...registerables);

function showOutcomes(element?: Element): void{
    switchByIndex('activeButton', 0);
    switchByIndex('tab', 0);
    document.querySelector('.button-toggle-colexp')!.classList.remove('hidden');
}

function showIncomes(element?: Element): void{
    switchByIndex('activeButton', 1);
    switchByIndex('tab', 1);
    document.querySelector('.button-toggle-colexp')!.classList.remove('hidden');
}

function showBrief(element?: Element): void{
    switchByIndex('activeButton', 2);
    switchByIndex('tab', 2);
    document.querySelector('.button-toggle-colexp')!.classList.add('hidden');

    setTimeout( () => drawBrief(), 200);
}

function expand(element: Element): void{
    const cs = document.querySelectorAll('.categories>.category');
    cs.forEach(el => el.classList.remove('reduced'));
    document.querySelectorAll('.button-toggle-colexp>span').forEach( el => el.textContent = 'Свернуть');
}

function collapse(element: Element): void{
    const cs = document.querySelectorAll('.categories>.category');
    cs.forEach(el => el.classList.add('reduced'));
    document.querySelectorAll('.button-toggle-colexp>span').forEach( el => el.textContent = 'Развернуть');
}

bindHandlers({showOutcomes, showIncomes, showBrief, expand, collapse})

const baseWidth = 360;

function drawPie(elementId: string, data: Array<any>, palette: Array<string>, title: string, isMobile: boolean){
    const el = document.getElementById(elementId)! as HTMLCanvasElement;
    const ctx = el.getContext("2d")!
    const labels = data.map( rec => rec[0]);
    const values = data.map( rec => +rec[1]);
    console.log({labels, values});
    const chart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: palette
            }]
        },
        options: {
            aspectRatio: isMobile? 0.5 : 2,
            plugins: {
                legend: {
                    position: isMobile? 'top' : 'left',
                    labels: {
                        font: {
                            size: 10
                        },
                        usePointStyle: true
                    }
                },
                title: {
                    display: true,
                    text: title
                }
            }
        }
    });

}

function drawBrief(){

    const briefData = getData('brief');
    const outcomesData = briefData['outcomes'] as Array<[string, string]>;
    const incomesData = briefData['incomes'] as Array<[string, string]>;
    console.log({outcomesData, incomesData});
    const isMobile = isMobileView();

    drawPie('outcomes-pie', outcomesData, WARM_PALETTE_SET, 'outcomes', isMobile);
    drawPie('incomes-pie', incomesData, COLD_PALETTE_SET, 'incomes', isMobile);

}


function switchTo(tab){
    switch (tab) {
        case 'outcomes': showOutcomes(); break;
        case 'incomes': showIncomes(); break;
        case 'brief': showBrief(); break;
    }
}

switchTo(getData('tab'));
