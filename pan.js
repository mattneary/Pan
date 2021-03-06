var PResult = function(success, val, rest) {
  this.success = success;
  this.val = val;
  this.rest = rest;
};
PResult.prototype.full = function() {
  return this.success && this.rest == "";
};
var P = {};
var parseChar = P.parseChar = function(c) {
  return function(text) {
    if( text[0] == c ) return new PResult(true, c, text.substr(1));
    return new PResult(false);
  };
};
var unit = P.unit = function(x) {
  return new PResult(true, "", x);
};
var bind = P.bind = function(a, b) {
  if( a.success ) {
    var bResult = b(a.rest);
    return new PResult(bResult.success, a.val + bResult.val, bResult.rest);
  } else {
    return new PResult(false);
  }
};
var Try = P.Try = function() {
  var tries = [].slice.call(arguments);
  return function(t) {
    if( tries.length == 0 ) return new PResult(false);
    var x = tries[0];
    var p = x(t);
    if( p.success ) return p;
    else return Try.apply({},tries.slice(1))(t);
  };
};
var product = P.product = function(a, b) {
  return function(t) {
    return bind(bind(unit(t), a), b);
  };
};
var star = P.star = function(p) {
  return Try(product(p, function(x) { return star(p)(x) }), unit);
};
var parseString = P.parseString = function(cs) {
  return function(t) {
    return cs.split("").map(parseChar).reduce(bind, unit(t));
  };
};
var binds = P.binds = function() {
  var xs = [].slice.call(arguments);
  return xs.reduce(bind);
};

var parse = P.parse = Try(
  // TODO: parse an AST which can then easily be evaluated.
  function(x) {
    return binds(
      unit(x),
      parseChar("("),
      product(star(product(parse, parseChar(" "))), parse),
      parseChar(")"));
  },
  parseString("data"),
  parseString("Float"),
  parseString("Vector")
);

module.exports = P;

