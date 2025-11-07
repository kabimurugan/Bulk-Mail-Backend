const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const nodemailer = require("nodemailer")

const app = express()

app.use(express.json())
app.use(cors())

app.listen(5000, () => console.log("server started..."))



//Project Start Point
mongoose.connect("mongodb+srv://kabimurugan:kabilan2005@cluster0.gatsi1v.mongodb.net/mail?appName=Cluster0").then(() => console.log("DB Connected")).catch(() => console.log("Failed To DB Connect"))

const dbMail = mongoose.model("mails", {}, "mails")


//create api for send mail

app.post("/sendmail", (req, res) => {

    var msg = req.body.msg
    var emailLists = req.body.emailLists


    dbMail.find().then((data) => {
        const transporter = nodemailer.createTransport(

            {
                service: "gmail",
                auth: {
                    user: data[0].toJSON().user,
                    pass: data[0].toJSON().pass
                }
            }
        )
        
        console.log(data[0].toJSON().user)
        
        new Promise(async function (resolve, reject) {

            try {
                for (let i = 0; i < emailLists.length; i++) {
                    await transporter.sendMail(
                        {
                            from: "kabimurugan8@gmail.com",
                            to: emailLists[i],
                            subject: "Hi, I'm from Bulk-Mail project",
                            text: msg
                        }
                    )
                    console.log("mail sent to : " + emailLists[i])
                }

                resolve()
            }
            catch (error) {
                reject()
            }

        }).then(()=> res.send(true)).catch(()=> res.send(false))


    }).catch(() => {
        console.log("Data not Fetched")
        res.send(false)  // db la irunthu value varalanahh
      })
})