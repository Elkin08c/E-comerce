'use client';

import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Input } from './input';

export interface SearchableSelectOption {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  options: SearchableSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  onOpenChange?: (open: boolean) => void;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
}

export function SearchableSelect({
  value,
  onValueChange,
  options,
  placeholder = "Selecciona una opción",
  disabled = false,
  onOpenChange,
  searchPlaceholder = "Buscar...",
  emptyMessage = "No se encontraron resultados",
  className
}: SearchableSelectProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrado local - NO hace peticiones
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) {
      return options;
    }

    const normalizedSearch = searchTerm.toLowerCase().trim();
    return options.filter(option =>
      option.label.toLowerCase().includes(normalizedSearch)
    );
  }, [options, searchTerm]);

  const handleOpenChange = (open: boolean) => {
    // Limpiar búsqueda cuando se cierra el select
    if (!open) {
      setSearchTerm('');
    }
    onOpenChange?.(open);
  };

  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      onOpenChange={handleOpenChange}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {/* Input de búsqueda - solo filtra localmente */}
        <div className="flex items-center border-b px-3 pb-2 mb-2 sticky top-0 bg-white z-10">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 w-full border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
            onClick={(e) => {
              // Prevenir que el click cierre el select
              e.stopPropagation();
            }}
            onKeyDown={(e) => {
              // Prevenir que Enter/Space cierren el select
              if (e.key === 'Enter' || e.key === ' ') {
                e.stopPropagation();
              }
            }}
          />
        </div>

        {/* Resultados filtrados */}
        <div className="max-h-[300px] overflow-y-auto">
          {filteredOptions.length === 0 ? (
            <div className="py-6 text-center text-sm text-gray-500">
              {emptyMessage}
            </div>
          ) : (
            filteredOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))
          )}
        </div>
      </SelectContent>
    </Select>
  );
}
