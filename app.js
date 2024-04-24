const express = require("express");
const bcrypt = require("bcryptjs"); 
const session = require("express-session");
const mysqlSession = require("express-mysql-session");
const db = require("./utils/mysql2-connect.js");
const cors = require("cors");
const path = require('path');
const MysqlStore = mysqlSession(session);
const sessionStore = new MysqlStore({}, db);
const jsonTable =require("./routes")
const app = express(); 
app.set('view engine', 'ejs');
app.use(express.json());
 
app.use(express.urlencoded({extended:true}));
 
const corsOptions={
  Credential:true,
  origin:(origin,callback)=>{
    callback(null,true);
  }
}
app.use(cors(corsOptions));
 
// 這邊存在資料庫 
app.use(session({
  saveUninitialized:true,
  resave:true,
  secret:"dafd;faekmcda",
  store:sessionStore
}))
// 自訂的頂層的 middlewares
//res.locals 設定使用者資訊的設定....
app.use((req, res, next) => {
  res.locals.title = "複習的網站";
  res.locals.pageName = "";
  res.locals.session = req.session; // 讓 ejs 可以使用 session
  res.locals.originalUrl = req.originalUrl;
  next();
});

app.get("/", (req, res) => { 
  res.render("login");
});

app.post("/vvv/login",async (req,res)=>{
  let {account,password}=req.body || {};
  const output={
    success:false,
    error:"",
    code:"",
    propsData:req.body
  }
  if(!account || !password){
    output.error="欄位資料不足";
    output.code=400;
    return res.json(output)
  }
  account=account.trim();
  password=password.trim();
  const sql="select * from members where email=?";
  const [rows]=await db.query(sql,[account]);

  if(!rows.length){
    output.error="帳號或密碼為誤"
    output.code=420
    return res.json(output)
  }
  // 比較帳號密碼是否正確
  const result=await bcrypt.compare(password,rows[0].password);
  if(result){
    output.success=true;
    req.session.admin={
      id:rows[0].id,
      email:account,
      nickname:rows[0].nickname
    }
  }else{
    output.error="帳號或密碼錯誤"
    output.code=450;
  }
  res.json(output) 

})
app.get("/m", async(req,res)=>{
  const sql = "select * from address_book";
  const [rows] = await db.query(sql);
  return res.render("json-table/json-table",{rows}) 
})

 
 
// express.static(root,[options]) 設定靜態目錄
// app.use("/", express.static("public"));
// 
/* ************** 其他的路, 放在這行之前 *********** */
// 靜態內容的資料夾 
// 後端圖片資料夾
// app.get("/",(req,res)=>{
//   return res.render("paypal") 

// })
app.use('/images', express.static(path.join(__dirname, 'public/images')));
let index = require('./routes')
app.use('/backRoute', index) 
app.use("/", express.static("public"));
app.use("/bootstrap", express.static("node_modules/bootstrap/dist"));
app.use("/jquery", express.static("node_modules/jquery/dist"));


/* 404 頁面 */
app.use((req, res) => {
  res.status(404).send(`<h2>404 走錯路了</h2>`);
});
const port = process.env.WEB_PORT || 3002;
app.listen(port, () => {
  console.log(`伺服器啟動 使用通訊埠 http://127.0.0.1:${port}`);
});
