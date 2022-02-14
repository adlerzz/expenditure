function initDraw(elementId){
    const canvas = document.getElementById(elementId);
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientWidth / 2; //canvas.clientHeight;

    const context = canvas.getContext("2d");

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    return {context, canvas, centerX, centerY};
}

function createSector(ctx, x0, y0, r, as, af, sc, fc) {
    const angle = af - as;
    const ras = Math.PI * as / 180.0;
    const raf = Math.PI * af / 180.0;
    const offsetAngle = (ras + raf) / 2.0;
    const o = r * 0.035 / (raf - ras);
    const ox = o * Math.cos(offsetAngle);
    const oy = o * Math.sin(offsetAngle);
    const path = new Path2D();

    if(angle !== 0) {
        path.arc(0, 0, r, ras, raf);
        if(angle !== 360) {
            path.lineTo(0, 0);
            path.closePath();
        }
    }

    ctx.restore();
    return {path, x0, y0, ox, oy, sc, fc};
}

function drawSector(ctx, sector, additional){
    ctx.save();

    //ctx.translate(sector.cx, sector.cy);
    if(additional){
        additional();
    }
    ctx.strokeStyle = sector.sc;
    ctx.fillStyle = sector.fc;
    ctx.lineWidth = 1.0;
    ctx.fill(sector.path);
    ctx.stroke(sector.path);
    ctx.restore();
}

function getRandomColor(){
    const v = Math.round((Math.random() * 0x1000000)).toString(16).padStart(6, '0');
    return `#${v}`;
}

function getRandomColorFromPalette(palette){

    const v = (n) => Math.round(Math.random()*n);

    switch(palette){
        case 'warm': {
            const h = (v(120) + 320) % 360;
            const s = v(20) + 80;
            const l = v(10) + 50;
            return `hsl(${h}, ${s}%, ${l}%)`;
        }

        case 'cold': {
            const h = v(120) + 150;
            const s = v(20) + 80;
            const l = v(10) + 50;
            return `hsl(${h}, ${s}%, ${l}%)`;
        }

        default: {
            return getRandomColor();
        }
    }

}
const WARM_PALETTE = [
    'hsl(280, 90%, 30%)',
    'hsl(280, 90%, 50%)',
    'hsl(280, 90%, 70%)',

    'hsl(300, 90%, 30%)',
    'hsl(300, 90%, 50%)',
    'hsl(300, 90%, 70%)',

    'hsl(320, 90%, 30%)',
    'hsl(320, 90%, 50%)',
    'hsl(320, 90%, 70%)',

    'hsl(340, 90%, 30%)',
    'hsl(340, 90%, 50%)',
    'hsl(340, 90%, 70%)',

    'hsl(  0, 90%, 30%)',
    'hsl(  0, 90%, 50%)',
    'hsl(  0, 90%, 70%)',

    'hsl( 20, 90%, 30%)',
    'hsl( 20, 90%, 50%)',
    'hsl( 20, 90%, 70%)',

    'hsl( 40, 90%, 30%)',
    'hsl( 40, 90%, 50%)',
    'hsl( 40, 90%, 70%)',

    'hsl( 60, 90%, 30%)',
    'hsl( 60, 90%, 50%)',
    'hsl( 60, 90%, 70%)',

    'hsl( 80, 90%, 30%)',
    'hsl( 80, 90%, 50%)',
    'hsl( 80, 90%, 70%)'
]

const COLD_PALETTE = [
    'hsl(100, 90%, 30%)',
    'hsl(100, 90%, 50%)',
    'hsl(100, 90%, 70%)',

    'hsl(120, 90%, 30%)',
    'hsl(120, 90%, 50%)',
    'hsl(120, 90%, 70%)',

    'hsl(140, 90%, 30%)',
    'hsl(140, 90%, 50%)',
    'hsl(140, 90%, 70%)',

    'hsl(160, 90%, 30%)',
    'hsl(160, 90%, 50%)',
    'hsl(160, 90%, 70%)',

    'hsl(180, 90%, 30%)',
    'hsl(180, 90%, 50%)',
    'hsl(180, 90%, 70%)',

    'hsl(200, 90%, 30%)',
    'hsl(200, 90%, 50%)',
    'hsl(200, 90%, 70%)',

    'hsl(220, 90%, 30%)',
    'hsl(220, 90%, 50%)',
    'hsl(220, 90%, 70%)',

    'hsl(240, 90%, 30%)',
    'hsl(240, 90%, 50%)',
    'hsl(240, 90%, 70%)',

    'hsl(260, 90%, 30%)',
    'hsl(260, 90%, 50%)',
    'hsl(260, 90%, 70%)'
]

function getColorFromPalette(palette, index){
    switch(palette){
        case 'warm': {
            return WARM_PALETTE[index % WARM_PALETTE.length];
        }

        case 'cold': {
            return COLD_PALETTE[index % COLD_PALETTE.length];
        }

        default: {
            return getRandomColor();
        }
    }
}
