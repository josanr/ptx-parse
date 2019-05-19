/**
 * Created by ruslan on 14.05.19.
 */

'use strict';
const CutRiteLink = require('../src/cutritelink');
const fs = require('fs');
const iconv = require('iconv-lite');

test("parse PTX with rotated patterns", () => {
    const parser = new CutRiteLink();

    const file = fs.readFileSync('./tests/no_grain_material.ptx');
    const convertedFile = iconv.decode(file, 'win1251');



    const maps = parser.parse(convertedFile.toString());


    console.log(maps.goods[14149][17]);
});



test("offcuts items", () => {
    const parser = new CutRiteLink();

    const file = fs.readFileSync('./tests/no_grain_material.ptx');
    const convertedFile = iconv.decode(file, 'win1251');



    const maps = parser.parse(convertedFile.toString());

    expect(Object.keys(parser.getOffcuts()).length).toBe(1);

});
