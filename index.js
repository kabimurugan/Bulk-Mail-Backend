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

const dbMail = mongoose.model("mails", {}, "mails");

// ✅ Create API for sending mail
app.post("/sendmail", (req, res) => {
    const msg = req.body.msg;
    const emailLists = req.body.emailLists;

    console.log("Message:", msg);
    console.log("Email List:", emailLists);

    dbMail
        .find()
        .then((data) => {
            if (!data || data.length === 0) {
                console.log("❌ No Gmail credentials found in DB");
                return res.send(false);
            }

            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: data[0].toJSON().user,
                    pass: data[0].toJSON().pass,
                },
            });

            console.log("Using Gmail account:", data[0].toJSON().user);

            // ✅ Use Promise for mail sending
            new Promise(async (resolve, reject) => {
                try {
                    for (let i = 0; i < emailLists.length; i++) {
                        await transporter.sendMail({
                            from: data[0].toJSON().user,
                            to: emailLists[i],
                            subject: "Hi, I'm from Bulk-Mail project",
                            text: msg,
                        });
                        console.log("Mail sent to:", emailLists[i]);
                    }
                    resolve();
                } catch (error) {
                    console.error("❌ Mail sending failed:", error);
                    reject();
                }
            })
                .then(() => res.send(true))
                .catch(() => res.send(false));
        })
        .catch(() => {
            console.log("❌ Data not fetched from DB");
            res.send(false);
        });
});
