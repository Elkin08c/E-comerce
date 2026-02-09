"use client";

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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CREATE_PRODUCT, REMOVE_PRODUCT, UPDATE_PRODUCT } from "@/graphql/mutations";
import { GET_CATEGORIES, GET_PRODUCTS } from "@/graphql/queries";
import { useMutation, useQuery } from "@apollo/client/react";
import { Loader2, Package, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ProductsPage() {
  const { data, loading, error, refetch } = useQuery<any>(GET_PRODUCTS, { variables: { first: 50 }, fetchPolicy: "network-only" });
  const { data: catData } = useQuery<any>(GET_CATEGORIES);
  
  const [createProduct, { loading: creating }] = useMutation(CREATE_PRODUCT);
  const [updateProduct, { loading: updating }] = useMutation(UPDATE_PRODUCT);
  const [removeProduct, { loading: removing }] = useMutation(REMOVE_PRODUCT);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  
  const initialForm = {
    name: "",
    slug: "",
    sku: "",
    salePrice: "",
    categoryId: "",
    description: "",
  };

  const [formData, setFormData] = useState(initialForm);

  const resetForm = () => {
    setFormData(initialForm);
    setEditingProduct(null);
  };

  const handleOpenDialog = (product?: any) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        slug: product.slug || "",
        sku: product.sku,
        salePrice: (product.salePrice ?? 0).toString(),
        categoryId: product.categoryId || (catData?.categories?.edges[0]?.node?.id || ""), 
        description: product.description || "",
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingProduct) {
        // Update logic
        const updateData: any = {
            name: formData.name,
            sku: formData.sku,
            salePrice: parseFloat(formData.salePrice),
            description: formData.description
        };
        
        // Only include fields that changed or are required by update input
        
        await updateProduct({
          variables: {
            id: editingProduct.id,
            data: updateData
          }
        });
        toast.success("Producto actualizado");
      } else {
        // Create logic
        if (!formData.categoryId) {
            toast.error("Selecciona una categoría");
            return;
        }

        await createProduct({
          variables: {
            createProductInput: {
              categoryId: formData.categoryId,
              name: formData.name,
              slug: formData.name.toLowerCase().replace(/ /g, '-'),
              sku: formData.sku,
              salePrice: parseFloat(formData.salePrice),
              description: formData.description,
              tags: ["general"] // Default tag
            }
          }
        });
        toast.success("Producto creado");
      }
      setIsDialogOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Error al guardar producto");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await removeProduct({ variables: { id } });
      toast.success("Producto eliminado");
      refetch();
    } catch (err: any) {
       toast.error(err.message || "Error al eliminar producto");
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;
  if (error) return <div className="p-8 text-destructive">Error: {error.message}</div>;

  const categories = catData?.categories?.edges?.map((e: any) => e.node) || [];

  return (
    <div className="space-y-6 p-6">
       <div className="flex justify-between items-center bg-card p-4 rounded-lg shadow-sm border">
        <h1 className="text-2xl font-bold">Productos</h1>
        <Button onClick={() => handleOpenDialog()}>
           <Plus className="h-4 w-4 mr-2" />
           Nuevo Producto
        </Button>
      </div>

      <div className="bg-card shadow-sm rounded-lg overflow-hidden border">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Producto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">SKU</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Precio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {data?.products?.edges?.map(({ node }: { node: any }) => (
              <tr key={node.id} className="hover:bg-muted/50">
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-secondary/10 rounded-full flex items-center justify-center">
                            <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="ml-4">
                            <div className="text-sm font-medium">{node.name}</div>
                             <div className="text-xs text-muted-foreground">Producto</div>
                        </div>
                    </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{node.sku}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">${(node.salePrice ?? 0).toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                   <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${node.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                    {node.status === "ACTIVE" ? "Activo" : (node.status === "DRAFT" ? "Borrador" : node.status ?? "Sin estado")}
                   </span>
                </td>
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
                                <AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Eliminarás permanentemente el producto "{node.name}".
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
        <DialogContent className="max-w-2xl">
            <DialogHeader>
                <DialogTitle>{editingProduct ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
                <DialogDescription>
                    Detalles completos del producto.
                </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSave} className="grid grid-cols-2 gap-4 py-4">
                 <div className="space-y-2 col-span-2">
                    <Label htmlFor="name">Nombre del Producto</Label>
                    <Input 
                        id="name" 
                        value={formData.name} 
                        onChange={(e) => setFormData({...formData, name: e.target.value})} 
                        required 
                    />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="sku">SKU</Label>
                    <Input 
                        id="sku" 
                        value={formData.sku} 
                        onChange={(e) => setFormData({...formData, sku: e.target.value})} 
                        required 
                    />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="price">Precio de Venta ($)</Label>
                    <Input 
                        id="price" 
                        type="number"
                        step="0.01"
                        value={formData.salePrice} 
                        onChange={(e) => setFormData({...formData, salePrice: e.target.value})} 
                        required 
                    />
                </div>
                 <div className="space-y-2 col-span-2">
                    <Label htmlFor="category">Categoría</Label>
                     <Select 
                        value={formData.categoryId} 
                        onValueChange={(val) => setFormData({...formData, categoryId: val})}
                        disabled={!!editingProduct} // Disable changing category on edit for simplicity if backend restricts
                     >
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccionar Categoría" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map((cat: any) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                    {cat.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2 col-span-2">
                    <Label htmlFor="desc">Descripción</Label>
                    <Textarea 
                        id="desc" 
                        value={formData.description} 
                        onChange={(e) => setFormData({...formData, description: e.target.value})} 
                    />
                </div>
                
                <DialogFooter className="col-span-2 mt-4">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                    <Button type="submit" disabled={creating || updating}>
                        {(creating || updating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Guardar Producto
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
