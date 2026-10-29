import test from 'node:test';
import assert from 'node:assert/strict';
import { demoteHeadings } from './wiki-headings.mjs';

test('the page H1 becomes H2 and the levels below follow', () => {
  assert.equal(
    demoteHeadings('# Title\n\nText\n\n## Part\n\n### Detail\n'),
    '## Title\n\nText\n\n### Part\n\n#### Detail\n',
  );
});

test('a demoted page has no H1 left', () => {
  const out = demoteHeadings('# One\n## Two\n# Three\n');
  assert.equal(out.split('\n').filter((l) => /^#\s/.test(l)).length, 0);
});

test('H6 stays H6', () => {
  assert.equal(demoteHeadings('###### Deepest'), '###### Deepest');
});

test('headings inside code fences are left alone', () => {
  const md = '# Real\n\n```markdown\n# Example\n```\n\n~~~\n## Also example\n~~~\n## Real two\n';
  assert.equal(
    demoteHeadings(md),
    '## Real\n\n```markdown\n# Example\n```\n\n~~~\n## Also example\n~~~\n### Real two\n',
  );
});

test('a longer fence is only closed by a fence at least as long', () => {
  const md = '````\n```\n# Inside\n```\n````\n# Outside\n';
  assert.equal(demoteHeadings(md), '````\n```\n# Inside\n```\n````\n## Outside\n');
});

test('text that only starts with a hash is not a heading', () => {
  assert.equal(demoteHeadings('#hashtag and #123'), '#hashtag and #123');
});

test('CRLF line endings survive', () => {
  assert.equal(demoteHeadings('# Title\r\nText\r\n'), '## Title\r\nText\r\n');
});
