const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}...`));

// ✅ Connect to MongoDB using environment variable
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("DB Connected"))
  .catch(() => console.log("Failed To DB Connect"));

// You can still keep your DB model if needed
const dbMail = mongoose.model("mails", {}, "mails");

// ✅ Send Mail API
app.post("/sendmail", async (req, res) => {
  const { msg, emailLists } = req.body;

  if (!msg || !emailLists || emailLists.length === 0) {
    return res.status(400).send("Message or email list missing");
  }

  // ✅ Use credentials from environment
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER, // your Gmail from Render env
      pass: process.env.GMAIL_PASS, // 16-char App Password
    },
  });

  try {
    for (let i = 0; i < emailLists.length; i++) {
      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: emailLists[i],
        subject: "Hi, I'm from Bulk-Mail project",
        text: msg,
      });
      console.log("Mail sent to:", emailLists[i]);
    }
    res.send(true);
  } catch (error) {
    console.error("❌ Failed to send mail:", error);
    res.send(false);
  }
});
