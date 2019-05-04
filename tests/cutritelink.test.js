/**
 * Created by ruslan on 03.05.19.
 */

'use strict';
const CutRiteLink = require('../src/cutritelink');
const fs = require('fs');
const iconv = require('iconv-lite');

test("parsed PTX has 1 good", () => {
    const parser = new CutRiteLink();

    const file = fs.readFileSync('./tests/test01.ptx');
    const convertedFile = iconv.decode(file, 'win1251');



    const maps = parser.parse(convertedFile.toString());

    const gids = Object.keys(maps.goods);
    // console.log(gids);
    expect(gids[0]).toBe('47353');
    expect(gids.length).toBe(1);
});


test("parsed PTX has 2 patterns", () => {
    const parser = new CutRiteLink();

    const file = fs.readFileSync('./tests/test01.ptx');
    const convertedFile = iconv.decode(file, 'win1251');



    const maps = parser.parse(convertedFile.toString());

    const gids = Object.keys(maps.goods['47353']);

    expect(gids.length).toBe(2);
});

test("pattern1 test", () => {
    const parser = new CutRiteLink();

    const file = fs.readFileSync('./tests/test01.ptx');
    const convertedFile = iconv.decode(file, 'win1251');



    const maps = parser.parse(convertedFile.toString());

    const map = maps.goods['47353']['1'];
    expect(map.mapNum).toBe( 1);
    expect(map.length).toBe( 2800);
    expect(map.width).toBe( 2070);
    expect(map.numSheets).toBe( 1);
    expect(map.numCuts).toBe( 0);
    expect(map.lengthCuts).toBe( 28542);
    expect(map.boardId).toBe( 1);
    expect(map.type).toBe( 0);
    expect(map.totalTime).toBe( 417);
    expect(map.toolId).toBe( 10);
    expect(map.gid).toBe(47353);
});


test("pattern2 test", () => {
    const parser = new CutRiteLink();

    const file = fs.readFileSync('./tests/test01.ptx');
    const convertedFile = iconv.decode(file, 'win1251');



    const maps = parser.parse(convertedFile.toString());

    const map = maps.goods['47353']['2'];
    expect(map.mapNum).toBe( 2);
    expect(map.length).toBe( 2800);
    expect(map.width).toBe( 2070);
    expect(map.numSheets).toBe( 1);
    expect(map.numCuts).toBe( 0);
    expect(map.lengthCuts).toBe( 26811);
    expect(map.boardId).toBe( 1);
    expect(map.type).toBe( 2);
    expect(map.totalTime).toBe( 420);
    expect(map.toolId).toBe( 10);
    expect(map.gid).toBe(47353);
});


test("pattern cutItems test", () => {
    const parser = new CutRiteLink();

    const file = fs.readFileSync('./tests/test01.ptx');
    const convertedFile = iconv.decode(file, 'win1251');



    const maps = parser.parse(convertedFile.toString());

    const cutItems = maps.goods['47353']['1']["cuts"];

    expect(cutItems.length).toBe(12);
});

test("pattern 2 cutItems test", () => {
    const parser = new CutRiteLink();

    const file = fs.readFileSync('./tests/test01.ptx');
    const convertedFile = iconv.decode(file, 'win1251');



    const maps = parser.parse(convertedFile.toString());

    const cutItems = maps.goods['47353']['2']["cuts"];

    expect(cutItems.length).toBe(17);
});


