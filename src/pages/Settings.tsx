import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Settings as SettingsIcon, User, Bell, Lock, Palette, Globe, Shield, LogOut
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { fadeUp } from "@/lib/animations";
import SidebarLayout from "@/components/SidebarLayout";

const Settings = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

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

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <SidebarLayout>
      <div className="px-4 lg:px-8 py-6 max-w-3xl mx-auto space-y-6">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <div className="flex items-center gap-2 mb-1">
            <SettingsIcon size={20} className="text-primary" />
            <h1 className="text-xl lg:text-2xl font-serif font-bold text-foreground">Settings</h1>
          </div>
          <p className="text-sm text-muted-foreground">Manage your account preferences</p>
        </motion.div>

        {/* Account */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
          <Card className="border-border bg-card">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                <User size={16} className="text-primary" /> Account
              </div>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-foreground">Email</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <Button size="sm" variant="outline" className="text-xs" onClick={() => navigate("/profile")}>
                    Edit Profile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notifications */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
          <Card className="border-border bg-card">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                <Bell size={16} className="text-primary" /> Notifications
              </div>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-notif" className="text-sm text-foreground">Email notifications</Label>
                  <Switch id="email-notif" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="course-notif" className="text-sm text-foreground">Course updates</Label>
                  <Switch id="course-notif" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="mentor-notif" className="text-sm text-foreground">Mentor messages</Label>
                  <Switch id="mentor-notif" defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Appearance */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}>
          <Card className="border-border bg-card">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                <Palette size={16} className="text-primary" /> Appearance
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Label htmlFor="dark-mode" className="text-sm text-foreground">Dark mode</Label>
                <Switch id="dark-mode" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Privacy */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4}>
          <Card className="border-border bg-card">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                <Shield size={16} className="text-primary" /> Privacy & Security
              </div>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="profile-vis" className="text-sm text-foreground">Public profile</Label>
                  <Switch id="profile-vis" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-foreground">Change password</p>
                    <p className="text-xs text-muted-foreground">Update your account password</p>
                  </div>
                  <Button size="sm" variant="outline" className="text-xs">Update</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sign Out */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={5} className="pb-8">
          <Button variant="destructive" className="w-full gap-2" onClick={handleSignOut}>
            <LogOut size={16} /> Sign Out
          </Button>
        </motion.div>
      </div>
    </SidebarLayout>
  );
};

export default Settings;
