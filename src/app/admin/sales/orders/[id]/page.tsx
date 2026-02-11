"use client";

import { GET_ORDER_WITH_DETAILS } from "@/graphql/queries";
import { useQuery } from "@apollo/client/react";
import { useParams } from "next/navigation";
import { OrderStatusUpdate } from "@/components/admin/orders/order-status-update";
import Link from "next/link";
import Image from "next/image";

export default function OrderDetailsPage() {
    const params = useParams();
    const orderId = params.id as string;

    const { data, loading, error, refetch } = useQuery<any>(GET_ORDER_WITH_DETAILS, {
        variables: { orderId },
        skip: !orderId,
    });

    if (loading) return <div className="p-8">Cargando detalles del pedido...</div>;
    if (error) return <div className="p-8 text-red-500">Error: {error.message}</div>;
    if (!data?.orderWithDetails) return <div className="p-8">Pedido no encontrado</div>;

    const order = data.orderWithDetails;

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center space-x-4">
                    <Link href="/admin/sales/orders" className="text-gray-500 hover:text-gray-700">
                        &larr; Volver
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Pedido #{order.orderNumber}</h1>
                </div>
                <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">
                        Fecha: {new Date(order.createdAt).toLocaleString()}
                    </span>
                    <OrderStatusUpdate
                        orderId={order.id}
                        currentStatus={order.status}
                        onUpdate={() => refetch()}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="md:col-span-2 space-y-6">
                    {/* Items */}
                    <div className="bg-white shadow-sm rounded-lg overflow-hidden p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Productos</h2>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cant.</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {order.items.map((item: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                                    <tr key={item.id}>
                                        <td className="px-3 py-2 text-sm text-gray-900">
                                            <div className="font-medium">{item.productName}</div>
                                            <div className="text-gray-500 text-xs">{item.variantName}</div>
                                            <div className="text-gray-400 text-xs font-mono">{item.sku}</div>
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-500">${item.unitPrice}</td>
                                        <td className="px-3 py-2 text-sm text-gray-500">{item.quantity}</td>
                                        <td className="px-3 py-2 text-sm font-medium text-gray-900">${item.totalPrice}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="mt-4 border-t pt-4 flex flex-col items-end space-y-1">
                            <div className="flex justify-between w-48 text-sm">
                                <span className="text-gray-500">Subtotal:</span>
                                <span className="font-medium">${order.subtotal}</span>
                            </div>
                            <div className="flex justify-between w-48 text-sm">
                                <span className="text-gray-500">Envío:</span>
                                <span className="font-medium">${order.shippingAmount}</span>
                            </div>
                            {order.discountAmount > 0 && (
                                <div className="flex justify-between w-48 text-sm text-green-600">
                                    <span>Descuento:</span>
                                    <span>-${order.discountAmount}</span>
                                </div>
                            )}
                            {order.taxAmount > 0 && (
                                <div className="flex justify-between w-48 text-sm text-gray-500">
                                    <span>Impuestos:</span>
                                    <span>${order.taxAmount}</span>
                                </div>
                            )}
                            <div className="flex justify-between w-48 text-base font-bold border-t pt-2 mt-2">
                                <span>Total:</span>
                                <span>${order.totalAmount}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payments */}
                    <div className="bg-white shadow-sm rounded-lg overflow-hidden p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Pagos</h2>
                        {order.payments && order.payments.length > 0 ? (
                            <div className="space-y-4">
                                {order.payments.map((payment: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                                    <div key={payment.id} className="border rounded-md p-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="font-medium text-gray-900">
                                                    {payment.paymentMethod?.type === 'BANK_TRANSFER' || payment.proofOfPayment ? 'Transferencia Bancaria' :
                                                        payment.paymentMethod?.type === 'CREDIT_CARD' ? 'Tarjeta de Crédito' : 'Efectivo'}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {new Date(payment.createdAt).toLocaleString()}
                                                </div>
                                                {payment.paymentMethod?.bankName && (
                                                    <div className="text-sm text-gray-500">
                                                        Banco: {payment.paymentMethod.bankName}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-gray-900">${payment.amount}</div>
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${payment.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {payment.status}
                                                </span>
                                            </div>
                                        </div>

                                        {payment.proofOfPayment && (
                                            <div className="mt-4">
                                                <h4 className="text-sm font-medium text-gray-700 mb-2">Comprobante de Pago:</h4>
                                                <div className="relative h-64 w-full md:w-1/2 border rounded-lg overflow-hidden bg-gray-50">
                                                    <a href={payment.proofOfPayment} target="_blank" rel="noopener noreferrer">
                                                        <Image
                                                            src={payment.proofOfPayment}
                                                            alt="Comprobante de pago"
                                                            fill
                                                            className="object-contain"
                                                        />
                                                    </a>
                                                </div>
                                                <a href={payment.proofOfPayment} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:text-indigo-800 mt-1 block">
                                                    Ver imagen original
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">No hay pagos registrados</p>
                        )}
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    {/* Customer Info */}
                    <div className="bg-white shadow-sm rounded-lg overflow-hidden p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Cliente</h2>
                        {order.customer ? (
                            <div className="space-y-3">
                                <div>
                                    <div className="text-sm text-gray-500">Nombre</div>
                                    <div className="font-medium">{order.customer.firstName} {order.customer.lastName}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Email</div>
                                    <div className="font-medium text-indigo-600">{order.customer.email}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Teléfono</div>
                                    <div className="font-medium">{order.customer.phone || 'N/A'}</div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-500">Cliente desconocido</p>
                        )}
                    </div>

                    {/* Shipping Info */}
                    <div className="bg-white shadow-sm rounded-lg overflow-hidden p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Envío</h2>
                        {order.shipping ? (
                            <div className="space-y-3">
                                <div>
                                    <div className="text-sm text-gray-500">Destinatario</div>
                                    <div className="font-medium">{order.shipping.recipientName}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Dirección</div>
                                    <div className="font-medium">{order.shipping.shippingAddress}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Teléfono</div>
                                    <div className="font-medium">{order.shipping.recipientPhone}</div>
                                </div>
                                {order.shipping.trackingNumber && (
                                    <div>
                                        <div className="text-sm text-gray-500">Tracking</div>
                                        <div className="font-mono bg-gray-100 p-1 rounded text-sm">{order.shipping.trackingNumber}</div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-gray-500">Sin información de envío</p>
                        )}
                    </div>

                    {/* Notes */}
                    {(order.notes || order.internalNotes) && (
                        <div className="bg-white shadow-sm rounded-lg overflow-hidden p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Notas</h2>
                            {order.notes && (
                                <div className="mb-4">
                                    <div className="text-sm text-gray-500">Notas del cliente:</div>
                                    <p className="text-sm bg-yellow-50 p-2 rounded border border-yellow-100">{order.notes}</p>
                                </div>
                            )}
                            {order.internalNotes && (
                                <div>
                                    <div className="text-sm text-gray-500">Notas internas:</div>
                                    <p className="text-sm bg-gray-50 p-2 rounded border border-gray-100 italic">{order.internalNotes}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
