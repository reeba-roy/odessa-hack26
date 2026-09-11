/**
 * @typedef {Object} Listing
 * @property {string} id
 * @property {string} farmerName
 * @property {"Paddy Stubble" | "Coconut Husk" | "Sugarcane Bagasse" | "Banana Stem"} cropType
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

export const CROP_TYPES = [
  "Paddy Stubble",
  "Coconut Husk",
  "Sugarcane Bagasse",
  "Banana Stem",
];

export const LISTING_STATUS = ["Listed", "Clustered", "EscrowLocked", "Paid"];
export const CLUSTER_STATUS = ["Available", "EscrowLocked", "Paid"];
