// Libraries
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as express from "express";
import * as cors from "cors";
import * as nodemailer from "nodemailer";

//Models
import { verifyToken } from "./models/recaptcha";

//Controllers
import { getTenant, getTenantTemplateConfig } from "./controllers/tenants";
import { getTemplate } from "./controllers/template";

//Config
import config from "./config";

admin.initializeApp();

const app = express();

const originValidation = async (req: any, res: any, next: Function) => {
  const header_origin = req.headers.origin ?? "Unknow";
  const tenant_id = req.body.tenant_id ? req.body.tenant_id : null;

  const tenant: any = await getTenant(tenant_id);

  if (!(tenant && header_origin.includes(tenant.domain)) && !header_origin.includes(config.dev_domain)) {
    console.log(`Origin '${header_origin}' is trying to execute sendMail`);

    return res.status(400).send({
      status: false,
      code: 400,
      message: "Unauthorized",
      internal_message: "You are trying to execute this endpoint from an invalid host",
    });
  }

  next();
};

app.use(cors({ origin: true }));

app.use(originValidation);

app.post("/sendMail", async (req, res, next) => {
  try {
    const form_data = req.body.data;
    const tenant_id = req.body.tenant_id ? req.body.tenant_id : "";
    const template_id = req.body.template_id ? req.body.template_id : "";
    const token = req.body.token;

    const transporter = nodemailer.createTransport(config.mailer);

    const template_config: any = await getTenantTemplateConfig(tenant_id, template_id);

    if (!template_config) {
      res.status(400).end({
        status: false,
        code: 400,
        message: "Invalid request",
        internal_message: "Error finding this template",
      });

      next();
    }

    const template_html: any = await getTemplate(form_data, template_config);

    const validRecaptcha: any = await verifyToken(template_config.recaptcha_secret, token);

    if (validRecaptcha.success) {
      const mailOptions = {
        from: '"No-Reply" <noreply@regiosdigitales.com>',
        to: template_config.to_email,
        subject: template_config.email_subject + form_data.name,
        html: template_html,
      };

      const send_mail = await transporter.sendMail(mailOptions);

      console.log("messageId : ", send_mail.messageId);

      res.status(200).send({
        status: true,
        code: 200,
        message: "Success",
        internal_message: "Success",
      });
    } else {
      res.status(400).send({
        status: false,
        code: 400,
        message: "Invalid recaptcha",
        internal_message: "Error no valid recaptcha",
      });
    }
  } catch (error) {
    console.log("System Error: ", error);

    res.status(500).send({
      status: false,
      code: 500,
      message: "Internal error",
      internal_message: "Internal error",
    });
  }
});

export const api = functions.https.onRequest(app);
