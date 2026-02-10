"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface ProductImage {
    id: string; // Backend ID or temp ID
    url: string; // Cloudinary URL or object URL for preview
    file?: File; // Only for new images
    isMain?: boolean;
}

interface ProductImageUploadProps {
    existingImages?: any[];
    onImagesChange: (newImages: File[]) => void;
    onDeleteImage: (id: string) => void;
    disabled?: boolean;
    className?: string;
}

export function ProductImageUpload({
    existingImages = [],
    onImagesChange,
    onDeleteImage,
    disabled = false,
    className
}: ProductImageUploadProps) {
    const [previews, setPreviews] = useState<ProductImage[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Combine existing images with new previews for display
    const allImages = [
        ...existingImages.map(img => ({ ...img, isExisting: true })),
        ...previews.map(img => ({ ...img, isExisting: false }))
    ];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);
            const newImageObjects: ProductImage[] = files.map(file => ({
                id: crypto.randomUUID(),
                url: URL.createObjectURL(file),
                file,
                isMain: false
            }));

            setPreviews(prev => {
                const updated = [...prev, ...newImageObjects];
                const allFiles = updated.map(p => p.file).filter((f): f is File => f !== undefined);
                Promise.resolve().then(() => onImagesChange(allFiles));
                return updated;
            });
        }
    };

    const removePreview = (id: string) => {
        setPreviews(prev => {
            const updated = prev.filter(p => p.id !== id);
            const allFiles = updated.map(p => p.file).filter((f): f is File => f !== undefined);
            Promise.resolve().then(() => onImagesChange(allFiles));
            return updated;
        });
    };

    const handleDeleteExisting = (id: string) => {
        onDeleteImage(id);
    };

    return (
        <div className={cn("space-y-4", className)}>
            <div className="flex items-center justify-between">
                <Label>Imágenes del Producto</Label>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled}
                >
                    <ImagePlus className="mr-2 h-4 w-4" />
                    Agregar Imagen
                </Button>
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                />
            </div>

            {allImages.length === 0 ? (
                <div
                    onClick={() => !disabled && fileInputRef.current?.click()}
                    className={cn(
                        "border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/50 cursor-pointer transition-colors",
                        disabled && "cursor-not-allowed opacity-50"
                    )}
                >
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <ImagePlus className="h-8 w-8" />
                        <p className="text-sm">Arrastra imágenes aquí o haz clic para seleccionar</p>
                        <p className="text-xs">Soporta: JPG, PNG, WEBP</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {allImages.map((image) => (
                        <div key={image.id} className="group relative aspect-square rounded-lg overflow-hidden border bg-background">
                            <Image
                                src={image.url}
                                alt="Product image"
                                fill
                                className="object-cover"
                            />
                            {!disabled && (
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => image.isExisting ? handleDeleteExisting(image.id) : removePreview(image.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                            {image.isExisting && (
                                <div className="absolute top-2 left-2 px-2 py-0.5 bg-background/80 backdrop-blur-sm rounded text-[10px] font-medium">
                                    Existente
                                </div>
                            )}
                            {image.isMain && (
                                <div className="absolute top-2 right-2 px-2 py-0.5 bg-primary text-primary-foreground rounded text-[10px] font-medium">
                                    Principal
                                </div>
                            )}
                        </div>
                    ))}
                    {!disabled && (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 cursor-pointer transition-colors"
                        >
                            <ImagePlus className="h-6 w-6 mb-1" />
                            <span className="text-xs">Agregar</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
