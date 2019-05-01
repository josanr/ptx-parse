/**
 * Created by ruslan on 29.04.19.
 */

'use strict';

class CutRiteLink {
    constructor() {
        let isNodeWebkit = (typeof process === "object");
        if (isNodeWebkit === false) {
            throw Error('Данный раздел не работает в режиме Браузера.');

        }

        this.lines = null;
        this.toolId = null;
        this.parts = {};
        this.boards = {};
        this.offcuts = {};
        this.materials = {};


    }

    parse(ptxFile) {

        this.lines = ptxFile.split("\r\n");



        for (const id in this.lines) {
            this.lines[id] = this.lines[id].split(",");
        }


        // this.materials = this.getMaterials();
        // this.boards = this.getBoards();
        // this.offcuts = this.getOffcuts();
        //
        // this.toolId = this.getToolId();
        // this.parts = this.getParts();


        // console.log(JSON.stringify(this.parseCuts(1)));


        // const maps = this.getPatterns();
        //
        //
        //
        //
        // const goods = {};
        // for (const patternId in maps) {
        //     const map = maps[patternId];
        //     if (goods[map.gid] === undefined) {
        //         goods[map.gid] = {};
        //     }
        //     goods[map.gid][patternId] = map;
        // }
        //
        //
        // return {
        //     toolId: this.toolId,
        //     goods: goods
        // };
    }

    getPatterns() {

        const maps = {};
        for (const id in this.lines) {
            const line = this.lines[id];

            if (line[0] === "PATTERNS") {
                const patternId = +line[2];
                const boardId = +line[3];

                maps[patternId] = {
                    mapNum: patternId,
                    length: this.boards[boardId].length,
                    width: this.boards[boardId].width,
                    numSheets: +line[5],
                    numCuts: 0,
                    lengthCuts: 0,
                    boardId: boardId,
                    type: +line[4],
                    totalTime: +line[10],
                    toolId: this.toolId,
                    gid: this.boards[boardId].gid,
                };

                if (this.boards[boardId].isOffcut) {
                    maps[patternId].offcutId = this.boards[boardId].offcutId;
                }
                maps[patternId].cuts = this.parseMap(patternId);

            }


        }

        return maps;
    }

    parseMap(patternId) {
        const cuts = [];

        for (let id in this.lines) {
            const line = this.lines[id];

            if (line[0] !== "CUTS") {
                continue;
            }
            if (line[2].trim() !== "" + patternId) {
                continue;
            }

            let part = null;
            if (line[8].trim()[0] === "X") {
                part = this.offcuts[+line[8].trim().slice(1)];
            } else if(line[8].trim() !== "0"){
                part = this.parts[+line[8]];
            }
            let kerf = 0;
            if(+line[5].trim() - 90 > 0){
                kerf = 4.4;
            }



            const cut = {
                part: part,
                patternId: patternId,
                cutIndex: +line[3].trim(),
                sequence: +line[4].trim(),
                func: +line[5].trim(),
                dimmension: +line[6].trim() + kerf,
                partIndex: +line[8].trim(),
                quntPart: +line[9].trim() === 0 ? 0 : 1,
            };
            cuts.push(cut);

            for(let count = 1; count < +line[7].trim(); count++) {

                const cut = {
                    part: part,
                    patternId: patternId,
                    cutIndex: +line[3].trim(),
                    sequence: +line[4].trim(),
                    func: +line[5].trim(),
                    dimmension: +line[6].trim() + kerf,
                    partIndex: +line[8].trim(),
                    quantPart: +line[9].trim() === 0 ? 0 : 1,
                };
                cuts.push(cut);
            }
        }

        const cutLines = this.getChildNodes(1, cuts, 1, cuts[0].dimmension, false, 0, 0).nodes;

        const cutItems = this.buildCutItems(cutLines);

        const cutLength = this.sumCutLines(cutLines);


        return cutItems;
    }

    sumCutLines(nodeTree){

    }


