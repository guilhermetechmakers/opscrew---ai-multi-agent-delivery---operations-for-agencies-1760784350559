import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CreditCard, Download, Eye, Calendar, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { formatDistanceToNow } from 'date-fns';

interface BillingCardProps {
  projectId: string;
}

// Mock data - in real app, this would come from API
const mockBillingData = {
  currentPlan: 'Professional',
  monthlyRate: 2500,
  nextBillingDate: '2024-01-15',
  totalPaid: 7500,
  remainingBudget: 5000,
  invoices: [
    {
      id: 'INV-001',
      amount: 2500,
      status: 'paid',
      date: '2023-12-15',
      description: 'Monthly Professional Plan'
    },
    {
      id: 'INV-002',
      amount: 1500,
      status: 'pending',
      date: '2024-01-15',
      description: 'Additional Services'
    },
    {
      id: 'INV-003',
      amount: 2500,
      status: 'paid',
      date: '2023-11-15',
      description: 'Monthly Professional Plan'
    }
  ],
  upcomingCharges: [
    {
      description: 'Monthly Professional Plan',
      amount: 2500,
      date: '2024-01-15'
    }
  ]
};

export function BillingCard({ projectId }: BillingCardProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);

  // In a real app, this would be a proper API call
  const { data: billingData, isLoading } = useQuery({
    queryKey: ['billing', projectId],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockBillingData;
    },
    enabled: !!projectId,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-secondary rounded-lg animate-pulse"></div>
        <div className="h-24 bg-secondary rounded-lg animate-pulse"></div>
        <div className="h-24 bg-secondary rounded-lg animate-pulse"></div>
      </div>
    );
  }

  if (!billingData) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Billing Information Unavailable</h3>
        <p className="text-muted-foreground">
          Unable to load billing information at this time.
        </p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'overdue':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Calendar className="h-4 w-4" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Plan Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Current Plan
          </CardTitle>
          <CardDescription>
            Your current subscription and billing information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Plan</p>
              <p className="text-2xl font-bold">{billingData.currentPlan}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Monthly Rate</p>
              <p className="text-2xl font-bold">${billingData.monthlyRate.toLocaleString()}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Next Billing</p>
              <p className="text-2xl font-bold">
                {formatDistanceToNow(new Date(billingData.nextBillingDate), { addSuffix: true })}
              </p>
            </div>
          </div>

          {/* Budget Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Budget Usage</span>
              <span>${billingData.totalPaid.toLocaleString()} / ${(billingData.totalPaid + billingData.remainingBudget).toLocaleString()}</span>
            </div>
            <Progress 
              value={(billingData.totalPaid / (billingData.totalPaid + billingData.remainingBudget)) * 100} 
              className="h-2"
            />
            <p className="text-xs text-muted-foreground">
              ${billingData.remainingBudget.toLocaleString()} remaining
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recent Invoices */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
          <CardDescription>
            Your recent billing history and invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {billingData.invoices.map((invoice) => (
              <div 
                key={invoice.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-secondary">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">{invoice.id}</p>
                    <p className="text-sm text-muted-foreground">{invoice.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(invoice.date), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-semibold">${invoice.amount.toLocaleString()}</p>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getStatusColor(invoice.status)}`}
                    >
                      {getStatusIcon(invoice.status)}
                      <span className="ml-1 capitalize">{invoice.status}</span>
                    </Badge>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Charges */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Charges</CardTitle>
          <CardDescription>
            Scheduled charges and renewals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {billingData.upcomingCharges.map((charge, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <DollarSign className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{charge.description}</p>
                    <p className="text-sm text-muted-foreground">
                      Due {formatDistanceToNow(new Date(charge.date), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${charge.amount.toLocaleString()}</p>
                  <Badge variant="outline" className="text-xs">
                    <Calendar className="h-3 w-3 mr-1" />
                    Scheduled
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>
            Manage your payment methods and billing preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-secondary">
                  <CreditCard className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">•••• •••• •••• 4242</p>
                  <p className="text-sm text-muted-foreground">Expires 12/25</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Update
              </Button>
            </div>
            
            <Button variant="outline" className="w-full">
              <CreditCard className="h-4 w-4 mr-2" />
              Add Payment Method
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
