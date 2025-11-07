const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const nodemailer = require("nodemailer")

const app = express()

app.use(express.json())
app.use(cors())

app.listen(process.env.PORT || 5000, () => console.log("server started..."))


//Project Start Point
mongoose.connect("mongodb+srv://kabimurugan:kabilan2005@cluster0.gatsi1v.mongodb.net/mail?appName=Cluster0").then(() => console.log("DB Connected")).catch(() => console.log("Failed To DB Connect"))

const dbMail = mongoose.model("mails", {}, "mails")


//create api for send mail

app.post("/sendmail", async (req, res) => {
  const msg = req.body.msg;
  const emailLists = req.body.emailLists;

  console.log("Incoming request:");
  console.log("Message:", msg);
  console.log("Email list:", emailLists);

  try {
    const data = await dbMail.find();
    if (!data || data.length === 0) {
      console.log("❌ No credentials found in MongoDB");
      return res.send(false);
    }

    const user = data[0].user;
    const pass = data[0].pass;

    console.log("✅ Credentials fetched:", user);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass }
    });

    for (let i = 0; i < emailLists.length; i++) {
      try {
        await transporter.sendMail({
          from: user,
          to: emailLists[i],
          subject: "Hi, I'm from Bulk-Mail project",
          text: msg
        });
        console.log("✅ Mail sent to:", emailLists[i]);
      } catch (mailError) {
        console.log("❌ Failed to send to:", emailLists[i], mailError);
        return res.send(false);
      }
    }

    res.send(true);
  } catch (error) {
    console.log("❌ General error:", error);
    res.send(false);
  }
});