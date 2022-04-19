const Router = require("koa-router");
const fs = require("fs");
const path = require("path");
const { transformCSVDataToArray, isEmpty, transformStrToObj, getDate } = require("../util/index");
const { BillModel, CategoriesModel } = require("../model/index");

const router = new Router();

/**
 * 
 * bill: { // 返回前端数据结构
 *  1 : [
 *      {
 *          type: 0,
 *          time: 1564502400000,
 *          category: "bsn20th0k2o",
 *          amount: 1900
 *      }...
 *  ]
 * 
 * }
 * 
*/

const billFilePath = path.join(__dirname, "../data/bill.csv");

router.get("/", (ctx, next) => {
    let billFileData; // 账单文件内容
    const resultData = { // 返回数据
        err: 0,
        data: {},
        msg: "default"
    }

    try {
        billFileData = fs.readFileSync(billFilePath, {encoding: "utf-8"});
    }catch (e) {
        console.log(e);
    }

    if (!billFileData) { // 获取文件内容失败直接返回
        resultData.err = 1;
        resultData.msg = "fail; failed to get file data!!!";

        ctx.body = resultData;
        next();
        return;
    }

    let billArr = transformCSVDataToArray(billFileData, BillModel);

    if(isEmpty(billArr)) {
        resultData.err = 1;
        resultData.msg = "fail, the billArr is empty!!!"

        ctx.body = resultData;
        next();
        return;
    }

    let finalObj = {}; // 最终返回前端数据
    billArr.forEach(bill => {
        let date = getDate(bill.time);

        // 按时间顺序存入月份账单中
        if(!!finalObj[date.month] && finalObj[date.month].length > 0) {
            if(bill.time >= finalObj[date.month][0].time) {
                finalObj[date.month].unshift(bill);
            }
        }else {
            finalObj[date.month] = [bill]
        }
    })
    
    resultData.data.bill = finalObj;
    resultData.msg = "success";

    ctx.body = resultData;
})

router.post("/create", (ctx, next) => { // 添加新账单
    let data = ctx.request.body;
    const resultData = {
        err: 0,
        data: {},
        msg: "default msg"
    }
    console.log("data: ", data);

    let billArr;
    if (!data.billArr) { // 排除空字符串
        billArr = []
    } else {
        let billStr = data.billArr,
        regExp = /(?<=\}),/g;
        billArr = billStr.split(regExp);
    }
    
    if(isEmpty(billArr)) {
        resultData.err = 1;
        resultData.msg = "The billArr is an empty array!!!"

        ctx.body = resultData;
        
        next();
        return;
    }

    let finalBill = {}; // 月份账单 最终返回数据【结构参考：bill  code:10处】
    billArr.forEach(billStr => { // 将账单数据存入finalBill中
        let billObj = transformStrToObj(billStr),
            billDate = new Date(+billObj.time),
            billMonth = billDate.getMonth() + 1;

        // 按时间顺序存入月份账单中
        if(!!finalBill[billMonth]) {
            if(finalBill[billMonth].length > 0) {   
                if(billObj.time >= finalBill[billMonth][0].time) {
                    finalBill[billMonth].unshift(billObj);
                }
            }
        } else {
            finalBill[billMonth] = [billObj]
        }

        // 将数据添加至csv文件中
        let value = Object.values(billObj),
            valueStr = `\r\n${value}`;
        
        console.log("value: ", valueStr);
        try{
            fs.appendFileSync(billFilePath, valueStr);
        } catch(e) {
            console.log(err);
        }
    });

    resultData.data.bill = finalBill;
    resultData.msg = "success";
    ctx.body = resultData;
})

module.exports = router;