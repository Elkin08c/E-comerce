"use client";

import { useQuery } from "@apollo/client/react";
import { GET_PRODUCTS } from "@/graphql/queries";
import { Plus } from "lucide-react";

export default function ProductsPage() {
  const { data, loading, error } = useQuery<any>(GET_PRODUCTS, { variables: { first: 20 } }); // eslint-disable-line @typescript-eslint/no-explicit-any

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error.message}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
           <Plus className="h-4 w-4" />
           Add Product
        </button>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data?.products?.edges?.map(({ node }: { node: any }) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
              <tr key={node.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{node.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{node.sku}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${node.basePrice}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                   <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${node.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {node.isActive ? "Active" : "Inactive"}
                   </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
