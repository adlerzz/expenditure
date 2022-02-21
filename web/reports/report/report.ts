import {
    bindClicks,
    bindSwitchingGroups,
    switchByElement, switchByIndex
} from '../../scripts/behavior.js';
import {getData} from '../../scripts/databus.js';
import {createSector, drawSector, getColorFromPalette, initDraw, SectorData} from '../../scripts/draw.js';

console.log('Lets do it');


function showOutcomes(element?: Element): void{
    console.log('showOutcomes');
    if(element){
        switchByElement('activeButton', element);
    } else {
        switchByIndex('activeButton', 0);
    }

    switchByIndex('tab', 0);
}

function showIncomes(element?: Element): void{
    console.log('showIncomes');
    if(element){
        switchByElement('activeButton', element);
    } else {
        switchByIndex('activeButton', 1);
    }
    switchByIndex('tab', 1);
}

function showBrief(element?: Element): void{
    console.log('showBrief');
    if(element){
        switchByElement('activeButton', element);
    } else {
        switchByIndex('activeButton', 2);
    }
    switchByIndex('tab', 2);

    setTimeout( () => drawBrief('brief-canvas', 'brief'), 200);
}

let state = 'expanded';

function toggleColExp(element: Element): void{
    const cs = document.querySelectorAll('.categories>.category');
    switch(state) {
        case 'collapsed': {
            cs.forEach(el => {
                el.classList.remove('reduced');
            });
            element.querySelector('*>span')!.textContent = 'Свернуть';
            state = 'expanded';
        } break;

        case 'expanded': {
            cs.forEach(el => {
                el.classList.add('reduced');
            })
            element.querySelector('*>span')!.textContent = 'Развернуть';
            state = 'collapsed';
        } break;
    }
}

bindClicks(document, {showOutcomes, showIncomes, showBrief, toggleColExp});
bindSwitchingGroups(document);



function calcBrief(key: string): any {
    const partToDegrees = (part, whole) => Math.round( part *360 / whole);

    const data = getData(key);
    const volumesData = [
        {
            data: data['outcomes'],
            palette: 'warm'
        },
        {
            data: data['incomes'],
            palette: 'cold'
        }

    ];

    const drawableVolumes = volumesData
        .map( volumeData => ({
            categories: volumeData.data,
            sum: volumeData.data
                .map(category => category.value < 0 ? 0 : +category.value)
                .reduce( (a,i) => a+i),
            palette: volumeData.palette
        }))
        .filter( (volume) => volume.sum > 0);

    const sectorsDrawingData = drawableVolumes

        .map( volume => {
            return volume.categories
                .map(category => ({value: +category.value, text: category.name}))
                .reduce((steps, category) => {
                    if (steps.length === 0) {
                        return [{startStep: 0, endStep: category.value, text: category.text}]
                    } else {
                        const prev = steps[steps.length - 1].endStep;
                        steps.push({startStep: prev, endStep: prev + category.value, text: category.text});
                        return steps;
                    }
                }, [])
                .map((sector, i) => ({
                    startAngle: partToDegrees(sector.startStep, volume.sum) - 90,
                    endAngle: partToDegrees(sector.endStep, volume.sum) - 90,
                    text: sector.text,
                    color: getColorFromPalette(volume.palette, i*4)
                }));
        });
    console.log({sectorsDrawingData});
    return sectorsDrawingData;

}

function drawBrief(elementId: string, key: string){

    const data = getData(key);
    const sectorsDrawingData = calcBrief(key);
    const {context, canvas, centerX, centerY, isMobile} = initDraw(elementId);
    const r = Math.min(centerX, centerY) * 0.4;

    //const partToDegrees = (part, whole) => Math.round( part *360 / whole);

    const volumesData = [
        {
            sectors: sectorsDrawingData[0],
            x0: 2 * centerX * (1/4),
            y0: 2 * centerY * (6/8)
        },
        {
            sectors: sectorsDrawingData[1],
            x0: 2 * centerX * (3/4),
            y0: 2 * centerY * (6/8)
        },
    ];

    console.log({volumesData});


    const drawingData = volumesData
        .map((volume, c) => {
            return volume.sectors.map( (sectorData, i) => ({
                sector: createSector(context, volume.x0 , volume.y0, r, sectorData.startAngle, sectorData.endAngle, 'gray', sectorData.color),
                bullet: {
                    bullet: createSector(context, (isMobile ? 15 : 30) + c * centerX, (isMobile? 20 : 25)*i + 20, 5, 0, 360, 'gray', sectorData.color),
                    x: (isMobile ? 25 : 45) + c*centerX,
                    y: (isMobile ? 20 : 25)*i + (isMobile ? 23 : 25)
                },
                text: sectorData.text
            }))
        })
        .flatMap(i => i);

    console.log({drawingData});

    const back = () => {
        context.fillStyle = 'beige';
        context.strokeStyle = 'black';
        context.fillRect(0,0, 2*centerX, 2*centerY);
    }

    const draw = (needShift: (SectorData) => boolean) => {
        back();
        drawingData.forEach( (category, i) => {
            context.save();
            drawSector(context, category.sector, () => {
                if(needShift(category.sector)) {
                    context.translate(category.sector.x0 + category.sector.xOffset, category.sector.y0 + category.sector.yOffset)
                    context.scale(1.05, 1.05);
                } else {
                    context.translate(category.sector.x0, category.sector.y0);
                }
            });
            drawSector(context, category.bullet.bullet, () => {
                if(needShift(category.sector)) {
                    context.translate(category.bullet.bullet.x0, category.bullet.bullet.y0);
                    context.scale(1.4, 1.4);
                } else {
                    context.translate(category.bullet.bullet.x0, category.bullet.bullet.y0);
                }
            });
            context.font = isMobile ? '8px sans-serif' : '14px sans-serif';
            context.fillStyle = 'blue';
            context.fillText(category.text, category.bullet.x, category.bullet.y);
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
