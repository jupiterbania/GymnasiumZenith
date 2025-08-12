
"use client";
import React, { useState, useEffect, useTransition, useCallback } from "react";
import { Member, Payment, MemberStatus } from "@/types";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { getMonth, getYear, parse } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRefresh } from "@/hooks/use-refresh";
import { IndianRupee, Loader2, RefreshCw } from "lucide-react";
import { getMembers, addMember as addMemberAction, updateMember as updateMemberAction, deleteMember as deleteMemberAction, getFeeSettings, saveFeeSettings } from "@/lib/actions";

const getMonthsBetween = (startDate: Date, endDate: Date): string[] => {
    const months = [];
    let currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const lastDate = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 1);

    while (currentDate < lastDate) {
        months.push(currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' }));
        currentDate.setMonth(currentDate.getMonth() + 1);
    }
    return months;
}

const generatePaymentHistory = (member: Member): Member => {
    const payments: Payment[] = [];
    const today = new Date();
    const joinDate = new Date(member.startDate);

    if (!member.statusHistory || member.statusHistory.length === 0) {
        member.statusHistory = [{ id: `status-${Date.now()}`, startDate: member.startDate, endDate: null, status: 'active' }];
    }

    const allMonths = getMonthsBetween(joinDate, today);

    const activeMonths = new Set<string>();
    member.statusHistory
        ?.filter(s => s.status === 'active')
        .forEach(period => {
            const startDate = new Date(period.startDate);
            const endDate = period.endDate ? new Date(period.endDate) : today;
            const monthsInPeriod = getMonthsBetween(startDate, endDate);
            monthsInPeriod.forEach(month => activeMonths.add(month));
        });

    const existingPayments = new Map(member.payments?.map(p => [p.month, p]));

    allMonths.forEach((month) => {
        const existingPayment = existingPayments.get(month);
        const isActiveMonth = activeMonths.has(month);

        if (isActiveMonth) {
            payments.push({
                id: existingPayment?.id || `p${member.id}-${month.replace(' ', '-')}`,
                memberId: member.id,
                amount: member.monthlyFee,
                paymentDate: existingPayment?.status === 'Paid' ? (existingPayment.paymentDate || new Date().toISOString().split('T')[0]) : null,
                month: month,
                status: existingPayment?.status === 'Paid' ? 'Paid' : 'Unpaid',
            });
        } else {
             payments.push({
                id: existingPayment?.id || `p${member.id}-${month.replace(' ', '-')}`,
                memberId: member.id,
                amount: member.monthlyFee,
                paymentDate: null,
                month: month,
                status: 'Inactive',
            });
        }
    });
    
    const latestStatus = [...member.statusHistory].sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())[0];
    const currentStatus = (latestStatus && latestStatus.endDate === null) ? latestStatus.status : 'inactive';

    return { ...member, payments, status: currentStatus };
}

