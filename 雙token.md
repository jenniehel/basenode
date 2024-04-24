routes.js
app.post("/renewAccessToken",(req,res)=>{
    const refreshToken=req.body.token;
    const cu_id=req.body.custom_id = 1;
    const cu_pa= req.body.password = "a123";
    const data0={cu_id,cu_pa}
console.log(refreshToken)
    // 確認retoken是否真的存在
    if(!refreshToken || !refreshTokens.includes(refreshToken)){

        return res.status(403).json({message:"User not authenticated",data:refreshTokens.includes(refreshToken)});
    }
    jwt.verify(refreshToken,process.env.resecret,(err,user)=>{
        if(!err){
            const accessToken=jwt.sign(data0,process.env.secret,{expiresIn:"40s"});
            return res.status(201).json({success:true,accessToken});
        }else{
            return res.status(403).json({message:"user not authenticated"});
        }
    });
})
app.post("/api/login", async (req, res) => {
    req.body.custom_id = 1;
    req.body.password = "a123";
    const { custom_id, password } = req.body;
    console.log(JSON.stringify(req.body))
    const user1 = `select * from custom where custom_id=${custom_id} `
    let [rows ] = await db.query(user1); //isUser 
    if (rows.length > 0) {
      
        const state = bcrypt.compareSync(req.body.password,rows[0].custom_password) 
        if(state){
              // 生成 JWT
              const accessToken=jwt.sign({id:custom_id},process.env.secret,{expiresIn:"40s"});
              const refreshToken=jwt.sign({id:custom_id},process.env.resecret,{expiresIn:"20m"});
              refreshTokens.push(refreshToken);
            return res.status(201).json({success:true,accessToken,refreshToken,refreshTokens})
            // return res.json({success:true,accessToken})
        }
    }

    return res.json(rows)

})
app.get("/api/login", async (req, res) => {
  return res.render("login");

})