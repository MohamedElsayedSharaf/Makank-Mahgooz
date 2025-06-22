import nodemailer from "nodemailer";

// Nodemailer
const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT, // if secure false port = 587, if true port= 465
    secure: true,
    auth: {
      user: "goat1357900@gmail.com",
      pass: "yjww xsis mrrk zdke",
    },
  });

  const mailOpts = {
    from: "Makanak Mahgooz <goat135700@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOpts);
};

export default sendEmail;