export default function MembersPage() {
  const [data, setData] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [admissionFee, setAdmissionFee] = useState(1000);
  const [monthlyFee, setMonthlyFee] = useState(500);
  const { toast } = useToast();
  const { refresh } = useRefresh();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
        const [members, fees] = await Promise.all([getMembers(), getFeeSettings()]);
        const processedData = members.map(d => generatePaymentHistory(d as Member));
        setData(processedData);
        if(fees) {
            setAdmissionFee(fees.admissionFee);
            setMonthlyFee(fees.monthlyFee);
        }
    } catch (error) {
        toast({ title: "Error", description: "Failed to load data.", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-refresh data every 30 seconds - only when page is visible
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (interval) clearInterval(interval);
      } else {
        interval = setInterval(() => {
          loadData();
        }, 30000);
      }
    };

    if (!document.hidden) {
      interval = setInterval(() => {
        loadData();
      }, 30000);
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (interval) clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadData]);

  const handleSaveFees = () => {
    startTransition(async () => {
        try {
            await saveFeeSettings({ admissionFee, monthlyFee });
            toast({
                title: "Settings Saved",
                description: "Your fee settings have been updated successfully.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Could not save settings.",
                variant: "destructive",
            });
        }
    })
  };

  const addMember = (member: Omit<Member, 'id' | 'memberId' | 'status' | 'statusHistory' | 'payments'>) => {
    startTransition(async () => {
        const newMemberData: Omit<Member, 'id'> = { 
            ...member, 
            memberId: `GZ${Date.now() % 100000}`,
            status: 'active',
            statusHistory: [{
                id: `status-${Date.now()}`,
                status: 'active',
                startDate: member.startDate,
                endDate: null
            }],
            payments: [],
        };
        try {
            await addMemberAction(newMemberData);
            await loadData();
            toast({ title: "Member Added", description: `${member.fullName} has been added.` });
        } catch (error) {
             toast({ title: "Error", description: "Failed to add member.", variant: "destructive" });
        }
    })
  };

  const updateMember = useCallback((updatedMember: Member) => {
     startTransition(async () => {
        try {
            await updateMemberAction(updatedMember);
            await loadData();
            toast({ title: "Member Updated", description: `${updatedMember.fullName} has been updated.` });
        } catch (error) {
            toast({ title: "Error", description: "Failed to update member.", variant: "destructive" });
        }
    });
  }, [loadData, toast]);

  const deleteMember = useCallback((memberId: string) => {
    startTransition(async () => {
        try {
            await deleteMemberAction(memberId);
            await loadData();
            toast({ title: "Member Deleted", description: "Member has been deleted." });
        } catch(error) {
            toast({ title: "Error", description: "Failed to delete member.", variant: "destructive" });
        }
    });
  }, [loadData, toast]);

  const handlePaymentUpdate = useCallback((memberId: string, updatedPayments: Payment[]) => {
      const memberToUpdate = data.find(m => m.id === memberId);
      if (memberToUpdate) {
        updateMember({ ...memberToUpdate, payments: updatedPayments });
      }
  }, [data, updateMember]);

  const markAsPaid = useCallback((memberId: string, paymentId: string) => {
    const member = data.find(m => m.id === memberId);
    if(member) {
        const updatedPayments = member.payments?.map(p => 
            p.id === paymentId ? { ...p, status: 'Paid', paymentDate: new Date().toISOString().split('T')[0] } : p
        ) || [];
        handlePaymentUpdate(memberId, updatedPayments);
    }
  }, [data, handlePaymentUpdate]);

  const markAsUnpaid = useCallback((memberId: string, paymentId: string) => {
    const member = data.find(m => m.id === memberId);
    if(member) {
        const updatedPayments = member.payments?.map(p => 
            p.id === paymentId ? { ...p, status: 'Unpaid', paymentDate: null } : p
        ) || [];
        handlePaymentUpdate(memberId, updatedPayments);
    }
  }, [data, handlePaymentUpdate]);

    const markMonthAsInactive = useCallback((memberId: string, month: string) => {
        const member = data.find(m => m.id === memberId);
        if (member) {
            const newStatusHistory = [...member.statusHistory];
            const targetMonthDate = parse(month, 'MMMM yyyy', new Date());
            const monthStartDate = new Date(Date.UTC(getYear(targetMonthDate), getMonth(targetMonthDate), 1));
            const monthEndDate = new Date(Date.UTC(getYear(targetMonthDate), getMonth(targetMonthDate) + 1, 0));

            const activePeriodIndex = newStatusHistory.findIndex(p => {
                const periodStartDate = new Date(p.startDate);
                const periodEndDate = p.endDate ? new Date(p.endDate) : new Date();
                return p.status === 'active' && periodStartDate <= monthEndDate && periodEndDate >= monthStartDate;
            });

            if (activePeriodIndex > -1) {
                const activePeriod = newStatusHistory[activePeriodIndex];
                const periodStartDate = new Date(activePeriod.startDate);
                const periodEndDate = activePeriod.endDate ? new Date(activePeriod.endDate) : null;

                newStatusHistory.splice(activePeriodIndex, 1);

                if (getMonth(periodStartDate) === getMonth(monthStartDate) && getYear(periodStartDate) === getYear(monthStartDate)) {
                    const nextMonth = new Date(monthStartDate);
                    nextMonth.setMonth(nextMonth.getMonth() + 1);
                    if (!periodEndDate || nextMonth <= periodEndDate) {
                        newStatusHistory.push({ ...activePeriod, startDate: nextMonth.toISOString().split('T')[0] });
                    }
                } 
                else if (periodEndDate && getMonth(periodEndDate) === getMonth(monthEndDate) && getYear(periodEndDate) === getYear(monthEndDate)) {
                    const prevMonth = new Date(monthStartDate);
                    prevMonth.setDate(prevMonth.getDate() - 1);
                     newStatusHistory.push({ ...activePeriod, endDate: prevMonth.toISOString().split('T')[0] });
                }
                else {
                    const prevDay = new Date(monthStartDate);
                    prevDay.setDate(prevDay.getDate() - 1);
                    newStatusHistory.push({ ...activePeriod, endDate: prevDay.toISOString().split('T')[0] });

                    const nextDay = new Date(monthEndDate);
                    nextDay.setDate(nextDay.getDate() + 1);
                    if (!periodEndDate || nextDay <= periodEndDate) {
                         newStatusHistory.push({ ...activePeriod, id: `status-split-${Date.now()}`, startDate: nextDay.toISOString().split('T')[0] });
                    }
                }
                
                newStatusHistory.push({
                    id: `status-inactive-${month.replace(' ','-')}`,
                    status: 'inactive',
                    startDate: monthStartDate.toISOString().split('T')[0],
                    endDate: monthEndDate.toISOString().split('T')[0]
                });
            }
            
            updateMember({ ...member, statusHistory: newStatusHistory.sort((a,b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()) });
        }
    }, [data, updateMember]);
    
    const markMonthAsActive = useCallback((memberId: string, month: string) => {
        const member = data.find(m => m.id === memberId);
        if (member) {
             const newStatusHistory = [...member.statusHistory];
             const targetMonthDate = parse(month, 'MMMM yyyy', new Date());
             const startDate = new Date(Date.UTC(targetMonthDate.getFullYear(), targetMonthDate.getMonth(), 1));
             const endDate = new Date(Date.UTC(targetMonthDate.getFullYear(), targetMonthDate.getMonth() + 1, 0));

             const inactivePeriodIndex = newStatusHistory.findIndex(p => 
                p.status === 'inactive' && 
                new Date(p.startDate).getTime() === startDate.getTime() &&
                p.endDate && new Date(p.endDate).getTime() === endDate.getTime()
             );
             
             if (inactivePeriodIndex > -1) {
                newStatusHistory.splice(inactivePeriodIndex, 1);
             }
            
            newStatusHistory.push({
                id: `status-active-${Date.now()}`,
                status: 'active',
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0]
            });

            updateMember({ ...member, statusHistory: newStatusHistory.sort((a,b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()) });
        }
    }, [data, updateMember]);

  if (isLoading) {
    return <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
    </div>;
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold font-headline">Members Management</h1>
            <Button 
                variant="outline" 
                onClick={loadData}
                disabled={isLoading}
                className="flex items-center gap-2 w-full sm:w-auto"
            >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh Data</span>
                <span className="sm:hidden">Refresh</span>
            </Button>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Fee Management</CardTitle>
                <CardDescription>Set the default admission and monthly fees for new members.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="admissionFee">Default Admission Fee</Label>
                        <div className="relative">
                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="admissionFee"
                                type="number"
                                value={admissionFee}
                                onChange={(e) => setAdmissionFee(parseInt(e.target.value, 10) || 0)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="monthlyFee">Default Monthly Fee</Label>
                        <div className="relative">
                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="monthlyFee"
                                type="number"
                                value={monthlyFee}
                                onChange={(e) => setMonthlyFee(parseInt(e.target.value, 10) || 0)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                </div>
                <Button onClick={handleSaveFees} disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Settings
                </Button>
            </CardContent>
        </Card>

      <DataTable
        columns={columns}
        data={data}
        onAddMember={addMember}
        onUpdateMember={updateMember}
        onDeleteMember={deleteMember}
        onMarkAsPaid={markAsPaid}
        onMarkAsUnpaid={markAsUnpaid}
        onMarkMonthAsActive={markMonthAsActive}
        onMarkMonthAsInactive={markMonthAsInactive}
      />
    </div>
  );
}
