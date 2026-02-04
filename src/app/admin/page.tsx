"use client";

import { useQuery } from "@apollo/client/react";
import { GET_PRODUCTS, GET_ORDERS } from "@/graphql/queries";
import { Activity, Package, ShoppingCart } from "lucide-react";

export default function Dashboard() {
  const { data: productsData, error: productsError } = useQuery<any>(GET_PRODUCTS, { variables: { first: 5 } }); // eslint-disable-line @typescript-eslint/no-explicit-any
  const { data: ordersData } = useQuery<any>(GET_ORDERS, { variables: { first: 5 } }); // eslint-disable-line @typescript-eslint/no-explicit-any
  // const { data: usersData } = useQuery(GET_USERS);

  if (productsError) {
      // Simple error handling for auth
      if (productsError.message.includes("Unauthorized") || productsError.message.includes("Forbidden")) {
          // In a real app, use a proper auth guard or middleware
          return <div className="p-4 text-red-500">Por favor inicia sesión para ver el panel de administración.</div>
      }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">Panel de Control</h1>
      
      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Products Stat */}
        <div className="bg-white overflow-hidden rounded-lg shadow px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Total Productos</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {productsData?.products?.totalCount || 0}
                </dd>
              </div>
            </div>
        </div>

        {/* Orders Stat */}
        <div className="bg-white overflow-hidden rounded-lg shadow px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                <ShoppingCart className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Total Pedidos</dt>
                 <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {ordersData?.orders?.totalCount || 0}
                </dd>
              </div>
            </div>
        </div>
        
         {/* API Health / Activity */}
        <div className="bg-white overflow-hidden rounded-lg shadow px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Estado del Sistema</dt>
                 <dd className="mt-1 text-lg font-semibold text-gray-900">
                    Activo
                </dd>
              </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Products */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
             <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Productos Recientes</h3>
            </div>
            <ul className="divide-y divide-gray-200">
                {productsData?.products?.edges?.map(({ node }: { node: any }) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                    <li key={node.id} className="px-4 py-4 sm:px-6">
                         <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-600">{node.name}</p>
                                <p className="text-xs text-gray-500">SKU: {node.sku}</p>
                            </div>
                            <span className="text-sm font-bold">${node.basePrice}</span>
                         </div>
                    </li>
                ))}
            </ul>
          </div>
          
           {/* Recent Orders */}
           <div className="bg-white shadow rounded-lg overflow-hidden">
             <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Pedidos Recientes</h3>
            </div>
            <ul className="divide-y divide-gray-200">
                 {ordersData?.orders?.edges?.map(({ node }: { node: any }) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                    <li key={node.id} className="px-4 py-4 sm:px-6">
                         <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-900">{node.orderNumber}</p>
                                <p className="text-xs text-gray-500">{new Date(node.createdAt).toLocaleDateString()}</p>
                            </div>
                             <div className="text-right">
                                <span className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${
                                    node.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {node.status}
                                </span>
                                <p className="text-sm font-bold mt-1">${node.totalAmount}</p>
                            </div>
                         </div>
                    </li>
                ))}
                 {(!ordersData?.orders?.edges?.length) && <p className="p-4 text-gray-500 text-sm">No hay pedidos aún.</p>}
            </ul>
          </div>
      </div>
    </div>
  );
}
