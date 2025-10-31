'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { orderService } from '@/services/orderService';
import { inventoryService } from '@/services/inventoryService';
import { Order, OrderInput, OrderInventoryInput, OrderStatusLabels, OrderStatusColors, OrderStatus } from '@/types/Order';
import { Inventory } from '@/types/Inventory';
import { DateRangeFilter } from '@/components/domain/DateRangeFilter';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Date filter states
  const [startDate, setStartDate] = useState<Date>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date;
  });
  const [endDate, setEndDate] = useState<Date>(new Date());

  // Create modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [orderItems, setOrderItems] = useState<OrderInventoryInput[]>([]);

  // Available inventory
  const [availableInventory, setAvailableInventory] = useState<Inventory[]>([]);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getByDateRange(startDate, endDate);
      setOrders(data);
    } catch (error: any) {
      const errorMessage = error.userMessage || error.message || 'Erro ao carregar pedidos';
      toast.error(errorMessage);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableInventory = async () => {
    try {
      const data = await inventoryService.getAvailable();
      setAvailableInventory(data);
    } catch (error: any) {
      const errorMessage = error.userMessage || error.message || 'Erro ao carregar inventário disponível';
      toast.error(errorMessage);
      console.error(error);
    }
  };

  const handleApplyFilter = () => {
    loadOrders();
  };

  const toggleRowExpansion = (orderId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedRows(newExpanded);
  };

  const openCreateModal = async () => {
    setOrderNumber('');
    setCustomerName('');
    setOrderItems([]);
    await loadAvailableInventory();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setOrderNumber('');
    setCustomerName('');
    setOrderItems([]);
  };

  const addItem = () => {
    if (availableInventory.length === 0) {
      toast.error('Nenhum item disponível no inventário');
      return;
    }

    // Find first available inventory not already added
    const availableItem = availableInventory.find(
      (inv) => !orderItems.some((item) => item.inventoryId === inv.id)
    );

    if (!availableItem) {
      toast.error('Todos os itens já foram adicionados');
      return;
    }

    setOrderItems([
      ...orderItems,
      { inventoryId: availableItem.id, quantity: 1 },
    ]);
  };

  const removeItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const updateItemInventory = (index: number, inventoryId: string) => {
    const newItems = [...orderItems];
    newItems[index].inventoryId = inventoryId;
    setOrderItems(newItems);
  };

  const updateItemQuantity = (index: number, quantity: number) => {
    const newItems = [...orderItems];
    newItems[index].quantity = quantity;
    setOrderItems(newItems);
  };

  const getAvailableInventoryForItem = (currentInventoryId?: string) => {
    return availableInventory.filter(
      (inv) =>
        inv.id === currentInventoryId ||
        !orderItems.some((item) => item.inventoryId === inv.id)
    );
  };

  const handleSave = async () => {
    try {
      // Validations
      if (!orderNumber.trim()) {
        toast.error('Número do pedido é obrigatório');
        return;
      }

      if (!customerName.trim()) {
        toast.error('Nome do cliente é obrigatório');
        return;
      }

      if (orderItems.length === 0) {
        toast.error('Adicione pelo menos um item ao pedido');
        return;
      }

      // Validate quantities
      for (const item of orderItems) {
        if (item.quantity <= 0) {
          toast.error('Quantidade deve ser maior que zero');
          return;
        }
      }

      // Check for duplicate inventory items
      const inventoryIds = orderItems.map((item) => item.inventoryId);
      const uniqueIds = new Set(inventoryIds);
      if (inventoryIds.length !== uniqueIds.size) {
        toast.error('Não é possível adicionar o mesmo item mais de uma vez');
        return;
      }

      const newOrder: OrderInput = {
        orderNumber: orderNumber.trim(),
        customerName: customerName.trim(),
        items: orderItems,
      };
      await orderService.create(newOrder);
      toast.success('Pedido criado com sucesso!');

      closeModal();
      loadOrders();
    } catch (error: any) {
      const errorMessage = error.userMessage || error.message || 'Erro ao salvar pedido';
      toast.error(errorMessage);
      console.error(error);
    }
  };

  const getInventoryInfo = (inventoryId: string) => {
    return availableInventory.find((inv) => inv.id === inventoryId);
  };

  const calculateOrderTotal = (order: Order) => {
    return order.items.reduce((sum, item) => {
      return sum + ((item.quantity || 0) * (item.price || 0));
    }, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1>Pedidos</h1>
          <p className="text-muted-foreground">
            Gerencie os pedidos de clientes
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Pedido
        </Button>
      </div>

<DateRangeFilter
  startDate={startDate}
  endDate={endDate}
  onStartDateChange={setStartDate}
  onEndDateChange={setEndDate}
  onApply={handleApplyFilter} // <- nome correto
/>


      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Número do Pedido</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Qtd. Itens</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Nenhum pedido encontrado
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <React.Fragment key={order.id}>
                  <TableRow>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleRowExpansion(order.id)}
                      >
                        {expandedRows.has(order.id) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell>{order.orderNumber}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>
                      {format(new Date(order.createdAt), "dd 'de' MMM, yyyy", {
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={OrderStatusColors[order.status as OrderStatus]}
                      >
                        {OrderStatusLabels[order.status as OrderStatus]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      R$ {calculateOrderTotal(order).toFixed(2)}
                    </TableCell>
                    <TableCell>{order.items.length}</TableCell>
                  </TableRow>

                  {expandedRows.has(order.id) && (
                    <TableRow>
                      <TableCell colSpan={7} className="bg-muted/50">
                        <div className="p-4 space-y-2">
                          <h4 className="mb-2">Itens do Pedido:</h4>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Código do Produto</TableHead>
                                <TableHead>Descrição</TableHead>
                                <TableHead>Quantidade</TableHead>
                                <TableHead>Preço Unit.</TableHead>
                                <TableHead>Subtotal</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {order.items.map((item, idx) => (
                                <TableRow key={idx}>
                                  <TableCell>{item.productCode || 'N/A'}</TableCell>
                                  <TableCell>{item.description || 'N/A'}</TableCell>
                                  <TableCell>{item.quantity || 0}</TableCell>
                                  <TableCell>R$ {item.price?.toFixed(2) || '0.00'}</TableCell>
                                  <TableCell>
                                    R$ {((item.quantity || 0) * (item.price || 0)).toFixed(2)}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Pedido</DialogTitle>
            <DialogDescription>
              Preencha as informações para criar um novo pedido
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="orderNumber">Número do Pedido *</Label>
                <Input
                  id="orderNumber"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="Ex: PED-001"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerName">Nome do Cliente *</Label>
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ex: João Silva"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Itens do Pedido *</Label>
                <Button type="button" onClick={addItem} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Item
                </Button>
              </div>

              {orderItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border rounded-lg bg-muted/30">
                  Nenhum item adicionado. Clique em "Adicionar Item" para começar.
                </div>
              ) : (
                <div className="space-y-3">
                  {orderItems.map((item, index) => {
                    const inventory = getInventoryInfo(item.inventoryId);

                    return (
                      <div
                        key={index}
                        className="border rounded-lg p-4 space-y-3 bg-muted/30"
                      >
                        <div className="flex justify-between items-start">
                          <h4>Item {index + 1}</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(index)}
                            className="h-8 w-8"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Produto</Label>
                            <Select
                              value={item.inventoryId}
                              onValueChange={(value) =>
                                updateItemInventory(index, value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um produto" />
                              </SelectTrigger>
                              <SelectContent>
                                {getAvailableInventoryForItem(item.inventoryId).map(
                                  (inv) => (
                                    <SelectItem key={inv.id} value={inv.id}>
                                      {inv.productCode} - {inv.description} (Disponível:{' '}
                                      {inv.quantity})
                                    </SelectItem>
                                  )
                                )}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Quantidade</Label>
                            <Input
                              type="number"
                              min="1"
                              max={inventory?.quantity || 999999}
                              value={item.quantity}
                              onChange={(e) =>
                                updateItemQuantity(index, parseInt(e.target.value) || 1)
                              }
                            />
                            {inventory && (
                              <p className="text-xs text-muted-foreground">
                                Máximo disponível: {inventory.quantity}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label>Preço Unitário</Label>
                            <Input
                              value={inventory && inventory.price ? `R$ ${inventory.price.toFixed(2)}` : 'R$ 0,00'}
                              disabled
                            />
                          </div>
                        </div>

                        {inventory && inventory.price !== undefined && (
                          <div className="bg-muted p-3 rounded">
                            <p className="text-sm">
                              <strong>Subtotal:</strong> R${' '}
                              {(inventory.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <div className="bg-primary/10 p-4 rounded-lg">
                    <p className="text-lg">
                      <strong>Total do Pedido:</strong> R${' '}
                      {orderItems
                        .reduce((sum, item) => {
                          const inv = getInventoryInfo(item.inventoryId);
                          return sum + (inv && inv.price ? inv.price * item.quantity : 0);
                        }, 0)
                        .toFixed(2)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleSave}>
              Criar Pedido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}