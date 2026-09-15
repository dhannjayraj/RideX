const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_SECURE === "true",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

//Welcome / Registration OTP Email

const sendWelcomeOtpEmail = async ({ to, otp }) => {
  const mailOptions = {
    from: `"RideX" <${process.env.EMAIL_USER}>`,

    to,

    subject: "Welcome to RideX 🚗 | Verify Your Email",

    text: `
Welcome to RideX!

We're excited to have you on board.

Your RideX verification code is: ${otp}

This code is valid for 5 minutes.

For your security, never share this code with anyone.

If you did not create a RideX account, you can safely ignore this email.

RideX Team
        `,

    html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>Welcome to RideX</title>
</head>

<body style="
    margin:0;
    padding:0;
    background:#f1f5f9;
    font-family:Arial,Helvetica,sans-serif;
">

<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="background:#f1f5f9;"
>
    <tr>
        <td align="center" style="padding:40px 15px;">

            <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                    max-width:600px;
                    background:#ffffff;
                    border-radius:18px;
                    overflow:hidden;
                    box-shadow:0 8px 30px rgba(15,23,42,0.08);
                "
            >

                <!-- HEADER -->

                <tr>
                    <td
                        align="center"
                        style="
                            padding:32px 20px;
                            background:#111827;
                        "
                    >

                        <div style="
                            font-size:30px;
                            font-weight:700;
                            color:#ffffff;
                            letter-spacing:1px;
                        ">
                            🚗 RideX
                        </div>

                        <div style="
                            margin-top:7px;
                            font-size:13px;
                            color:#cbd5e1;
                        ">
                            Move smarter. Ride better.
                        </div>

                    </td>
                </tr>


                <!-- CONTENT -->

                <tr>
                    <td style="padding:42px 35px;">

                        <div style="
                            text-align:center;
                            font-size:42px;
                            margin-bottom:15px;
                        ">
                            👋
                        </div>

                        <h1 style="
                            margin:0;
                            text-align:center;
                            color:#111827;
                            font-size:28px;
                            line-height:1.3;
                        ">
                            Welcome to RideX!
                        </h1>

                        <p style="
                            margin:14px 0 30px;
                            text-align:center;
                            color:#64748b;
                            font-size:15px;
                            line-height:1.7;
                        ">
                            Your journey starts here.
                            Verify your email address to complete
                            your RideX account setup.
                        </p>


                        <!-- OTP CARD -->

                        <div style="
                            background:#f8fafc;
                            border:1px solid #e2e8f0;
                            border-radius:14px;
                            padding:28px 20px;
                            text-align:center;
                        ">

                            <div style="
                                font-size:12px;
                                font-weight:700;
                                letter-spacing:2px;
                                color:#64748b;
                                margin-bottom:16px;
                            ">
                                YOUR VERIFICATION CODE
                            </div>

                            <div style="
                                display:inline-block;
                                background:#111827;
                                color:#ffffff;
                                padding:16px 28px;
                                border-radius:10px;
                                font-size:32px;
                                font-weight:700;
                                letter-spacing:8px;
                            ">
                                ${otp}
                            </div>

                            <div style="
                                margin-top:17px;
                                color:#ef4444;
                                font-size:13px;
                                font-weight:600;
                            ">
                                ⏱ Valid for 5 minutes
                            </div>

                        </div>


                        <!-- SECURITY -->

                        <div style="
                            margin-top:25px;
                            padding:17px;
                            background:#fff7ed;
                            border-left:4px solid #f97316;
                            border-radius:7px;
                        ">

                            <p style="
                                margin:0;
                                color:#7c2d12;
                                font-size:13px;
                                line-height:1.6;
                            ">
                                🔐
                                <strong>Security reminder:</strong>
                                Never share your verification code.
                                RideX will never ask you for your OTP.
                            </p>

                        </div>


                        <p style="
                            margin:28px 0 0;
                            text-align:center;
                            color:#94a3b8;
                            font-size:13px;
                            line-height:1.6;
                        ">
                            If you didn't create a RideX account,
                            you can safely ignore this email.
                        </p>

                    </td>
                </tr>


                <!-- FOOTER -->

                <tr>
                    <td
                        align="center"
                        style="
                            padding:25px 20px;
                            background:#f8fafc;
                            border-top:1px solid #e5e7eb;
                        "
                    >

                        <div style="
                            color:#334155;
                            font-size:14px;
                            font-weight:700;
                        ">
                            RideX Team ❤️
                        </div>

                        <div style="
                            margin-top:8px;
                            color:#94a3b8;
                            font-size:11px;
                            line-height:1.5;
                        ">
                            This is an automated email.
                            Please do not reply.
                        </div>

                        <div style="
                            margin-top:10px;
                            color:#cbd5e1;
                            font-size:11px;
                        ">
                            © ${new Date().getFullYear()} RideX
                        </div>

                    </td>
                </tr>

            </table>

        </td>
    </tr>
</table>

</body>
</html>
        `,
  };

  const info = await transporter.sendMail(mailOptions);

  console.log("Welcome OTP email sent:", info.messageId);

  return info;
};

// Resend OTP Email

const sendResendOtpEmail = async ({ to, otp }) => {
  const mailOptions = {
    from: `"RideX Security" <${process.env.EMAIL_USER}>`,

    to,

    subject: "RideX 🔐 | Your New Verification Code",

    text: `
Your new RideX verification code is: ${otp}

Your previous verification code is no longer valid.

This code is valid for 5 minutes.

For your security, never share this code with anyone.

If you did not request a new verification code, please secure your account.

RideX Security Team
        `,

    html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>Your New RideX Verification Code</title>
</head>

<body style="
    margin:0;
    padding:0;
    background:#f1f5f9;
    font-family:Arial,Helvetica,sans-serif;
">

<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="background:#f1f5f9;"
>
    <tr>
        <td align="center" style="padding:40px 15px;">

            <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                    max-width:600px;
                    background:#ffffff;
                    border-radius:18px;
                    overflow:hidden;
                    box-shadow:0 8px 30px rgba(15,23,42,0.08);
                "
            >

                <!-- HEADER -->

                <tr>
                    <td
                        align="center"
                        style="
                            padding:32px 20px;
                            background:#111827;
                        "
                    >

                        <div style="
                            font-size:30px;
                            font-weight:700;
                            color:#ffffff;
                            letter-spacing:1px;
                        ">
                            🚗 RideX
                        </div>

                        <div style="
                            margin-top:7px;
                            font-size:13px;
                            color:#cbd5e1;
                        ">
                            Account Security
                        </div>

                    </td>
                </tr>


                <!-- CONTENT -->

                <tr>
                    <td style="padding:42px 35px;">

                        <div style="
                            text-align:center;
                            font-size:40px;
                            margin-bottom:15px;
                        ">
                            🔐
                        </div>

                        <h1 style="
                            margin:0;
                            text-align:center;
                            color:#111827;
                            font-size:26px;
                            line-height:1.3;
                        ">
                            Your New Verification Code
                        </h1>

                        <p style="
                            margin:14px 0 30px;
                            text-align:center;
                            color:#64748b;
                            font-size:15px;
                            line-height:1.7;
                        ">
                            You requested a new verification code
                            for your RideX account.
                        </p>


                        <!-- IMPORTANT NOTICE -->

                        <div style="
                            margin-bottom:20px;
                            padding:14px 16px;
                            background:#eff6ff;
                            border:1px solid #dbeafe;
                            border-radius:9px;
                            text-align:center;
                        ">

                            <p style="
                                margin:0;
                                color:#1e40af;
                                font-size:13px;
                                line-height:1.5;
                            ">
                                ℹ️ Your previous OTP is no longer valid.
                            </p>

                        </div>


                        <!-- OTP CARD -->

                        <div style="
                            background:#f8fafc;
                            border:1px solid #e2e8f0;
                            border-radius:14px;
                            padding:28px 20px;
                            text-align:center;
                        ">

                            <div style="
                                font-size:12px;
                                font-weight:700;
                                letter-spacing:2px;
                                color:#64748b;
                                margin-bottom:16px;
                            ">
                                NEW VERIFICATION CODE
                            </div>

                            <div style="
                                display:inline-block;
                                background:#111827;
                                color:#ffffff;
                                padding:16px 28px;
                                border-radius:10px;
                                font-size:32px;
                                font-weight:700;
                                letter-spacing:8px;
                            ">
                                ${otp}
                            </div>

                            <div style="
                                margin-top:17px;
                                color:#ef4444;
                                font-size:13px;
                                font-weight:600;
                            ">
                                ⏱ Valid for 5 minutes
                            </div>

                        </div>


                        <!-- SECURITY -->

                        <div style="
                            margin-top:25px;
                            padding:17px;
                            background:#fef2f2;
                            border-left:4px solid #ef4444;
                            border-radius:7px;
                        ">

                            <p style="
                                margin:0;
                                color:#991b1b;
                                font-size:13px;
                                line-height:1.6;
                            ">
                                🛡️
                                <strong>Didn't request this?</strong>
                                If you didn't request a new verification
                                code, please ignore this email and make
                                sure your account credentials are secure.
                            </p>

                        </div>


                        <p style="
                            margin:28px 0 0;
                            text-align:center;
                            color:#94a3b8;
                            font-size:13px;
                            line-height:1.6;
                        ">
                            Never share this code with anyone,
                            including RideX support.
                        </p>

                    </td>
                </tr>


                <!-- FOOTER -->

                <tr>
                    <td
                        align="center"
                        style="
                            padding:25px 20px;
                            background:#f8fafc;
                            border-top:1px solid #e5e7eb;
                        "
                    >

                        <div style="
                            color:#334155;
                            font-size:14px;
                            font-weight:700;
                        ">
                            RideX Security Team 🛡️
                        </div>

                        <div style="
                            margin-top:8px;
                            color:#94a3b8;
                            font-size:11px;
                            line-height:1.5;
                        ">
                            This is an automated security email.
                            Please do not reply.
                        </div>

                        <div style="
                            margin-top:10px;
                            color:#cbd5e1;
                            font-size:11px;
                        ">
                            © ${new Date().getFullYear()} RideX
                        </div>

                    </td>
                </tr>

            </table>

        </td>
    </tr>
</table>

</body>
</html>
        `,
  };

  const info = await transporter.sendMail(mailOptions);

  console.log("Resend OTP email sent:", info.messageId);

  return info;
};

module.exports = {
  sendWelcomeOtpEmail,
  sendResendOtpEmail,
};
