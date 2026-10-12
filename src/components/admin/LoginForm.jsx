"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Building2, Eye, EyeOff, KeyRound, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiPost } from "@/components/admin/api";

export default function LoginForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const data = await apiPost("/api/admin/auth/login", { email, password });
      router.push(data.admin?.mustChangePassword ? "/admin/account?mustChange=true" : "/admin");
      router.refresh();
    } catch (err) {
      setError(err.message || "Login failed.");
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <span className="grid size-12 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Building2 className="size-6" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Mithrabyte Admin</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Yönetim paneline giriş yapın.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-border bg-card p-6 shadow-sm"
        >
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="login-email">E-posta</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="login-email"
                  type="email"
                  autoComplete="username"
                  autoFocus
                  required
                  className="pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="login-password">Şifre</Label>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="login-password"
                  type={show ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="pr-9 pl-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground [&_svg]:pointer-events-none"
                  aria-label={show ? "Şifreyi gizle" : "Şifreyi göster"}
                >
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}

            <Button type="submit" disabled={busy} className="w-full">
              {busy && <Loader2 className="animate-spin" />}
              Giriş Yap
            </Button>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link href="/tr" className="hover:text-foreground">
            Public siteye dön
          </Link>
        </p>
      </div>
    </main>
  );
}