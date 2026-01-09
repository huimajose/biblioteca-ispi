"use server";
import * as nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER || "badsoftwareengineers@gmail.com",
    pass: process.env.EMAIL_PASS || "qqkm lbcl wwbq cpbw",
  },
});

// async..await is not allowed in global scope, must use a wrapper
export default async function main(email: string, content: string) {
  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: "Biblioteca Digital - ISPI", // sender address
    to: email, // list of receivers
    subject: "Olá ✔", // Subject line
    text: content, // plain text body
    html: content, // html body
  });

  console.log("Mensagem enviada: %s", info.messageId);
  // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
}
