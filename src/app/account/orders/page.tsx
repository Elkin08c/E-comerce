"use client";
import { authService } from "@/lib/services/auth.service";

import { useQuery } from "@apollo/client/react";
import { GET_CUSTOMER_ORDERS } from "@/graphql/queries";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Loader2, Package, ShoppingBag, ArrowRight } from "lucide-react";
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

export default function MyOrdersPage() {
  const router = useRouter();
  const [customerId, setCustomerId] = useState<string | null>(null);

  useEffect(() => {
    const storedCustomerId = localStorage.getItem("customerId");
    
    // We rely on the query to fail if not authorized, or we can check profile
    authService.getProfile().catch(() => {
      router.push("/login");
    });

    if (storedCustomerId) {
      setCustomerId(storedCustomerId);
    }
    // If no customerId but token exists (e.g. old login), maybe trigger a profile fetch or ask to relogin
    // For now we assume customerId is there if logged in via new flow
  }, [router]);

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
    // Wait briefly for useEffect to set ID, or show loader. 
    // Ideally we should have a 'isCheckingAuth' state, but this works if we assume token check redirects.
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center">
             <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )
  }

  const orders = data?.ordersByCustomer || [];

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
                            {orders.map((order: any) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                                    <TableCell>
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            order.status === 'COMPLETED' ? 'default' : 
                                            order.status === 'CANCELLED' ? 'destructive' :
                                            'outline'
                                        }>
                                            {order.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-muted-foreground text-sm">
                                            {order.items?.length || 0} artículos
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right font-semibold">
                                        ${order.totalAmount.toFixed(2)}
                                    </TableCell>
                                     <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`#`}>
                                                Detalles <ArrowRight className="ml-1 h-3 w-3" />
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
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
