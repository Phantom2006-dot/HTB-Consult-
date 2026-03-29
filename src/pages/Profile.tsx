import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, Save, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { CloudinaryUpload } from "@/components/CloudinaryUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { fadeUp } from "@/lib/animations";
import SidebarLayout from "@/components/SidebarLayout";

const Profile = () => {
  const { user, loading, setUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  const [form, setForm] = useState({ full_name: "", bio: "", avatar_url: "" });
  const [pwForm, setPwForm] = useState({ current_password: "", new_password: "", confirm_password: "" });

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name || "",
        bio: user.bio || "",
        avatar_url: user.avatar_url || "",
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await api.patch("/api/auth/profile", {
        full_name: form.full_name,
        bio: form.bio,
        avatar_url: form.avatar_url,
      });
      setUser({ ...user, full_name: form.full_name, bio: form.bio, avatar_url: form.avatar_url || null });
      toast({ title: "Profile saved", description: "Your changes have been saved." });
    } catch {
      toast({ title: "Error", description: "Failed to save profile.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!pwForm.current_password || !pwForm.new_password) {
      toast({ title: "Missing fields", description: "Please fill in all password fields.", variant: "destructive" });
      return;
    }
    if (pwForm.new_password.length < 6) {
      toast({ title: "Password too short", description: "New password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    if (pwForm.new_password !== pwForm.confirm_password) {
      toast({ title: "Passwords don't match", description: "New password and confirmation don't match.", variant: "destructive" });
      return;
    }
    setChangingPassword(true);
    try {
      await api.post("/api/auth/change-password", {
        current_password: pwForm.current_password,
        new_password: pwForm.new_password,
      });
      toast({ title: "Password changed", description: "Your password has been updated successfully." });
      setPwForm({ current_password: "", new_password: "", confirm_password: "" });
    } catch (err: any) {
      toast({ title: "Failed", description: err.message || "Incorrect current password.", variant: "destructive" });
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <SidebarLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </SidebarLayout>
    );
  }

  if (!user) return null;

  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <SidebarLayout>
      <div className="px-4 lg:px-8 py-6 max-w-2xl mx-auto space-y-6">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <h1 className="text-xl lg:text-2xl font-serif font-bold text-foreground mb-1">My Profile</h1>
          <p className="text-muted-foreground text-sm">Manage your personal information and account security</p>
        </motion.div>

        {/* Personal Info */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
          <Card className="bg-card border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                <User size={16} className="text-primary" /> Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Email address</label>
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted px-3 py-2 rounded-md">
                  <Mail size={14} /> {user.email}
                </div>
              </div>
              {memberSince && (
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Member since</label>
                  <div className="text-sm text-muted-foreground bg-muted px-3 py-2 rounded-md">{memberSince}</div>
                </div>
              )}
              <Separator />
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Full Name</label>
                <Input
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Bio</label>
                <Textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Tell us a little about yourself..."
                  rows={3}
                />
              </div>
              <CloudinaryUpload
                value={form.avatar_url}
                onChange={(url) => setForm({ ...form, avatar_url: url })}
                folder="htb-avatars"
                label="Profile Picture"
              />
              <Button onClick={handleSave} disabled={saving} className="bg-gradient-gold hover:opacity-90 gap-1.5">
                <Save size={15} /> {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Change Password */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
          <Card className="bg-card border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                <Lock size={16} className="text-primary" /> Change Password
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Current Password</label>
                <div className="relative">
                  <Input
                    type={showCurrentPw ? "text" : "password"}
                    value={pwForm.current_password}
                    onChange={(e) => setPwForm({ ...pwForm, current_password: e.target.value })}
                    placeholder="Enter your current password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showCurrentPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">New Password</label>
                <div className="relative">
                  <Input
                    type={showNewPw ? "text" : "password"}
                    value={pwForm.new_password}
                    onChange={(e) => setPwForm({ ...pwForm, new_password: e.target.value })}
                    placeholder="At least 6 characters"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showNewPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Confirm New Password</label>
                <Input
                  type="password"
                  value={pwForm.confirm_password}
                  onChange={(e) => setPwForm({ ...pwForm, confirm_password: e.target.value })}
                  placeholder="Repeat your new password"
                />
              </div>
              <Button
                onClick={handleChangePassword}
                disabled={changingPassword}
                variant="outline"
                className="gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
              >
                <ShieldCheck size={15} /> {changingPassword ? "Updating..." : "Update Password"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </SidebarLayout>
  );
};

export default Profile;
