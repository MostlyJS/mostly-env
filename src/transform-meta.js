export default function transformMeta (meta, depth) {
  if (typeof meta !== 'object') {
    return meta;
  }

  if(!meta) return;

  if(!depth) depth = 0;

  function transformValue (value) {
    if(value === undefined) return;

    if(value instanceof Error) {
      return { message: value.message, stack: value.stack, name: value.name };
    }

    var valType = typeof value;

    if(valType === 'string' || valType === 'number' || valType === 'boolean') {
      return value;
    }

    /* Deal with null object values */
    if(!value) return null;

    /* Deal with mongo objectIds so we dont get binary logged */
    if(valType === 'object' && value._bsontype === 'ObjectID') {
      return "" + value;
    }

    if(depth < 1) {
      return transformMeta(value, depth + 1);
    }

    if(value.toString && typeof value.toString === 'function' && value.toString !== Object.prototype.toString) {
      return value.toString();
    }
  }

  var result = Object.keys(meta).reduce(function (result, key) {
    var value = transformValue(meta[key]);
    if(value !== undefined) {
      result[key] = value;
    }

    return result;
  }, {});

  return result;
}