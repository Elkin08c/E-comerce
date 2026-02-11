"use client";
import { useQuery } from "@apollo/client/react";
import { GET_CUSTOMER_ORDERS } from "@/graphql/queries";
import { Fragment, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Loader2, Package, ShoppingBag, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

import { useAuthStore } from "@/store/auth";

interface OrderItem {
    productName?: string;
    variantName?: string;
    quantity?: number;
    unitPrice?: number;
    totalPrice?: number;
}

interface Order {
    id: string;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    subtotal: number;
    totalAmount: number;
    createdAt: string;
    items?: OrderItem[];
}

export default function MyOrdersPage() {
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/login");
        }
    }, [router, isAuthenticated]);

    const customerId = user?.id;

    const { data, loading, error } = useQuery<any>(GET_CUSTOMER_ORDERS, {
        variables: {
            input: {
                customerId: customerId || "",
                limit: 20
            }
        },
        skip: !customerId,
        fetchPolicy: "cache-and-network"
    });

    if (!customerId) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    const orders: Order[] = data?.ordersByCustomer || [];

    const toggleExpand = (orderId: string) => {
        setExpandedOrderId(prev => prev === orderId ? null : orderId);
    };

    const statusLabel: Record<string, string> = {
        PENDING: "Pendiente",
        CONFIRMED: "Confirmado",
        PROCESSING: "Procesando",
        SHIPPED: "Enviado",
        DELIVERED: "Entregado",
        COMPLETED: "Completado",
        CANCELLED: "Cancelado",
    };

    return (
        <div className="min-h-screen bg-background flex flex-col font-sans">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
                <div className="mb-8 flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                        <Package className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Mis Pedidos</h1>
                        <p className="text-muted-foreground">Administra y rastrea tus compras recientes</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    </div>
                ) : error ? (
                    <div className="text-center py-20">
                        <p className="text-destructive font-medium mb-2">Error al cargar pedidos</p>
                        <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
                        <Button onClick={() => window.location.reload()}>Reintentar</Button>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center border rounded-xl bg-secondary/5">
                        <div className="bg-secondary/20 p-6 rounded-full mb-6">
                            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <h2 className="text-xl font-semibold mb-2">Aún no hay pedidos</h2>
                        <p className="text-muted-foreground max-w-sm mb-8">
                            No has realizado ningún pedido aún. Empieza a comprar para llenar tu armario.
                        </p>
                        <Button asChild size="lg">
                            <Link href="/">Empezar a Comprar</Link>
                        </Button>
                    </div>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>Pedidos Recientes</CardTitle>
                            <CardDescription>Una lista de tus pedidos recientes.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Orden #</TableHead>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead>Items</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orders.map((order) => (
                                        <Fragment key={order.id}>
                                            <TableRow className="cursor-pointer hover:bg-muted/50" onClick={() => toggleExpand(order.id)}>
                                                <TableCell className="font-medium">{order.orderNumber}</TableCell>
                                                <TableCell>
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={
                                                        order.status === 'COMPLETED' || order.status === 'DELIVERED' ? 'default' :
                                                            order.status === 'CANCELLED' ? 'destructive' :
                                                                'outline'
                                                    }>
                                                        {statusLabel[order.status] || order.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-muted-foreground text-sm">
                                                        {order.items?.length || 0} artículo{(order.items?.length || 0) !== 1 ? 's' : ''}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right font-semibold">
                                                    ${order.totalAmount.toFixed(2)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); toggleExpand(order.id); }}>
                                                        Detalles
                                                        {expandedOrderId === order.id
                                                            ? <ChevronUp className="ml-1 h-3 w-3" />
                                                            : <ChevronDown className="ml-1 h-3 w-3" />
                                                        }
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                            {expandedOrderId === order.id && (
                                                <TableRow key={`${order.id}-details`}>
                                                    <TableCell colSpan={6} className="bg-muted/30 p-0">
                                                        <div className="px-6 py-4">
                                                            <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Artículos del pedido</h4>
                                                            {order.items && order.items.length > 0 ? (
                                                                <div className="space-y-2">
                                                                    {order.items.map((item, idx) => (
                                                                        <div key={idx} className="flex items-center justify-between py-2 px-3 rounded-md bg-background border text-sm">
                                                                            <div className="flex-1">
                                                                                <span className="font-medium">{item.productName || 'Producto'}</span>
                                                                                {item.variantName && (
                                                                                    <span className="text-muted-foreground ml-2">— {item.variantName}</span>
                                                                                )}
                                                                            </div>
                                                                            <div className="flex items-center gap-6 text-muted-foreground">
                                                                                <span>Cant: {item.quantity}</span>
                                                                                <span>${(item.unitPrice ?? 0).toFixed(2)} c/u</span>
                                                                                <span className="font-semibold text-foreground">${(item.totalPrice ?? 0).toFixed(2)}</span>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <p className="text-sm text-muted-foreground italic">No hay artículos disponibles.</p>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </Fragment>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </main>
            <Footer />
        </div>
    );
}
