//imports
const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const users = require("./models/users");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

//constant values and env values
const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 3000;
const JWT_ENCRYPT_KEY = process.env.JWT_ENCRYPT_KEY;
const REFRESH_TOKEN_KEY = process.env.REFRESH_TOKEN_KEY;
const SENDER_MAIL = process.env.SENDER_MAIL;
const MAIL_PASSWORD = process.env.MAIL_PASSWORD;

//mongo connect
mongoose.connect(MONGO_URI);

//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS options
const corsOptions = {
  origin: "https://chronicles-plum.vercel.app",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
//routes
app.get("/", (req, res) => {
  res.send("Welcome to chronicles");
});

//signup route
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  if (await users.findOne({ email })) {
    return res.status(400).json({ message: "user already exists" });
  }
  try {
    const hashed_password = await bcrypt.hash(password, 10); //hashing the password to store it with a cost factor of 10
    const user = new users({
      email,
      password: hashed_password,
      refresh_token: "",
      token_version: 0,
    });
    await user.save();
    mailer(email, "manualSignup", { text: "none" });
    res.status(200).json({ message: "signup successfull" });
  } catch (err) {
    res.status(400).json({ message: "signup failed" });
  }
});

//login route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await users.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }
    const isLoggedOut = user.refresh_token == "" ? true : false; //checking if the user is logged out or not
    if (!isLoggedOut) {
      return res.status(200).json({ message: "user already logged in" });
    }
    const is_valid = await bcrypt.compare(password, user.password);
    if (!is_valid) {
      return res.status(400).json({ message: "incorrect password" });
    }
    try {
      const payload = { email: user.email };
      const token = jwt.sign(payload, JWT_ENCRYPT_KEY, { expiresIn: "1h" });
      const refresh_token = jwt.sign(payload, REFRESH_TOKEN_KEY);
      user.refresh_token = refresh_token;
      user.token_version += 1;
      await user.save();
      res.status(200).json({
        token: token,
        refresh_token: refresh_token,
        token_version: user.token_version,
      });
    } catch (err) {
      res.status(400).json({ message: "token generation failed" });
    }
  } catch (err) {
    res.status(400).json({ message: "login failed" });
  }
});

//refresh token route
app.post("/refresh", async (req, res) => {
  const { email, refresh_token, token_version } = req.body;
  const user = await users.findOne({ email });
  if (!user) return res.status(400).json({ message: "refresh failed" });
  console.log(`token version from user: ${user.token_version}`);
  console.log(`token version from request: ${token_version}`);
  try {
    if (user.refresh_token != refresh_token) {
      return res.status(401).json({ message: "refresh token invalid" });
    }
    if (user.token_version != parseInt(token_version)) {
      return res.status(401).json({ message: "token version invalid" });
    }
    const payload = { email: user.email };
    const token = jwt.sign(payload, JWT_ENCRYPT_KEY, { expiresIn: "1h" });
    user.token_version += 1;
    await user.save();
    res.status(200).json({ token: token, token_version: user.token_version });
  } catch (err) {
    res.status(400).json({ message: "refresh failed" });
  }
});

//middleware to verify the JWT
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; //get token from header
  const token_version = req.headers.authorization?.split(" ")[2]; //get token version from header

  if (!token || !token_version) {
    return res
      .status(401)
      .json({ message: "token or token version not found" });
  }
  try {
    const payload = jwt.verify(token, JWT_ENCRYPT_KEY); //verify token
    const user = await users.findOne({ email: payload.email }); //get user from db
    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }
    if (user.token_version != token_version) {
      return res.status(401).json({ message: "unauthorised" });
    }
    req.user = payload;
    next();
  } catch (err) {
    res.status(401).json({ message: "authorization failed" });
  }
};

//protected route
app.get("/protected", verifyToken, (req, res) => {
  res.status(200).json({ message: "protected route accessed" });
});

//logut route
app.post("/logout", async (req, res) => {
  const { token, token_version } = req.body;
  const { email } = jwt.verify(token, JWT_ENCRYPT_KEY);
  const user = await users.findOne({ email });
  if (!user) return res.status(400).json({ message: "user does not exist" });
  if (user.refresh_token == "") {
    return res.status(400).json({ message: "user already logged out" });
  }
  if (user.token_version != token_version) {
    return res.status(401).json({ message: "unauthorised" });
  }
  user.refresh_token = "";
  user.token_version += 1;
  await user.save();
  res.status(200).json({ message: "logout successfull" });
});

//server
app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});

