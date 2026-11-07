/**
 * Just enough ZIP to read an Office or ePub file and write it back with a few
 * parts changed. Unchanged parts are copied byte for byte (still compressed),
 * so a round trip changes nothing a reader would notice except those parts.
 *
 * No ZIP64, no encryption: Office and ePub files under 20 MB never need them.
 */

import zlib from "node:zlib";

const MAX_ENTRY_BYTES = 200 * 1024 * 1024;

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

export function crc32(buf) {
  if (typeof zlib.crc32 === "function") return zlib.crc32(buf) >>> 0;
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/** Read a ZIP's central directory. Returns entries in their stored order. */
export function readZip(buf) {
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  let eocd = -1;
  for (let i = buf.length - 22; i >= 0 && i >= buf.length - 65557; i--) {
    if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error("This is not a ZIP-based file (Word, Excel, PowerPoint or ePub).");
  const count = dv.getUint16(eocd + 10, true);
  let pos = dv.getUint32(eocd + 16, true);
  const entries = [];
  for (let i = 0; i < count; i++) {
    if (pos + 46 > buf.length || dv.getUint32(pos, true) !== 0x02014b50) break;
    const nameLen = dv.getUint16(pos + 28, true);
    const extraLen = dv.getUint16(pos + 30, true);
    const commentLen = dv.getUint16(pos + 32, true);
    const entry = {
      name: new TextDecoder().decode(buf.subarray(pos + 46, pos + 46 + nameLen)),
      flags: dv.getUint16(pos + 8, true),
      method: dv.getUint16(pos + 10, true),
      time: dv.getUint16(pos + 12, true),
      date: dv.getUint16(pos + 14, true),
      crc: dv.getUint32(pos + 16, true),
      cSize: dv.getUint32(pos + 20, true),
      uSize: dv.getUint32(pos + 24, true),
      localOffset: dv.getUint32(pos + 42, true),
    };
    const lo = entry.localOffset;
    if (lo + 30 <= buf.length && dv.getUint32(lo, true) === 0x04034b50) {
      const start = lo + 30 + dv.getUint16(lo + 26, true) + dv.getUint16(lo + 28, true);
      entry.raw = buf.subarray(start, start + entry.cSize);
    }
    entries.push(entry);
    pos += 46 + nameLen + extraLen + commentLen;
  }
  return entries;
}

/** One entry's bytes, uncompressed, or null when it cannot be read safely. */
export function entryData(entry) {
  if (!entry || !entry.raw || entry.uSize > MAX_ENTRY_BYTES) return null;
  if (entry.method === 0) return Buffer.from(entry.raw);
  if (entry.method === 8) {
    try {
      return zlib.inflateRawSync(entry.raw, { maxOutputLength: MAX_ENTRY_BYTES });
    } catch {
      return null;
    }
  }
  return null;
}

export function entryText(entry) {
  const data = entryData(entry);
  return data ? data.toString("utf8") : "";
}

/**
 * Write a ZIP from read entries. `replace` maps an entry name to new bytes;
 * those are deflated again, everything else is copied as it was. The first
 * entry keeps its place (an ePub's mimetype must stay first and stored).
 */
export function writeZip(entries, replace = new Map()) {
  const locals = [];
  const centrals = [];
  let offset = 0;
  for (const e of entries) {
    const name = Buffer.from(e.name, "utf8");
    let { method, crc, cSize, uSize } = e;
    let data = e.raw || Buffer.alloc(0);
    if (replace.has(e.name)) {
      const plain = Buffer.from(replace.get(e.name));
      crc = crc32(plain);
      uSize = plain.length;
      if (method === 0) {
        data = plain;
      } else {
        method = 8;
        data = zlib.deflateRawSync(plain);
      }
      cSize = data.length;
    }
    const flags = (e.flags || 0) & 0x0800; // keep only the UTF-8 name flag
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(flags, 6);
    local.writeUInt16LE(method, 8);
    local.writeUInt16LE(e.time || 0, 10);
    local.writeUInt16LE(e.date || 0, 12);
    local.writeUInt32LE(crc >>> 0, 14);
    local.writeUInt32LE(cSize, 18);
    local.writeUInt32LE(uSize, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28);
    locals.push(local, name, data);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(flags, 8);
    central.writeUInt16LE(method, 10);
    central.writeUInt16LE(e.time || 0, 12);
    central.writeUInt16LE(e.date || 0, 14);
    central.writeUInt32LE(crc >>> 0, 16);
    central.writeUInt32LE(cSize, 20);
    central.writeUInt32LE(uSize, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt32LE(offset, 42);
    centrals.push(central, name);
    offset += 30 + name.length + data.length;
  }
  const cd = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(cd.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, cd, end]);
}
