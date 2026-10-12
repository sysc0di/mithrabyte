"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiPost } from "@/components/admin/api";
import { useToast } from "@/components/admin/toast";

export default function PasswordForm() {
  const router = useRouter();
  const { push } = useToast();
  const [busy, setBusy] = useState(false);
  const [values, setValues] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [error, setError] = useState("");

  const strength = checkStrength(values.newPassword);

  async function handleSubmit(e) {
    e.preventDefault();
    if (values.newPassword !== values.confirm) {
      setError("Yeni şifre ile teyidi eşleşmiyor.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await apiPost("/api/admin/account/password", {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      push({
        type: "success",
        title: "Şifre değiştirildi",
        description: "Güvenlik için tüm oturumlar sonlandırıldı. Yeni şifre ile tekrar giriş yapın.",
      });
      setTimeout(() => router.replace("/admin/login"), 1200);
    } catch (err) {
      setError(err.message || "Şifre değiştirilemedi.");
      setBusy(false);
    }
  }

  return (
    <Card className="gap-4 p-5">
      <div className="flex items-center gap-2">
        <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
          <KeyRound className="size-4" />
        </span>
        <div>
          <h2 className="text-sm font-semibold">Şifre Değiştir</h2>
          <p className="text-xs text-muted-foreground">
            Değişiklik tüm oturumları sonlandırır.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="grid gap-1.5">
          <Label htmlFor="current-password">Mevcut şifre</Label>
          <Input
            id="current-password"
            type="password"
            autoComplete="current-password"
            required
            value={values.currentPassword}
            onChange={(e) => setValues((v) => ({ ...v, currentPassword: e.target.value }))}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="new-password">Yeni şifre</Label>
          <Input
            id="new-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={12}
            value={values.newPassword}
            onChange={(e) => setValues((v) => ({ ...v, newPassword: e.target.value }))}
          />
          <span className="text-xs text-muted-foreground">En az 12 karakter olmalıdır.</span>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="confirm-password">Yeni şifre (tekrar)</Label>
          <Input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={12}
            value={values.confirm}
            onChange={(e) => setValues((v) => ({ ...v, confirm: e.target.value }))}
          />
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" disabled={busy || strength === "weak"}>
          {busy && <Loader2 className="animate-spin" />}
          {strength === "weak" ? "Şifre çok zayıf" : "Şifreyi Güncelle"}
        </Button>
      </form>
    </Card>
  );
}

function checkStrength(password) {
  if (!password) return "";
  let score = 0;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return score < 2 ? "weak" : score < 4 ? "ok" : "strong";
}