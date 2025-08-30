const express = require("express");
const { Pool } = require("pg");
require("dotenv").config();
const bcrypt = require("bcrypt");
const app = express();
const PORT = 3001;
const cors = require("cors");
const nodemailer = require("nodemailer")
app.use(express.json());
const otps = new Map();
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "thuyavan855@gmail.com",
    pass: "hkuf ntvs zfmq tusz", // Ensure this is a valid app password
  },
});

// Setup PostgreSQL connection
const pool = new Pool({
  user: process.env.PGUSER || "postgres",
  password: process.env.PGPASSWORD || "0328",
  host: process.env.PGHOST || "localhost",
  database: process.env.PGDATABASE || "dummy",
  port: process.env.PGPORT || 5432,
});
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Test DB connection
(async function testDb() {
  try {
    const client = await pool.connect();
    console.log("✅ DB IS CONNECTED");
    client.release();
  } catch (err) {
    console.error("❌ DB connection error:", err.message);
  }
})();

app.get("/", (req, res) => {
  res.send("Express + PostgreSQL is connected ✅");
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "insert into users (name,email,password) values($1,$2,$3) returning *",
      [name, email, hashed]
    );
    res.status(200).json({
      success: true,
      message: "email successfully registered",
      user: result.rows[0],
    });
  } catch (err) {
    if (err.code == "23505") {
      return res.status(409).json({ message: "email already exist" });
    }
    console.log("signup error:", err.message);
    res.status(500).json({ message: "internal server error" });
  }
});

app.post("/email-send", async (req, res) => {
  const { name, email } = req.body;
  

  try {
    

    let info = await transporter.sendMail({
      from: "thuyavan855@gmail.com",
      to: email,
      subject: "Welcome to My Website 🎉",
      text: `Hello ${name},\n\nYour account has been created successfully!\n\nBest Regards,\nThe Team`,
    });

    console.log("Email sent:", info.response);
    res.status(200).json({ success: true, message: "Email sent successfully" });
  } catch (err) {
    console.error("Email error:", err);
    res.status(500).json({ success: false, message: "Email failed" });
  }
});

app.post("/google-auth", async (req, res) => {
  try {
    const { name, email } = req.body;

    //check the email is exist or not

    const usercheck = await pool.query("SELECT * FROM users where email=$1  ", [
      email,
    ]);
    if (usercheck.rows.length > 0) {
      return res.status(200).json({
        success: true,
        message: "User already exists, logged in successfully",
        user: usercheck.rows[0],
      });
    }

    const result = await pool.query(
      "INSERT INTO users(name,email,password) values($1,$2,$3) returning * ",
      [name, email, null]
    );
    res.status(200).json({
      success: true,
      message: " successfully signed ",
      user: result.rows[0],
    });
  } catch (err) {
    console.log("google-Oauth", err.message);
    res.status(500).json({
      message: "internal error",
    });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const users = await pool.query("select * from users where email=$1", [
      email,
    ]);
    if (users.rows.length === 0) {
      return res
        .status(200)
        .json({ success: false, message: "email is not founed" });
    }
    const user = users.rows[0];

    const ismatch = await bcrypt.compare(password, user.password);
    if (!ismatch) {
      return res.status(200).json({
        success: false,
        message: "password not match",
      });
    }
    return res.status(200).json({
      success: true,
      message: "login successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: "internal error" });
  }
});
app.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  try {
    if(!email){
      return res.status(400).json({success:false,message:"Email is required"})
    }
    const result = await pool.query("select * from users where email =$1", [
      email,
    ]);
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "user not found" });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otps.set(email, { otp, expiry: Date.now() + 5 * 60 * 1000 });
    
    const info = await transporter.sendMail({
      from: "thuyavan855@gmail.com",
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is: ${otp}. It expires in 5 minutes.`,
    });
   console.log("OTP sent successfully for:", email, "Response:", info.response);
    res
      .status(200)
      .json({ success: true, message: "OTP is sended to your email" });
  } catch (err) {
    console.error("sent otp error:", err);
    res.status(500).json({ success: false, message: "failed to send otp" });
  }
});
app.post("/reset-password",async(req,res)=>{

  const{email,otp,password} = req.body;
    console.log("Reset attempt:", { email, otp, stored });
  try{
    const stored = otps.get(email)
   if (!stored || stored.expiry < Date.now() || stored.otp.toString() !== otp.toString()) {
      return res.status(400).json({success:false,message:"Invaild or expire OTP"})
    }
    const hashed = await bcrypt.hash(password,10)
    await pool.query("update users SET password = $1 where email=$2",[hashed,email])
    otps.delete(email);
    res.status(200).json({success:true,message:" Reset Password successfully "})



  } 
  catch(err){
    console.log("reset password :",err)
    res.status(500).json({success:false,message:"failed to reset password"})
  }
})
