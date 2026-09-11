export function resolveWasteCategory({ wasteCategory, customWasteCategory }) {
  const trimmedCustom = String(customWasteCategory || "").trim();
  const trimmedPreset = String(wasteCategory || "").trim();

  if (trimmedCustom) {
    return trimmedCustom;
  }

  return trimmedPreset || "Other";
}
