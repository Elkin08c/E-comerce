"use client";

import { useQuery } from "@apollo/client/react";
import { GET_USERS } from "@/graphql/queries";

export default function CustomersPage() {
  const { data, loading, error } = useQuery<any>(GET_USERS); // eslint-disable-line @typescript-eslint/no-explicit-any

  if (loading) return <div className="p-8">Cargando...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error.message}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data?.users?.edges?.map(({ node }: { node: any }) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
              <tr key={node.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {node.firstName} {node.lastName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{node.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
