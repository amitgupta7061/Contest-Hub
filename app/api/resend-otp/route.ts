import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendVerificationEmail, generateOTP } from "@/lib/email"
import * as z from "zod"

const resendSchema = z.object({
  email: z.string().email(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email } = resendSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      )
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { message: "Email is already verified" },
        { status: 400 }
      )
    }

    // Delete any existing verification tokens for this email
    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    })

    // Generate new OTP
    const otp = generateOTP()
    const expires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: otp,
        expires,
      },
    })

    // Send verification email
    await sendVerificationEmail(email, otp)

    return NextResponse.json(
      { message: "Verification code sent" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Resend OTP error:", error)
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
}
