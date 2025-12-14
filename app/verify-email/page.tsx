"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { useToast } from "@/hooks/use-toast"

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email")
  const { toast } = useToast()
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (!email) {
      router.push("/register")
    }
  }, [email, router])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter a valid 6-digit code",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Email verified successfully! Please login.",
        })
        router.push("/login")
      } else {
        toast({
          title: "Error",
          description: data.message || "Verification failed",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    setIsResending(true)
    try {
      const response = await fetch("/api/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Verification code sent to your email",
        })
        setCountdown(60) // 60 second cooldown
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to resend code",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsResending(false)
    }
  }

  if (!email) {
    return null
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-8 border rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Verify your email</h2>
          <p className="text-sm text-muted-foreground mt-2">
            We&apos;ve sent a verification code to
          </p>
          <p className="text-sm font-medium mt-1">{email}</p>
        </div>

        <div className="flex flex-col items-center space-y-6">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={(value) => setOtp(value)}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>

          <Button
            className="w-full"
            onClick={handleVerify}
            disabled={isLoading || otp.length !== 6}
          >
            {isLoading ? "Verifying..." : "Verify Email"}
          </Button>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">
              Didn&apos;t receive the code?{" "}
            </span>
            <Button
              variant="link"
              className="p-0 h-auto"
              onClick={handleResend}
              disabled={isResending || countdown > 0}
            >
              {countdown > 0 ? `Resend in ${countdown}s` : "Resend"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