    buildCutItems(nodeTree){
        const mapcuts = [];
        for(let idx in nodeTree){
            const node = nodeTree[idx];
            if(node.part === null){

                const children = this.buildCutItems(node.children);
                for(let id in children){
                    mapcuts.push(children[id]);
                }
            }else{
                mapcuts.push({
                    id: node.part.idx,
                    length: node.part.length,
                    width: node.part.width,
                    x: node.x,
                    y: node.y,
                    unknown: "",
                    degreese: 0,
                    uid: node.part.uid
                });
            }

        }
        return mapcuts;
    }



    getChildNodes(startPoint, list, layer, dimmension, crossCut, x, y){
        let start = false;
        let currentParrent = null;
        let nodes = [];
        let dx = x;
        let dy = y;
        let offset = 0;
        for(let idx = startPoint; idx < list.length; idx++){
            const line = list[idx];

            if(this.isBorderFunc(line.func) && layer === this.getLayerId(line.func)){
                if(start === false){
                    start = true;
                    currentParrent = nodes.push({
                        part: line.part,
                        x: dx,
                        y: dy,
                        crossCut: crossCut,
                        length: dimmension,
                        width: line.dimmension,
                        children: []
                    });
                    offset = line.dimmension;
                }else if(start === true){
                    return {
                        nodes: nodes,
                        lastIndex: idx
                    };
                }


            }else if(layer !== this.getLayerId(line.func)){
                const result = this.getChildNodes(idx, list, this.getLayerId(line.func), nodes[currentParrent - 1].width, !crossCut, dx, dy);
                nodes[currentParrent - 1].children = result.nodes;
                idx = result.lastIndex;

            }else{
                if(crossCut === false){
                    dy += offset;
                }else{
                    dx += offset;
                }
                currentParrent = nodes.push({
                    part: line.part,
                    x: dx,
                    y: dy,
                    crossCut: crossCut,
                    length: dimmension,
                    width: line.dimmension,
                    children: []
                });
                offset = line.dimmension;
            }




        }
    }

    isBorderFunc(func){
        return (func - 90) > 0;
    }

    getLayerId(func){
        if(func - 90 > 0){
            return func - 90;
        }

        return func;
    }








    getOffcuts() {
        const offcuts = {};
        for (const id in this.lines) {
            const line = this.lines[id];
            if (line[0] === "OFFCUTS") {
                if (+line[8] > 0) {
                    offcuts[+line[2]] = {
                        idx: "Обрезок",
                        uid: 0,
                        gid: this.materials[+line[4]].gid,
                        length: Math.floor(+line[5]),
                        width: Math.floor(+line[6]),
                        qty: +line[7],
                    };
                }
            }
        }
        return offcuts;
    }

    getMaterials() {
        const materials = {};
        for (const id in this.lines) {
            const line = this.lines[id];
            if (line[0] === "MATERIALS") {
                materials[+line[2]] = {
                    idx: +line[2],
                    gid: +line[3],
                };

            }
        }

        return materials;
    }

    getBoards() {

        const boards = {};
        for (const id in this.lines) {
            const line = this.lines[id];
            if (line[0] === "BOARDS") {
                if (+line[8] > 0) {
                    boards[+line[2]] = {
                        idx: +line[2],
                        gid: this.materials[+line[4]].gid,
                        isOffcut: (+line[14] === 1),
                        offcutId: +line[16],
                        length: +line[5],
                        width: +line[6]
                    };
                }
            }
        }

        return boards;
    }

    getParts() {
        const parts = {};
        for (const id in this.lines) {
            const line = this.lines[id];
            if (line[0] === "PARTS_REQ") {
                parts[+line[2]] = {
                    idx: +line[2],
                    uid: +line[3],
                    length: +line[5],
                    width: +line[6],
                    num: +line[7],
                    numProduced: +line[10]
                };
            }
        }

        return parts;
    }

    getToolId() {
        for (const id in this.lines) {
            const line = this.lines[id];
            if (line[0] === "JOBS") {
                let ids = line[3].split("-");
                return +ids[1];

            }
        }
        return null;
    }


}

module.exports = CutRiteLink;
