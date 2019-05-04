/**
 * Created by ruslan on 03.05.19.
 */

'use strict';
const CutRiteLink = require('../src/cutritelink');
const fs = require('fs');
const iconv = require('iconv-lite');

test("parsed Optimisation PTX # 1 all have length different than 0", () => {
    const parser = new CutRiteLink();

    const file = fs.readFileSync('./tests/184417-1.ptx');
    const convertedFile = iconv.decode(file, 'win1251');



    const maps = parser.parse(convertedFile.toString());
    for(let gid in maps.goods){
        for(let mid in maps.goods[gid]){
            const map = maps.goods[gid][mid];
            expect(map.lengthCuts).not.toBe(0);
        }
    }
});



test("parsed Optimisation PTX # 2 all have length different than 0", () => {
    const parser = new CutRiteLink();

    const file = fs.readFileSync('./tests/184417-2.ptx');
    const convertedFile = iconv.decode(file, 'win1251');



    const maps = parser.parse(convertedFile.toString());
    for(let gid in maps.goods){
        for(let mid in maps.goods[gid]){
            const map = maps.goods[gid][mid];
            expect(map.lengthCuts).not.toBe(0);
        }
    }
});


test("parsed Optimisation PTX # 3 all have length different than 0", () => {
    const parser = new CutRiteLink();

    const file = fs.readFileSync('./tests/184417-10.ptx');
    const convertedFile = iconv.decode(file, 'win1251');



    const maps = parser.parse(convertedFile.toString());
    for(let gid in maps.goods){
        for(let mid in maps.goods[gid]){
            const map = maps.goods[gid][mid];
            expect(map.lengthCuts).not.toBe(0);
        }
    }
});


test("parsed Optimisation PTX # 1 all have cut items", () => {
    const parser = new CutRiteLink();

    const file = fs.readFileSync('./tests/184417-1.ptx');
    const convertedFile = iconv.decode(file, 'win1251');



    const maps = parser.parse(convertedFile.toString());
    for(let gid in maps.goods){
        for(let mid in maps.goods[gid]){
            const map = maps.goods[gid][mid];
            expect(map.cuts.length).not.toBe(0);
        }
    }
});


test("parsed Optimisation PTX # 2 all have cut items", () => {
    const parser = new CutRiteLink();

    const file = fs.readFileSync('./tests/184417-2.ptx');
    const convertedFile = iconv.decode(file, 'win1251');



    const maps = parser.parse(convertedFile.toString());
    for(let gid in maps.goods){
        for(let mid in maps.goods[gid]){
            const map = maps.goods[gid][mid];
            expect(map.cuts.length).not.toBe(0);
        }
    }
});

test("parsed Optimisation PTX # 3 all have cut items", () => {
    const parser = new CutRiteLink();

    const file = fs.readFileSync('./tests/184417-10.ptx');
    const convertedFile = iconv.decode(file, 'win1251');



    const maps = parser.parse(convertedFile.toString());
    for(let gid in maps.goods){
        for(let mid in maps.goods[gid]){
            const map = maps.goods[gid][mid];
            expect(map.cuts.length).not.toBe(0);
        }
    }
});

test("parsed small pattern with one item", () => {
    const parser = new CutRiteLink();

    const file = fs.readFileSync('./tests/small_pattern.ptx');
    const convertedFile = iconv.decode(file, 'win1251');



    const maps = parser.parse(convertedFile.toString());

    const map = maps.goods['26381']['1'];
    expect(map.lengthCuts).toBe(2063);
    expect(map.cuts.length).toBe(2);

    let cutItem = map.cuts[0];
    expect(cutItem.x).toBe(15);
    expect(cutItem.y).toBe(15);

    cutItem = map.cuts[1];
    expect(cutItem.x).toBe(325);
    expect(cutItem.y).toBe(0);
});



test("counted by hand length for pattern 1", () => {
    const parser = new CutRiteLink();

    const file = fs.readFileSync('./tests/184417-1.ptx');
    const convertedFile = iconv.decode(file, 'win1251');



    const maps = parser.parse(convertedFile.toString());

    const map = maps.goods['8325']['1'];
    expect(map.lengthCuts).toBe(32811);
    expect(map.cuts.length).toBe(18);


});


test("map items must have coordinates set", () => {
    const parser = new CutRiteLink();

    const file = fs.readFileSync('./tests/184417-1.ptx');
    const convertedFile = iconv.decode(file, 'win1251');



    const maps = parser.parse(convertedFile.toString());

    for(let gid in maps.goods) {
        const mapGood = maps.goods[gid];
        for(const mid in mapGood){
            const map = mapGood[mid];
            for(let cid in map.cuts){
                const cutItem = map.cuts[cid];
                expect(cutItem.x).not.toBe(null);
                expect(cutItem.y).not.toBe(null);
            }

        }

    }

});
