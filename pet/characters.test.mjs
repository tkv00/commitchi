import test from 'node:test';
import assert from 'node:assert/strict';
import { CHARACTERS, characterFor } from './characters.mjs';

test('exports an ordered, frozen roster of eight distinct characters', () => {
  assert.equal(CHARACTERS.length, 8);
  assert.deepEqual(CHARACTERS.map(({ id }) => id), ['spark', 'mogu', 'pudding', 'luna', 'bolt', 'moss', 'ember', 'cloud']);
  assert.equal(Object.isFrozen(CHARACTERS), true);
  assert.equal(new Set(CHARACTERS.map(({ species }) => species)).size, 8);
  for (const character of CHARACTERS) {
    assert.equal(Object.isFrozen(character), true);
    assert.match(character.sprite, /^assets\/sprites\/[a-z]+\.png$/);
    assert.ok(character.name && character.accent && character.description);
  }
});

test('keeps the same character for the same owner and generation', () => {
  assert.equal(characterFor('tkv00', 1).id, 'spark');
  assert.equal(characterFor(' TKV00 ', 1), characterFor('tkv00', 1));
  assert.equal(characterFor('tkv00', 4), characterFor('TKV00', 4));
});

test('assigns every character exactly once over an eight-generation cycle', () => {
  const assigned = Array.from({ length: 8 }, (_, index) => characterFor('kim', index + 1));
  assert.equal(new Set(assigned.map(({ id }) => id)).size, 8);
  assert.equal(characterFor('kim', 8).id === characterFor('kim', 9).id, false);
});

test('different owners can start at different characters', () => {
  const starts = new Set(['kim', 'doyeon', 'octocat', 'commitpet'].map((owner) => characterFor(owner, 1).id));
  assert.ok(starts.size > 1);
});

test('rejects invalid owners and generations', () => {
  assert.throws(() => characterFor('', 1), /owner/i);
  assert.throws(() => characterFor('kim', 0), /generation/i);
  assert.throws(() => characterFor('kim', 1.5), /generation/i);
});
