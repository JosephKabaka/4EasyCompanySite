const express = require("express");
const nodemailer = require("nodemailer");
const path = require("path");
require("dotenv").config();
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, "public")));

// Configure Nodemailer Transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Contact Form Submission Route
app.post("/api/contact", async (req, res) => {
  const { name, countryCode, phone, email } = req.body;

  if (!name || !phone || !email) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required." });
  }

  try {
    // 1. Email to the Customer (Confirmation & Welcome)
    const customerMailOptions = {
      from: `"4easy Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Welcome to 4easy - We received your request!",
      html: `
                <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
                    <h2 style="color: #2563eb;">Hi ${name},</h2>
                    <p>Thank you for reaching out to <strong>4easy</strong>! We have received your inquiry.</p>
                    <p>Our team is reviewing your details and will get back to you shortly to help you get started with our POS or trainer website solutions.</p>
                    <br>
                    <p>Best regards,</p>
                    <p><strong>The 4easy Team</strong><br><em>Software that makes your life easy.</em></p>
                </div>
            `,
    };

    // 2. Email to Your Team (New Lead Alert)
    const teamMailOptions = {
      from: `"4easy Website Lead" <${process.env.EMAIL_USER}>`,
      to: process.env.TEAM_EMAIL,
      subject: `🚀 New Lead: ${name} contacted 4easy`,
      html: `
                <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
                    <h2 style="color: #2563eb;">New Customer Inquiry</h2>
                    <p>You have a new submission from your website contact form:</p>
                    <ul style="list-style: none; padding: 0;">
                        <li><strong>Name:</strong> ${name}</li>
                        <li><strong>Phone:</strong> ${countryCode} ${phone}</li>
                        <li><strong>Email:</strong> ${email}</li>
                    </ul>
                    <p>Follow up with them as soon as possible!</p>
                </div>
            `,
    };

    // Send both emails concurrently
    await Promise.all([
      transporter.sendMail(customerMailOptions),
      transporter.sendMail(teamMailOptions),
    ]);

    res
      .status(200)
      .json({ success: true, message: "Emails sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send email. Please try again later.",
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running smoothly at http://localhost:${PORT}`);
});
