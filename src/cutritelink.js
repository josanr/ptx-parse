/**
 * Created by ruslan on 29.04.19.
 */

'use strict';
class CutTreeItem {
    constructor(part, x, y, crossCut, length, width){
        this.part =  part;
        this.x =  x;
        this.y =  y;
        this.crossCut =  crossCut;
        this.length =  length;
        this.offset =  width;
        this.children =  [];
    }
}

class CutItem {
    constructor(part, x, y, num){
        this.id = part.idx;
        this.length = part.length;
        this.width = part.width;
        this.x = x;
        this.y = y;
        this.unknown = "";
        this.degreese = 0;
        this.uid = part.uid;
        this.count = num;
    }
}


class CutRiteLink {
    constructor() {
        let isNodeWebkit = (typeof process === "object");
        if (isNodeWebkit === false) {
            throw Error('Данный раздел не работает в режиме Браузера.');

        }
        this.kerf = 4.4;
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
            this.lines[id] = this.lines[id].split(",").map(v => v.trim());
        }

        this.materials = this.getMaterials();
        this.boards = this.getBoards();
        this.offcuts = this.getOffcuts();

        this.toolId = this.getToolId();
        this.parts = this.getParts();


        const patterns = this.getPatterns();

        const goodsMapList = {};
        for (const patternId in patterns) {
            const map = patterns[patternId];
            if (goodsMapList[map.gid] === undefined) {
                goodsMapList[map.gid] = [];
            }

            if(map.numSheets === 1){
                goodsMapList[map.gid].push(map);
            }else{
                for(let i = 1; i <= map.numSheets; i++){
                    const clonedMap = {};
                    for(let propId in map){
                        if(propId === 'cuts'){
                            continue;
                        }
                        if(propId === 'cutLines'){
                            clonedMap[propId] = JSON.parse(JSON.stringify(map[propId]));
                            continue;
                        }
                        clonedMap[propId] = map[propId];
                    }
                    clonedMap.numSheets = 1;
                    clonedMap.sheetSerial = i;
                    clonedMap.cuts = [];
                    let lastX = -1;
                    let lastY = -1;
                    for(let cid = 0; cid < map.cuts.length; cid++){
                        if(map.cuts[cid].count <= 0){
                            continue;
                        }
                        const cut = map.cuts[cid];
                        if(lastX === cut.x && lastY === cut.y){
                            continue;
                        }
                        const cloneCut = {
                            id: cut.id,
                            length: cut.length,
                            width: cut.width,
                            x: cut.x,
                            y: cut.y,
                            unknown: cut.unknown,
                            degreese: cut.degreese,
                            uid: cut.uid
                        };
                        clonedMap.cuts.push(cloneCut);
                        cut.count--;
                        lastX = cut.x;
                        lastY = cut.y;
                    }
                    goodsMapList[map.gid].push(clonedMap);
                }
            }

        }
        return {
            toolId: this.toolId,
            goods: goodsMapList
        };
    }


    /*

    patternType
    Fixed Pattern
    0 = rip length first – non-head cut pattern
    1 = turn board before ripping - non-head cut pattern
    2 = head cut pattern – head cut across width
    3 = head cut pattern – head cut along length
    4 = crosscut only
     */

    /*
    * JOB_INDEX, 1
    * PTN_INDEX, 2
    * BRD_INDEX, 3
    * TYPE,      4
    * QTY_RUN,   5
    * QTY_CYCLES,6
    * MAX _BOOK, 7
    * PICTURE,   8
    * CYCLE_TIME,9
    * TOTAL_TIME 10
    * */
    getPatterns() {

        const patterns = {};
        for (const id in this.lines) {
            const line = this.lines[id];

            if (line[0] === "PATTERNS") {
                const patternId = +line[2];
                const boardId = +line[3];
                const patternType = +line[4];
                const mapCount = +line[5];

                patterns[patternId] = {
                    mapNum: patternId,
                    length: this.boards[boardId].length,
                    width: this.boards[boardId].width,
                    numSheets: mapCount,
                    sheetSerial: 1,
                    numCuts: 0,
                    lengthCuts: 0,
                    boardId: boardId,
                    type: patternType,
                    totalTime: +line[10],
                    toolId: this.toolId,
                    gid: this.boards[boardId].gid,
                };

                if (this.boards[boardId].isOffcut) {
                    patterns[patternId].offcutId = this.boards[boardId].offcutId;
                }
                this.parseCuts(patterns[patternId]);
            }
        }
        return patterns;
    }

    parseCuts(pattern) {
        const cuts = [];
        for (let id in this.lines) {
            const line = this.lines[id];

            if (line[0] !== "CUTS") {
                continue;
            }
            if (+line[2] !== pattern.mapNum) {
                continue;
            }


            let part = null;
            if (line[8][0] === "X") {
                part = this.offcuts[+line[8].slice(1)];
            } else if(line[8] !== "0"){
                part = this.parts[+line[8]];
            }

            let kerf = 0;
            if(+line[5] - 90 > 0){
                kerf = this.kerf;
            }

            const cutRepeat = +line[7];
            const partCount = +line[9];
            let afterRepeatCount = 0;
            if(part !== null){
                if(cutRepeat !== 0){
                    afterRepeatCount = Math.round(partCount / cutRepeat)
                }else{
                    afterRepeatCount = partCount;
                }
            }

            const cut = {
                part: part,
                patternId: pattern.mapNum,
                cutIndex: +line[3],
                sequence: +line[4],
                func: +line[5],
                dimmension: +line[6] + kerf,
                partIndex: (part !== null) ? part.idx : 0,
                quantPart: afterRepeatCount,
            };
            cuts.push(cut);
            //repeated cuts
            for(let count = 1; count < +line[7]; count++) {

                const cut = {
                    part: part,
                    patternId: pattern.mapNum,
                    cutIndex: +line[3],
                    sequence: +line[4],
                    func: +line[5],
                    dimmension: +line[6] + kerf,
                    partIndex: (part !== null) ? part.idx : 0,
                    quantPart: afterRepeatCount,
                };
                cuts.push(cut);
            }
        }

        let crossCut = false;
        let dimmension = pattern.length;
        let startPoint = 1;
        let startLayer = 1;


        if(pattern.type === 1){
            crossCut = true;
            dimmension = pattern.width;

            startPoint = 1;
            startLayer = 1;
        }else if(pattern.type === 2){
            //board is divided in stripes by width
            crossCut = true;
            dimmension = pattern.width;
            startPoint = 0;
            startLayer = 0;
        }else if(pattern.type === 3){
            //board is divided in stripes by length
            startPoint = 0;
            startLayer = 0;
        }
        let cutLines = {};
        let cutLength = 0;
        try {
            cutLines = this.getCutLines(startPoint, cuts, startLayer, dimmension, crossCut, 0, 0).nodes;
            cutLength = this.sumCutLines(cutLines);
        }catch (e) {
            console.log(e);
            console.log(pattern);
        }
        let cutItems = {};
        try {
            cutItems = this.buildCutItems(startPoint, cuts, startLayer, dimmension, crossCut, 0, 0).nodes;
        }catch (e) {
            console.log(e);
            console.log(pattern);
        }

        pattern.lengthCuts = cutLength;
        pattern.cuts = cutItems;
        pattern.cutLines = cutLines;

    }

    buildCutItems(startPoint, list, layer, dimmension, crossCut, x, y){
        let nodes = [];
        let dx = x;
        let dy = y;
        let offset = 0;
        for(let idx = startPoint; idx < list.length; idx++){
            const line = list[idx];

            if(this.getLayer(line.func) === layer){
                //part is different in same place on new plate in book
                if(line.sequence === 0 && line.dimmension === 0.0 && line.part !== null){
                    nodes.push(
                        new CutItem(line.part, dx, dy, line.quantPart)
                    );
                    continue;
                }
                if(crossCut === false){
                    dy += offset;
                }else{
                    dx += offset;
                }
                if(line.part !== null) {
                    nodes.push(
                        new CutItem(line.part, dx, dy, line.quantPart)
                    );
                }
                offset = line.dimmension;

            }else if(this.getLayer(line.func) > layer){
                //get children
                const result = this.buildCutItems(idx, list, layer + 1, offset, !crossCut, dx, dy);
                nodes = nodes.concat(result.nodes);
                idx = result.lastIndex;
            }else if(this.getLayer(line.func) < layer){
                return {
                    nodes: nodes,
                    lastIndex: idx -1
                };
            }
        }
        return {
            nodes: nodes,
            lastIndex: list.length
        };
    }

    getCutLines(startPoint, list, layer, dimmension, crossCut, x, y){
        let currentParrent = null;
        let nodes = [];
        let dx = x;
        let dy = y;
        let offset = 0;
        for(let idx = startPoint; idx < list.length; idx++){
            const line = list[idx];
            if(this.getLayer(line.func) === layer){
                if(crossCut === false){
                    dy += offset;
                }else{
                    dx += offset;
                }
                if((idx + 1) < list.length && (this.getLayer(list[idx + 1].func) >= layer)) {
                    currentParrent = nodes.push(
                        new CutTreeItem(line.part, dx, dy, crossCut, dimmension, line.dimmension)
                    );
                    offset = line.dimmension;
                }
            }else if(this.getLayer(line.func) > layer){
                //get children
                const result = this.getCutLines(idx, list, layer + 1, nodes[currentParrent - 1].offset, !crossCut, dx, dy);
                nodes[currentParrent - 1].children = result.nodes;
                idx = result.lastIndex;
            }else if(this.getLayer(line.func) < layer && idx + 1 < list.length){
                return {
                    nodes: nodes,
                    lastIndex: idx -1
                };
            }
        }

        return {
            nodes: nodes,
            lastIndex: list.length
        };
    }

    getLayer(func){
        if(func - 90 > 0){
            return func - 90;
        }

        return func;
    }



    sumCutLines(nodeTree){
        let totalLength = 0;
        for(let idx in nodeTree){
            const node = nodeTree[idx];
            totalLength += node.length;
            if(node.children.length !== 0){
                totalLength += this.sumCutLines(node.children);
            }
        }

        return totalLength;
    }

    getOffcuts() {
        const offcuts = {};
        for (const id in this.lines) {
            const line = this.lines[id];
            if (line[0] === "OFFCUTS") {
                if (+line[7] > 0) {
                    offcuts[+line[2]] = {
                        idx: "Обрезок",
                        uid: +line[2],
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
