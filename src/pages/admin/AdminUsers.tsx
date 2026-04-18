import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { fadeUp } from "@/lib/animations";
import AdminLayout from "@/components/AdminLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Search, ShieldOff, ShieldCheck, ShieldPlus, ShieldMinus, ShieldAlert, MailCheck, MailX } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const AdminUsers = () => {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [confirmUser, setConfirmUser] = useState<{ id: string; name: string; blocked: boolean } | null>(null);
  const [confirmRole, setConfirmRole] = useState<{ id: string; name: string; grant: boolean } | null>(null);

  const { data: profiles, isLoading } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: () => api.get<any[]>("/api/admin/users"),
  });

  const blockMutation = useMutation({
    mutationFn: ({ id, blocked }: { id: string; blocked: boolean }) =>
      api.patch(`/api/admin/users/${id}/block`, { blocked }),
    onSuccess: (_data, { blocked }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-profiles"] });
      toast({
        title: blocked ? "Account blocked" : "Account unblocked",
        description: blocked
          ? "The user can no longer log in."
          : "The user can now log in again.",
      });
      setConfirmUser(null);
    },
    onError: (err: any) => {
      toast({ title: "Action failed", description: err.message, variant: "destructive" });
      setConfirmUser(null);
    },
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, grant }: { id: string; grant: boolean }) =>
      api.patch(`/api/admin/users/${id}/role`, { role: "admin", grant }),
    onSuccess: (_data, { grant }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-profiles"] });
      toast({
        title: grant ? "Admin access granted" : "Admin access removed",
        description: grant
          ? "This user now has admin access."
          : "Admin access has been revoked.",
      });
      setConfirmRole(null);
    },
    onError: (err: any) => {
      toast({ title: "Action failed", description: err.message, variant: "destructive" });
      setConfirmRole(null);
    },
  });

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  };

  const filtered = (profiles || []).filter((p) => {
    const q = search.toLowerCase();
    return (
      (p.full_name || "").toLowerCase().includes(q) ||
      (p.email || "").toLowerCase().includes(q)
    );
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <h1 className="text-2xl font-serif font-bold text-foreground">Users</h1>
          <p className="text-sm text-muted-foreground">{(profiles || []).length} registered users</p>
        </motion.div>

        {/* Search */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1} className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
          <Input
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card border-border text-sm"
          />
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2} className="space-y-3">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)
          ) : filtered.length === 0 ? (
            <Card className="border-border bg-card">
              <CardContent className="p-8 text-center text-muted-foreground">
                {search ? "No users match your search." : "No users yet."}
              </CardContent>
            </Card>
          ) : (
            filtered.map((profile: any) => (
              <Card
                key={profile.id}
                className={`border-border bg-card transition-colors ${profile.is_blocked ? "opacity-60 border-destructive/20" : "hover:border-primary/20"}`}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                    profile.is_blocked ? "bg-destructive/10 text-destructive" : "bg-primary/15 text-primary"
                  }`}>
                    {getInitials(profile.full_name)}
                  </div>

                  {/* Name + email */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-foreground truncate">{profile.full_name || "Unnamed"}</p>
                      {profile.is_blocked && (
                        <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Blocked</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-muted-foreground">{profile.email}</p>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${
                              profile.email_verified
                                ? "border-green-500/30 bg-green-500/10 text-green-500"
                                : "border-amber-500/30 bg-amber-500/10 text-amber-500"
                            }`}>
                              {profile.email_verified
                                ? <><MailCheck size={10} /> Verified</>
                                : <><MailX size={10} /> Unverified</>
                              }
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">
                            {profile.email_verified
                              ? "Email address has been verified"
                              : "User has not yet verified their email"}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>

                  {/* Roles */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {(profile.roles || []).map((r: string) => (
                      <Badge key={r} variant={r === "admin" ? "default" : "secondary"} className="text-[10px]">{r}</Badge>
                    ))}
                    {(!profile.roles || profile.roles.length === 0) && (
                      <Badge variant="outline" className="text-[10px] border-border">student</Badge>
                    )}
                  </div>

                  {/* Date */}
                  <p className="text-xs text-muted-foreground shrink-0 hidden md:block">
                    {new Date(profile.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </p>

                  {/* Make Admin / Remove Admin — don't show for self */}
                  {profile.id !== currentUser?.id && (
                    profile.is_founding_admin && (profile.roles || []).includes("admin") ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="shrink-0">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-xs gap-1.5 h-8 text-muted-foreground/40 cursor-not-allowed"
                                disabled
                              >
                                <ShieldAlert size={13} /> Founding Admin
                              </Button>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="left" className="text-xs max-w-[200px] text-center">
                            This is the original admin and cannot have their access removed.
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        className={`shrink-0 text-xs gap-1.5 h-8 ${
                          (profile.roles || []).includes("admin")
                            ? "text-amber-500 hover:text-amber-600 hover:bg-amber-500/10"
                            : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                        }`}
                        onClick={() =>
                          setConfirmRole({
                            id: profile.id,
                            name: profile.full_name || profile.email,
                            grant: !(profile.roles || []).includes("admin"),
                          })
                        }
                      >
                        {(profile.roles || []).includes("admin") ? (
                          <><ShieldMinus size={13} /> Remove Admin</>
                        ) : (
                          <><ShieldPlus size={13} /> Make Admin</>
                        )}
                      </Button>
                    )
                  )}

                  {/* Block / Unblock button — don't show for admins */}
                  {!(profile.roles || []).includes("admin") && (
                    <Button
                      size="sm"
                      variant={profile.is_blocked ? "outline" : "ghost"}
                      className={`shrink-0 text-xs gap-1.5 h-8 ${
                        profile.is_blocked
                          ? "border-green-500/30 text-green-500 hover:bg-green-500/10"
                          : "text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      }`}
                      onClick={() =>
                        setConfirmUser({ id: profile.id, name: profile.full_name || profile.email, blocked: !profile.is_blocked })
                      }
                    >
                      {profile.is_blocked ? (
                        <><ShieldCheck size={13} /> Unblock</>
                      ) : (
                        <><ShieldOff size={13} /> Block</>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </motion.div>
      </div>

      {/* Confirm role change dialog */}
      <AlertDialog open={!!confirmRole} onOpenChange={(o) => { if (!o) setConfirmRole(null); }}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif">
              {confirmRole?.grant ? "Grant admin access?" : "Remove admin access?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              {confirmRole?.grant
                ? `"${confirmRole?.name}" will be able to access the admin dashboard and manage all platform content.`
                : `"${confirmRole?.name}" will lose admin access. They will return to their standard role.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={confirmRole?.grant ? "bg-gradient-gold hover:opacity-90" : "bg-destructive hover:bg-destructive/90"}
              onClick={() => confirmRole && roleMutation.mutate({ id: confirmRole.id, grant: confirmRole.grant })}
              disabled={roleMutation.isPending}
            >
              {roleMutation.isPending
                ? "Updating…"
                : confirmRole?.grant ? "Yes, Grant Admin" : "Yes, Remove Admin"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm block/unblock dialog */}
      <AlertDialog open={!!confirmUser} onOpenChange={(o) => { if (!o) setConfirmUser(null); }}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif">
              {confirmUser?.blocked ? "Block account?" : "Unblock account?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              {confirmUser?.blocked
                ? `This will prevent "${confirmUser?.name}" from logging in. Their data will be preserved and you can unblock them at any time.`
                : `This will restore login access for "${confirmUser?.name}".`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={confirmUser?.blocked ? "bg-destructive hover:bg-destructive/90" : "bg-gradient-gold hover:opacity-90"}
              onClick={() => confirmUser && blockMutation.mutate({ id: confirmUser.id, blocked: confirmUser.blocked })}
              disabled={blockMutation.isPending}
            >
              {blockMutation.isPending
                ? "Updating…"
                : confirmUser?.blocked ? "Yes, Block Account" : "Yes, Unblock Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminUsers;
