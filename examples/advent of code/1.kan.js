function FilePath___FileContent(f) { return require('fs').readFileSync(f, 'utf-8'); }
function LogMsg___LogResult(msg) { console.log(msg); }
function num___NumericString(i) { return "" + i }
function string_SplitOperator___Array_SubString(a, b) { return a.split(b) }
function PrefixString_SuffixString___StringConcat(a, b) { return a + b }
function string___StringLength(a) { return a.length }
function string___NumericString_Error(a){
let splitOperator = "";


for (let part of string_SplitOperator___Array_SubString(a, splitOperator)) {if (part != "0") {if (part != "1") {if (part != "2") {if (part != "3") {if (part != "4") {if (part != "5") {if (part != "6") {if (part != "7") {if (part != "8") {if (part != "9") {return {Error: "string is not numeric"};};};};};};};};};};};};
return {NumericString: a};}
function NumericString___ParsedNumericString(a){
let splitOperator = "";
let splitString = a;
let val = 0;


for (let part of string_SplitOperator___Array_SubString(splitString, splitOperator)) {if (val != 0) {val = val * 10;};
let num = 0;
if (part == "1") {num = 1;};
if (part == "2") {num = 2;};
if (part == "3") {num = 3;};
if (part == "4") {num = 4;};
if (part == "5") {num = 5;};
if (part == "6") {num = 6;};
if (part == "7") {num = 7;};
if (part == "8") {num = 8;};
if (part == "9") {num = 9;};
val = val + num;};
return val;}
function FileContent___Array_Bag(input){
let splitOperator = "\n";
let bag = [];
let bags = [];


for (let part of string_SplitOperator___Array_SubString(input, splitOperator)) {let test = part;


if (string___StringLength(test) != 0) {bag = [...bag,test];};


if (string___StringLength(test) == 0) {bags = [...bags,bag];
bag = [];};};
return bags;}
function Bag___CalorieInBag(bag){
let sum = 0;
for (let part of bag) {

if (string___StringLength(part) != 0) {

let ___NumericString = string___NumericString_Error(part) || num___NumericString(sum);
      if(!___NumericString.NumericString) {
        if(___NumericString.Error) {
                let e = ___NumericString.Error;
                let pre = part;
let post = " is not a number string";


let m = PrefixString_SuffixString___StringConcat(pre, post);


LogMsg___LogResult(m);
return 0;
              }
      }
let cal = ___NumericString.NumericString;


sum = sum + NumericString___ParsedNumericString(cal);};};
return sum;}
function Array_Bag___CaloricBags(bags){
let res = [];
for (let bag of bags) {

res = [...res,Bag___CalorieInBag(bag)];};
return res;}
function CaloricBags___MaxCaloricBag(bags){
let max = 0;
for (let bag of bags) {if (bag > max) {max = bag;};};
return max;}
function __SysCode(){
let filePath = "./1.txt";
let label = "Max bag ";


let max = CaloricBags___MaxCaloricBag(Array_Bag___CaloricBags(FileContent___Array_Bag(FilePath___FileContent(filePath))));


let value = num___NumericString(max);


let c = PrefixString_SuffixString___StringConcat(label, value);


LogMsg___LogResult(c);
return true;}
__SysCode();