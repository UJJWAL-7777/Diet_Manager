import express from "express";
import nodemailer from "nodemailer";

const router = express.Router();

router.post("/send-mail", async (req, res) => {
    const { name, email, message } = req.body;

    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,  // store in .env
                pass: process.env.EMAIL_PASS,  // store in .env
            },
        });

        await transporter.sendMail({
            from: email,
            to: process.env.EMAIL_USER,
            subject: "New Contact Form Message",
            html: `
                <h3>New Feedback</h3>
                <p><b>Name:</b> ${name}</p>
                <p><b>Email:</b> ${email}</p>
                <p><b>Message:</b> ${message}</p>
            `,
        });

        res.json({ success: true, message: "Mail sent successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Error Sending Mail" });
    }
});

export default router;
