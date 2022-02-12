registerSwitchingGroup('rep_cat', ['.outcomes.categories', '.incomes.categories', '.brief']);
registerSwitchingGroup('rep_but', ['.button.button-outcomes', '.button.button-incomes', '.button.button-brief'], 'activate');

function showOutcomes(){
    switchWithinGroup('rep_cat', '.outcomes.categories');
    switchWithinGroup('rep_but', '.button.button-outcomes');
}

function showIncomes(){
    switchWithinGroup('rep_cat', '.incomes.categories');
    switchWithinGroup('rep_but', '.button.button-incomes');
}

function showBrief(){
    switchWithinGroup('rep_cat', '.brief');
    switchWithinGroup('rep_but', '.button.button-brief');

    setTimeout( () => {
        drawBrief('brief-canvas', 'brief');
    }, 200);
}

const cs = document.querySelectorAll('.categories>.category');

let state = 'expanded';
function toggleColExp(){
    switch(state) {
        case 'collapsed': {
            console.log('collapsed -> expanded');
            cs.forEach(el => {
                el.classList.remove('reduced');
            });

            state = 'expanded';
        } break;

        case 'expanded': {
            console.log('expanded -> collapsed');
            cs.forEach(el => {
                el.classList.add('reduced');
            })

            state = 'collapsed';
        } break;
    }
}

function drawBrief(elementId, key){

    const data = getData(key);
    // console.log({loadedData: data});

    const {context, canvas} = initDraw(elementId);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    const r = Math.min(cx, cy) * 0.5;

    //context.translate(0, cy);

    const [outcomes, incomes] = [data['outcomes'], data['incomes']];

    const drawingData = [outcomes, incomes]
        .map( volume => [
            volume,
            volume
                .map(category => category.value < 0 ? 0 : +category.value)
                .reduce( (a,i) => a+i)
        ])
        .filter( ([categories,sum]) => sum > 0)

        .map( ([categories, sum]) => categories
            .map(category => +category.value)
            .reduce( (a,i) => {
                if (a.length === 0){
                    return [{s: 0, f: i}]
                } else {
                    const prev = a[a.length-1].f;
                    a.push({s: prev, f: prev+i});
                    return a;
                }
            }, [])
            .map( i => ({s: Math.round(i.s*360 / sum) -90, f: Math.round(i.f*360 / sum ) - 90}))
        );

    const eDrawingData = [{
        drawingData: drawingData[0],
        palette: 'warm',
        x0: 2 * cx * (1/4)
    }, {
        drawingData: drawingData[1],
        palette: 'cold',
        x0: 2 * cx * (3/4)
    }];

    console.log({'eDrawingData': eDrawingData});

    const sectors = eDrawingData
        .map(volume => {

            return volume.drawingData.map( sectorData => {
                const color = getRandomColorFromPalette(volume.palette);
                return createSector(context, volume.x0 , cy, r, sectorData.s, sectorData.f, 'gray', color)
            });
        })
        .flatMap(drawingData => drawingData);

    console.log({"sectors": sectors});

    const back = () => {
        context.fillStyle = 'beige';
        context.fillRect(0,0, 2*cx, 2*cy);
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

        draw(sector => context.isPointInPath(sector.path, x - sector.x0, y - sector.y0)  );

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


