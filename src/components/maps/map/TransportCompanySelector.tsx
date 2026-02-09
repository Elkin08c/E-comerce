'use client';

import { useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Truck, AlertCircle } from 'lucide-react';
import { useTransportCompanies } from '../../hooks/useTransportCompanies';

interface TransportCompanySelectorProps {
  value?: string;
  onChange: (companyId: string) => void;
  required?: boolean;
  showCreateButton?: boolean;
  onCreateNew?: () => void;
}

export default function TransportCompanySelector({
  value,
  onChange,
  required = false,
  showCreateButton = true,
  onCreateNew
}: TransportCompanySelectorProps) {
  // Usar hook con cache compartido en lugar de llamada directa
  const { companies: allCompanies, loading, error: hookError, refetch } = useTransportCompanies();

  // Filtrar solo empresas activas
  const companies = useMemo(() =>
    allCompanies.filter(c => c.isActive),
    [allCompanies]
  );

  const error = hookError?.message || null;

  if (loading) {
    return (
      <div className="p-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">Cargando empresas de transporte...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="w-4 h-4" />
          <p className="text-sm">{error}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="mt-2"
        >
          Reintentar
        </Button>
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-800 mb-1">
              No hay empresas de transporte registradas
            </p>
            <p className="text-sm text-gray-700 mb-3">
              Debes crear al menos una empresa de transporte antes de poder asignarla a esta zona restringida.
            </p>
            {showCreateButton && onCreateNew && (
              <Button
                onClick={onCreateNew}
                size="sm"
                className="bg-[#FE9124] hover:bg-[#FE9124]/90 text-white"
              >
                <Truck className="w-4 h-4 mr-2" />
                Crear Empresa de Transporte
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="transportCompany">
        Empresa de Transporte {required && '*'}
      </Label>

      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="transportCompany">
          <SelectValue placeholder="Selecciona una empresa de transporte" />
        </SelectTrigger>
        <SelectContent>
          {companies.map((company) => (
            <SelectItem key={company.id} value={company.id}>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-gray-500" />
                <span>{company.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {required && !value && (
        <p className="text-xs text-red-500">
          Las zonas restringidas requieren una empresa de transporte asignada
        </p>
      )}

      {showCreateButton && onCreateNew && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCreateNew}
          className="w-full mt-2"
        >
          <Truck className="w-4 h-4 mr-2" />
          Crear Nueva Empresa
        </Button>
      )}
    </div>
  );
}
