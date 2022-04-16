import {bindHandlers,switchByIndex} from '../../scripts/behavior.js';
import {getData} from '../../scripts/databus.js';
import {Chart, registerables} from '../../scripts/node_modules/chart.js/chart.esm.js';
import {
    WARM_PALETTE_SET, COLD_PALETTE_SET,
    isMobileView, brighten, darken,
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

function mask(array: string[], selected: number, palette: string[]): void {
    array.forEach((color, index, thisArray) => {
        thisArray[index] = index != selected ? darken(palette[index]): brighten(palette[index])
    });
}

function unmask(array: string[], palette: string[]): void {
    array.forEach((color, index, thisArray) => {
        thisArray[index] = palette[index]
    });
}

function legendHover(palette, e, item, legend){
    mask(legend.chart.data.datasets[0].backgroundColor, item.index, palette);
    legend.chart.update();
}

function legendLeave(palette, e, item, legend){
    unmask(legend.chart.data.datasets[0].backgroundColor, palette);
    legend.chart.update();

}

function pieHover(palette, e, items, chart){
    if(items.length > 0){
        mask(chart.data.datasets[0].backgroundColor, items[0].index, palette);
        mask(chart.data.datasets[0].hoverBackgroundColor, items[0].index, palette);
    } else {
        unmask(chart.data.datasets[0].backgroundColor, palette)
    }
    chart.update();
}

function drawPie(elementId: string, data: Array<any>, palette: Array<string>, title: string, isMobile: boolean): Chart {
    const el = document.getElementById(elementId)! as HTMLCanvasElement;
    const ctx = el.getContext("2d")!
    const nonEmptyArticles = data.map( rec => ({name: rec[0], value: +rec[1]})).filter(rec => rec.value > 0)
    const labels = nonEmptyArticles.map( rec => rec.name);
    const values = nonEmptyArticles.map( rec => rec.value);
    return new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: [...palette],
                hoverBackgroundColor: [...palette],
            }]
        },
        options: {
            responsive: true,
            aspectRatio: isMobile? 0.5 : 2,

            onHover: pieHover.bind(null, palette),
            plugins: {
                legend: {
                    position: isMobile? 'top' : 'left',
                    labels: {
                        font: {
                            size: 10
                        },
                        usePointStyle: true
                    },
                    onClick: () => {},
                    onHover: legendHover.bind(null, palette),
                    onLeave: legendLeave.bind(null, palette)
                },
                title: {
                    display: true,
                    text: title
                }
            }
        }
    });

}

let op, ip: Chart|null = null;

function drawBrief(){

    const briefData = getData('brief');
    const outcomesData = briefData['outcomes'] as Array<[string, string]>;
    const incomesData = briefData['incomes'] as Array<[string, string]>;
    console.log({outcomesData, incomesData});
    const isMobile = isMobileView();

    if(op) {
        op.destroy();
    }
    if(ip) {
        ip.destroy();
    }

    op = drawPie('outcomes-pie', outcomesData, WARM_PALETTE_SET, 'outcomes', isMobile);
    ip = drawPie('incomes-pie', incomesData, COLD_PALETTE_SET, 'incomes', isMobile);

}


function switchTo(tab){
    switch (tab) {
        case 'outcomes': showOutcomes(); break;
        case 'incomes': showIncomes(); break;
        case 'brief': showBrief(); break;
    }
}

switchTo(getData('tab'));
