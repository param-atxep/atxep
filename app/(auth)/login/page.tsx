"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/more-icons"
import { UserAuthForm } from "@/components/user-auth-form"

export default function LoginPage() {
  const router = useRouter()

  const handleBack = () => {
    router.back()
  }

  return (
    <>
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <button
        onClick={handleBack}
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "absolute left-4 top-4 md:left-8 md:top-8"
        )}
      >
        <>
          <Icons.chevronLeft className="mr-2 h-4 w-4" />
          Back
        </>
      </button>
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <Icons.logo className="mx-auto h-6 w-6" />
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome to ALTFaze
          </h1>
          {/* <p className="text-sm text-muted-foreground">
            Enter your email to sign in to your account
          </p> */}
        </div>
        <UserAuthForm />
        <p className="px-8 text-center text-sm text-muted-foreground">
          <Link
            href="/register"
            className="hover:text-brand underline underline-offset-4"
          >
            Don&apos;t have an account? Sign Up
          </Link>
        </p>
      </div>
    </div>
    </>
  )
}