/**
 * Created by ruslan on 03.05.19.
 */

'use strict';
const CutRiteLink = require('../src/cutritelink');
const fs = require('fs');
const iconv = require('iconv-lite/lib/index');
// const file = fs.readFileSync('./tests/test01.ptx');
const file = fs.readFileSync('./tests/test02.ptx');
const convertedFile = iconv.decode(file, 'win1251');



const parser = new CutRiteLink();

const goodsMaps = parser.parse(convertedFile.toString());

// parser.materials = JSON.parse('{"1":{"idx":1,"gid":47353}}');
// parser.boards = JSON.parse('{"1":{"idx":1,"gid":47353,"isOffcut":false,"offcutId":0,"length":2800,"width":2070}}');
// parser.offcuts =JSON.parse( '{"1":{"idx":"Обрезок","uid":0,"gid":47353,"length":1947,"width":397,"qty":1}}');
// parser.toolId = 10;
// parser.parts = JSON.parse('{"1":{"idx":1,"uid":2812773,"length":1550,"width":550,"num":1,"numProduced":1},"2":{"idx":2,"uid":2812774,"length":1768,"width":550,"num":1,"numProduced":1},"3":{"idx":3,"uid":2812775,"length":748,"width":450,"num":9,"numProduced":1},"4":{"idx":4,"uid":2812776,"length":200,"width":530,"num":2,"numProduced":1},"5":{"idx":5,"uid":2812777,"length":950,"width":350,"num":1,"numProduced":1},"6":{"idx":6,"uid":2812778,"length":890,"width":350,"num":2,"numProduced":1},"7":{"idx":7,"uid":2812779,"length":734,"width":350,"num":3,"numProduced":1},"8":{"idx":8,"uid":2812780,"length":448,"width":340,"num":6,"numProduced":1},"9":{"idx":9,"uid":2836618,"length":1000,"width":1000,"num":1,"numProduced":1},"10":{"idx":10,"uid":2836620,"length":600,"width":600,"num":1,"numProduced":1},"11":{"idx":11,"uid":2836621,"length":300,"width":300,"num":1,"numProduced":1}}');
//
// const pattern1 = {
//     mapNum: 1,
//     length: parser.boards[1].length,
//     width: parser.boards[1].width,
//     numSheets: 1,
//     numCuts: 0,
//     lengthCuts: 0,
//     boardId: 1,
//     type: 0,
//     totalTime: 0,
//     toolId: 10,
//     gid: parser.boards[1].gid,
// };
//
// const pattern2 = {
//     mapNum: 2,
//     length: parser.boards[1].length,
//     width: parser.boards[1].width,
//     numSheets: 1,
//     numCuts: 0,
//     lengthCuts: 0,
//     boardId: 1,
//     type: 2,
//     totalTime: 0,
//     toolId: 10,
//     gid: parser.boards[1].gid,
// };
// const cutTree = parser.parsePattern(pattern2);

console.dir(goodsMaps, { colors: true, depth: 10});
