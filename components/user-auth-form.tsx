"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeProvider } from "@/components/theme-provider";
import { signIn } from 'next-auth/react';
import { useToast } from "@/hooks/use-toast";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  isSignUp?: boolean;
}

export function UserAuthForm({ className, isSignUp = false, ...props }: UserAuthFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [mobile, setMobile] = React.useState('');
  const [error, setError] = React.useState('');
  const {toast} = useToast()

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isSignUp) {
        // Signup
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name, mobile }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Registration failed');
          setIsLoading(false);
          return;
        }

        toast({
          title: 'Success',
          description: 'Account created. Redirecting to login...',
        });

        setTimeout(() => {
          router.push('/login');
        }, 1000);
      } else {
        // Login
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });

        if (!result?.ok) {
          setError(result?.error || 'Invalid email or password');
          setIsLoading(false);
          return;
        }

        toast({
          title: 'Success',
          description: 'Logged in successfully',
        });

        router.push('/onboard');
      }
    } catch (error: any) {
      console.error('[AUTH_ERROR]', error);
      const errorMessage = error?.message || 'An error occurred. Please try again.';
      setError(errorMessage);
      setIsLoading(false);
    }
  }

  const loginWithGoogle = async () => {
    setIsLoading(true);

    try {
      await signIn('google')
    } catch(error) {
      toast({
        title: 'There was a problem.',
        description: 'There was an error logging in with Google',
        variant: 'destructive',
      })
      setIsLoading(false)
    }
  }

  const loginWithGitHub = async () => {
    setIsLoading(true);

    try {
      await signIn('github')
    } catch(error) {
      toast({
        title: 'There was a problem.',
        description: 'There was an error logging in with GitHub',
        variant: 'destructive',
      })
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form onSubmit={onSubmit}>
        <div className="grid gap-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          
          {isSignUp && (
            <div className="grid gap-1">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                type="text"
                autoCapitalize="words"
                disabled={isLoading}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="grid gap-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-1">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              placeholder="••••••••"
              type="password"
              autoCapitalize="none"
              autoComplete={isSignUp ? "new-password" : "current-password"}
              disabled={isLoading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {isSignUp && (
            <div className="grid gap-1">
              <Label htmlFor="mobile">Mobile Number (Optional)</Label>
              <Input
                id="mobile"
                placeholder="+1 (555) 000-0000"
                type="tel"
                disabled={isLoading}
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
              />
            </div>
          )}

          <Button disabled={isLoading} className="w-full">
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isSignUp ? 'Create Account' : 'Sign In'}
          </Button>
        </div>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            or continue with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button onClick={loginWithGoogle} variant="outline" type="button" disabled={isLoading}>
          {isLoading ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Icons.google className="mr-2 h-4 w-4" />
          )}
          Google
        </Button>
        <Button onClick={loginWithGitHub} variant="outline" type="button" disabled={isLoading}>
          {isLoading ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Icons.gitHub className="mr-2 h-4 w-4" />
          )}
          GitHub
        </Button>
      </div>
    </div>
  );
}
