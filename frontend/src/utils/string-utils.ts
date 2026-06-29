import { OAM_S3_BUCKET_URL, OAM_TITILER_ENDPOINT } from "@/config";

/**
 * Truncates a string to a specified maximum length, appending ellipsis if truncated.
 *
 * This function takes a string and a maximum length, and if the string exceeds
 * the specified length, it truncates the string and appends "..." to indicate that
 * it has been shortened. The default maximum length is set to 30 characters.
 *
 * @param {string} [string] - The string to be truncated (optional).
 * @param {number} [maxLength=30] - The maximum length for the string (default is 30).
 * @returns {string | undefined} - The truncated string with ellipsis, or the original string if within limit.
 */
export const truncateString = (string?: string, maxLength: number = 30) => {
  if (string && string.length > maxLength) {
    return `${string.slice(0, maxLength - 3)}...`;
  }
  return string;
};

/**
 * Formats a keyword string by replacing hyphens and underscores with spaces
 * and capitalizing the first letter of each word (title case).
 *
 * @example
 * formatKeyword("swimming_pool")        // → "Swimming Pool"
 * formatKeyword("semantic-segmentation") // → "Semantic Segmentation"

 *
 * @param {string} keyword - The raw keyword string to format.
 * @returns {string} The formatted, human-readable label.
 */
export const formatKeyword = (keyword: string): string => {
  return keyword
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export const extractTileJSONURL = (OAMTMSURL: string) => {
  // Before, when we hit this url https://tiles.openaerialmap.org/63b457ba3fb8c100063c55f0/0/63b457ba3fb8c100063c55f1/{z}/{x}/{y} (without the /{z}/{x}/{y}),
  // we get the TileJSON which is passed to Maplibre GL JS to render the aerial imagery, but with the recent OAM updates
  // we have to grab the unique id of the aerial imagery, construct the new S3 bucket location and give it to titiler to get the new TileJSON.
  const uniqueImageryId = OAMTMSURL.replace(
    "https://tiles.openaerialmap.org/",
    "",
  ).replace("/{z}/{x}/{y}", "");

  // Construct the URL to fetch the TileJSON from titiler.
  return `${OAM_TITILER_ENDPOINT}cog/WebMercatorQuad/tilejson.json?url=${OAM_S3_BUCKET_URL}${uniqueImageryId}.tif`;
};
