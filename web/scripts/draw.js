function initDraw(elementId){
    const canvas = document.getElementById(elementId);
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientWidth / 2; //canvas.clientHeight;

    const context = canvas.getContext("2d");
    return {context, canvas};
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
            const s = v(40) + 50;
            const l = v(20) + 50;
            return `hsl(${h}, ${s}%, ${l}%)`;
        }

        case 'cold': {
            const h = v(120) + 150;
            const s = v(40) + 50;
            const l = v(20) + 50;
            return `hsl(${h}, ${s}%, ${l}%)`;
        }

        default: {
            return getRandomColor();
        }
    }

}
