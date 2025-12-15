import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

export async function sendVerificationEmail(email: string, otp: string) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "ContestTracker - Email Verification",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Verify Your Email</h2>
        <p>Thank you for registering with ContestTracker!</p>
        <p>Your verification code is:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #333;">${otp}</span>
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this verification, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">ContestTracker - Never miss a programming contest</p>
      </div>
    `,
  }

  await transporter.sendMail(mailOptions)
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

interface ContestReminderData {
  contestName: string
  contestPlatform: string
  contestUrl: string
  contestStartTime: Date
  userName?: string
}

export async function sendContestReminderEmail(email: string, data: ContestReminderData) {
  const startTime = new Date(data.contestStartTime)
  const formattedDate = startTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const formattedTime = startTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  })

  const platformColors: Record<string, string> = {
    codeforces: '#1890ff',
    leetcode: '#ffa116',
    codechef: '#5b4638',
    hackerrank: '#00ea64',
    hackerearth: '#2c3454',
    atcoder: '#222222',
  }

  const platformColor = platformColors[data.contestPlatform.toLowerCase()] || '#6366f1'

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `🔔 Reminder: ${data.contestName} starts in 1 hour!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background: linear-gradient(135deg, ${platformColor} 0%, ${platformColor}dd 100%); padding: 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🏆 Contest Reminder</h1>
        </div>
        
        <div style="padding: 30px;">
          <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
            Hi${data.userName ? ` ${data.userName}` : ''}! 👋
          </p>
          
          <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
            This is a friendly reminder that a contest you registered for is starting in <strong>1 hour</strong>!
          </p>
          
          <div style="background-color: #f8f9fa; border-left: 4px solid ${platformColor}; padding: 20px; margin: 20px 0; border-radius: 4px;">
            <h2 style="color: #333; margin: 0 0 10px 0; font-size: 20px;">${data.contestName}</h2>
            <p style="color: #666; margin: 5px 0;">
              <strong>Platform:</strong> ${data.contestPlatform.charAt(0).toUpperCase() + data.contestPlatform.slice(1)}
            </p>
            <p style="color: #666; margin: 5px 0;">
              <strong>Date:</strong> ${formattedDate}
            </p>
            <p style="color: #666; margin: 5px 0;">
              <strong>Time:</strong> ${formattedTime}
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.contestUrl}" 
               style="background-color: ${platformColor}; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Go to Contest →
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 20px;">
            Good luck! 🍀 May your code compile on the first try!
          </p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 0;">
        
        <div style="padding: 20px; text-align: center; background-color: #f8f9fa;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            You received this email because you set up a notification for this contest on ContestTracker.
          </p>
          <p style="color: #999; font-size: 12px; margin: 10px 0 0 0;">
            ContestTracker - Never miss a programming contest 🎯
          </p>
        </div>
      </div>
    `,
  }

  await transporter.sendMail(mailOptions)
}
