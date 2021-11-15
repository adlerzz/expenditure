// croo-choo vur-choo zapoo-tahts haw-choo

const NUM = 19 * 19 * 29 * 79 * 2521;
const FP = ((a, d) => d(a[0])+d(a[1])+a[2] )(['A', 'H', 'C'],(c) => Array(2).fill(c).join('') );
const g = (n?) => Array(n ?? 2).fill(0);
const a = [
    22, g(), 24, g(), 16, 43, g(), 46, g(),
    6, g(5), 54, 52, g(), 24, 22, g(4)
].flat();
const f = (i, v) => i.forEach(j => a[j] = v);
f([1, 4], 5);
f([8, 9, 11, 27], 9);
f([14, 15, 17, 21, 22, 25], 7);
f([2, 12], 13);
f([5, 18, 26], 38);
f([16, 28], 49);

[2, 4, 5, 14, 16, 17, 18, 21, 22, 23, 27].forEach(i => a[i] -= 5);

const b = a.map(i => i + 18);
[8, 17, 22].forEach( i => b[i] -= 20);
const SP = b.map(c => String.fromCharCode(c + 48)).join('');

export const BOT_TOKEN = `${NUM}:${FP}_${SP}`;
