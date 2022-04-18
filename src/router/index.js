const Router = require("koa-router");
const fs = require("fs");
const path = require("path");
const { transformCSVDataToArray, sortArr, isEmpty, transformStrToObj } = require("../util/index");
const { BillModel, CategoriesModel } = require("../model/index");

const router = new Router();

/**
 * bill: {
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
const cateFilePath = path.join(__dirname, "../data/categories.csv");

let billFileData = fs.readFileSync(billFilePath, {encoding: "utf-8"});
let cateFielData = fs.readFileSync(cateFilePath, {encoding: "utf-8"});

router.get("/", (ctx, next) => {
    let billArr = transformCSVDataToArray(billFileData, BillModel),
        cateArr = transformCSVDataToArray(cateFielData, CategoriesModel);

    billArr = sortArr(billArr, "time");  
    
    ctx.body = {
        err: 0,
        data: {
            bill: billArr,
            cate: cateArr
        }
    }
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

    resultData.data = finalBill;
    resultData.msg = "success";
    ctx.body = resultData;
})

module.exports = router;