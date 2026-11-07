/**
 * schema.js - the small slice of a schema library this server needs.
 *
 * Each tool declares its arguments and its result shape once. From that one
 * declaration this module does two jobs: it validates what a client sends,
 * and it produces the JSON Schema the client is shown in tools/list.
 *
 * Why not a library: the plugin directory reads every file a plugin ships, and
 * holds anything over 256 KiB for a person to inspect. The general-purpose
 * schema library this server used to bundle was 850 KiB by itself. This
 * covers exactly the calls the tools make (string, number, boolean, enum,
 * array, object, record, any; optional, default, describe, min, max, int,
 * positive) and nothing else, in readable source.
 *
 * The method names match the library they replace, so a tool definition
 * reads the same as before: z.string().max(200).describe("...").
 */

class Schema {
  constructor(kind, props = {}) {
    this.kind = kind;
    this.props = props;
  }

  _with(extra) {
    return new Schema(this.kind, { ...this.props, ...extra });
  }

  optional() {
    return this._with({ optional: true });
  }

  default(value) {
    return this._with({ optional: true, hasDefault: true, defaultValue: value });
  }

  describe(description) {
    return this._with({ description });
  }

  min(n) {
    return this._with({ min: n });
  }

  max(n) {
    return this._with({ max: n });
  }

  int() {
    return this._with({ int: true });
  }

  positive() {
    return this._with({ positive: true });
  }

  get isOptional() {
    return Boolean(this.props.optional);
  }

  get description() {
    return this.props.description;
  }

  /** Object schemas expose their fields, as the library they replace did. */
  get shape() {
    return this.props.shape;
  }

  /**
   * Validate a value. Returns { success, data } or { success, error }, where
   * error.issues lists every problem with the path it was found at. Unknown
   * object keys are dropped rather than rejected, and defaults are filled in.
   */
  safeParse(value) {
    const issues = [];
    const data = this._parse(value, [], issues);
    if (issues.length) {
      const error = new Error(
        issues.map((i) => (i.path.length ? `${i.path.join(".")}: ${i.message}` : i.message)).join("; "),
      );
      error.issues = issues;
      return { success: false, error };
    }
    return { success: true, data };
  }

  parse(value) {
    const result = this.safeParse(value);
    if (!result.success) throw result.error;
    return result.data;
  }

  _parse(value, path, issues) {
    const p = this.props;
    if (value === undefined) {
      if (p.hasDefault) return structuredClone(p.defaultValue);
      if (p.optional) return undefined;
      issues.push({ path, message: "Required" });
      return undefined;
    }
    const fail = (message) => {
      issues.push({ path, message });
      return undefined;
    };

    switch (this.kind) {
      case "any":
        return value;

      case "string":
        if (typeof value !== "string") return fail(`Expected string, received ${typeOf(value)}`);
        if (p.min !== undefined && value.length < p.min) return fail(`Must be at least ${p.min} characters`);
        if (p.max !== undefined && value.length > p.max) return fail(`Must be at most ${p.max} characters`);
        return value;

      case "number":
        if (typeof value !== "number" || !Number.isFinite(value)) {
          return fail(`Expected number, received ${typeOf(value)}`);
        }
        if (p.int && !Number.isInteger(value)) return fail("Expected integer");
        if (p.positive && !(value > 0)) return fail("Must be greater than 0");
        if (p.min !== undefined && value < p.min) return fail(`Must be at least ${p.min}`);
        if (p.max !== undefined && value > p.max) return fail(`Must be at most ${p.max}`);
        return value;

      case "boolean":
        if (typeof value !== "boolean") return fail(`Expected boolean, received ${typeOf(value)}`);
        return value;

      case "enum":
        if (!p.values.includes(value)) {
          return fail(`Expected one of ${p.values.map((v) => JSON.stringify(v)).join(", ")}`);
        }
        return value;

      case "array": {
        if (!Array.isArray(value)) return fail(`Expected array, received ${typeOf(value)}`);
        if (p.min !== undefined && value.length < p.min) return fail(`Must contain at least ${p.min} items`);
        if (p.max !== undefined && value.length > p.max) return fail(`Must contain at most ${p.max} items`);
        return value.map((item, i) => p.element._parse(item, [...path, i], issues));
      }

      case "object": {
        if (!isPlainObject(value)) return fail(`Expected object, received ${typeOf(value)}`);
        const out = {};
        for (const [key, field] of Object.entries(p.shape)) {
          const parsed = field._parse(value[key], [...path, key], issues);
          if (parsed !== undefined) out[key] = parsed;
        }
        return out;
      }

      case "record": {
        if (!isPlainObject(value)) return fail(`Expected object, received ${typeOf(value)}`);
        const out = {};
        for (const [key, item] of Object.entries(value)) {
          p.key._parse(key, [...path, key], issues);
          out[key] = p.value._parse(item, [...path, key], issues);
        }
        return out;
      }

      default:
        return fail(`Unknown schema kind ${this.kind}`);
    }
  }

  /** The JSON Schema a client sees for this schema. */
  toJSONSchema() {
    const p = this.props;
    let out;
    switch (this.kind) {
      case "any":
        out = {};
        break;
      case "string":
        out = { type: "string" };
        if (p.min !== undefined) out.minLength = p.min;
        if (p.max !== undefined) out.maxLength = p.max;
        break;
      case "number":
        out = { type: p.int ? "integer" : "number" };
        if (p.positive) out.exclusiveMinimum = 0;
        if (p.min !== undefined) out.minimum = p.min;
        if (p.max !== undefined) out.maximum = p.max;
        break;
      case "boolean":
        out = { type: "boolean" };
        break;
      case "enum":
        out = { type: "string", enum: [...p.values] };
        break;
      case "array":
        out = { type: "array", items: p.element.toJSONSchema() };
        if (p.min !== undefined) out.minItems = p.min;
        if (p.max !== undefined) out.maxItems = p.max;
        break;
      case "object": {
        const properties = {};
        const required = [];
        for (const [key, field] of Object.entries(p.shape)) {
          properties[key] = field.toJSONSchema();
          if (!field.isOptional) required.push(key);
        }
        out = { type: "object", properties };
        if (required.length) out.required = required;
        break;
      }
      case "record":
        out = { type: "object", additionalProperties: p.value.toJSONSchema() };
        break;
      default:
        out = {};
    }
    if (p.description) out.description = p.description;
    if (p.hasDefault) out.default = p.defaultValue;
    return out;
  }
}

function typeOf(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export const z = {
  string: () => new Schema("string"),
  number: () => new Schema("number"),
  boolean: () => new Schema("boolean"),
  any: () => new Schema("any"),
  enum: (values) => new Schema("enum", { values: [...values] }),
  array: (element) => new Schema("array", { element }),
  object: (shape) => new Schema("object", { shape }),
  record: (key, value) => new Schema("record", { key, value }),
};

export function isSchema(value) {
  return value instanceof Schema;
}

/** A raw shape ({ name: z.string() }) or a z.object(), as one object schema. */
export function asObjectSchema(shapeOrSchema) {
  if (!shapeOrSchema) return z.object({});
  return isSchema(shapeOrSchema) ? shapeOrSchema : z.object(shapeOrSchema);
}
