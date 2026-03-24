import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { fadeUp } from "@/lib/animations";
import AdminLayout from "@/components/AdminLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const AdminCategories = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [name, setName] = useState("");

  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editing) {
        const { error } = await supabase.from("categories").update({ name }).eq("id", editing);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("categories").insert({ name });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      setOpen(false);
      setEditing(null);
      setName("");
      toast({ title: editing ? "Category updated" : "Category created" });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err?.message?.includes("duplicate") ? "Category already exists" : "Failed to save.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      toast({ title: "Category deleted" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete category.", variant: "destructive" });
    },
  });

  const openEdit = (cat: any) => {
    setEditing(cat.id);
    setName(cat.name);
    setOpen(true);
  };

  const openCreate = () => {
    setEditing(null);
    setName("");
    setOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold text-foreground">Categories</h1>
            <p className="text-sm text-muted-foreground">{(categories || []).length} categories</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate} className="gap-1.5"><Plus size={16} /> New Category</Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>{editing ? "Edit Category" : "Create Category"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">Name</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Business Analysis" />
                </div>
                <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !name.trim()} className="w-full">
                  {saveMutation.isPending ? "Saving..." : editing ? "Update" : "Create"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1} className="space-y-2">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)
          ) : (categories || []).length === 0 ? (
            <Card className="border-border bg-card"><CardContent className="p-8 text-center text-muted-foreground">No categories yet.</CardContent></Card>
          ) : (
            (categories || []).map((cat: any) => (
              <Card key={cat.id} className="border-border bg-card hover:border-primary/20 transition-colors">
                <CardContent className="p-4 flex items-center justify-between">
                  <span className="font-medium text-sm text-foreground">{cat.name}</span>
                  <div className="flex items-center gap-1.5">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(cat)}>
                      <Pencil size={14} />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(cat.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default AdminCategories;
