import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";

const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrderStatus($input: UpdateOrderStatusInput!) {
    updateOrderStatus(input: $input) {
      id
      status
      updatedAt
    }
  }
`;

interface OrderStatusUpdateProps {
    orderId: string;
    currentStatus: string;
    onUpdate?: () => void;
}

const ORDER_STATUSES = [
    { value: "PENDING", label: "Pendiente" },
    { value: "CONFIRMED", label: "Confirmado" },
    { value: "PREPARING", label: "Preparando" },
    { value: "READY_FOR_PICKUP", label: "Listo para recoger" },
    { value: "SHIPPED", label: "Enviado" },
    { value: "DELIVERED", label: "Entregado" },
    { value: "COMPLETED", label: "Completado" },
    { value: "CANCELLED", label: "Cancelado" },
    { value: "RETURNED", label: "Devuelto" },
    { value: "REFUNDED", label: "Reembolsado" },
];

export function OrderStatusUpdate({ orderId, currentStatus, onUpdate }: OrderStatusUpdateProps) {
    const [status, setStatus] = useState(currentStatus);
    const [updateOrderStatus, { loading, error }] = useMutation(UPDATE_ORDER_STATUS);

    const handleStatusChange = async (newStatus: string) => {
        try {
            await updateOrderStatus({
                variables: {
                    input: {
                        orderId,
                        status: newStatus,
                    },
                },
            });
            setStatus(newStatus);
            if (onUpdate) onUpdate();
        } catch (e) {
            console.error("Error updating status:", e);
        }
    };

    return (
        <div className="flex items-center space-x-2">
            <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={loading}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            >
                {ORDER_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                        {s.label}
                    </option>
                ))}
            </select>
            {loading && <span className="text-sm text-gray-500">Actualizando...</span>}
            {error && <span className="text-sm text-red-500">Error</span>}
        </div>
    );
}
