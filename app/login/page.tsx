/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useActionState, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, LogIn } from "lucide-react";
import toast from "react-hot-toast";
import { login } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [state, action, pending] = useActionState(login, null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!state) return;
    if (state.success) {
      toast.success("Welcome back!");
      router.push("/dashboard");
    } else {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-background">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative z-10 w-full max-w-100">
        {/* Card */}
        <div className="rounded-2xl border border-border bg-card shadow-xl shadow-black/5 dark:shadow-black/30 overflow-hidden">

          {/* Top accent strip */}
          <div className="h-1.5 w-full bg-linear-to-r from-primary/60 via-primary to-primary/60" />

          <div className="px-8 py-8 space-y-7">
            {/* Logo + title */}
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-xl border border-border bg-background p-2.5 shadow-sm">
                <Image
                  src="/gailogo.png"
                  alt="GAI Logo"
                  width={56}
                  height={56}
                  className="rounded-lg object-contain"
                />
              </div>
              <div className="text-center space-y-0.5">
                <h1 className="text-xl font-bold tracking-tight">
                  Graphic Arts Institute
                </h1>
                <p className="text-sm text-muted-foreground">Seat Planner Admin Portal</p>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Form */}
            <form action={action} className="space-y-5">
              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@gai.edu"
                  required
                  autoComplete="email"
                  className="h-10 px-3 text-sm"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    className="h-10 pr-10 px-3 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full h-10 font-medium gap-2"
                disabled={pending}
              >
                {pending ? (
                  <>
                    <span className="size-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <>
                    <LogIn className="size-4" />
                    Sign in
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* Footer note */}
        <div className="mt-5 text-center space-y-1">
          <p className="text-xs text-muted-foreground">
            Restricted access · Graphic Arts Institute &copy; {new Date().getFullYear()}
          </p>
          <p className="text-xs text-muted-foreground">
            Developed by{" "}
            <a
              href="https://tarekdeveloper.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline underline-offset-4"
            >
              Md. Tarek
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
