'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { DateRangeFilter } from '@/components/domain/DateRangeFilter';
import { MessageModal } from '@/components/domain/MessageModal';
import { inboundEntryService } from '@/services/inboundEntryService';
import { InboundEntry, InboundEntryInput, InboundEntryUpdate } from '@/types/InboundEntry';
import { formatPriceInput, unformatPriceInput } from '@/utils/formatters';
import { toast } from 'sonner';

export default function InboundEntryPage() {
  const [entries, setEntries] = useState<InboundEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

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
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [messageModal, setMessageModal] = useState<{
    open: boolean;
    title: string;
    message: string;
  }>({ open: false, title: '', message: '' });

  // Form states
  const [selectedEntry, setSelectedEntry] = useState<InboundEntry | null>(null);
  const [formData, setFormData] = useState({
    productCode: '',
    description: '',
    quantity: '',
    price: '',
    reference: '',
    supplierName: '',
    observation: '',
  });

  // Load entries on mount
  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      setLoading(true);
      const data = await inboundEntryService.getByDateRange(startDate, endDate);
      setEntries(data);
    } catch (error: any) {
      const errorMessage = error.userMessage || error.message || 'Erro ao carregar entradas de materiais';
      toast.error(errorMessage);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };



  const toggleRowExpansion = (id: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(id)) {
      newExpandedRows.delete(id);
    } else {
      newExpandedRows.add(id);
    }
    setExpandedRows(newExpandedRows);
  };

  const resetForm = () => {
    setFormData({
      productCode: '',
      description: '',
      quantity: '',
      price: '',
      reference: '',
      supplierName: '',
      observation: '',
    });
    setSelectedEntry(null);
  };

  const openCreateModal = () => {
    resetForm();
    setCreateModalOpen(true);
  };

  const openEditModal = (entry: InboundEntry) => {
    setSelectedEntry(entry);
    setFormData({
      productCode: '',
      description: '',
      quantity: '',
      price: '',
      reference: entry.reference,
      supplierName: entry.supplierName,
      observation: entry.observation || '',
    });
    setEditModalOpen(true);
  };

  const openDeleteModal = (entry: InboundEntry) => {
    setSelectedEntry(entry);
    setDeleteModalOpen(true);
  };



  const handleCreate = async () => {
    try {
      const priceValue = unformatPriceInput(formData.price);
      
      const input: InboundEntryInput = {
        inventoryInput: {
          productCode: formData.productCode,
          description: formData.description,
          quantity: parseInt(formData.quantity),
          price: priceValue,
        },
        reference: formData.reference,
        supplierName: formData.supplierName,
        observation: formData.observation,
      };

      await inboundEntryService.create(input);
      toast.success('Entrada de material criada com sucesso');
      setCreateModalOpen(false);
      resetForm();
      await loadEntries();
    } catch (error: any) {
      const errorMessage = error.userMessage || error.message || 'Ocorreu um erro ao criar a entrada de material';
      setMessageModal({
        open: true,
        title: 'Erro ao criar entrada',
        message: errorMessage,
      });
    }
  };

  const handleUpdate = async () => {
    if (!selectedEntry) return;

    try {
      const update: InboundEntryUpdate = {
        reference: formData.reference,
        supplierName: formData.supplierName,
        observation: formData.observation,
      };

      await inboundEntryService.update(selectedEntry.id, update);
      toast.success('Entrada de material atualizada com sucesso');
      setEditModalOpen(false);
      resetForm();
      await loadEntries();
    } catch (error: any) {
      const errorMessage = error.userMessage || error.message || 'Ocorreu um erro ao atualizar a entrada de material';
      setMessageModal({
        open: true,
        title: 'Erro ao atualizar entrada',
        message: errorMessage,
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedEntry) return;

    try {
      await inboundEntryService.delete(selectedEntry.id);
      toast.success('Entrada de material excluída com sucesso');
      setDeleteModalOpen(false);
      resetForm();
      await loadEntries();
    } catch (error: any) {
      const errorMessage = error.userMessage || error.message || 'Ocorreu um erro ao excluir a entrada de material';
      setMessageModal({
        open: true,
        title: 'Erro ao excluir entrada',
        message: errorMessage,
      });
    }
  };

  const isCreateFormValid = () => {
    const priceValue = unformatPriceInput(formData.price);
    return (
      formData.productCode.trim() !== '' &&
      formData.description.trim() !== '' &&
      formData.quantity.trim() !== '' &&
      parseInt(formData.quantity) > 0 &&
      formData.price.trim() !== '' &&
      priceValue >= 0 &&
      formData.reference.trim() !== '' &&
      formData.supplierName.trim() !== ''
    );
  };

  const isEditFormValid = () => {
    return formData.reference.trim() !== '' && formData.supplierName.trim() !== '';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1>Entradas de Materiais</h1>
          <p className="text-muted-foreground">
            Gerencie as entradas de materiais no estoque
          </p>
        </div>
      </div>

      <DateRangeFilter
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onApply={loadEntries}
      />

      <div className="flex justify-end">
        <Button onClick={openCreateModal} disabled={loading}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Entrada
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Referência</TableHead>
              <TableHead>Fornecedor</TableHead>
              <TableHead>Código do Produto</TableHead>
              <TableHead>Quantidade</TableHead>
              <TableHead>Data de Criação</TableHead>
              <TableHead>Última Atualização</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Nenhuma entrada encontrada
                </TableCell>
              </TableRow>
            ) : (
              entries.map((entry) => (
                <React.Fragment key={entry.id}>
                  <TableRow>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleRowExpansion(entry.id)}
                        className="h-8 w-8"
                      >
                        {expandedRows.has(entry.id) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell>{entry.reference}</TableCell>
                    <TableCell>{entry.supplierName}</TableCell>
                    <TableCell>{entry.productCode}</TableCell>
                    <TableCell>{entry.quantity}</TableCell>
                    <TableCell>
                      {format(new Date(entry.createdAt), 'dd/MM/yyyy HH:mm', {
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell>
                      {entry.updatedAt
                        ? format(new Date(entry.updatedAt), 'dd/MM/yyyy HH:mm', {
                            locale: ptBR,
                          })
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditModal(entry)}
                          className="h-8 w-8"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteModal(entry)}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  {expandedRows.has(entry.id) && (
                    <TableRow>
                      <TableCell colSpan={8} className="bg-muted/50 p-4">
                        <div className="space-y-4">
                          <h4>Detalhes do Item Adicionado</h4>
                          <div className="border rounded-lg overflow-hidden">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Código do Produto</TableHead>
                                  <TableHead>Descrição</TableHead>
                                  <TableHead>Quantidade</TableHead>
                                  <TableHead>Preço Unitário</TableHead>
                                  <TableHead>Valor Total</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                <TableRow>
                                  <TableCell>{entry.productCode}</TableCell>
                                  <TableCell>{entry.description}</TableCell>
                                  <TableCell>{entry.quantity}</TableCell>
                                  <TableCell>
                                    R${' '}
                                    {entry.price.toLocaleString('pt-BR', {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                                  </TableCell>
                                  <TableCell>
                                    R${' '}
                                    {(entry.price * entry.quantity).toLocaleString('pt-BR', {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                                  </TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </div>
                          {entry.observation && (
                            <div>
                              <Label>Observação</Label>
                              <p className="text-sm text-muted-foreground mt-1">
                                {entry.observation}
                              </p>
                            </div>
                          )}
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
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adicionar Entrada de Material</DialogTitle>
            <DialogDescription>
              Preencha os dados da entrada de material. Se o código do produto já existir no sistema, a quantidade será
              adicionada ao estoque existente. Caso contrário, um novo produto será criado.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="productCode">Código do Produto *</Label>
              <Input
                id="productCode"
                value={formData.productCode}
                onChange={(e) =>
                  setFormData({ ...formData, productCode: e.target.value })
                }
                maxLength={50}
                placeholder="Ex: PROD-001"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Descrição *</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                maxLength={200}
                placeholder="Ex: Parafuso M8 x 50mm"
              />
            </div>
            
            <div>
              <Label htmlFor="price">Preço Unitário (R$) *</Label>
              <Input
                id="price"
                type="text"
                inputMode="numeric"
                value={formData.price}
                onChange={(e) => {
                  const formatted = formatPriceInput(e.target.value);
                  setFormData({ ...formData, price: formatted });
                }}
                placeholder="0,00"
              />
            </div>

            <div>
              <Label htmlFor="quantity">Quantidade *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="0"
              />
            </div>

            <div>
              <Label htmlFor="reference">Referência *</Label>
              <Input
                id="reference"
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                maxLength={100}
                placeholder="Ex: NF-2024-1001"
              />
            </div>

            <div>
              <Label htmlFor="supplierName">Fornecedor *</Label>
              <Input
                id="supplierName"
                value={formData.supplierName}
                onChange={(e) =>
                  setFormData({ ...formData, supplierName: e.target.value })
                }
                maxLength={200}
                placeholder="Ex: Fornecedor ABC Ltda"
              />
            </div>

            <div>
              <Label htmlFor="observation">Observação</Label>
              <Textarea
                id="observation"
                value={formData.observation}
                onChange={(e) =>
                  setFormData({ ...formData, observation: e.target.value })
                }
                maxLength={500}
                placeholder="Observações sobre a entrada..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={!isCreateFormValid()}>
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Entrada de Material</DialogTitle>
            <DialogDescription>
              Atualize os dados da entrada de material. Os dados do produto não podem ser
              alterados.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-reference">Referência *</Label>
              <Input
                id="edit-reference"
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                maxLength={100}
              />
            </div>

            <div>
              <Label htmlFor="edit-supplierName">Fornecedor *</Label>
              <Input
                id="edit-supplierName"
                value={formData.supplierName}
                onChange={(e) =>
                  setFormData({ ...formData, supplierName: e.target.value })
                }
                maxLength={200}
              />
            </div>

            <div>
              <Label htmlFor="edit-observation">Observação</Label>
              <Textarea
                id="edit-observation"
                value={formData.observation}
                onChange={(e) =>
                  setFormData({ ...formData, observation: e.target.value })
                }
                maxLength={500}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdate} disabled={!isEditFormValid()}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta entrada de material?
              <br />
              <br />
              <span>
                Referência: <strong>{selectedEntry?.reference}</strong>
              </span>
              <br />
              <span>
                Fornecedor: <strong>{selectedEntry?.supplierName}</strong>
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Message Modal */}
      <MessageModal
        open={messageModal.open}
        onOpenChange={(open) => setMessageModal({ ...messageModal, open })}
        type="error"
        title={messageModal.title}
        message={messageModal.message}
      />
    </div>
  );
}
