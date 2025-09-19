import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';
import type { CreateInvestorRequest } from '@/types/api';
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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/ui';
import { ArrowLeft, Edit, Trash2, DollarSign, TrendingUp, User, Mail, Phone, MapPin, FileText } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useInvestor, useUpdateInvestor, useDeleteInvestor } from './hooks';
import { InvestorForm } from './ui/InvestorForm';
import { InvestorCashflowModal } from './ui/InvestorCashflowModal';

export function InvestorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [cashflowModal, setCashflowModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const { toast } = useToast();

  const {
    data: investor,
    isLoading,
    error,
  } = useInvestor(id ?? '');
  const updateInvestorMutation = useUpdateInvestor();
  const deleteInvestorMutation = useDeleteInvestor();

  const handleUpdateInvestor = async (data: CreateInvestorRequest) => {
    if (!investor) return;

    try {
      await updateInvestorMutation.mutateAsync({ id: investor.id, data });
      setShowForm(false);
      toast({
        title: 'Úspech',
        description: 'Investor bol úspešne aktualizovaný.',
      });
    } catch (error: unknown) {
      logger.apiError('update investor', error, { investorId: investor.id, investorData: data });
      const errorMessage =
        error instanceof Error ? error.message : 'Nepodarilo sa aktualizovať investora.';
      toast({
        title: 'Chyba',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteInvestor = async () => {
    if (!investor) return;

    try {
      await deleteInvestorMutation.mutateAsync(investor.id);
      toast({
        title: 'Úspech',
        description: 'Investor bol úspešne odstránený.',
      });
      navigate('/investors');
    } catch (error: unknown) {
      logger.apiError('delete investor', error, { investorId: investor.id });
      const errorMessage =
        error instanceof Error ? error.message : 'Nepodarilo sa odstrániť investora.';
      toast({
        title: 'Chyba',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4 xs:space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/investors" className="text-blue-600 hover:text-blue-700">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold text-foreground">
            Načítavam investora...
          </h1>
        </div>
        <div className="flex items-center justify-center py-8 xs:py-12">
          <div className="animate-spin rounded-full h-6 w-6 xs:h-8 xs:w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !investor) {
    return (
      <div className="space-y-4 xs:space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/investors" className="text-blue-600 hover:text-blue-700">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold text-foreground">
            Investor
          </h1>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 xs:p-4">
          <p className="text-xs xs:text-sm sm:text-base text-red-800">
            {error ? `Chyba pri načítavaní investora: ${(error as Error)?.message ?? 'Neznáma chyba'}` : 'Investor nebol nájdený.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 xs:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/investors" className="text-blue-600 hover:text-blue-700">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold text-foreground">
              {investor.name}
            </h1>
            <p className="text-xs xs:text-sm sm:text-base text-muted-foreground">
              Detail investora
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowForm(true)}
            variant="outline"
            size="sm"
          >
            <Edit className="h-4 w-4 mr-2" />
            Upraviť
          </Button>
          <Button
            onClick={() => setCashflowModal(true)}
            size="sm"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Cashflow
          </Button>
          <Button
            onClick={() => setDeleteConfirm(true)}
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Odstrániť
          </Button>
        </div>
      </div>

      {/* Edit form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Upraviť investora</CardTitle>
          </CardHeader>
          <CardContent>
            <InvestorForm
              onSubmit={handleUpdateInvestor}
              onCancel={() => setShowForm(false)}
              isLoading={updateInvestorMutation.isPending}
              initialData={{
                name: investor.name,
                email: investor.email,
                phone: investor.phone,
                address: investor.address,
                taxId: investor.taxId,
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Investor details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 xs:gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Osobné údaje
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{investor.email}</p>
              </div>
            </div>
            {investor.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Telefón</p>
                  <p className="text-sm text-muted-foreground">{investor.phone}</p>
                </div>
              </div>
            )}
            {investor.address && (
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Adresa</p>
                  <p className="text-sm text-muted-foreground">{investor.address}</p>
                </div>
              </div>
            )}
            {investor.taxId && (
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Daňové ID</p>
                  <p className="text-sm text-muted-foreground">{investor.taxId}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Financial Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Finančné informácie
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Celkový kapitál</p>
              <p className="text-lg font-bold text-green-600">
                €{(investor.totalCapital ?? 0).toLocaleString('sk-SK')}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Vklady</p>
              <p className="text-sm text-muted-foreground">
                €{(investor.totalDeposits ?? 0).toLocaleString('sk-SK')}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Výbery</p>
              <p className="text-sm text-muted-foreground">
                €{(investor.totalWithdrawals ?? 0).toLocaleString('sk-SK')}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Podiel vo firme</p>
              <p className="text-lg font-bold text-blue-600">
                {(investor.ownershipPercent ?? 0).toFixed(2)}%
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Vytvorený</p>
              <p className="text-sm text-muted-foreground">
                {new Date(investor.createdAt).toLocaleDateString('sk-SK')}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Posledná aktualizácia</p>
              <p className="text-sm text-muted-foreground">
                {new Date(investor.updatedAt).toLocaleDateString('sk-SK')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cashflow Modal */}
      {cashflowModal && (
        <InvestorCashflowModal
          investor={investor}
          onClose={() => setCashflowModal(false)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Odstrániť investora</AlertDialogTitle>
            <AlertDialogDescription>
              Ste si istí, že chcete odstrániť investora &quot;{investor.name}&quot;?
              Táto akcia sa nedá vrátiť späť a odstránia sa aj všetky jeho cashflow záznamy.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteInvestorMutation.isPending}>
              Zrušiť
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteInvestor}
              disabled={deleteInvestorMutation.isPending}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deleteInvestorMutation.isPending ? 'Spracúvam...' : 'Odstrániť'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
