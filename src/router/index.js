const Router = require("koa-router");
const fs = require("fs");
const path = require("path");
const qs = require("querystring");
const { transformCSVDataToArray, sortArr } = require("../util/index");
const { BillModel, CategoriesModel } = require("../model/index");

const router = new Router();

router.get("/", (ctx, next) => {
    const filePath = path.join(__dirname, "../data/bill.csv");
    const cateFilePath = path.join(__dirname, "../data/categories.csv");

    let billFileData = fs.readFileSync(filePath, {encoding: "utf-8"});
    let cateFielData = fs.readFileSync(cateFilePath, {encoding: "utf-8"});

    let billArr = transformCSVDataToArray(billFileData, BillModel),
        cateArr = transformCSVDataToArray(cateFielData, CategoriesModel);

    billArr = sortArr(billArr, "time");  
    const params = qs.parse(ctx.querystring)
    
    ctx.body = {
        err: 0,
        data: {
            bill: billArr,
            cate: cateArr
        }
    }
})

module.exports = router;