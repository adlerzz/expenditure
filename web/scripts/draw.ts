interface DrawData {
    context: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;
    centerX, centerY: number;
    isMobile: boolean;
}

export function initDraw(elementId: string): DrawData {
    const canvas = document.getElementById(elementId)! as HTMLCanvasElement;
    canvas.width = canvas.clientWidth;
    const isMobile = screen.width < 800;

    canvas.height = canvas.clientWidth * ( isMobile ? 1.1 : 0.75); //canvas.clientHeight;

    const context = canvas.getContext("2d")!;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    return {context, canvas, centerX, centerY, isMobile} as DrawData;
}

export interface SectorData {
    path: Path2D;
    x0, y0: number;
    xOffset, yOffset: number;
    strokeColor, fillColor: string;
}

export function createSector(ctx, x0, y0, r, startAngle, endAngle, strokeColor, fillColor): SectorData {
    const angle = endAngle - startAngle;
    const ras = Math.PI * startAngle / 180.0;
    const raf = Math.PI * endAngle / 180.0;
    const offsetAngle = (ras + raf) / 2.0;
    const offset = r * 0.035 / (raf - ras);
    const xOffset = offset * Math.cos(offsetAngle);
    const yOffset = offset * Math.sin(offsetAngle);
    const path = new Path2D();

    if(angle !== 0) {
        path.arc(0, 0, r, ras, raf);
        if(angle !== 360) {
            path.lineTo(0, 0);
            path.closePath();
        }
    }

    ctx.restore();
    return {path, x0, y0, xOffset, yOffset, strokeColor, fillColor} as SectorData;
}

export function drawSector(ctx, sector: SectorData, additional?: () => void): void {
    ctx.save();

    //ctx.translate(sector.cx, sector.cy);
    if(additional){
        additional();
    } else {
        ctx.translate(sector.x0, sector.y0);
    }
    ctx.strokeStyle = sector.strokeColor;
    ctx.fillStyle = sector.fillColor;
    ctx.lineWidth = 1.0;
    ctx.fill(sector.path);
    ctx.stroke(sector.path);
    ctx.restore();
}

function getRandomColor(): string {
    const v = Math.round((Math.random() * 0x1000000)).toString(16).padStart(6, '0');
    return `#${v}`;
}

const WARM_PALETTE = [
    'hsl(280, 90%, 50%)',    'hsl(280, 90%, 40%)',    'hsl(280, 90%, 30%)',
    'hsl(300, 90%, 30%)',    'hsl(300, 90%, 40%)',    'hsl(300, 90%, 50%)',
    'hsl(320, 90%, 50%)',    'hsl(320, 90%, 40%)',    'hsl(320, 90%, 30%)',
    'hsl(340, 90%, 30%)',    'hsl(340, 90%, 40%)',    'hsl(340, 90%, 50%)',
    'hsl(  0, 90%, 50%)',    'hsl(  0, 90%, 40%)',    'hsl(  0, 90%, 30%)',
    'hsl( 20, 90%, 30%)',    'hsl( 20, 90%, 40%)',    'hsl( 20, 90%, 50%)',
    'hsl( 40, 90%, 50%)',    'hsl( 40, 90%, 40%)',    'hsl( 40, 90%, 30%)',
    'hsl( 60, 90%, 30%)',    'hsl( 60, 90%, 40%)',    'hsl( 60, 90%, 50%)',
    'hsl( 80, 90%, 50%)',    'hsl( 80, 90%, 40%)',    'hsl( 80, 90%, 30%)'
]

const COLD_PALETTE = [
    'hsl(100, 90%, 30%)',    'hsl(100, 90%, 40%)',    'hsl(100, 90%, 50%)',
    'hsl(120, 90%, 50%)',    'hsl(120, 90%, 40%)',    'hsl(120, 90%, 30%)',
    'hsl(140, 90%, 30%)',    'hsl(140, 90%, 40%)',    'hsl(140, 90%, 50%)',
    'hsl(160, 90%, 50%)',    'hsl(160, 90%, 40%)',    'hsl(160, 90%, 30%)',
    'hsl(180, 90%, 30%)',    'hsl(180, 90%, 40%)',    'hsl(180, 90%, 50%)',
    'hsl(200, 90%, 50%)',    'hsl(200, 90%, 40%)',    'hsl(200, 90%, 30%)',
    'hsl(220, 90%, 30%)',    'hsl(220, 90%, 40%)',    'hsl(220, 90%, 50%)',
    'hsl(240, 90%, 50%)',    'hsl(240, 90%, 40%)',    'hsl(240, 90%, 30%)',
    'hsl(260, 90%, 30%)',    'hsl(260, 90%, 40%)',    'hsl(260, 90%, 50%)'
]

export function getColorFromPalette(palette: string, index: number): string{
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
