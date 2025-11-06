// simple slug generator
export function slugify(text = "") {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // spaces to -
    .replace(/[^\w-]+/g, "") // remove non-word chars
    .replace(/--+/g, "-") // collapse dashes
    .replace(/^-+|-+$/g, "");
}
