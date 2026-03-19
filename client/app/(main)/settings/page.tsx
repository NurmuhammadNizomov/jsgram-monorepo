"use client";

import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Camera, Loader2, LogOut, Trash2, Shield } from "lucide-react";
import { toast } from "sonner";
import { UserAPI } from "@/lib/social";

export default function SettingsPage() {
  const { user, logout, logoutAll, refreshUser } = useAuthStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    username: user?.username ?? "",
    bio: (user as any)?.bio ?? "",
  });

  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  const profileMut = useMutation({
    mutationFn: () => UserAPI.updateProfile(profileForm),
    onSuccess: () => { refreshUser(); toast.success("Profile updated"); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Update failed"),
  });

  const avatarMut = useMutation({
    mutationFn: (file: File) => UserAPI.uploadAvatar(file),
    onSuccess: () => { refreshUser(); toast.success("Avatar updated"); },
    onError: () => toast.error("Failed to upload avatar"),
  });

  const pwMut = useMutation({
    mutationFn: () => UserAPI.changePassword(pwForm.currentPassword, pwForm.newPassword),
    onSuccess: () => {
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Password changed");
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Failed to change password"),
  });

  const deactivateMut = useMutation({
    mutationFn: () => UserAPI.deactivate(),
    onSuccess: () => { logout(); },
  });

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) avatarMut.mutate(file);
    e.target.value = "";
  };

  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.username;

  return (
    <div>
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-5 py-3">
        <h1 className="text-xl font-bold">Settings</h1>
      </div>

      <div className="divide-y divide-border">
        {/* Profile section */}
        <section className="px-5 py-6 space-y-5">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Profile</h2>

          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="w-16 h-16">
                <AvatarImage src={user?.avatar ?? ""} />
                <AvatarFallback className="text-xl">{displayName?.[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <button
                className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1.5"
                onClick={() => fileRef.current?.click()}
              >
                {avatarMut.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3" />}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
            </div>
            <div>
              <p className="font-semibold">{displayName}</p>
              <p className="text-sm text-muted-foreground">@{user?.username}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">First name</Label>
              <Input
                value={profileForm.firstName}
                onChange={(e) => setProfileForm((p) => ({ ...p, firstName: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Last name</Label>
              <Input
                value={profileForm.lastName}
                onChange={(e) => setProfileForm((p) => ({ ...p, lastName: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Username</Label>
            <Input
              value={profileForm.username}
              onChange={(e) => setProfileForm((p) => ({ ...p, username: e.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Bio</Label>
            <Textarea
              value={profileForm.bio}
              onChange={(e) => setProfileForm((p) => ({ ...p, bio: e.target.value }))}
              placeholder="Tell people about yourself..."
              className="resize-none"
              rows={3}
            />
          </div>

          <Button
            onClick={() => profileMut.mutate()}
            disabled={profileMut.isPending}
            className="w-full"
          >
            {profileMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save changes"}
          </Button>
        </section>

        {/* Password section */}
        <section className="px-5 py-6 space-y-4">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <Shield className="w-4 h-4" /> Security
          </h2>

          <div className="space-y-1.5">
            <Label className="text-xs">Current password</Label>
            <Input
              type="password"
              value={pwForm.currentPassword}
              onChange={(e) => setPwForm((p) => ({ ...p, currentPassword: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">New password</Label>
            <Input
              type="password"
              value={pwForm.newPassword}
              onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Confirm new password</Label>
            <Input
              type="password"
              value={pwForm.confirmPassword}
              onChange={(e) => setPwForm((p) => ({ ...p, confirmPassword: e.target.value }))}
            />
          </div>

          <Button
            variant="outline"
            className="w-full"
            disabled={
              pwMut.isPending ||
              !pwForm.currentPassword ||
              pwForm.newPassword.length < 6 ||
              pwForm.newPassword !== pwForm.confirmPassword
            }
            onClick={() => pwMut.mutate()}
          >
            {pwMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Change password"}
          </Button>
        </section>

        {/* Account actions */}
        <section className="px-5 py-6 space-y-3">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Account</h2>

          <Button variant="outline" className="w-full justify-start gap-2" onClick={() => logout()}>
            <LogOut className="w-4 h-4" /> Log out
          </Button>

          <Button variant="outline" className="w-full justify-start gap-2" onClick={() => logoutAll()}>
            <LogOut className="w-4 h-4" /> Log out all devices
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full justify-start gap-2">
                <Trash2 className="w-4 h-4" /> Delete account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently deactivate your account. You cannot undo this.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => deactivateMut.mutate()}
                >
                  {deactivateMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </section>
      </div>
    </div>
  );
}
