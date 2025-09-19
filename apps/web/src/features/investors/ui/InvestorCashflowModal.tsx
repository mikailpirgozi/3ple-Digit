import type {
  Investor,
  InvestorCashflow,
  CreateCashflowRequest,
} from '@/types/api';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/ui';
import { useState } from 'react';
import { useInvestorCashflows, useCreateCashflow, useUpdateCashflow, useDeleteCashflow } from '../hooks';
import { CashflowForm } from './CashflowForm';

interface InvestorCashflowModalProps {
  investor: Investor;
  onClose: () => void;
}

const cashflowTypeLabels: Record<string, string> = {
  DEPOSIT: '💰 Vklad',
  WITHDRAWAL: '💸 Výber',
};

export function InvestorCashflowModal({ investor, onClose }: InvestorCashflowModalProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingCashflow, setEditingCashflow] = useState<InvestorCashflow | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    cashflowId: string;
    cashflowType: string;
    amount: number;
  }>({
    open: false,
    cashflowId: '',
    cashflowType: '',
    amount: 0,
  });
  const { toast } = useToast();

  const { data: cashflows, isLoading } = useInvestorCashflows(investor.id);
  const createCashflowMutation = useCreateCashflow();
  const updateCashflowMutation = useUpdateCashflow();
  const deleteCashflowMutation = useDeleteCashflow();

  const handleCreateCashflow = async (data: CreateCashflowRequest) => {
    try {
      await createCashflowMutation.mutateAsync({ id: investor.id, data });
      setShowForm(false);
      toast({
        title: 'Úspech',
        description: 'Cashflow bol úspešne vytvorený. Vlastníctvo sa automaticky prepočítalo.',
      });
    } catch (error: unknown) {
      logger.apiError('create cashflow', error, { investorId: investor.id, cashflowData: data });
      const errorMessage =
        error instanceof Error ? error.message : 'Nepodarilo sa vytvoriť cashflow.';
      toast({
        title: 'Chyba',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleUpdateCashflow = async (data: CreateCashflowRequest) => {
    if (!editingCashflow) return;

    try {
      await updateCashflowMutation.mutateAsync({
        investorId: investor.id,
        cashflowId: editingCashflow.id,
        data,
      });
      setEditingCashflow(null);
      toast({
        title: 'Úspech',
        description: 'Cashflow bol úspešne aktualizovaný. Vlastníctvo sa automaticky prepočítalo.',
      });
    } catch (error: unknown) {
      logger.apiError('update cashflow', error, { 
        investorId: investor.id, 
        cashflowId: editingCashflow.id, 
        cashflowData: data 
      });
      const errorMessage =
        error instanceof Error ? error.message : 'Nepodarilo sa aktualizovať cashflow.';
      toast({
        title: 'Chyba',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteCashflow = (cashflow: InvestorCashflow) => {
    setDeleteConfirm({
      open: true,
      cashflowId: cashflow.id,
      cashflowType: cashflow.type,
      amount: cashflow.amount,
    });
  };

  const confirmDeleteCashflow = async () => {
    try {
      await deleteCashflowMutation.mutateAsync({
        investorId: investor.id,
        cashflowId: deleteConfirm.cashflowId,
      });
      toast({
        title: 'Úspech',
        description: 'Cashflow bol úspešne odstránený. Vlastníctvo sa automaticky prepočítalo.',
      });
      setDeleteConfirm({ open: false, cashflowId: '', cashflowType: '', amount: 0 });
    } catch (error: unknown) {
      logger.apiError('delete cashflow', error, { 
        investorId: investor.id, 
        cashflowId: deleteConfirm.cashflowId 
      });
      const errorMessage =
        error instanceof Error ? error.message : 'Nepodarilo sa odstrániť cashflow.';
      toast({
        title: 'Chyba',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleEditCashflow = (cashflow: InvestorCashflow) => {
    setEditingCashflow(cashflow);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCashflow(null);
  };

  return (
    <>
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Cashflow pre investora: {investor.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Add cashflow button */}
            <div className="flex justify-end">
              <Button onClick={() => setShowForm(true)}>
                Pridať cashflow
              </Button>
            </div>

            {/* Cashflow form */}
            {showForm && (
              <div className="rounded-lg border border-border bg-card p-4">
                <h3 className="text-lg font-semibold mb-4">
                  {editingCashflow ? 'Upraviť cashflow' : 'Nový cashflow'}
                </h3>
                <CashflowForm
                  onSubmit={editingCashflow ? handleUpdateCashflow : handleCreateCashflow}
                  onCancel={handleCloseForm}
                  isLoading={createCashflowMutation.isPending || updateCashflowMutation.isPending}
                  initialData={editingCashflow ? {
                    type: editingCashflow.type,
                    amount: editingCashflow.amount,
                    date: editingCashflow.date,
                    note: editingCashflow.note ?? undefined,
                  } : undefined}
                />
              </div>
            )}

            {/* Cashflows list */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">História cashflow</h3>
              
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : !cashflows || cashflows.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Žiadne cashflow záznamy.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {cashflows.map((cashflow) => (
                    <div
                      key={cashflow.id}
                      className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent/50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">
                            {cashflowTypeLabels[cashflow.type] ?? cashflow.type}
                          </span>
                          <span className={`font-semibold ${
                            cashflow.type === 'DEPOSIT' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            €{cashflow.amount.toLocaleString('sk-SK')}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(cashflow.date).toLocaleDateString('sk-SK')}
                          </span>
                        </div>
                        {cashflow.note && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {cashflow.note}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditCashflow(cashflow)}
                        >
                          Upraviť
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCashflow(cashflow)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Odstrániť
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteConfirm.open}
        onOpenChange={(open: boolean) => setDeleteConfirm({ ...deleteConfirm, open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Odstrániť cashflow</AlertDialogTitle>
            <AlertDialogDescription>
              Ste si istí, že chcete odstrániť cashflow {cashflowTypeLabels[deleteConfirm.cashflowType]} 
              v hodnote €{deleteConfirm.amount.toLocaleString('sk-SK')}?
              Táto akcia sa nedá vrátiť späť.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteCashflowMutation.isPending}>
              Zrušiť
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteCashflow}
              disabled={deleteCashflowMutation.isPending}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deleteCashflowMutation.isPending ? 'Spracúvam...' : 'Odstrániť'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
