"use client";

import { useQuery, useMutation } from "@apollo/client/react";
import { GET_CATEGORIES } from "@/graphql/queries";
import { CREATE_CATEGORY, UPDATE_CATEGORY, REMOVE_CATEGORY } from "@/graphql/mutations";
import { useState } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function CategoriesPage() {
  const { data, loading, error, refetch } = useQuery<any>(GET_CATEGORIES);
  
  const [createCategory, { loading: creating }] = useMutation(CREATE_CATEGORY);
  const [updateCategory, { loading: updating }] = useMutation(UPDATE_CATEGORY);
  const [removeCategory, { loading: removing }] = useMutation(REMOVE_CATEGORY);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", slug: "" });

  const resetForm = () => {
    setFormData({ name: "", slug: "" });
    setEditingCategory(null);
  };

  const handleOpenDialog = (category?: any) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ name: category.name, slug: category.slug });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCategory) {
        await updateCategory({
          variables: {
            id: editingCategory.id,
            data: {
              name: formData.name,
              slug: formData.slug
            }
          }
        });
        toast.success("Categoría actualizada correctamente");
      } else {
        await createCategory({
          variables: {
            createCategoryInput: {
              name: formData.name,
              slug: formData.slug
            }
          }
        });
        toast.success("Categoría creada correctamente");
      }
      setIsDialogOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Error al guardar categoría");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await removeCategory({ variables: { id } });
      toast.success("Categoría eliminada");
      refetch();
    } catch (err: any) {
       toast.error(err.message || "Error al eliminar categoría");
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;
  if (error) return <div className="p-8 text-destructive">Error: {error.message}</div>;

  return (
    <div className="space-y-6 p-6">
       <div className="flex justify-between items-center bg-card p-4 rounded-lg shadow-sm border">
        <h1 className="text-2xl font-bold">Categorías</h1>
        <Button onClick={() => handleOpenDialog()}>
           <Plus className="h-4 w-4 mr-2" />
           Nueva Categoría
        </Button>
      </div>

      <div className="bg-card shadow-sm rounded-lg overflow-hidden border">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Slug</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {data?.categories?.edges?.map(({ node }: { node: any }) => (
              <tr key={node.id} className="hover:bg-muted/50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{node.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{node.slug}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(node)}>
                        <Pencil className="h-4 w-4 text-blue-500" />
                    </Button>
                    
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Esta acción no se puede deshacer. Esto eliminará permanentemente la categoría "{node.name}".
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => handleDelete(node.id)}>
                                    Eliminar
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{editingCategory ? "Editar Categoría" : "Nueva Categoría"}</DialogTitle>
                <DialogDescription>
                    Ingresa los detalles de la categoría. El slug debe ser único.
                </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSave}>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre</Label>
                        <Input 
                            id="name" 
                            value={formData.name} 
                            onChange={(e) => setFormData({...formData, name: e.target.value})} 
                            required 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="slug">Slug (URL)</Label>
                        <Input 
                            id="slug" 
                            value={formData.slug} 
                            onChange={(e) => setFormData({...formData, slug: e.target.value})} 
                            required 
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                    <Button type="submit" disabled={creating || updating}>
                        {(creating || updating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Guardar
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
