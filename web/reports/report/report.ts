import {registerSwitchingGroup, switchWithinGroup} from '../../scripts/behavior.js';
import {getData} from '../../scripts/databus.js';
import {createSector, drawSector, getColorFromPalette, initDraw} from '../../scripts/draw.js';

console.log('Lets do it');

registerSwitchingGroup('rep_cat', ['.outcomes.categories', '.incomes.categories', '.brief']);
registerSwitchingGroup('rep_but', ['.button.button-outcomes', '.button.button-incomes', '.button.button-brief'], 'activate');


function showOutcomes(): void{
    switchWithinGroup('rep_cat', '.outcomes.categories');
    switchWithinGroup('rep_but', '.button.button-outcomes');
}

document.querySelector('.button-outcomes')!.addEventListener('click', showOutcomes);

function showIncomes(): void{
    switchWithinGroup('rep_cat', '.incomes.categories');
    switchWithinGroup('rep_but', '.button.button-incomes');
}
document.querySelector('.button-incomes')!.addEventListener('click', showIncomes);

function showBrief(): void{
    switchWithinGroup('rep_cat', '.brief');
    switchWithinGroup('rep_but', '.button.button-brief');

    setTimeout( () => {
        drawBrief('brief-canvas', 'brief');
    }, 200);
}
document.querySelector('.button-brief')!.addEventListener('click', showBrief);

const cs = document.querySelectorAll('.categories>.category');
const buttonLabel = document.querySelector('.button-toggle-colexp>span')!;
let state = 'expanded';
function toggleColExp(){
    switch(state) {
        case 'collapsed': {
            console.log('collapsed -> expanded');
            cs.forEach(el => {
                el.classList.remove('reduced');
            });
            buttonLabel.textContent = 'Свернуть';
            state = 'expanded';
        } break;

        case 'expanded': {
            console.log('expanded -> collapsed');
            cs.forEach(el => {
                el.classList.add('reduced');
            })
            buttonLabel.textContent = 'Развернуть';
            state = 'collapsed';
        } break;
    }
}
document.querySelector('.button-toggle-colexp')!.addEventListener('click', toggleColExp);

function drawBrief(elementId, key){

    const data = getData(key);
    const {context, canvas, centerX, centerY} = initDraw(elementId);
    const r = Math.min(centerX, centerY) * 0.4;

    const partToDegrees = (part, whole) => Math.round( part *360 / whole);

    const volumesData = [
        {
            data: data['outcomes'],
            palette: 'warm',
            x0: 2 * centerX * (3/8),
            y0: centerY
        },
        {
            data: data['incomes'],
            palette: 'cold',
            x0: 2 * centerX * (7/8),
            y0: centerY
        },
    ];

    const sectorsDrawingData = volumesData
        .map( volume => [
            volume,
            volume.data
                .map(category => category.value < 0 ? 0 : +category.value)
                .reduce( (a,i) => a+i)
        ])
        .filter( ([volume, sum]) => sum > 0)

        .map( ([volume, sum]) => {
            volume.data = volume.data
                .map(category => +category.value)
                .reduce((steps, value) => {
                    if (steps.length === 0) {
                        return [{startStep: 0, endStep: value}]
                    } else {
                        const prev = steps[steps.length - 1].endStep;
                        steps.push({startStep: prev, endStep: prev + value});
                        return steps;
                    }
                }, [])
                .map(i => ({
                    startAngle: partToDegrees(i.startStep, sum) - 90,
                    endAngle: partToDegrees(i.endStep, sum) - 90
                }))
            return volume;
        });

    console.log({'drawingData': sectorsDrawingData});

    const sectors = sectorsDrawingData
        .map(volume => {
            return volume.data.map( (sectorData, index) => {
                const color = getColorFromPalette(volume.palette, index);
                return createSector(context, volume.x0 , volume.y0, r, sectorData.startAngle, sectorData.endAngle, 'gray', color)
            });
        })
        .flatMap(drawingData => drawingData);

    console.log({"sectors": sectors});

    const back = () => {
        context.fillStyle = 'beige';
        context.fillRect(0,0, 2*centerX, 2*centerY);
    }

    const draw = (needShift) => {
        back();
        sectors.forEach(sector => {
            context.save();
            drawSector(context, sector, () => {
                if(needShift(sector)) {
                    context.translate(sector.x0 + sector.ox, sector.y0 + sector.oy)
                    context.scale(1.05, 1.05);
                } else {
                    context.translate(sector.x0, sector.y0);
                }
            });
            context.restore();
        });
    }

    draw(() => false);

    canvas.addEventListener('mousemove', (event => {
        const x = event.offsetX;
        const y = event.offsetY;
        back();

        draw(sector => context.isPointInPath(sector.path, x - sector.x0, y - sector.y0) );

    }));
}

function switchTo(tab){
    switch (tab) {
        case 'outcomes': showOutcomes(); break;
        case 'incomes': showIncomes(); break;
        case 'brief': showBrief(); break;
    }
}

switchTo(getData('tab'));



