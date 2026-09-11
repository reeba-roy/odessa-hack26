import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveWasteCategory } from '../lib/wasteCategory.js';

test('prefers a custom waste category when provided', () => {
  const resolved = resolveWasteCategory({
    wasteCategory: 'Other',
    customWasteCategory: 'Wood pellets'
  });

  assert.equal(resolved, 'Wood pellets');
});

test('falls back to the selected preset when no custom value is entered', () => {
  const resolved = resolveWasteCategory({
    wasteCategory: 'Sugarcane Bagasse',
    customWasteCategory: ''
  });

  assert.equal(resolved, 'Sugarcane Bagasse');
});
