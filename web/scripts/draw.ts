
export function isMobileView(): boolean {
    return screen.width < 800;
}

function constraint(v, min, max: number): number{
    if(v > max){
        return max;
    }
    if(v < min){
        return min;
    }
    return v;
}


function parseHSL(color: string): number[] {
    const parsedValues = color.replace(/\s/g, '').match(/hsl\((\d+),(\d+)%,(\d+)%\)/);
    if(parsedValues === null){
        return [];
    }
    return parsedValues.slice(1).map(v => +v);
}

function makeHSL(H,S,L: number): string {

    return `hsl(${H}, ${constraint(S, 0, 100)}%, ${constraint(L, 0, 100)}%)`;
}

export function darken(color: string): string {
    const [h,s,l] = parseHSL(color);
    return makeHSL(h, s, l - 15);
}

export function brighten(color: string): string {
    const [h,s,l] = parseHSL(color);
    return makeHSL(h, s, l + 15);
}

export const WARM_PALETTE_SET = [
    'hsl( 60, 100%, 50%)',
    'hsl( 40, 100%, 50%)',
    'hsl( 20, 100%, 50%)',
    'hsl(  0, 100%, 50%)',
    'hsl(340, 100%, 50%)',
    'hsl(320, 100%, 50%)',
    'hsl(305, 100%, 50%)',
    'hsl(290, 100%, 50%)',
    'hsl(310, 100%, 50%)',
    'hsl(330, 100%, 50%)',
    'hsl(350, 100%, 50%)',
    'hsl( 10, 100%, 50%)',
    'hsl( 30, 100%, 50%)'
]

export const COLD_PALETTE_SET = [
    'hsl( 90, 100%, 50%)',
    'hsl(130, 100%, 50%)',
    'hsl(170, 100%, 50%)',
    'hsl(190, 100%, 50%)',
    'hsl(210, 100%, 50%)',
    'hsl(230, 100%, 50%)',
    'hsl(245, 100%, 50%)',
    'hsl(260, 100%, 50%)',
    'hsl(240, 100%, 50%)',
    'hsl(220, 100%, 50%)',
    'hsl(200, 100%, 50%)',
    'hsl(160, 100%, 50%)',
    'hsl(120, 100%, 50%)'
]

