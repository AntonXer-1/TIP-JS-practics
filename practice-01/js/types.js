"use strict";

const addition = "8" + 2;
const subtraction = "8" - 2;
const numericAddition = Number("8") + 2;
const comparison = "12" > "3";
const strictEquality = 12 === "12";
const emptyNumber = Number("");
const invalidNumber = Number("text");
const nonEmptyBoolean = Boolean("false");
const nullType = typeof null;
const nanType = typeof NaN;

console.log('"8" + 2', addition, typeof addition);
console.log('"8" - 2', subtraction, typeof subtraction);
console.log('Number("8") + 2', numericAddition, typeof numericAddition);
console.log('"12" > "3"', comparison, typeof comparison);
console.log('12 === "12"', strictEquality, typeof strictEquality);
console.log('Number("")', emptyNumber, typeof emptyNumber);
console.log('Number("text")', invalidNumber, typeof invalidNumber);
console.log('Boolean("false")', nonEmptyBoolean, typeof nonEmptyBoolean);
console.log("typeof null", nullType, typeof nullType);
console.log("typeof NaN", nanType, typeof nanType);
