import test from 'node:test';
import assert from 'node:assert/strict';
import { getMapPoints } from '../lib/mapData.mjs';

test('cluster mode returns cluster markers and strips missing coordinates', () => {
  const clusters = [
    { id: 'c1', region: 'Kottayam', lat: 9.59, lng: 76.52, totalTonnes: 2, status: 'Available' },
    { id: 'c2', region: 'Palakkad', lat: NaN, lng: 76.65, totalTonnes: 2, status: 'Available' },
  ];

  const markers = getMapPoints({ clusters, listings: [], mode: 'clusters' });

  assert.equal(markers.length, 1);
  assert.equal(markers[0].type, 'cluster');
  assert.equal(markers[0].id, 'c1');
});

test('farmer mode returns farmer markers and ignores invalid locations', () => {
  const listings = [
    { id: 'l1', farmerName: 'Farmer A', lat: 9.58, lng: 76.50, cropType: 'Paddy Stubble', quantityTonnes: 2, clusterId: 'c1' },
    { id: 'l2', farmerName: 'Farmer B', lat: 'not-a-number', lng: 76.50, cropType: 'Paddy Stubble', quantityTonnes: 2, clusterId: 'c1' },
  ];

  const markers = getMapPoints({ clusters: [], listings, mode: 'farmers' });

  assert.equal(markers.length, 1);
  assert.equal(markers[0].type, 'farmer');
  assert.equal(markers[0].id, 'l1');
});
