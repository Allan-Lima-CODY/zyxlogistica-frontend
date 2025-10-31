'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Save, X, Loader2, Power } from 'lucide-react';
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
import { inventoryService } from '@/services/inventoryService';
import { Inventory, InventoryInput, InventoryUpdate } from '@/types/Inventory';
import { formatDate, formatNumber } from '@/utils/formatCurrency';
import { formatPriceInput, unformatPriceInput } from '@/utils/formatters';

const InventoryPage = () => {
  const [inventory, setInventory] = useState<Inventory[]>([]);
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

  const [newInventory, setNewInventory] = useState<InventoryInput>({
    productCode: '',
    description: '',
    quantity: 0,
    price: 0,
  });

  // String versions for input fields
  const [newInventoryInputs, setNewInventoryInputs] = useState({
    quantity: '',
    price: '',
  });

  const [editForm, setEditForm] = useState<{ [key: string]: InventoryUpdate }>({});
  const [editFormInputs, setEditFormInputs] = useState<{ [key: string]: { price: string } }>({});

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const data = await inventoryService.getByDateRange(startDate, endDate);
      setInventory(data);
    } catch (error: any) {
      const errorMessage = error.userMessage || error.message || 'Erro ao carregar inventário';
      showModal('error', 'Erro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const showModal = (
    type: 'success' | 'error' | 'confirm',
    title: string,
    message: string,
    onConfirm?: () => void
  ) => {
    setModal({ open: true, type, title, message, onConfirm });
  };

  const handleAddInventory = async () => {
    // Validation
    if (!newInventory.productCode.trim()) {
      showModal('error', 'Erro', 'ProductCode não pode ser vazio');
      return;
    }
    if (newInventory.productCode.length > 50) {
      showModal('error', 'Erro', 'ProductCode não pode ter mais que 50 caracteres');
      return;
    }
    if (!newInventory.description.trim()) {
      showModal('error', 'Erro', 'Descrição não pode ser vazia');
      return;
    }
    if (newInventory.description.length > 200) {
      showModal('error', 'Erro', 'Descrição não pode ter mais que 200 caracteres');
      return;
    }
    
    const quantity = newInventoryInputs.quantity ? parseInt(newInventoryInputs.quantity) : 0;
    const price = unformatPriceInput(newInventoryInputs.price);
    
    if (quantity < 0) {
      showModal('error', 'Erro', 'Quantidade deve ser >= 0');
      return;
    }
    if (price < 0) {
      showModal('error', 'Erro', 'Preço deve ser >= 0');
      return;
    }

    setLoading(true);
    try {
      await inventoryService.create({
        ...newInventory,
        quantity,
        price,
      });
      showModal('success', 'Sucesso', 'Item adicionado com sucesso!');
      setShowAddCard(false);
      setNewInventory({
        productCode: '',
        description: '',
        quantity: 0,
        price: 0,
      });
      setNewInventoryInputs({
        quantity: '',
        price: '',
      });
      fetchInventory();
    } catch (error: any) {
      const errorMessage = error.userMessage || error.message || 'Erro ao adicionar item';
      showModal('error', 'Erro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAdd = () => {
    setShowAddCard(false);
    setNewInventory({
      productCode: '',
      description: '',
      quantity: 0,
      price: 0,
    });
    setNewInventoryInputs({
      quantity: '',
      price: '',
    });
  };

  const handleStartEdit = (item: Inventory) => {
    setEditingId(item.id);
    setEditForm({
      ...editForm,
      [item.id]: {
        description: item.description,
        price: item.price,
      },
    });
    // Convert price to cents and format for bank-style input
    const priceInCents = Math.round(item.price * 100).toString();
    setEditFormInputs({
      ...editFormInputs,
      [item.id]: {
        price: formatPriceInput(priceInCents),
      },
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = async (id: string) => {
    const update = editForm[id];
    if (!update) return;

    // Validation
    if (!update.description.trim()) {
      showModal('error', 'Erro', 'Descrição não pode ser vazia');
      return;
    }
    if (update.description.length > 200) {
      showModal('error', 'Erro', 'Descrição não pode ter mais que 200 caracteres');
      return;
    }
    
    const priceInput = editFormInputs[id]?.price || '';
    const price = unformatPriceInput(priceInput);
    
    if (price < 0) {
      showModal('error', 'Erro', 'Preço deve ser >= 0');
      return;
    }

    setLoading(true);
    try {
      await inventoryService.update(id, {
        description: update.description,
        price,
      });
      showModal('success', 'Sucesso', 'Item atualizado com sucesso!');
      setEditingId(null);
      fetchInventory();
    } catch (error: any) {
      const errorMessage = error.userMessage || error.message || 'Erro ao atualizar item';
      showModal('error', 'Erro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (id: string, field: 'description' | 'price', value: string) => {
    if (field === 'description') {
      setEditForm({
        ...editForm,
        [id]: {
          ...editForm[id],
          description: value,
        },
      });
    } else if (field === 'price') {
      // Format the price input (bank-style)
      const formatted = formatPriceInput(value);
      setEditFormInputs({
        ...editFormInputs,
        [id]: {
          price: formatted,
        },
      });
      // Update editForm with parsed value
      const numValue = unformatPriceInput(formatted);
      setEditForm({
        ...editForm,
        [id]: {
          ...editForm[id],
          price: numValue,
        },
      });
    }
  };

  const handleToggleActive = (item: Inventory) => {
    const action = item.active ? 'inativar' : 'ativar';
    showModal(
      'confirm',
      'Confirmação',
      `Deseja realmente ${action} o item ${item.productCode}?`,
      async () => {
        setLoading(true);
        try {
          await inventoryService.toggleActive(item.id);
          showModal('success', 'Sucesso', `Item ${action === 'inativar' ? 'inativado' : 'ativado'} com sucesso!`);
          fetchInventory();
        } catch (error) {
          showModal('error', 'Erro', error instanceof Error ? error.message : `Erro ao ${action} item`);
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
          <h1 className="text-3xl mb-2">Inventário</h1>
          <p className="text-gray-600">Gerencie os itens de estoque</p>
        </div>
        <Button
          onClick={() => setShowAddCard(true)}
          disabled={showAddCard || loading}
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Item
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
            onApply={fetchInventory}
          />
        </CardContent>
      </Card>

      {showAddCard && (
        <Card className="border-purple-200 bg-purple-50/50">
          <CardHeader>
            <CardTitle>Adicionar Novo Item</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="productCode">Código do Produto *</Label>
                <Input
                  id="productCode"
                  value={newInventory.productCode}
                  onChange={(e) =>
                    setNewInventory({ ...newInventory, productCode: e.target.value })
                  }
                  placeholder="PROD-001"
                  maxLength={50}
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="quantity">Quantidade *</Label>
                <Input
                  id="quantity"
                  type="text"
                  inputMode="numeric"
                  value={newInventoryInputs.quantity}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    setNewInventoryInputs({ ...newInventoryInputs, quantity: value });
                    setNewInventory({ ...newInventory, quantity: parseInt(value) || 0 });
                  }}
                  placeholder="0"
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="price">Preço (R$) *</Label>
                <Input
                  id="price"
                  type="text"
                  inputMode="numeric"
                  value={newInventoryInputs.price}
                  onChange={(e) => {
                    const formatted = formatPriceInput(e.target.value);
                    setNewInventoryInputs({ ...newInventoryInputs, price: formatted });
                    setNewInventory({ ...newInventory, price: unformatPriceInput(formatted) });
                  }}
                  placeholder="0,00"
                  disabled={loading}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="description">Descrição *</Label>
                <Input
                  id="description"
                  value={newInventory.description}
                  onChange={(e) =>
                    setNewInventory({ ...newInventory, description: e.target.value })
                  }
                  placeholder="Descrição do item"
                  maxLength={200}
                  disabled={loading}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button onClick={handleAddInventory} disabled={loading}>
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
          <CardTitle>Lista de Itens ({inventory.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && !showAddCard ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
          ) : inventory.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Nenhum item encontrado no período selecionado
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">#</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Preço Unit.</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead>Atualizado em</TableHead>
                    <TableHead className="w-40">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventory.map((item, index) => {
                    const isEditing = editingId === item.id;
                    const editData = editForm[item.id];

                    return (
                      <TableRow key={item.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{item.productCode}</TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Input
                              value={editData?.description || ''}
                              onChange={(e) =>
                                handleEditChange(item.id, 'description', e.target.value)
                              }
                              maxLength={200}
                              disabled={loading}
                            />
                          ) : (
                            item.description
                          )}
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              item.quantity === 0
                                ? 'text-red-600'
                                : item.quantity < 100
                                ? 'text-yellow-600'
                                : ''
                            }
                          >
                            {formatNumber(item.quantity)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Input
                              type="text"
                              inputMode="numeric"
                              value={editFormInputs[item.id]?.price || ''}
                              onChange={(e) => {
                                handleEditChange(item.id, 'price', e.target.value);
                              }}
                              placeholder="0,00"
                              disabled={loading}
                              className="w-32"
                            />
                          ) : (
                            `R$ ${item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          )}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                              item.active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {item.active ? 'Ativo' : 'Inativo'}
                          </span>
                        </TableCell>
                        <TableCell>{formatDate(item.createdAt)}</TableCell>
                        <TableCell>
                          {item.updatedAt ? formatDate(item.updatedAt) : '-'}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <div className="flex gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleSaveEdit(item.id)}
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
                                onClick={() => handleStartEdit(item)}
                                disabled={loading || showAddCard}
                              >
                                <Edit className="h-4 w-4 text-blue-600" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleToggleActive(item)}
                                disabled={loading || showAddCard}
                              >
                                <Power
                                  className={`h-4 w-4 ${
                                    item.active ? 'text-red-600' : 'text-green-600'
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

export default InventoryPage;