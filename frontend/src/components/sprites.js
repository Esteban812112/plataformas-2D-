// Sprites de pixel art. Cada fila es un texto; cada letra apunta a un color de la paleta
// y el punto "." es transparente. Se dibujan con el componente PixelArt.

// Une una mitad izquierda con una derecha espejada. La derecha baja `drop` filas
// para que la palmera no quede perfectamente simétrica.
function symmetric(left, center, drop = 1) {
  const w = left[0].length;
  const h = left.length + drop;
  const rows = [];
  for (let y = 0; y < h; y++) {
    const l = left[y] ?? '.'.repeat(w);
    const rSrc = left[y - drop] ?? '.'.repeat(w);
    const r = rSrc.split('').reverse().join('');
    rows.push(l + (center[y] ?? '.') + r);
  }
  return rows;
}

const palmCrown = symmetric(
  [
    '.........l',
    '.......ggl',
    '....gggglg',
    '..ggllggdg',
    '.gglgggdgg',
    'gglgg.gddg',
    'ggl....ggd',
    'gl.....gdd',
    'l.......gd',
  ],
  ['d', 'd', 'g', 'g', 'g', 'd', 'd', 'u', 'u', 'u'],
  1
);

const trunk = [
  '.........tu.........',
  '.........tu.........',
  '.........ut.........',
  '..........tu........',
  '..........ut........',
  '..........tu........',
  '..........tu........',
  '..........ut........',
  '..........tu........',
  '.........ttu........',
  '.........ttu........',
  '.........ttuu.......',
];

export const PALM = {
  rows: [...palmCrown.map((r) => r.padEnd(21, '.').slice(0, 21)), ...trunk.map((r) => r.padEnd(21, '.'))],
  palette: {
    g: '#2FA24F',
    l: '#6AD477',
    d: '#1D7A3C',
    t: '#C98A47',
    u: '#98602D',
  },
};

export const CLOUD = {
  rows: [
    '.......wwww.........',
    '.....wwwwwwww..www..',
    '...wwwwwwwwwwwwwwwww',
    '..wwwwwwwwwwwwwwwwww',
    '.wwwwwwwwwwwwwwwwwww',
    'bbbbbbbbbbbbbbbbbbbb',
    '.bbbbbbbbbbbbbbbbbb.',
  ],
  palette: { w: '#FFFFFF', b: '#CFE8FF' },
};

export const ROCK = {
  rows: [
    '.....hhh........',
    '...hhhrrrr......',
    '..hhrrrrrrrr.hh.',
    '.hrrrrrrrrrrhrrr',
    'hrrrrrrrrrrrrrrr',
    'rrrrrrrrrrrrrrrd',
    'drrrrrrrrrrrrrdd',
    '.ddddddddddddd..',
  ],
  palette: { h: '#B9CBE6', r: '#7E94B8', d: '#566C93' },
};

export const PLANT = {
  rows: [
    '.....g..g.....',
    '.....gl.gl....',
    '..g..gl.gl.g..',
    '..gl.gl.gl.gl.',
    '.gl..ggggg..gl',
    'gl...ggggg...g',
    '.gg.gdgggdg.g.',
    '..ggdddddddgg.',
    '...dddddddddd.',
  ],
  palette: { g: '#2FA24F', l: '#6AD477', d: '#1D7A3C' },
};

// Íconos de 1 solo color: "#" se pinta con el color que se pase al componente.
export const ICONS = {
  play: ['##.....', '####...', '######.', '#######', '######.', '####...', '##.....'],
  back: ['...#....', '..##....', '.#######', '########', '.#######', '..##....', '...#....'],
  forward: ['....#...', '....##..', '#######.', '########', '#######.', '....##..', '....#...'],
  chat: [
    '.########.',
    '##########',
    '##########',
    '##.#.#.###',
    '##########',
    '.########.',
    '..###.....',
    '..##......',
  ],
  power: [
    '....#....',
    '..#.#.#..',
    '.#..#..#.',
    '#...#...#',
    '#.......#',
    '#.......#',
    '.#.....#.',
    '..#####..',
  ],
};
