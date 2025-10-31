'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DateRangeFilter } from '@/components/domain/DateRangeFilter';
import { MessageModal } from '@/components/domain/MessageModal';
import { expeditionService } from '@/services/expeditionService';
import {
  Expedition,
  ExpeditionInput,
  ExpeditionUpdate,
  OrderStatus,
  OrderStatusLabels,
  AvailableOrder,
  AvailableDriver,
  AvailableTruck,
} from '@/types/Expedition';
import { toast } from 'sonner';

export default function ExpeditionsPage() {
  const [expeditions, setExpeditions] = useState<Expedition[]>([]);
  const [loading, setLoading] = useState(false);

  // Date range state
  const [startDate, setStartDate] = useState<Date>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date;
  });
  const [endDate, setEndDate] = useState<Date>(new Date());

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [messageModal, setMessageModal] = useState<{
    open: boolean;
    title: string;
    message: string;
  }>({ open: false, title: '', message: '' });

  // Available resources
  const [availableOrders, setAvailableOrders] = useState<AvailableOrder[]>([]);
  const [availableDrivers, setAvailableDrivers] = useState<AvailableDriver[]>([]);
  const [availableTrucks, setAvailableTrucks] = useState<AvailableTruck[]>([]);

  // Form states
  const [selectedExpedition, setSelectedExpedition] = useState<Expedition | null>(null);
  const [formData, setFormData] = useState({
    orderId: '',
    driverId: '',
    truckId: '',
    deliveryForecast: '',
    observation: '',
    orderStatus: 'KEEP_CURRENT' as OrderStatus | 'KEEP_CURRENT',
  });

  // Load expeditions on mount
  useEffect(() => {
    loadExpeditions();
  }, []);

  // Load available resources when create modal opens
  useEffect(() => {
    if (createModalOpen) {
      loadAvailableResources();
    }
  }, [createModalOpen]);

  // Load available drivers and trucks when edit modal opens
  useEffect(() => {
    if (editModalOpen) {
      loadAvailableDriversAndTrucks();
    }
  }, [editModalOpen]);

  const loadExpeditions = async () => {
    try {
      setLoading(true);
      const data = await expeditionService.getByDateRange(startDate, endDate);
      setExpeditions(data);
    } catch (error: any) {
      const errorMessage = error.userMessage || error.message || 'Erro ao carregar expedições';
      toast.error(errorMessage);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableResources = async () => {
    try {
      const [orders, drivers, trucks] = await Promise.all([
        expeditionService.getAvailableOrders(),
        expeditionService.getAvailableDrivers(),
        expeditionService.getAvailableTrucks(),
      ]);
      setAvailableOrders(orders);
      setAvailableDrivers(drivers);
      setAvailableTrucks(trucks);
    } catch (error: any) {
      const errorMessage = error.userMessage || error.message || 'Erro ao carregar recursos disponíveis';
      toast.error(errorMessage);
      console.error(error);
    }
  };

  const loadAvailableDriversAndTrucks = async () => {
    try {
      const [drivers, trucks] = await Promise.all([
        expeditionService.getAvailableDrivers(),
        expeditionService.getAvailableTrucks(),
      ]);
      setAvailableDrivers(drivers);
      setAvailableTrucks(trucks);
    } catch (error: any) {
      const errorMessage = error.userMessage || error.message || 'Erro ao carregar motoristas e caminhões disponíveis';
      toast.error(errorMessage);
      console.error(error);
    }
  };

  const resetForm = () => {
    setFormData({
      orderId: '',
      driverId: '',
      truckId: '',
      deliveryForecast: '',
      observation: '',
      orderStatus: 'KEEP_CURRENT',
    });
    setSelectedExpedition(null);
  };

  const openCreateModal = () => {
    resetForm();
    setCreateModalOpen(true);
  };

  const openEditModal = (expedition: Expedition) => {
    setSelectedExpedition(expedition);
    setFormData({
      orderId: expedition.orderId,
      driverId: expedition.driverId,
      truckId: expedition.truckId,
      deliveryForecast: expedition.deliveryForecast.split('T')[0],
      observation: expedition.observation || '',
      orderStatus: expedition.orderStatus ? OrderStatus[expedition.orderStatus as keyof typeof OrderStatus] : 'KEEP_CURRENT',
    });
    setEditModalOpen(true);
  };

  const handleCreate = async () => {
    try {
      // Validations
      if (!formData.orderId) {
        setMessageModal({
          open: true,
          title: 'Erro de validação',
          message: 'Selecione um pedido',
        });
        return;
      }

      if (!formData.driverId) {
        setMessageModal({
          open: true,
          title: 'Erro de validação',
          message: 'Selecione um motorista',
        });
        return;
      }

      if (!formData.truckId) {
        setMessageModal({
          open: true,
          title: 'Erro de validação',
          message: 'Selecione um caminhão',
        });
        return;
      }

      if (!formData.deliveryForecast) {
        setMessageModal({
          open: true,
          title: 'Erro de validação',
          message: 'Informe a previsão de entrega',
        });
        return;
      }

      const forecastDate = new Date(formData.deliveryForecast);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (forecastDate < today) {
        setMessageModal({
          open: true,
          title: 'Erro de validação',
          message: 'Previsão de entrega não pode ser no passado',
        });
        return;
      }

      const maxDate = new Date(today);
      maxDate.setDate(maxDate.getDate() + 30);

      if (forecastDate > maxDate) {
        setMessageModal({
          open: true,
          title: 'Erro de validação',
          message: 'Previsão de entrega muito distante (máximo 30 dias)',
        });
        return;
      }

      if (formData.observation.length > 500) {
        setMessageModal({
          open: true,
          title: 'Erro de validação',
          message: 'Observação não pode ter mais que 500 caracteres',
        });
        return;
      }

      const input: ExpeditionInput = {
        orderId: formData.orderId,
        driverId: formData.driverId,
        truckId: formData.truckId,
        deliveryForecast: new Date(formData.deliveryForecast).toISOString(),
        observation: formData.observation,
      };

      await expeditionService.create(input);
      toast.success('Expedição criada com sucesso');
      setCreateModalOpen(false);
      resetForm();
      await loadExpeditions();
    } catch (error: any) {
      const errorMessage = error.userMessage || error.message || 'Ocorreu um erro ao criar a expedição';
      setMessageModal({
        open: true,
        title: 'Erro ao criar expedição',
        message: errorMessage,
      });
    }
  };

  const handleUpdate = async () => {
    if (!selectedExpedition) return;

    try {
      // Validations
      if (!formData.driverId) {
        setMessageModal({
          open: true,
          title: 'Erro de validação',
          message: 'Selecione um motorista',
        });
        return;
      }

      if (!formData.truckId) {
        setMessageModal({
          open: true,
          title: 'Erro de validação',
          message: 'Selecione um caminhão',
        });
        return;
      }

      if (!formData.deliveryForecast) {
        setMessageModal({
          open: true,
          title: 'Erro de validação',
          message: 'Informe a previsão de entrega',
        });
        return;
      }

      const forecastDate = new Date(formData.deliveryForecast);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (forecastDate < today) {
        setMessageModal({
          open: true,
          title: 'Erro de validação',
          message: 'Previsão de entrega não pode ser no passado',
        });
        return;
      }

      const maxDate = new Date(today);
      maxDate.setDate(maxDate.getDate() + 30);

      if (forecastDate > maxDate) {
        setMessageModal({
          open: true,
          title: 'Erro de validação',
          message: 'Previsão de entrega muito distante (máximo 30 dias)',
        });
        return;
      }

      if (formData.observation.length > 500) {
        setMessageModal({
          open: true,
          title: 'Erro de validação',
          message: 'Observação não pode ter mais que 500 caracteres',
        });
        return;
      }

      const update: ExpeditionUpdate = {
        driverId: formData.driverId,
        truckId: formData.truckId,
        deliveryForecast: new Date(formData.deliveryForecast).toISOString(),
        observation: formData.observation,
        orderStatus: formData.orderStatus !== 'KEEP_CURRENT' ? (formData.orderStatus as OrderStatus) : undefined,
      };

      await expeditionService.update(selectedExpedition.id, update);
      toast.success('Expedição atualizada com sucesso');
      setEditModalOpen(false);
      resetForm();
      await loadExpeditions();
    } catch (error: any) {
      const errorMessage = error.userMessage || error.message || 'Ocorreu um erro ao atualizar a expedição';
      setMessageModal({
        open: true,
        title: 'Erro ao atualizar expedição',
        message: errorMessage,
      });
    }
  };

  const isCreateFormValid = () => {
    return (
      formData.orderId !== '' &&
      formData.driverId !== '' &&
      formData.truckId !== '' &&
      formData.deliveryForecast !== ''
    );
  };

  const isEditFormValid = () => {
    return (
      formData.driverId !== '' &&
      formData.truckId !== '' &&
      formData.deliveryForecast !== ''
    );
  };

  const getStatusBadgeVariant = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.Pending:
        return 'secondary';
      case OrderStatus.InSeparation:
        return 'default';
      case OrderStatus.InTransit:
        return 'default';
      case OrderStatus.Delivered:
        return 'default';
      case OrderStatus.Canceled:
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const canEditExpedition = (expedition: Expedition) => {
    if (!expedition.orderStatus) return false;
    const status = OrderStatus[expedition.orderStatus as keyof typeof OrderStatus];
    return status === OrderStatus.Pending || status === OrderStatus.InSeparation || status === OrderStatus.InTransit;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Expedições</h1>
          <p className="text-gray-600">Gerencie as expedições de pedidos</p>
        </div>
        <Button onClick={openCreateModal} disabled={loading}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Expedição
        </Button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="mb-4">Filtros</h2>
        <DateRangeFilter
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onApply={loadExpeditions}
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <h2 className="mb-4">Lista de Expedições ({expeditions.length})</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Carregando...</div>
        ) : expeditions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Nenhuma expedição encontrada no período selecionado
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Motorista</TableHead>
                  <TableHead>Caminhão</TableHead>
                  <TableHead>Previsão Entrega</TableHead>
                  <TableHead>Observação</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead>Atualizado em</TableHead>
                  <TableHead className="w-24">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expeditions.map((expedition, index) => (
                  <TableRow key={expedition.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-mono">{expedition.orderNumber || expedition.orderId.slice(0, 8)}</TableCell>
                    <TableCell>{expedition.customerName || '-'}</TableCell>
                    <TableCell>
                      {expedition.orderStatus && (
                        <Badge variant={getStatusBadgeVariant(OrderStatus[expedition.orderStatus as keyof typeof OrderStatus])}>
                          {OrderStatusLabels[OrderStatus[expedition.orderStatus as keyof typeof OrderStatus]]}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{expedition.driverName || '-'}</TableCell>
                    <TableCell>
                      {expedition.truckPlate && expedition.truckModel
                        ? `${expedition.truckPlate} - ${expedition.truckModel}`
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {format(new Date(expedition.deliveryForecast), 'dd/MM/yyyy', {
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {expedition.observation || '-'}
                    </TableCell>
                    <TableCell>
                      {format(new Date(expedition.createdAt), 'dd/MM/yyyy HH:mm', {
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell>
                      {expedition.updatedAt
                        ? format(new Date(expedition.updatedAt), 'dd/MM/yyyy HH:mm', {
                            locale: ptBR,
                          })
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditModal(expedition)}
                        disabled={!canEditExpedition(expedition)}
                        title={
                          canEditExpedition(expedition)
                            ? 'Editar expedição'
                            : 'Apenas expedições com status Pendente, Em Separação ou Em Trânsito podem ser editadas'
                        }
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adicionar Expedição</DialogTitle>
            <DialogDescription>
              Selecione um pedido pendente, motorista e caminhão disponíveis para criar uma nova
              expedição.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="order">Pedido *</Label>
              <Select value={formData.orderId} onValueChange={(value) => setFormData({ ...formData, orderId: value })}>
                <SelectTrigger id="order">
                  <SelectValue placeholder="Selecione um pedido" />
                </SelectTrigger>
                <SelectContent>
                  {availableOrders.length === 0 ? (
                    <SelectItem value="none" disabled>
                      Nenhum pedido disponível
                    </SelectItem>
                  ) : (
                    availableOrders.map((order) => (
                      <SelectItem key={order.id} value={order.id}>
                        {order.customerName} - {format(new Date(order.createdAt), 'dd/MM/yyyy')}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="driver">Motorista *</Label>
              <Select
                value={formData.driverId}
                onValueChange={(value) => setFormData({ ...formData, driverId: value })}
              >
                <SelectTrigger id="driver">
                  <SelectValue placeholder="Selecione um motorista" />
                </SelectTrigger>
                <SelectContent>
                  {availableDrivers.length === 0 ? (
                    <SelectItem value="none" disabled>
                      Nenhum motorista disponível
                    </SelectItem>
                  ) : (
                    availableDrivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.name} - CNH: {driver.cnh}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="truck">Caminhão *</Label>
              <Select
                value={formData.truckId}
                onValueChange={(value) => setFormData({ ...formData, truckId: value })}
              >
                <SelectTrigger id="truck">
                  <SelectValue placeholder="Selecione um caminhão" />
                </SelectTrigger>
                <SelectContent>
                  {availableTrucks.length === 0 ? (
                    <SelectItem value="none" disabled>
                      Nenhum caminhão disponível
                    </SelectItem>
                  ) : (
                    availableTrucks.map((truck) => (
                      <SelectItem key={truck.id} value={truck.id}>
                        {truck.licensePlate} - {truck.model} ({truck.modelYear})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="deliveryForecast">Previsão de Entrega *</Label>
              <Input
                id="deliveryForecast"
                type="date"
                value={formData.deliveryForecast}
                onChange={(e) =>
                  setFormData({ ...formData, deliveryForecast: e.target.value })
                }
                min={new Date().toISOString().split('T')[0]}
                max={
                  new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                }
              />
            </div>

            <div>
              <Label htmlFor="observation">Observação</Label>
              <Textarea
                id="observation"
                value={formData.observation}
                onChange={(e) => setFormData({ ...formData, observation: e.target.value })}
                maxLength={500}
                placeholder="Observações sobre a expedição (opcional)"
                rows={3}
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.observation.length}/500 caracteres
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={!isCreateFormValid()}>
              Criar Expedição
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Expedição</DialogTitle>
            <DialogDescription>
              Atualize os dados da expedição. Você pode alterar motorista, caminhão, previsão de
              entrega e status do pedido.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Pedido</Label>
              <Input
                value={
                  selectedExpedition
                    ? `${selectedExpedition.customerName} - ${selectedExpedition.orderNumber || selectedExpedition.orderId.slice(0, 8)}`
                    : ''
                }
                disabled
              />
            </div>

            <div>
              <Label htmlFor="edit-driver">Motorista *</Label>
              <Select
                value={formData.driverId}
                onValueChange={(value) => setFormData({ ...formData, driverId: value })}
              >
                <SelectTrigger id="edit-driver">
                  <SelectValue placeholder="Selecione um motorista" />
                </SelectTrigger>
                <SelectContent>
                  {/* Include current driver if not in available list */}
                  {selectedExpedition?.driverName &&
                    !availableDrivers.find((d) => d.id === selectedExpedition.driverId) && (
                      <SelectItem value={selectedExpedition.driverId}>
                        {selectedExpedition.driverName} (Atual)
                      </SelectItem>
                    )}
                  {availableDrivers.map((driver) => (
                    <SelectItem key={driver.id} value={driver.id}>
                      {driver.name} - CNH: {driver.cnh}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="edit-truck">Caminhão *</Label>
              <Select
                value={formData.truckId}
                onValueChange={(value) => setFormData({ ...formData, truckId: value })}
              >
                <SelectTrigger id="edit-truck">
                  <SelectValue placeholder="Selecione um caminhão" />
                </SelectTrigger>
                <SelectContent>
                  {/* Include current truck if not in available list */}
                  {selectedExpedition?.truckPlate && selectedExpedition?.truckModel &&
                    !availableTrucks.find((t) => t.id === selectedExpedition.truckId) && (
                      <SelectItem value={selectedExpedition.truckId}>
                        {selectedExpedition.truckPlate} - {selectedExpedition.truckModel}{' '}
                        (Atual)
                      </SelectItem>
                    )}
                  {availableTrucks.map((truck) => (
                    <SelectItem key={truck.id} value={truck.id}>
                      {truck.licensePlate} - {truck.model} ({truck.modelYear})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="edit-deliveryForecast">Previsão de Entrega *</Label>
              <Input
                id="edit-deliveryForecast"
                type="date"
                value={formData.deliveryForecast}
                onChange={(e) =>
                  setFormData({ ...formData, deliveryForecast: e.target.value })
                }
                min={new Date().toISOString().split('T')[0]}
                max={
                  new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                }
              />
            </div>

            <div>
              <Label htmlFor="edit-orderStatus">Status do Pedido</Label>
              <Select
                value={formData.orderStatus !== 'KEEP_CURRENT' ? formData.orderStatus.toString() : 'KEEP_CURRENT'}
                onValueChange={(value) =>
                  setFormData({ ...formData, orderStatus: value !== 'KEEP_CURRENT' ? parseInt(value) : 'KEEP_CURRENT' })
                }
              >
                <SelectTrigger id="edit-orderStatus">
                  <SelectValue placeholder="Manter status atual" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KEEP_CURRENT">Manter status atual</SelectItem>
                  <SelectItem value={OrderStatus.InSeparation.toString()}>
                    {OrderStatusLabels[OrderStatus.InSeparation]}
                  </SelectItem>
                  <SelectItem value={OrderStatus.InTransit.toString()}>
                    {OrderStatusLabels[OrderStatus.InTransit]}
                  </SelectItem>
                  <SelectItem value={OrderStatus.Delivered.toString()}>
                    {OrderStatusLabels[OrderStatus.Delivered]}
                  </SelectItem>
                  <SelectItem value={OrderStatus.Canceled.toString()}>
                    {OrderStatusLabels[OrderStatus.Canceled]}
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500 mt-1">
                Alterar o status do pedido para "Entregue" ou "Cancelado" irá liberar o caminhão
              </p>
            </div>

            <div>
              <Label htmlFor="edit-observation">Observação</Label>
              <Textarea
                id="edit-observation"
                value={formData.observation}
                onChange={(e) => setFormData({ ...formData, observation: e.target.value })}
                maxLength={500}
                placeholder="Observações sobre a expedição (opcional)"
                rows={3}
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.observation.length}/500 caracteres
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdate} disabled={!isEditFormValid()}>
              Atualizar Expedição
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Message Modal */}
      <MessageModal
        open={messageModal.open}
        onOpenChange={(open) => setMessageModal({ open, title: '', message: '' })}
        type="error"
        title={messageModal.title}
        message={messageModal.message}
      />
    </div>
  );
}