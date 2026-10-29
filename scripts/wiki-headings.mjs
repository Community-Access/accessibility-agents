/**
 * wiki-headings.mjs - give a wiki page one H1.
 *
 * GitHub's wiki shows the page name above the content as a level-one heading,
 * so a page copied from docs/ with its own H1 has two (issue #274). The wiki
 * copy is demoted one level: H1 becomes H2, H2 becomes H3, and so on, which
 * keeps the relative structure and leaves no skipped level under the page
 * name. H6 stays H6, since there is nothing below it. Headings inside fenced
 * code blocks are examples, not structure, and are left alone. The repository
 * copy is never changed; its linter still requires its own H1.
 */

const FENCE = /^\s*(`{3,}|~{3,})/;
const HEADING = /^( {0,3})(#{1,6})(?=\s|$)/;

/** Return the Markdown with every heading outside code fences one level lower. */
export function demoteHeadings(markdown) {
  let fence = null;
  return markdown
    .split('\n')
    .map((line) => {
      const f = line.match(FENCE);
      if (f) {
        const marker = f[1];
        if (fence === null) fence = marker;
        else if (marker[0] === fence[0] && marker.length >= fence.length) fence = null;
        return line;
      }
      if (fence !== null) return line;
      return line.replace(HEADING, (_, indent, hashes) =>
        indent + (hashes.length < 6 ? hashes + '#' : hashes));
    })
    .join('\n');
}
