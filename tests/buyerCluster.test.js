import test from 'node:test';
import assert from 'node:assert/strict';
import { summarizeClusterData, sortClustersForDisplay } from '../lib/buyerCluster.js';

test('summarizeClusterData reports volume, farmer count, and average moisture', () => {
  const cluster = {
    id: 'cluster-1',
    region: 'Kozhikode',
    totalTonnes: 36,
    listingIds: ['a', 'b'],
    lat: 11.25,
    lng: 75.78,
  };

  const listings = [
    { id: 'a', quantityTonnes: 12, moisturePct: 25, wasteCategory: 'Paddy Stubble' },
    { id: 'b', quantityTonnes: 24, moisturePct: 55, wasteCategory: 'Paddy Stubble' },
  ];

  const summary = summarizeClusterData(cluster, listings);

  assert.equal(summary.farmerCount, 2);
  assert.equal(summary.totalTonnes, 36);
  assert.equal(summary.avgMoisture, 40);
  assert.equal(summary.wasteCategories.length, 1);
});

test('sortClustersForDisplay can prioritize quantity and urgency', () => {
  const clusters = [
    { id: 'low', totalTonnes: 10, listingIds: [{}, {}], averageMoisture: 12 },
    { id: 'high', totalTonnes: 40, listingIds: [{}, {}], averageMoisture: 58 },
  ];

  const sorted = sortClustersForDisplay(clusters, 'quantity');
  assert.deepEqual(sorted.map((cluster) => cluster.id), ['high', 'low']);

  const urgent = sortClustersForDisplay(clusters, 'urgency');
  assert.deepEqual(urgent.map((cluster) => cluster.id), ['high', 'low']);
});
