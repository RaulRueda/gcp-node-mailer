// Firebase Config
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as express from "express";
import * as cors from "cors";
import * as nodemailer from "nodemailer";

admin.initializeApp();

const app = express();

app.use(cors({ origin: true }));

app.get("/sendMail", async (request, response) => {
  const config = functions.config();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: config.mailer.user,
      pass: config.mailer.pass,
    },
  });

  const mailOptions = {
    from: '"Raul Rueda 🤠" <raul.rueda@regiosdigitales.com>',
    to: "raulruedabarajas@hotmail.com",
    subject: "Node Mailer Test",
    html: "<p>Hello world from google functions</p>",
  };

  let send_mail = await transporter.sendMail(mailOptions);

  console.log("send_mail : ", send_mail);

  response.status(200).send({
    status: true,
    code: 200,
    message: "Success",
    internal_message: "Success",
  });
});

export const api = functions.https.onRequest(app);
