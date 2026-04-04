"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
<<<<<<< HEAD
import { ThemeProvider } from "@/components/theme-provider";
=======
>>>>>>> 6562c65 (Fixing All The Problems & Adding The Exception Handling)
import { signIn } from 'next-auth/react';
import { useToast } from "@/hooks/use-toast";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  isSignUp?: boolean;
}

export function UserAuthForm({ className, isSignUp = false, ...props }: UserAuthFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
<<<<<<< HEAD
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [mobile, setMobile] = React.useState('');
  const [error, setError] = React.useState('');
  const {toast} = useToast()
=======
  const [isGoogleLoading, setIsGoogleLoading] = React.useState<boolean>(false);
  const [isGitHubLoading, setIsGitHubLoading] = React.useState<boolean>(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [error, setError] = React.useState('');
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const { toast } = useToast()

  // Validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!email || email.trim() === '') {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Invalid email format';
    }

    if (!password || password.trim() === '') {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (isSignUp) {
      if (!name || name.trim() === '') {
        errors.name = 'Name is required';
      }
      if (!confirmPassword || confirmPassword.trim() === '') {
        errors.confirmPassword = 'Please confirm your password';
      } else if (password !== confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };
>>>>>>> 6562c65 (Fixing All The Problems & Adding The Exception Handling)

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    setError('');
<<<<<<< HEAD
=======

    if (!validateForm()) {
      return;
    }

>>>>>>> 6562c65 (Fixing All The Problems & Adding The Exception Handling)
    setIsLoading(true);

    try {
      if (isSignUp) {
        // Signup
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
<<<<<<< HEAD
          body: JSON.stringify({ email, password, name, mobile }),
=======
          body: JSON.stringify({ 
            email: email.toLowerCase().trim(), 
            password, 
            name: name.trim() 
          }),
>>>>>>> 6562c65 (Fixing All The Problems & Adding The Exception Handling)
        });

        const data = await res.json();

        if (!res.ok) {
<<<<<<< HEAD
          setError(data.error || 'Registration failed');
=======
          setError(data.message || data.error || 'Registration failed');
>>>>>>> 6562c65 (Fixing All The Problems & Adding The Exception Handling)
          setIsLoading(false);
          return;
        }

        toast({
          title: 'Success',
          description: 'Account created. Redirecting to login...',
        });

        // Clear form
        setEmail('');
        setPassword('');
<<<<<<< HEAD
=======
        setConfirmPassword('');
        setName('');
        setIsLoading(false);

        // Replace history and redirect
        setTimeout(() => {
          router.replace('/login');
        }, 1000);
      } else {
        // Login with credentials
        const result = await signIn('credentials', {
          email: email.toLowerCase().trim(),
          password,
          redirect: false,
        });

        if (!result?.ok) {
          const errorMsg = result?.error || 'Invalid email or password';
          setError(errorMsg);
          setIsLoading(false);
          return;
        }

        toast({
          title: 'Success',
          description: 'Logged in successfully. Redirecting...',
        });

        // Clear form
        setEmail('');
        setPassword('');
        setName('');
        setIsLoading(false);

        // Replace history and redirect to onboard
        setTimeout(() => {
          router.replace('/onboard');
        }, 500);
      }
    } catch (error: any) {
      console.error('[AUTH_ERROR]', error);
      const errorMessage = error?.message || 'An error occurred. Please try again.';
      setError(errorMessage);
      setIsLoading(false);
    }
  }

  const loginWithGoogle = async () => {
    setIsGoogleLoading(true);
    setError('');

    try {
      const result = await signIn('google', {
        redirect: false,
      });

      if (!result?.ok) {
        setError(result?.error || 'Failed to sign in with Google');
        setIsGoogleLoading(false);
        return;
      }

      toast({
        title: 'Success',
        description: 'Signed in with Google. Redirecting...',
      });

      setTimeout(() => {
        router.replace('/onboard');
      }, 500);
    } catch (error) {
      console.error('[GOOGLE_AUTH_ERROR]', error);
      toast({
        title: 'Error',
        description: 'There was an error logging in with Google',
        variant: 'destructive',
      });
      setIsGoogleLoading(false);
    }
  };

  const loginWithGitHub = async () => {
    setIsGitHubLoading(true);
    setError('');

    try {
      const result = await signIn('github', {
        redirect: false,
      });

      if (!result?.ok) {
        setError(result?.error || 'Failed to sign in with GitHub');
        setIsGitHubLoading(false);
        return;
      }

      toast({
        title: 'Success',
        description: 'Signed in with GitHub. Redirecting...',
      });

      setTimeout(() => {
        router.replace('/onboard');
      }, 500);
    } catch (error) {
      console.error('[GITHUB_AUTH_ERROR]', error);
      toast({
        title: 'Error',
        description: 'There was an error logging in with GitHub',
        variant: 'destructive',
      });
      setIsGitHubLoading(false);
    }
  };

  const isFormLoading = isLoading || isGoogleLoading || isGitHubLoading;

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form onSubmit={onSubmit}>
        <div className="grid gap-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 border border-red-200">
              <p className="text-sm text-red-800 font-medium">{error}</p>
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
                disabled={isFormLoading}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (fieldErrors.name) {
                    setFieldErrors({ ...fieldErrors, name: '' });
                  }
                }}
                aria-invalid={!!fieldErrors.name}
              />
              {fieldErrors.name && (
                <p className="text-xs text-red-600">{fieldErrors.name}</p>
              )}
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
              disabled={isFormLoading}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) {
                  setFieldErrors({ ...fieldErrors, email: '' });
                }
              }}
              aria-invalid={!!fieldErrors.email}
            />
            {fieldErrors.email && (
              <p className="text-xs text-red-600">{fieldErrors.email}</p>
            )}
          </div>

          <div className="grid gap-1">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              placeholder="••••••••"
              type="password"
              autoCapitalize="none"
              autoComplete={isSignUp ? "new-password" : "current-password"}
              disabled={isFormLoading}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) {
                  setFieldErrors({ ...fieldErrors, password: '' });
                }
              }}
              aria-invalid={!!fieldErrors.password}
            />
            {fieldErrors.password && (
              <p className="text-xs text-red-600">{fieldErrors.password}</p>
            )}
          </div>

          {isSignUp && (
            <div className="grid gap-1">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                placeholder="••••••••"
                type="password"
                disabled={isFormLoading}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (fieldErrors.confirmPassword) {
                    setFieldErrors({ ...fieldErrors, confirmPassword: '' });
                  }
                }}
                aria-invalid={!!fieldErrors.confirmPassword}
              />
              {fieldErrors.confirmPassword && (
                <p className="text-xs text-red-600">{fieldErrors.confirmPassword}</p>
              )}
            </div>
          )}

          <Button 
            disabled={isFormLoading} 
            className="w-full"
            type="submit"
          >
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
        <Button 
          onClick={loginWithGoogle} 
          variant="outline" 
          type="button" 
          disabled={isFormLoading}
        >
          {isGoogleLoading ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Icons.google className="mr-2 h-4 w-4" />
          )}
          Google
        </Button>
        <Button 
          onClick={loginWithGitHub} 
          variant="outline" 
          type="button" 
          disabled={isFormLoading}
        >
          {isGitHubLoading ? (
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

        toast({
          title: 'Success',
          description: 'Account created. Redirecting to login...',
        });

        // Clear form
        setEmail('');
        setPassword('');
>>>>>>> 6562c65 (Fixing All The Problems & Adding The Exception Handling)
        setName('');
        setMobile('');
        setIsLoading(false);

        // Replace history and redirect
        router.replace('/login');
      } else {
        // Login
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });

        if (!result?.ok) {
          const errorMsg = result?.error || 'Invalid email or password';
          
          // Check if it's an OAuth-only account error
          if (errorMsg.includes('OAuth') || errorMsg.includes('Google') || errorMsg.includes('GitHub')) {
            setError(`${errorMsg}. Try using the Google or GitHub login button below.`);
          } else {
            setError(errorMsg);
          }
          
          setIsLoading(false);
          return;
        }

        toast({
          title: 'Success',
          description: 'Logged in successfully',
        });

        // Clear form
        setEmail('');
        setPassword('');
        setName('');
        setMobile('');
        setIsLoading(false);

        // Replace history and redirect to onboard
        setTimeout(() => {
          router.replace('/onboard');
        }, 500);
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
