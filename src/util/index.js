/**
 * @description 将csv文件内容，按照model转换成对象。返回一个数组
 * @param str<string>
 * @returns 
 *         - resArr<Array>
 * */

function transformCSVDataToArray(str, model) {
    let res = [];

    // conten为空 || str类型不为string 进行错误日志打印，并返回一个空数组
    if(!str || typeof str !== "string") {
        console.error("content is null or not a string");
        return res;    
    }

    const contentReg = /\w+/g;

    let csvDataRawArr, csvDataTypeArr;

    try {
        csvDataRawArr = str.split("\r\n"), // 文件内容转换成字符串数组 例如： ["type,time,category,amount", "0,1561910400000,8s0p77c323,5400"]
        csvDataTypeArr = csvDataRawArr[0].match(contentReg); // 获取属性字符串数组 例如: ["type","time","category","amount"]
    } catch (e) {
        console.log(e);
        return res;
    }
        
    csvDataRawArr.splice(0, 1); // 去除type，只保留数据

    // 将字符串根据model转换成object
    csvDataRawArr.forEach((csvDataArrStr, idx, self) => {
        let finalObj = {}; // 根据model生成的对象
        let values = csvDataArrStr.split(",");

        // 属性遍历，根据model进行类型转换,并添加至finalObj中
        csvDataTypeArr.forEach((key, kIdx, selfDataTypeArr) => {
            switch(model[key]) {
                case  "number":
                    values[kIdx] = Number(values[kIdx]);
                    break;
                default:
                case "string": 
                    values[kIdx] = String(values[kIdx]);
                    break;
            }
            finalObj[key] = values[kIdx]; 
        })
        res.push(finalObj);
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

/**
 * @description 清除str中所有空格，如果str不是string，则直接返回。
 * @param str
 * @returns 
 * */ 
function clearAllSpace(str) {
    let regExp = /\s+/g;

    if(typeof str === "string") {
        return str.replace(regExp, "");
    }

    return str
}

/**
 * @description 将类对象字符串转换成对象【浅拷贝】
 * @param strObj 例如：'{type:0, time:1650286816934, category:"3tqndrjqgrg", amount:3900}'
 * @returns 
 *      -- res<Obj>
 * */ 
function transformStrToObj(strObj) {
    let regExp = /([\w|\"|\']+):([\w|\"|\']+)/g,
        res = {};

    if (!strObj) {
        return res
    }

    let keyValueStrArr = strObj.match(regExp); // 获取键值对字符串
    if(!keyValueStrArr) { // 匹配失败，直接返回空对象。
        return res;
    }

    keyValueStrArr.forEach(keyValueStr => {
        let keyValueRegExp = /(\w+)/g;

        let keyValues = keyValueStr.match(keyValueRegExp);
        res = addKeyValue(res, keyValues)
    })

    return res
}

/**
 * @description 为目标对象添加键值对，如果arr不为数组或者长度不为2，直接返回目标对象。 
 * @param targetObj<Object>
 * @param arr<Array> arr为一个键值对数组，长度为2. 例如：["type"；"0"]
 * @returns
 *      -- res<Object>
 * */ 
function addKeyValue(targetObj, arr) {
    if(!isObject(targetObj)) {
        return targetObj;
    }
    
    if(Array.isArray(arr) && arr.length !== 2) {
        return targetObj;
    }

    targetObj[arr[0]] = arr[1]
    
    return targetObj;
}

/**
 * @description 判断val是否为空
 * @param val
 * @returns 
 *      -- res<Boolean>
 * */ 
function isEmpty(val) {
    let res = false;

    if(isEmptyArr(val)) {
        res = true
    }

    return res;
}

/**
 * @description 判断arr是否是一个空数组， 是：true 否：false
 * @param arr
 * @returns
 *      --res<Boolean>
 * */ 
function isEmptyArr(arr) {
    let res = false;
    
    if(!arr) {
        res = true;
    } else if(Array.isArray(arr) && arr.length === 0) {
        res = true;
    }

    return res;
}

/**
 * @description 根据传入time毫秒数，返回对应的日期对象
 * @param time
 * @returns 
 *      -- res
 * */ 
function getDate(time) {
    let res = {};

    if(!time) {
        return res
    }

    let date = new Date(time);

    res.month = date.getMonth() + 1;
    res.year = date.getFullYear();
    res.localDate = date.toLocaleDateString();

    return res
}


/**
 * @description 判断targetObj 是否为一个对象，返回true | false
 * */ 
function isObject(targetObj) {
    let res = false;
    
    if(targetObj && Object.prototype.toString.call(targetObj) === '[object Object]') {
        res = true;
    }

    return res;
}

module.exports = {
    transformCSVDataToArray,
    sortArr,
    clearAllSpace,
    isEmptyArr,
    isEmpty,
    transformStrToObj,
    getDate
}