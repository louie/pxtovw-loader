"use strict";
var css = require("css");

var config = {
  viewportWidth: 1080,
  unitPrecision: 5,
};
function pxtovw(options) {
  if (options === void 0) {
    this.config = config;
  } else if (Object.prototype.toString.call(options) !== "[object Object]") {
    throw new Error("options need a object");
  } else {
    this.config = config;
    for (var property in options) {
      config[config] = options[property];
    }
  }
}
pxtovw.prototype.converPxToVw=function(cssText) {
   this.ast = css.parse(cssText);
  return this.parseRules(this.ast.stylesheet.rules)
}
pxtovw.prototype.parseRules =  function (rules) {
  for (var i = 0; i < rules.length; i++) {
    var rule = rules[i];
    var declarations = rule.declarations;
    if (rule.type === "media" && rule.rules.length > 0) {
      this.parseRules(rule.rules);
      continue;
    } else if (rule.type === "keyframes") {
      this.parseRules(rule.keyframes); // recursive invocation while dealing with keyframes
      continue;
    } else if (rule.type !== "rule" && rule.type !== "keyframe") {
      continue;
    }
    if (!declarations) {
      continue;
    }
    for (var j = 0; j < declarations.length; j++) {
      if (!declarations[j]) {
        continue;
      }
      this.convertUnit(declarations[j]);
    }
  }
  return css.stringify(this.ast);
}
// console.log(JSON.stringify(ast.stylesheet.rules, null, ' '));
pxtovw.prototype.convertUnit =  function (declaration) {
  var config = this.config
  var converStr = "";
  var state = data;
  var unitToken;
  for (var i = 0; i < declaration.value.length; i++) {
    // console.log("char--------", declaration.value[i], "\n");
    state = state(declaration.value[i]);
  }
  commitUnit();
  function data(c) {
    if (c.charAt(0) >= 0 && c.charAt(0) <= 9) {
      unitToken = {
        match: false,
        number: "",
        unit: "",
      };
      unitToken.number += c;
      return waitP;
    } else {
      converStr += c;
      return data;
    }
  }
  function waitP(c) {
    if (c.charAt(0) >= 0 && c.charAt(0) <= 9) {
      unitToken.number += c;
      return waitP;
    } else if (c.charAt(0) === "p") {
      unitToken.unit += c;
      return waitX;
    } else {
      commitUnit();
      return data;
    }
  }
  // c.match(/^[\t\n\f ]$/)
  function waitX(c) {
    if (c === "x") {
      unitToken.unit += c;
      unitToken.match = true;
      return unit;
    } else {
      commitUnit();
      return data;
    }
  }
  function unit(c) {
    if (c.match(/^[\t\n\f ]$/)) {
      commitUnit();
      converStr += c;
      return data;
    } else {
      unitToken.match = false;
      commitUnit();
      return data;
    }
  }
  function commitUnit() {
    if (unitToken && unitToken.match) {
      unitToken.unit = "vw";
      unitToken.number = (
        (unitToken.number / config.viewportWidth) *
        100
      ).toFixed(config.unitPrecision);
    }
    if (unitToken !== void 0) {
      converStr += unitToken.number;
      converStr += unitToken.unit;
    }
    unitToken = void 0;
  }

  declaration.value = converStr;
  converStr = "";
}
module.exports = pxtovw;