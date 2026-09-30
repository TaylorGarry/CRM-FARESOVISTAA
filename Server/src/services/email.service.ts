import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  cc?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
      throw new Error('SMTP_HOST, SMTP_USER and SMTP_PASS are required');
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });

    await transporter.sendMail({
      from: user,
      to: options.to,
      cc: options.cc,
      subject: options.subject,
      html: options.html,
    });
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};

// PHP: Exact email HTML from forgot_password.php
export const buildResetEmail = (email: string, code: string, link: string): string => {
  return `<!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.0 Transitional//EN' 'http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd'>
<html xmlns='http://www.w3.org/1999/xhtml'>
<head>
<meta http-equiv='Content-Type' content='text/html; charset=UTF-8' />
<title>Change Your Password</title>
<style>
table.inner, table.inner td, table.inner tr {
  border:1px solid rgb(125, 125, 125);
  border-collapse: collapse;
}
</style>
</head>
<body style='font-size:13px; margin:0px; padding:0px;background:#d5d5d5; color:rgb(125, 125, 125); font-family:Arial, Helvetica, sans-serif;'>
<table width='600' cellspacing='0' cellpadding='0' align='center' bgcolor='#fbfcff' style='border:1px solid #f8f8f6; padding:10px;'>
  <tr>
    <td width='60'>&nbsp;</td>
    <td width='60'>&nbsp;</td>
    <td width='60'>&nbsp;</td>
    <td width='60'>&nbsp;</td>
    <td width='60'>&nbsp;</td>
    <td width='60'>&nbsp;</td>
    <td width='60'>&nbsp;</td>
    <td width='60'>&nbsp;</td>
    <td width='60'>&nbsp;</td>
    <td width='60'>&nbsp;</td>
  </tr>
  <tr>
    <td colspan='5' align='left' bgcolor='#033763'>
      <a href='https://softwarexprtsservices.online/PFB_CRM' target='_BLANK'>
        <img src='http://visastation.in/img/logo-images/4logo.png' height='50'/>
      </a>
    </td>
    <td colspan='5' align='right'>
      <span style='margin:0px;font-size:13px;color:#7d7d7d;'>One Time Password : ${code}</span><br>
      <span style='margin:0px;font-size:13px;color:#7d7d7d;'>${email}</span>
    </td>
  </tr>
  <tr>
    <td colspan='10' height='10px'></td>
  </tr>
  <tr>
    <td colspan='10' style='border-bottom:1px solid #333;'></td>
  </tr>
  <tr>
    <td colspan='10' height='20px'></td>
  </tr>
  <tr>
    <td colspan='10' align='left'>
      <span style='margin:0px;font-size:14px; color:rgb(99, 96, 96)'>
        <b><a href='${link}'>${email}</a></b>
      </span><br /><br />
    </td>
  </tr>
  <tr>
    <td colspan='10' height='10px'></td>
  </tr>
  <td colspan='10'>
    <table class='inner' cellpadding='5' width='100%'>
      <tr style='display:none;'>
        <td width='60' height='0px'></td>
        <td width='60' height='0px'></td>
        <td width='60' height='0px'></td>
        <td width='60' height='0px'></td>
        <td width='60' height='0px'></td>
        <td width='60' height='0px'></td>
        <td width='60' height='0px'></td>
        <td width='60' height='0px'></td>
        <td width='60' height='0px'></td>
        <td width='60' height='0px'></td>
      </tr>
      <tr>
        <td colspan='6' valign='top'><b>Email:</b></td>
        <td colspan='6' valign='top'>${email}</td>
      </tr>
    </table>
  </td>
</table>
</body>
</html>`;
};
