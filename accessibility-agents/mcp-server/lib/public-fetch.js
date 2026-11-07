/**
 * Fetch a file from a public web address, for the hosted tools that take a
 * link instead of a file's bytes (a chat assistant can pass a link; it often
 * cannot pass an attachment's bytes).
 *
 * The danger on a shared server is reaching what only the server can reach:
 * its own services, the private network, cloud metadata. So the address must
 * be http or https on the standard ports, and every connection, including
 * after each redirect, is checked at the moment it connects (the DNS answer
 * itself, so a name that changes between check and connect cannot slip
 * past): loopback, private, link-local, carrier-grade NAT, multicast and
 * reserved addresses are refused. Size and time are capped.
 */

import dns from "node:dns";
import http from "node:http";
import https from "node:https";
import net from "node:net";

export const MAX_FETCH_BYTES = 20 * 1024 * 1024;
const TIMEOUT_MS = 20000;
const MAX_REDIRECTS = 4;

function ipv4Blocked(ip) {
  const p = ip.split(".").map(Number);
  const [a, b] = p;
  return a === 0 || a === 10 || a === 127 || a >= 224 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 192 && b === 0 && p[2] === 0) ||
    (a === 198 && (b === 18 || b === 19));
}

export function isBlockedAddress(ip) {
  if (net.isIPv4(ip)) return ipv4Blocked(ip);
  if (net.isIPv6(ip)) {
    const v = ip.toLowerCase();
    const mapped = v.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return ipv4Blocked(mapped[1]);
    return v === "::" || v === "::1" || v.startsWith("fc") || v.startsWith("fd") ||
      v.startsWith("fe8") || v.startsWith("fe9") || v.startsWith("fea") || v.startsWith("feb") ||
      v.startsWith("ff") || v.startsWith("64:ff9b") || v.startsWith("2001:db8");
  }
  return true;
}

/** A lookup that only ever answers with public addresses. */
function publicLookup(hostname, options, callback) {
  dns.lookup(hostname, { ...options, all: true }, (err, addresses) => {
    if (err) return callback(err);
    const list = Array.isArray(addresses) ? addresses : [{ address: addresses, family: options.family }];
    const ok = list.filter((a) => !isBlockedAddress(a.address));
    if (!ok.length) return callback(new Error("That address is not on the public internet."));
    if (options.all) return callback(null, ok);
    return callback(null, ok[0].address, ok[0].family);
  });
}

/** Share links that show a page rather than the file, turned into the file. */
export function directDownloadUrl(raw) {
  const u = new URL(raw);
  const drive = u.hostname === "drive.google.com" && u.pathname.match(/^\/file\/d\/([\w-]+)/);
  if (drive) return `https://drive.google.com/uc?export=download&id=${drive[1]}`;
  const docs = u.hostname === "docs.google.com" && u.pathname.match(/^\/(document|presentation|spreadsheets)\/d\/([\w-]+)/);
  if (docs) {
    const fmt = { document: "docx", presentation: "pptx", spreadsheets: "xlsx" }[docs[1]];
    return `https://docs.google.com/${docs[1]}/d/${docs[2]}/export?format=${fmt}`;
  }
  if (/(^|\.)(1drv\.ms|onedrive\.live\.com|sharepoint\.com)$/.test(u.hostname) && !u.searchParams.has("download")) {
    u.searchParams.set("download", "1");
    return u.toString();
  }
  if (u.hostname === "www.dropbox.com" || u.hostname === "dropbox.com") {
    u.searchParams.set("dl", "1");
    return u.toString();
  }
  return u.toString();
}

function filenameFrom(res, url) {
  const cd = String(res.headers["content-disposition"] || "");
  const star = cd.match(/filename\*=(?:UTF-8'')?([^;]+)/i);
  const plain = cd.match(/filename="?([^";]+)"?/i);
  let name = star ? decodeURIComponent(star[1].trim().replace(/^"|"$/g, "")) : plain ? plain[1].trim() : "";
  if (!name) name = decodeURIComponent(new URL(url).pathname.split("/").pop() || "");
  return name;
}

function getOnce(url) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    if (u.protocol !== "https:" && u.protocol !== "http:") {
      return reject(new Error("Only http and https links can be fetched."));
    }
    if (u.port && u.port !== "80" && u.port !== "443") {
      return reject(new Error("Only links on the standard web ports can be fetched."));
    }
    if (u.username || u.password) return reject(new Error("Links with a user name or password are not fetched."));
    // A literal address never goes through the lookup, so check it here.
    const literal = u.hostname.replace(/^\[|\]$/g, "");
    if (net.isIP(literal) && isBlockedAddress(literal)) {
      return reject(new Error("That address is not on the public internet."));
    }
    if (/^localhost$|\.localhost$|\.internal$|\.local$/i.test(u.hostname)) {
      return reject(new Error("That address is not on the public internet."));
    }
    const lib = u.protocol === "https:" ? https : http;
    const req = lib.get(u, {
      lookup: publicLookup,
      timeout: TIMEOUT_MS,
      headers: { "user-agent": "AccessibilityAgents/7 (+https://letitglow.app/accessibility-agents)", accept: "*/*" },
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume();
        return resolve({ redirect: new URL(res.headers.location, u).toString() });
      }
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`The link answered ${res.statusCode}. Check it is shared with anyone who has the link.`));
      }
      const declared = Number(res.headers["content-length"] || 0);
      if (declared > MAX_FETCH_BYTES) {
        res.destroy();
        return reject(new Error("The file at that link is larger than 20 MB."));
      }
      const chunks = [];
      let size = 0;
      res.on("data", (c) => {
        size += c.length;
        if (size > MAX_FETCH_BYTES) {
          res.destroy();
          reject(new Error("The file at that link is larger than 20 MB."));
        } else {
          chunks.push(c);
        }
      });
      res.on("end", () => resolve({
        buf: Buffer.concat(chunks),
        filename: filenameFrom(res, url),
        type: String(res.headers["content-type"] || ""),
      }));
      res.on("error", reject);
    });
    req.on("timeout", () => req.destroy(new Error("The link took too long to answer.")));
    req.on("error", (err) => reject(new Error(err.message.startsWith("That address") ? err.message
      : `The link could not be fetched: ${err.message}`)));
  });
}

/** Fetch a public file. Returns { buf, filename, type, url }. */
export async function fetchPublicFile(link) {
  let url = directDownloadUrl(String(link || "").trim());
  for (let i = 0; i <= MAX_REDIRECTS; i++) {
    const got = await getOnce(url);
    if (!got.redirect) return { ...got, url };
    url = got.redirect;
  }
  throw new Error("The link redirected too many times.");
}
