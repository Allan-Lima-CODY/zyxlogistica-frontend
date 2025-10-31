'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Save, X, Loader2, Power } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { driverService } from '@/services/driverService';
import { Driver, DriverInput, DriverUpdate, CnhCategory } from '@/types/Driver';
import { formatDate } from '@/utils/formatCurrency';
import { formatPhone, unformatPhone, formatCNH } from '@/utils/formatters';

const cnhCategories = [
  { value: CnhCategory.A, label: 'A' },
  { value: CnhCategory.B, label: 'B' },
  { value: CnhCategory.C, label: 'C' },
  { value: CnhCategory.D, label: 'D' },
  { value: CnhCategory.E, label: 'E' },
];

const getCnhCategoryLabel = (category: CnhCategory): string => {
  const labels: string[] = [];
  if (category & CnhCategory.A) labels.push('A');
  if (category & CnhCategory.B) labels.push('B');
  if (category & CnhCategory.C) labels.push('C');
  if (category & CnhCategory.D) labels.push('D');
  if (category & CnhCategory.E) labels.push('E');
  return labels.length > 0 ? labels.join(', ') : 'Nenhuma';
};

const Drivers = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [startDate, setStartDate] = useState<Date>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date;
  });
  const [endDate, setEndDate] = useState<Date>(new Date());

  const [modal, setModal] = useState<{
    open: boolean;
    type: 'success' | 'error' | 'confirm';
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({
    open: false,
    type: 'success',
    title: '',
    message: '',
  });

  const [newDriver, setNewDriver] = useState<DriverInput>({
    name: '',
    phone: '',
    cnh: '',
    cnhCategory: CnhCategory.None,
  });

  const [editForm, setEditForm] = useState<{ [key: string]: DriverUpdate }>({});

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const data = await driverService.getByDateRange(startDate, endDate);
      setDrivers(data);
    } catch (error: any) {
      const errorMessage = error.userMessage || error.message || 'Erro ao carregar motoristas';
      showModal('error', 'Erro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const showModal = (
    type: 'success' | 'error' | 'confirm',
    title: string,
    message: string,
    onConfirm?: () => void
  ) => {
    setModal({ open: true, type, title, message, onConfirm });
  };

  const handleAddDriver = async () => {
    // Unformat phone and CNH to get only numbers
    const phoneNumbers = unformatPhone(newDriver.phone);
    const cnhNumbers = unformatPhone(newDriver.cnh);

    // Validation
    if (!newDriver.name.trim()) {
      showModal('error', 'Erro', 'Nome não pode ser vazio');
      return;
    }
    if (newDriver.name.length < 2 || newDriver.name.length > 200) {
      showModal('error', 'Erro', 'Nome deve ter entre 2 e 200 caracteres');
      return;
    }
    if (!phoneNumbers.trim()) {
      showModal('error', 'Erro', 'Telefone não pode ser vazio');
      return;
    }
    if (phoneNumbers.length > 20) {
      showModal('error', 'Erro', 'Telefone não pode ter mais que 20 caracteres');
      return;
    }
    if (!cnhNumbers.trim()) {
      showModal('error', 'Erro', 'CNH não pode ser vazia');
      return;
    }
    if (cnhNumbers.length > 20) {
      showModal('error', 'Erro', 'CNH não pode ter mais que 20 caracteres');
      return;
    }
    if (newDriver.cnhCategory === CnhCategory.None) {
      showModal('error', 'Erro', 'Categoria de CNH inválida');
      return;
    }

    setLoading(true);
    try {
      // Send only numbers to API
      await driverService.create({
        ...newDriver,
        phone: phoneNumbers,
        cnh: cnhNumbers,
      });
      showModal('success', 'Sucesso', 'Motorista adicionado com sucesso!');
      setShowAddCard(false);
      setNewDriver({
        name: '',
        phone: '',
        cnh: '',
        cnhCategory: CnhCategory.None,
      });
      fetchDrivers();
    } catch (error: any) {
      const errorMessage = error.userMessage || error.message || 'Erro ao adicionar motorista';
      showModal('error', 'Erro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAdd = () => {
    setShowAddCard(false);
    setNewDriver({
      name: '',
      phone: '',
      cnh: '',
      cnhCategory: CnhCategory.None,
    });
  };

  const handleStartEdit = (driver: Driver) => {
    setEditingId(driver.id);
    setEditForm({
      ...editForm,
      [driver.id]: {
        name: driver.name,
        phone: formatPhone(driver.phone), // Format phone for display
      },
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = async (id: string) => {
    const update = editForm[id];
    if (!update) return;

    // Unformat phone to get only numbers
    const phoneNumbers = unformatPhone(update.phone);

    // Validation
    if (!update.name.trim()) {
      showModal('error', 'Erro', 'Nome não pode ser vazio');
      return;
    }
    if (update.name.length < 2 || update.name.length > 200) {
      showModal('error', 'Erro', 'Nome deve ter entre 2 e 200 caracteres');
      return;
    }
    if (!phoneNumbers.trim()) {
      showModal('error', 'Erro', 'Telefone não pode ser vazio');
      return;
    }
    if (phoneNumbers.length > 20) {
      showModal('error', 'Erro', 'Telefone não pode ter mais que 20 caracteres');
      return;
    }

    setLoading(true);
    try {
      // Send only numbers to API
      await driverService.update(id, {
        ...update,
        phone: phoneNumbers,
      });
      showModal('success', 'Sucesso', 'Motorista atualizado com sucesso!');
      setEditingId(null);
      fetchDrivers();
    } catch (error: any) {
      const errorMessage = error.userMessage || error.message || 'Erro ao atualizar motorista';
      showModal('error', 'Erro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (id: string, field: keyof DriverUpdate, value: string) => {
    setEditForm({
      ...editForm,
      [id]: {
        ...editForm[id],
        [field]: value,
      },
    });
  };

  const handleToggleStatus = (driver: Driver) => {
    const action = driver.active ? 'inativar' : 'ativar';
    showModal(
      'confirm',
      'Confirmação',
      `Deseja realmente ${action} o motorista ${driver.name}?`,
      async () => {
        setLoading(true);
        try {
          await driverService.toggleStatus(driver.id);
          showModal('success', 'Sucesso', `Motorista ${action === 'inativar' ? 'inativado' : 'ativado'} com sucesso!`);
          fetchDrivers();
        } catch (error: any) {
          const errorMessage = error.userMessage || error.message || `Erro ao ${action} motorista`;
          showModal('error', 'Erro', errorMessage);
        } finally {
          setLoading(false);
        }
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Motoristas</h1>
          <p className="text-gray-600">Gerencie os motoristas</p>
        </div>
        <Button
          onClick={() => setShowAddCard(true)}
          disabled={showAddCard || loading}
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Motorista
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
            onApply={fetchDrivers}
          />
        </CardContent>
      </Card>

      {showAddCard && (
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle>Adicionar Novo Motorista</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={newDriver.name}
                  onChange={(e) =>
                    setNewDriver({ ...newDriver, name: e.target.value })
                  }
                  placeholder="João da Silva"
                  maxLength={200}
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  value={newDriver.phone}
                  onChange={(e) =>
                    setNewDriver({ ...newDriver, phone: formatPhone(e.target.value) })
                  }
                  placeholder="(11) 98765-4321"
                  maxLength={15}
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="cnh">CNH *</Label>
                <Input
                  id="cnh"
                  value={newDriver.cnh}
                  onChange={(e) =>
                    setNewDriver({ ...newDriver, cnh: formatCNH(e.target.value) })
                  }
                  placeholder="12345678901"
                  maxLength={11}
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="cnhCategory">Categoria CNH *</Label>
                <Select
                  value={newDriver.cnhCategory.toString()}
                  onValueChange={(value) =>
                    setNewDriver({ ...newDriver, cnhCategory: parseInt(value) as CnhCategory })
                  }
                  disabled={loading}
                >
                  <SelectTrigger id="cnhCategory">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {cnhCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value.toString()}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button onClick={handleAddDriver} disabled={loading}>
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
          <CardTitle>Lista de Motoristas ({drivers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && !showAddCard ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
          ) : drivers.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Nenhum motorista encontrado no período selecionado
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">#</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>CNH</TableHead>
                    <TableHead>Categoria CNH</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead>Atualizado em</TableHead>
                    <TableHead className="w-40">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {drivers.map((driver, index) => {
                    const isEditing = editingId === driver.id;
                    const editData = editForm[driver.id];

                    return (
                      <TableRow key={driver.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Input
                              value={editData?.name || ''}
                              onChange={(e) =>
                                handleEditChange(driver.id, 'name', e.target.value)
                              }
                              maxLength={200}
                              disabled={loading}
                            />
                          ) : (
                            driver.name
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Input
                              value={editData?.phone || ''}
                              onChange={(e) =>
                                handleEditChange(driver.id, 'phone', formatPhone(e.target.value))
                              }
                              maxLength={15}
                              disabled={loading}
                            />
                          ) : (
                            formatPhone(driver.phone)
                          )}
                        </TableCell>
                        <TableCell>{driver.cnh}</TableCell>
                        <TableCell>{getCnhCategoryLabel(driver.cnhCategory)}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                              driver.active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {driver.active ? 'Ativo' : 'Inativo'}
                          </span>
                        </TableCell>
                        <TableCell>{formatDate(driver.createdAt)}</TableCell>
                        <TableCell>
                          {driver.updatedAt ? formatDate(driver.updatedAt) : '-'}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <div className="flex gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleSaveEdit(driver.id)}
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
                            <div className="flex gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleStartEdit(driver)}
                                disabled={loading || showAddCard}
                              >
                                <Edit className="h-4 w-4 text-blue-600" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleToggleStatus(driver)}
                                disabled={loading || showAddCard}
                              >
                                <Power
                                  className={`h-4 w-4 ${
                                    driver.active ? 'text-red-600' : 'text-green-600'
                                  }`}
                                />
                              </Button>
                            </div>
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
        onConfirm={modal.onConfirm}
      />
    </div>
  );
};

export default Drivers;