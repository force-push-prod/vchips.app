const WIN = 'win' as const;
const LOSE = 'lose' as const;
const SPLIT = 'split' as const;

type WLSOption = typeof WIN | typeof LOSE | typeof SPLIT;


function isConsistent(choices: WLSOption[], completed: boolean) {
  const winCount = choices.filter(c => c === 'win').length;
  const splitCount = choices.filter(c => c === 'split').length;
  const loseCount = choices.filter(c => c === 'lose').length;

  if (splitCount > 0)
    if (winCount > 0) return false;

  if (winCount > 1) return false;

  if (completed) {
    if (winCount + splitCount + loseCount <= 1) return false;
    if (splitCount === 1) return false;
    if (splitCount > 1 && winCount > 0) return false;
    if (splitCount === 0 && winCount !== 1) return false;
  }

  return true;
}

function c(s: string): WLSOption[] {
  return s.split('').map(x => ({ W: WIN, L: LOSE, S: SPLIT }[x]))
}

test('isConsistent with non-completed choices', () => {
  expect(isConsistent(c('W'), false)).toBe(true);
  expect(isConsistent(c('L'), false)).toBe(true);
  expect(isConsistent(c('S'), false)).toBe(true);

  expect(isConsistent(c('WW'), false)).toBe(false);
  expect(isConsistent(c('LL'), false)).toBe(true);
  expect(isConsistent(c('SS'), false)).toBe(true);

  expect(isConsistent(c('WL'), false)).toBe(true);
  expect(isConsistent(c('WS'), false)).toBe(false);
  expect(isConsistent(c('LS'), false)).toBe(true);

  expect(isConsistent(c('WWW'), false)).toBe(false);
  expect(isConsistent(c('LLL'), false)).toBe(true);
  expect(isConsistent(c('SSS'), false)).toBe(true);

  expect(isConsistent(c('WLL'), false)).toBe(true);
  expect(isConsistent(c('WLS'), false)).toBe(false);
  expect(isConsistent(c('WSS'), false)).toBe(false);
  expect(isConsistent(c('LSS'), false)).toBe(true);
  expect(isConsistent(c('SLL'), false)).toBe(true);
  expect(isConsistent(c('SSLL'), false)).toBe(true);
});

test('isConsistent with completed choices', () => {
  expect(isConsistent(c('W'), true)).toBe(false);
  expect(isConsistent(c('L'), true)).toBe(false);
  expect(isConsistent(c('S'), true)).toBe(false);

  expect(isConsistent(c('WW'), true)).toBe(false);
  expect(isConsistent(c('LL'), true)).toBe(false);
  expect(isConsistent(c('SS'), true)).toBe(true);

  expect(isConsistent(c('WL'), true)).toBe(true);
  expect(isConsistent(c('WS'), true)).toBe(false);
  expect(isConsistent(c('LS'), true)).toBe(false);

  expect(isConsistent(c('WWW'), true)).toBe(false);
  expect(isConsistent(c('LLL'), true)).toBe(false);
  expect(isConsistent(c('SSS'), true)).toBe(true);

  expect(isConsistent(c('WLL'), true)).toBe(true);
  expect(isConsistent(c('WLS'), true)).toBe(false);
  expect(isConsistent(c('WSS'), true)).toBe(false);
  expect(isConsistent(c('LSS'), true)).toBe(true);
  expect(isConsistent(c('SLL'), true)).toBe(false);
  expect(isConsistent(c('SSLL'), true)).toBe(true);
});
