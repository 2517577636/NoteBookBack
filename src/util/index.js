const { BillModel, CategoriesModel } = require("../model/index")

/**
 * @description 将csv文件内容，转换成对象。返回一个数组
 * @param content<string>
 * @returns 
 *         - resArr<Array>
 * */

function transformCSVDataToArray(content, model) {
    let res = [];

    // conten为空 || content类型不为string 进行错误日志打印，并返回一个空数组
    if(!content || typeof content !== "string") {
        console.error("content is null or not a string");
        return res;    
    }

    const contentReg = /\w+/g;

    let csvDataRawArr = content.split("\r\n"),
        csvDataTypeArr = csvDataRawArr[0].match(contentReg);

    csvDataRawArr.splice(0, 1); // 去除type，只保留数据

    // 将字符串转换成object
    csvDataRawArr.forEach((billStr, idx, self) => {
        let tempObj = {};
        let csvDataArr = billStr.split(",");
        csvDataTypeArr.forEach((key, kIdx, selfDataTypeArr) => {
            switch(model[key]) {
                case  "number":
                    csvDataArr[kIdx] = Number(csvDataArr[kIdx]);
                    break;
                default:
                case "string": 
                    csvDataArr[kIdx] = String(csvDataArr[kIdx]);
                    break;
            }
            tempObj[key] = csvDataArr[kIdx]; 
        })
        res.push(tempObj);
    })

    return res;
}

/**
 * @description 将数组按序进行排序，返回排序后的数组
 * @param targetArr
 * @param targetProp
 * @returns
 *      - res<Array:number>
 * */ 
function sortArr(targetArr, targetProp) {
    let res = [];

    if(!targetArr || !Array.isArray(targetArr)) {
        return res;
    }

    if(!targetProp) {
        targetArr.sort((fir, sec) => {
            return fir -sec
        });
        res = targetArr
    } 

    if(typeof targetProp === "string") {
        targetArr.sort((fir, sec) => {
            return fir[targetProp] - sec[targetProp]
        })
        res = targetArr
    }

    return res
}

module.exports = {
    transformCSVDataToArray,
    sortArr
}