// Function to generate email body based on template type
const generateEmailBody = (templateType, params) => {
  switch (templateType) {
    case "manualSignup":
      return `Hi there,

Welcome to Chronicles!

We're thrilled to have you on board. At Chronicles, we strive to provide you with a seamless and collaborative note-taking experience. Whether you're jotting down personal thoughts, brainstorming ideas, or working on a group project, our platform is designed to keep you on the same page with your friends and colleagues.

Here's what you can do next:

Log In: Access your dashboard using your credentials. Your personal workspace is ready and waiting for you.
Create Notes: Start creating notes effortlessly. Our intuitive text editor allows you to write and organize your thoughts in a way that suits you best.
Collaborate in Real-Time: Share your notes with friends by adding their emails. Watch as changes happen live, ensuring everyone stays on the same page, no matter where they are.
Explore Features: Take advantage of our user-friendly features designed to enhance your productivity and collaboration.
If you have any questions or need assistance, our support team is here to help. Feel free to reach out to us at chroniclesnote.org@gmail.com.

We're excited to see what you create and share with Chronicles. Welcome to the community!

Best regards,
The Chronicles Team`;
    case "googleAuth":
      return `Dear Valued users,

Congratulations on joining the Chronicles community! Your account has been successfully created.

Your temporary password is: ${params.temporaryPassword}. For your security, please log in at your earliest convenience to reset your password and personalize your account.

We are thrilled to have you with us and look forward to your journey with Chronicles!

Best regards,

The Chronicles Team`;
    case "otp":
      return `Welcome to Chronicles! We're excited to have you on board.

To complete your sign-up process, please use the following One-Time Password (OTP):

${params.otp}

This code is valid for the next 10 minutes. Please enter it on the sign-up page to verify your account.

If you did not request this, please ignore this email or contact our support team for assistance.

Thank you for joining Chronicles!

Best regards,
The Chronicles Team

`;
    default:
      return "";
  }
};

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: SENDER_MAIL,
    pass: MAIL_PASSWORD,
  },
});

const mailOptions = (userEmail, subject, text) => {
  return {
    from: SENDER_MAIL,
    to: userEmail,
    subject: subject,
    text: text,
  };
};

// Updated mailer function to accept template type and parameters
const mailer = (userEmail, templateType, params) => {
  const subject =
    templateType === "googleAuth"
      ? "Welcome to Chronicles - Your Account is Ready!"
      : templateType === "manualSignup"
      ? "Welcome to Chronicles!"
      : "Your Chronicles OTP Code";
  const text = generateEmailBody(templateType, params);

  transporter.sendMail(mailOptions(userEmail, subject, text), (err, info) => {
    if (err) {
      console.log(err);
    } else {
      console.log(`Email sent: ${info.response}`);
    }
  });
};

//handle googleAuth sign up and savewith an initial password
app.post("/googleauth/signup", async (req, res) => {
  try {
    const { email } = req.body;
    // Validate email here (not shown)
    let user = await users.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "users already exists." });
    }
    const temporaryPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10); // Use async version
    user = new users({
      email,
      password: hashedPassword,
      refresh_token: "",
      token_version: 0,
    });
    await user.save();
    mailer(email, "googleAuth", { temporaryPassword });
    res.status(200).json({ message: "Signup successful." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred during the signup process." });
  }
});

const otpStore = {};

//handle email verification via sending an otp
app.post("/verifyemail", async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000);
  otpStore[email] = otp;
  mailer(email, "otp", { otp });
  res.status(200).json({ message: "OTP sent" });
});

//handle otp verification
app.post("/verifyotp", async (req, res) => {
  const { email, otp } = req.body;
  const parsedOtp = parseInt(otp);
  if (!otpStore[email]) {
    return res.status(400).json({ message: "OTP not found" });
  }
  const storedOtp = otpStore[email];
  if (parsedOtp === storedOtp) {
    delete otpStore[email];
    res.status(200).json({ message: "OTP verified" });
  } else {
    res.status(400).json({ message: "Invalid OTP" });
  }
});

//handle googleAuth login
app.post("/googleauth/login", async (req, res) => {
  const { email } = req.body;
  let user = await users.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "user does not exist" });
  }
  const payload = { email: user.email };
  const token = jwt.sign(payload, JWT_ENCRYPT_KEY, { expiresIn: "1h" });
  const refresh_token = jwt.sign(payload, REFRESH_TOKEN_KEY);
  user.refresh_token = refresh_token;
  user.token_version += 1;
  await user.save();
  res.status(200).json({
    token: token,
    refresh_token: refresh_token,
    token_version: user.token_version,
  });
});
