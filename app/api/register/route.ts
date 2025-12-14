import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import * as z from "zod"
import { sendVerificationEmail, generateOTP } from "@/lib/email"

const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, name, password } = userSchema.parse(body)

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      if (existingUser.emailVerified) {
        return NextResponse.json(
          { user: null, message: "User with this email already exists" },
          { status: 409 }
        )
      }
      // Delete unverified user to allow re-registration
      await prisma.user.delete({ where: { email } })
    }

    // Delete any existing verification tokens for this email
    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    })

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        emailVerified: null,
      },
    })

    // Generate OTP and store in verification token
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

    const { password: newUserPassword, ...rest } = newUser

    return NextResponse.json(
      { 
        user: rest, 
        message: "Verification code sent to your email",
        requiresVerification: true 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
}
