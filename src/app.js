const Koa = require("koa");
const router = require("./router/index");
const bodyParser = require("koa-bodyparser");

const app = new Koa();

app.use(async(ctx, next) => {
    ctx.set("Access-Control-Allow-Origin", "*");
    ctx.set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild");
    ctx.set("Access-Control-Allow-Methods", 'PUT, POST, GET, DELETE, OPTIONS');
    if (ctx.method == 'OPTIONS') {
        ctx.body = 200; 
      } else {
        await next();
      }
})
    .use(bodyParser())
    .use(router.routes())
    .use(router.allowedMethods());

app.listen(3000, () => {
    console.log("Current server is running at port: 3000");
})