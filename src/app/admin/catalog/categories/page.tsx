"use client";

import { useQuery } from "@apollo/client/react";
import { GET_CATEGORIES } from "@/graphql/queries";
import { Plus } from "lucide-react";

export default function CategoriesPage() {
  const { data, loading, error } = useQuery<any>(GET_CATEGORIES); // eslint-disable-line @typescript-eslint/no-explicit-any

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error.message}</div>;

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
           <Plus className="h-4 w-4" />
           Add Category
        </button>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data?.categories?.edges?.map(({ node }: { node: any }) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
              <tr key={node.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{node.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{node.slug}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${node.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {node.isActive ? "Yes" : "No"}
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
