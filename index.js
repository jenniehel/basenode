var express = require('express');
var nodemailer = require('nodemailer');
const app = express()
const port = 3000

app.set("view engine", "ejs"); 
app.use(express.urlencoded({ extended: true }));
const googleOAuth2Client = require('./config/googleOAuth2Client');

const SCOPES = [
  'https://mail.google.com/',
];
var session = require('express-session');
 

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}))
app.get('/', (req, res) => {
  
 return   res.render("index");
});

app.get('/login', (req, res) => {
  const authUrl = googleOAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  res.redirect(authUrl);
});

app.get('/auth/google/callback', async (req, res) => {
  const code = req.query.code;
  try {
    const { tokens } = await googleOAuth2Client.getToken(code)
     
    googleOAuth2Client.setCredentials(tokens);
    req.session.tokens = tokens;

    res.redirect('/email/send');
  } catch (err) {
    console.error('Error authenticating with Google:', err);
    res.status(500).send('Error authenticating with Google');
  }
});

// 
// 
app.post('/email/send',async (req, res) => {
 
 const email=req.body.email;
 
  // 第一種
  // const {
  //   refresh_token,
  //   access_token,
  // } = req.session.tokens;
 

  // const transporter = nodemailer.createTransport({
  //   service: 'gmail',
  //   auth: {
  //     type: 'OAuth2',
  //     user: '你要用來發送信件的 Gmail',
  //     clientId: process.env.CLIENT_ID,
  //     clientSecret: process.env.CLIENT_SECRET,
  //     refreshToken: refresh_token,
  //     accessToken: access_token,
  //   },
  // });
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });
  await transporter.verify();
  const mailOptions = {
    from: 'awd0900814212@gmail.com',
    to: email,
    subject: '你好',
    text: '很高興認識你',
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error(err);
      res.status(500).send({success:true,msg:'Error sending email'});
    } else {
      console.log(info);
      res.json({success:true,msg:'Email sent'});
    }
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})