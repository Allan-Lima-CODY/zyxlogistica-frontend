'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Save, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DateRangeFilter } from '@/components/domain/DateRangeFilter';
import { MessageModal } from '@/components/domain/MessageModal';
import { truckService } from '@/services/truckService';
import { Truck, TruckInput, TruckUpdate } from '@/types/Truck';
import { formatDate, formatNumber } from '@/utils/formatCurrency';
import { formatLicensePlate, formatYear } from '@/utils/formatters';

const Trucks = () => {
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Date filters
  const [startDate, setStartDate] = useState<Date>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date;
  });
  const [endDate, setEndDate] = useState<Date>(new Date());

  // Modal state
  const [modal, setModal] = useState<{
    open: boolean;
    type: 'success' | 'error' | 'confirm';
    title: string;
    message: string;
  }>({
    open: false,
    type: 'success',
    title: '',
    message: '',
  });

  // Add form state
  const [newTruck, setNewTruck] = useState<TruckInput>({
    licensePlate: '',
    model: '',
    year: new Date().getFullYear(),
    capacityKg: 0,
  });

  // String versions for input fields
  const [newTruckInputs, setNewTruckInputs] = useState({
    year: '',
    capacityKg: '',
  });

  // Edit form state
  const [editForm, setEditForm] = useState<{ [key: string]: TruckUpdate }>({});
  const [editFormInputs, setEditFormInputs] = useState<{ [key: string]: { capacityKg: string } }>({});

  const fetchTrucks = async () => {
    setLoading(true);
    try {
      const data = await truckService.getByDateRange(startDate, endDate);
      setTrucks(data);
    } catch (error: any) {
      const errorMessage = error.userMessage || error.message || 'Erro ao carregar caminhões';
      showModal('error', 'Erro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrucks();
  }, []);

  const showModal = (type: 'success' | 'error' | 'confirm', title: string, message: string) => {
    setModal({ open: true, type, title, message });
  };

  const handleAddTruck = async () => {
    const year = newTruckInputs.year ? parseInt(newTruckInputs.year) : new Date().getFullYear();
    const capacityKg = newTruckInputs.capacityKg ? parseFloat(newTruckInputs.capacityKg.replace(',', '.')) : 0;
    
    // Validation
    if (!newTruck.licensePlate.trim()) {
      showModal('error', 'Erro', 'Placa não pode ser vazia');
      return;
    }
    if (!newTruck.model.trim()) {
      showModal('error', 'Erro', 'Modelo não pode ser vazio');
      return;
    }
    if (newTruck.licensePlate.length > 20) {
      showModal('error', 'Erro', 'Placa não pode ter mais que 20 caracteres');
      return;
    }
    if (newTruck.model.length > 100) {
      showModal('error', 'Erro', 'Modelo não pode ter mais que 100 caracteres');
      return;
    }
    if (year <= 1900 || year > new Date().getFullYear()) {
      showModal('error', 'Erro', 'Ano inválido');
      return;
    }
    if (capacityKg <= 0) {
      showModal('error', 'Erro', 'Capacidade deve ser maior que 0');
      return;
    }

    setLoading(true);
    try {
      await truckService.create({
        ...newTruck,
        year,
        capacityKg,
      });
      showModal('success', 'Sucesso', 'Caminhão adicionado com sucesso!');
      setShowAddCard(false);
      setNewTruck({
        licensePlate: '',
        model: '',
        year: new Date().getFullYear(),
        capacityKg: 0,
      });
      setNewTruckInputs({
        year: '',
        capacityKg: '',
      });
      fetchTrucks();
    } catch (error: any) {
      const errorMessage = error.userMessage || error.message || 'Erro ao adicionar caminhão';
      showModal('error', 'Erro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAdd = () => {
    setShowAddCard(false);
    setNewTruck({
      licensePlate: '',
      model: '',
      year: new Date().getFullYear(),
      capacityKg: 0,
    });
    setNewTruckInputs({
      year: '',
      capacityKg: '',
    });
  };

  const handleStartEdit = (truck: Truck) => {
    setEditingId(truck.id);
    setEditForm({
      ...editForm,
      [truck.id]: {
        model: truck.model,
        year: truck.year,
        capacityKg: truck.capacityKg,
      },
    });
    setEditFormInputs({
      ...editFormInputs,
      [truck.id]: {
        capacityKg: truck.capacityKg.toString(),
      },
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = async (id: string) => {
    const update = editForm[id];
    if (!update) return;

    const capacityInput = editFormInputs[id]?.capacityKg || '0';
    const capacityKg = parseFloat(capacityInput.replace(',', '.')) || 0;

    // Validation
    if (!update.model.trim()) {
      showModal('error', 'Erro', 'Modelo não pode ser vazio');
      return;
    }
    if (update.model.length > 100) {
      showModal('error', 'Erro', 'Modelo não pode ter mais que 100 caracteres');
      return;
    }
    if (update.year <= 1900 || update.year > new Date().getFullYear()) {
      showModal('error', 'Erro', 'Ano inválido');
      return;
    }
    if (capacityKg <= 0) {
      showModal('error', 'Erro', 'Capacidade deve ser maior que 0');
      return;
    }

    setLoading(true);
    try {
      await truckService.update(id, {
        model: update.model,
        year: update.year,
        capacityKg,
      });
      showModal('success', 'Sucesso', 'Caminhão atualizado com sucesso!');
      setEditingId(null);
      fetchTrucks();
    } catch (error: any) {
      const errorMessage = error.userMessage || error.message || 'Erro ao atualizar caminhão';
      showModal('error', 'Erro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (id: string, field: keyof TruckUpdate, value: string | number) => {
    if (field === 'capacityKg') {
      const strValue = typeof value === 'string' ? value : value.toString();
      setEditFormInputs({
        ...editFormInputs,
        [id]: {
          capacityKg: strValue,
        },
      });
      const numValue = parseFloat(strValue.replace(',', '.')) || 0;
      setEditForm({
        ...editForm,
        [id]: {
          ...editForm[id],
          capacityKg: numValue,
        },
      });
    } else {
      setEditForm({
        ...editForm,
        [id]: {
          ...editForm[id],
          [field]: value,
        },
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Caminhões</h1>
          <p className="text-gray-600">Gerencie a frota de caminhões</p>
        </div>
        <Button
          onClick={() => setShowAddCard(true)}
          disabled={showAddCard || loading}
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Caminhão
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onApply={fetchTrucks}
          />
        </CardContent>
      </Card>

      {showAddCard && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle>Adicionar Novo Caminhão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="licensePlate">Placa *</Label>
                <Input
                  id="licensePlate"
                  value={newTruck.licensePlate}
                  onChange={(e) => {
                    const formatted = formatLicensePlate(e.target.value);
                    setNewTruck({ ...newTruck, licensePlate: formatted });
                  }}
                  placeholder="ABC1D23"
                  maxLength={7}
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="model">Modelo *</Label>
                <Input
                  id="model"
                  value={newTruck.model}
                  onChange={(e) =>
                    setNewTruck({ ...newTruck, model: e.target.value })
                  }
                  placeholder="Volvo FH 540"
                  maxLength={100}
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="year">Ano *</Label>
                <Input
                  id="year"
                  type="text"
                  inputMode="numeric"
                  value={newTruckInputs.year}
                  onChange={(e) => {
                    const formatted = formatYear(e.target.value);
                    setNewTruckInputs({ ...newTruckInputs, year: formatted });
                    setNewTruck({ ...newTruck, year: parseInt(formatted) || new Date().getFullYear() });
                  }}
                  placeholder="2024"
                  maxLength={4}
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="capacityKg">Capacidade (Kg) *</Label>
                <Input
                  id="capacityKg"
                  type="text"
                  inputMode="decimal"
                  value={newTruckInputs.capacityKg}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9.,]/g, '');
                    setNewTruckInputs({ ...newTruckInputs, capacityKg: value });
                    setNewTruck({ ...newTruck, capacityKg: parseFloat(value.replace(',', '.')) || 0 });
                  }}
                  placeholder="25000"
                  disabled={loading}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button onClick={handleAddTruck} disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Salvar
              </Button>
              <Button
                variant="outline"
                onClick={handleCancelAdd}
                disabled={loading}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Lista de Caminhões ({trucks.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && !showAddCard ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : trucks.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Nenhum caminhão encontrado no período selecionado
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">#</TableHead>
                    <TableHead>Placa</TableHead>
                    <TableHead>Modelo</TableHead>
                    <TableHead>Ano</TableHead>
                    <TableHead>Capacidade (Kg)</TableHead>
                    <TableHead>Disponível</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead>Atualizado em</TableHead>
                    <TableHead className="w-32">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trucks.map((truck, index) => {
                    const isEditing = editingId === truck.id;
                    const editData = editForm[truck.id];

                    return (
                      <TableRow key={truck.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{truck.licensePlate}</TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Input
                              value={editData?.model || ''}
                              onChange={(e) =>
                                handleEditChange(truck.id, 'model', e.target.value)
                              }
                              maxLength={100}
                              disabled={loading}
                            />
                          ) : (
                            truck.model
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Input
                              type="number"
                              value={editData?.year || ''}
                              onChange={(e) =>
                                handleEditChange(truck.id, 'year', parseInt(e.target.value) || 0)
                              }
                              min={1900}
                              max={new Date().getFullYear()}
                              disabled={loading}
                            />
                          ) : (
                            truck.year
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Input
                              type="number"
                              value={editData?.capacityKg || ''}
                              onChange={(e) =>
                                handleEditChange(truck.id, 'capacityKg', parseFloat(e.target.value) || 0)
                              }
                              min={0}
                              step={100}
                              disabled={loading}
                            />
                          ) : (
                            formatNumber(truck.capacityKg)
                          )}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                              truck.available
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {truck.available ? 'Sim' : 'Não'}
                          </span>
                        </TableCell>
                        <TableCell>{formatDate(truck.createdAt)}</TableCell>
                        <TableCell>
                          {truck.updatedAt ? formatDate(truck.updatedAt) : '-'}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <div className="flex gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleSaveEdit(truck.id)}
                                disabled={loading}
                              >
                                <Save className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={handleCancelEdit}
                                disabled={loading}
                              >
                                <X className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleStartEdit(truck)}
                              disabled={loading || showAddCard}
                            >
                              <Edit className="h-4 w-4 text-blue-600" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <MessageModal
        open={modal.open}
        onOpenChange={(open) => setModal({ ...modal, open })}
        type={modal.type}
        title={modal.title}
        message={modal.message}
      />
    </div>
  );
};

export default Trucks;