/**
 * @typedef {Object} Listing
 * @property {string} id
 * @property {string} farmerName
 * @property {string} wasteCategory
 * @property {number} quantityTonnes
 * @property {number} lat
 * @property {number} lng
 * @property {"Listed" | "Clustered" | "EscrowLocked" | "Paid"} status
 * @property {string | null} clusterId
 * @property {number} moisturePct
 * @property {string} photoUrl
 */

/**
 * @typedef {Object} Cluster
 * @property {string} id
 * @property {string} region
 * @property {number} totalTonnes
 * @property {string[]} listingIds
 * @property {"Available" | "EscrowLocked" | "Paid"} status
 * @property {number} lat
 * @property {number} lng
 */

export const WASTE_CATEGORIES = [
  "Paddy Stubble",
  "Coconut Husk",
  "Sugarcane Bagasse",
  "Banana Stem",
  "Other",
];

export const LISTING_STATUS = ["Listed", "Clustered", "EscrowLocked", "Paid"];
export const CLUSTER_STATUS = ["Available", "EscrowLocked", "Paid"];
