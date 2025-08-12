
"use client";
import React, { useState, useEffect, useTransition, useCallback } from "react";
import { Member, Payment, Expense } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { IndianRupee, Users, TrendingUp, TrendingDown, FileDown, Trash, Eye, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
  } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Separator } from "@/components/ui/separator";
import { DatePicker } from "@/app/admin/members/date-picker";
import { useToast } from "@/hooks/use-toast";
import { getMembers, getExpenses, addExpense, deleteExpense } from "@/lib/actions";

type MonthlyData = {
    month: string;
    payments: number;
    admissions: number;
    expenses: number;
    grossIncome: number;
    netIncome: number;
    paymentDetails: (Payment & { memberName: string })[];
    admissionDetails: (Member & { admissionMonth: string })[];
    expenseDetails: Expense[];
}

const IncomePage = () => {
    const [members, setMembers] = useState<Member[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
    const [totalIncome, setTotalIncome] = useState(0);
    const [totalAdmissionFees, setTotalAdmissionFees] = useState(0);
    const [totalExpenses, setTotalExpenses] = useState(0);
    
    const [newExpense, setNewExpense] = useState({ description: '', amount: '', date: new Date().toISOString().split('T')[0] });
    const [isLoading, setIsLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [membersData, expensesData] = await Promise.all([getMembers(), getExpenses()]);
            setMembers(membersData);
            setExpenses(expensesData);
        } catch (error) {
            toast({ title: "Error", description: "Failed to load financial data.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        loadData();
    }, [loadData]);


    useEffect(() => {
        if(isLoading) return;

        const dataByMonth: Record<string, { payments: number; admissions: number; expenses: number; paymentDetails: (Payment & { memberName: string})[], admissionDetails: (Member & { admissionMonth: string })[], expenseDetails: Expense[] }> = {};
        let totalAdmissions = 0;

        members.forEach(member => {
            totalAdmissions += member.admissionFee;
            const joinDate = new Date(member.startDate);
            const joinMonth = joinDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

            if (!dataByMonth[joinMonth]) {
                dataByMonth[joinMonth] = { payments: 0, admissions: 0, expenses: 0, paymentDetails: [], admissionDetails: [], expenseDetails: [] };
            }
            dataByMonth[joinMonth].admissions += member.admissionFee;
            dataByMonth[joinMonth].admissionDetails.push({ ...member, admissionMonth: joinMonth });

            member.payments?.forEach(payment => {
                if (payment.status === 'Paid') {
                    if (!dataByMonth[payment.month]) {
                         dataByMonth[payment.month] = { payments: 0, admissions: 0, expenses: 0, paymentDetails: [], admissionDetails: [], expenseDetails: [] };
                    }
                    dataByMonth[payment.month].payments += payment.amount;
                    dataByMonth[payment.month].paymentDetails.push({ ...payment, memberName: member.fullName });
                }
            });
        });
        
        expenses.forEach(expense => {
            const expenseDate = new Date(expense.date);
            const expenseMonth = expenseDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
             if (!dataByMonth[expenseMonth]) {
                dataByMonth[expenseMonth] = { payments: 0, admissions: 0, expenses: 0, paymentDetails: [], admissionDetails: [], expenseDetails: [] };
            }
            dataByMonth[expenseMonth].expenses += expense.amount;
            dataByMonth[expenseMonth].expenseDetails.push(expense);
        });

        const dataArray = Object.entries(dataByMonth).map(([month, data]) => {
            const grossIncome = data.admissions + data.payments;
            return {
                month,
                admissions: data.admissions,
                payments: data.payments,
                expenses: data.expenses,
                grossIncome,
                netIncome: grossIncome - data.expenses,
                paymentDetails: data.paymentDetails,
                admissionDetails: data.admissionDetails.filter(m => m.admissionMonth === month),
                expenseDetails: data.expenseDetails,
            }
        }).sort((a,b) => new Date(a.month).getTime() - new Date(b.month).getTime());
        
        setMonthlyData(dataArray);
        setTotalAdmissionFees(totalAdmissions);
        setTotalIncome(dataArray.reduce((acc, curr) => acc + curr.grossIncome, 0));

    }, [members, expenses, isLoading]);

    useEffect(() => {
        const total = expenses.reduce((acc, curr) => acc + curr.amount, 0);
        setTotalExpenses(total);
    }, [expenses]);

    const handleAddExpense = () => {
        if (!newExpense.description || !newExpense.amount) return;
        startTransition(async () => {
            try {
                const newExpenseItem: Omit<Expense, 'id'> = {
                    description: newExpense.description,
                    amount: parseFloat(newExpense.amount),
                    date: newExpense.date,
                };
                await addExpense(newExpenseItem);
                setNewExpense({ description: '', amount: '', date: new Date().toISOString().split('T')[0] });
                await loadData();
                toast({ title: "Expense Added", description: "The new expense has been logged." });
            } catch (error) {
                toast({ title: "Error", description: "Failed to add expense.", variant: "destructive" });
            }
        });
    };
    
    const handleDeleteExpense = (id: string) => {
        startTransition(async () => {
            try {
                await deleteExpense(id);
                await loadData();
                toast({ title: "Expense Deleted", description: "The expense has been removed.", variant: "destructive" });
            } catch (error) {
                toast({ title: "Error", description: "Failed to delete expense.", variant: "destructive" });
            }
        });
    };

    const handleGeneratePdf = () => {
        const doc = new jsPDF();
        
        doc.setFontSize(20);
        doc.text("Gymnasium Zenith", 14, 22);
        doc.setFontSize(12);
        doc.text("Financial Report", 14, 30);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 35);
        
        const netIncome = totalIncome - totalExpenses;
        
        // Summary section with net totals
        autoTable(doc, {
            startY: 45,
            head: [['Metric', 'Amount (INR)']],
            body: [
                ['Total Gross Income', `INR ${totalIncome.toLocaleString()}`],
                ['Total Expenses', `INR ${totalExpenses.toLocaleString()}`],
                ['Net Total Income/Loss', `INR ${netIncome.toLocaleString()}`],
            ],
            theme: 'striped',
            headStyles: { fillColor: [37, 99, 235] },
            didParseCell: (data) => {
                if (data.row.index === 2 && data.column.index === 1) { // Net Income Amount
                    data.cell.styles.fontStyle = 'bold';
                    data.cell.styles.textColor = netIncome >= 0 ? [0, 128, 0] : [255, 0, 0];
                }
            }
        });
        
        const finalYSummary = (doc as any).lastAutoTable.finalY;

        // Income Breakdown section with net totals
        doc.setFontSize(14);
        doc.text("Income Breakdown by Month", 14, finalYSummary + 15);
        autoTable(doc, {
            startY: finalYSummary + 20,
            head: [['Month', 'Monthly Fees (INR)', 'Admission Fees (INR)', 'Gross Income (INR)', 'Expenses (INR)', 'Net Income (INR)']],
            body: monthlyData.map(item => [
                item.month,
                `INR ${item.payments.toLocaleString()}`,
                `INR ${item.admissions.toLocaleString()}`,
                `INR ${item.grossIncome.toLocaleString()}`,
                `INR ${item.expenses.toLocaleString()}`,
                `INR ${item.netIncome.toLocaleString()}`
            ]),
            theme: 'grid',
            headStyles: { fillColor: [37, 99, 235] },
            didParseCell: (data) => {
                 if (data.column.dataKey === 5) { // Net Income column
                    const cellNetIncomeText = data.cell.raw?.toString().replace(/[^0-9.-]+/g,"");
                    if (cellNetIncomeText) {
                        const cellNetIncome = parseFloat(cellNetIncomeText);
                        if (cellNetIncome < 0) {
                            data.cell.styles.textColor = [255, 0, 0];
                        }
                    }
                }
            }
        });

        const finalYIncome = (doc as any).lastAutoTable.finalY;

        // Add summary row to income breakdown
        const totalPayments = monthlyData.reduce((sum, item) => sum + item.payments, 0);
        const totalAdmissions = monthlyData.reduce((sum, item) => sum + item.admissions, 0);
        const totalGrossIncome = monthlyData.reduce((sum, item) => sum + item.grossIncome, 0);
        const totalExpensesFromData = monthlyData.reduce((sum, item) => sum + item.expenses, 0);
        const totalNetIncome = monthlyData.reduce((sum, item) => sum + item.netIncome, 0);

        autoTable(doc, {
            startY: finalYIncome + 5,
            head: [['TOTALS', 'Monthly Fees (INR)', 'Admission Fees (INR)', 'Gross Income (INR)', 'Expenses (INR)', 'Net Income (INR)']],
            body: [
                ['SUMMARY', 
                 `INR ${totalPayments.toLocaleString()}`, 
                 `INR ${totalAdmissions.toLocaleString()}`, 
                 `INR ${totalGrossIncome.toLocaleString()}`, 
                 `INR ${totalExpensesFromData.toLocaleString()}`, 
                 `INR ${totalNetIncome.toLocaleString()}`
                ]
            ],
            theme: 'grid',
            headStyles: { fillColor: [37, 99, 235], fontStyle: 'bold' },
            bodyStyles: { fontStyle: 'bold' },
            didParseCell: (data) => {
                if (data.column.dataKey === 5) { // Net Income column
                    const cellNetIncomeText = data.cell.raw?.toString().replace(/[^0-9.-]+/g,"");
                    if (cellNetIncomeText) {
                        const cellNetIncome = parseFloat(cellNetIncomeText);
                        if (cellNetIncome < 0) {
                            data.cell.styles.textColor = [255, 0, 0];
                        } else {
                            data.cell.styles.textColor = [0, 128, 0];
                        }
                    }
                }
            }
        });

        const finalYIncomeSummary = (doc as any).lastAutoTable.finalY;

        // Expense Log section with net total
        doc.setFontSize(14);
        doc.text("Expense Log", 14, finalYIncomeSummary + 15);
        autoTable(doc, {
            startY: finalYIncomeSummary + 20,
            head: [['Date', 'Description', 'Amount (INR)']],
            body: expenses.map(item => [
                new Date(item.date).toLocaleDateString(),
                item.description,
                `INR ${item.amount.toLocaleString()}`
            ]),
            theme: 'grid',
            headStyles: { fillColor: [37, 99, 235] }
        });

        const finalYExpenses = (doc as any).lastAutoTable.finalY;

        // Add total expenses summary
        autoTable(doc, {
            startY: finalYExpenses + 5,
            head: [['Total Expenses', 'Amount (INR)']],
            body: [
                ['Net Total Expenses', `INR ${totalExpenses.toLocaleString()}`]
            ],
            theme: 'grid',
            headStyles: { fillColor: [37, 99, 235], fontStyle: 'bold' },
            bodyStyles: { fontStyle: 'bold' }
        });

        doc.save(`financial-report-${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const handleGenerateMonthlyPdf = (item: MonthlyData) => {
        const doc = new jsPDF();
        
        doc.setFontSize(20);
        doc.text("Gymnasium Zenith", 14, 22);
        doc.setFontSize(12);
        doc.text(`Monthly Report: ${item.month}`, 14, 30);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 35);

        // Summary section with net totals
        autoTable(doc, {
            startY: 45,
            head: [['Category', 'Amount (INR)']],
            body: [
                ['Monthly Fee Payments', `INR ${item.payments.toLocaleString()}`],
                ['Admission Fees', `INR ${item.admissions.toLocaleString()}`],
                { content: `Total Gross Income: INR ${item.grossIncome.toLocaleString()}`, styles: { fontStyle: 'bold' } },
                ['Expenses', `INR ${item.expenses.toLocaleString()}`],
                { content: `Net Total Income/Loss: INR ${item.netIncome.toLocaleString()}`, styles: { fontStyle: 'bold', textColor: item.netIncome >= 0 ? [0, 128, 0] : [255, 0, 0] } },
            ],
            theme: 'striped',
            headStyles: { fillColor: [37, 99, 235] }
        });

        let finalY = (doc as any).lastAutoTable.finalY;

        if(item.paymentDetails.length > 0) {
            doc.setFontSize(14);
            doc.text("Monthly Fee Payments", 14, finalY + 15);
            autoTable(doc, {
                startY: finalY + 20,
                head: [['Member', 'Amount (INR)']],
                body: item.paymentDetails.map(p => [p.memberName, `INR ${p.amount.toLocaleString()}`]),
                theme: 'grid',
                headStyles: { fillColor: [37, 99, 235] }
            });
            
            // Add total for payments section
            const totalPayments = item.paymentDetails.reduce((sum, p) => sum + p.amount, 0);
            autoTable(doc, {
                startY: (doc as any).lastAutoTable.finalY + 5,
                head: [['Total Monthly Fees', 'Amount (INR)']],
                body: [['Net Total', `INR ${totalPayments.toLocaleString()}`]],
                theme: 'grid',
                headStyles: { fillColor: [37, 99, 235], fontStyle: 'bold' },
                bodyStyles: { fontStyle: 'bold' }
            });
            
            finalY = (doc as any).lastAutoTable.finalY;
        }

        if(item.admissionDetails.length > 0) {
            doc.setFontSize(14);
            doc.text("Admission Fees", 14, finalY + 15);
            autoTable(doc, {
                startY: finalY + 20,
                head: [['Member', 'Amount (INR)']],
                body: item.admissionDetails.map(m => [m.fullName, `INR ${m.admissionFee.toLocaleString()}`]),
                theme: 'grid',
                headStyles: { fillColor: [37, 99, 235] }
            });
            
            // Add total for admissions section
            const totalAdmissions = item.admissionDetails.reduce((sum, m) => sum + m.admissionFee, 0);
            autoTable(doc, {
                startY: (doc as any).lastAutoTable.finalY + 5,
                head: [['Total Admission Fees', 'Amount (INR)']],
                body: [['Net Total', `INR ${totalAdmissions.toLocaleString()}`]],
                theme: 'grid',
                headStyles: { fillColor: [37, 99, 235], fontStyle: 'bold' },
                bodyStyles: { fontStyle: 'bold' }
            });
            
            finalY = (doc as any).lastAutoTable.finalY;
        }

        if(item.expenseDetails.length > 0) {
            doc.setFontSize(14);
            doc.text("Expenses", 14, finalY + 15);
            autoTable(doc, {
                startY: finalY + 20,
                head: [['Date', 'Description', 'Amount (INR)']],
                body: item.expenseDetails.map(e => [new Date(e.date).toLocaleDateString(), e.description, `INR ${e.amount.toLocaleString()}`]),
                theme: 'grid',
                headStyles: { fillColor: [37, 99, 235] }
            });
            
            // Add total for expenses section
            const totalExpenses = item.expenseDetails.reduce((sum, e) => sum + e.amount, 0);
            autoTable(doc, {
                startY: (doc as any).lastAutoTable.finalY + 5,
                head: [['Total Expenses', 'Amount (INR)']],
                body: [['Net Total', `INR ${totalExpenses.toLocaleString()}`]],
                theme: 'grid',
                headStyles: { fillColor: [37, 99, 235], fontStyle: 'bold' },
                bodyStyles: { fontStyle: 'bold' }
            });
        }

        doc.save(`monthly-report-${item.month.replace(' ', '-')}-${new Date().toISOString().split('T')[0]}.pdf`);
    };

    if(isLoading) {
        return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

  return (
    <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold font-headline">Income/Expenses</h1>
                <p className="text-muted-foreground">Track your gym's income and expenses.</p>
            </div>
            <Button onClick={handleGeneratePdf} className="w-full sm:w-auto">
                <FileDown className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Generate PDF Report</span>
                <span className="sm:hidden">Generate PDF</span>
            </Button>
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Gross Income</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-500">₹{totalIncome.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">From all payments and admissions</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                    <TrendingDown className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-500">₹{totalExpenses.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">All recorded business expenses</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Net Income</CardTitle>
                    <IndianRupee className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">₹{(totalIncome - totalExpenses).toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Gross income minus expenses</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">From Admission Fees</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">₹{totalAdmissionFees.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">One-time fees from new members</p>
                </CardContent>
            </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Income by Month</CardTitle>
                        <CardDescription>A breakdown of income from monthly fees and new admissions.</CardDescription>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Month</TableHead>
                                    <TableHead className="text-right">Monthly Fees</TableHead>
                                    <TableHead className="text-right hidden sm:table-cell">Admission Fees</TableHead>
                                    <TableHead className="text-right hidden md:table-cell">Expenses</TableHead>
                                    <TableHead className="text-right">Net Income</TableHead>
                                    <TableHead className="text-center">Details</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                               {monthlyData.map(item => (
                                 <TableRow key={item.month}>
                                    <TableCell className="font-medium whitespace-nowrap">{item.month}</TableCell>
                                    <TableCell className="text-right whitespace-nowrap">₹{item.payments.toLocaleString()}</TableCell>
                                    <TableCell className="text-right whitespace-nowrap hidden sm:table-cell">₹{item.admissions.toLocaleString()}</TableCell>
                                    <TableCell className="text-right text-red-500 whitespace-nowrap hidden md:table-cell">₹{item.expenses.toLocaleString()}</TableCell>
                                    <TableCell className="text-right whitespace-nowrap">
                                       <Badge variant={item.netIncome >= 0 ? "default" : "destructive"}>₹{item.netIncome.toLocaleString()}</Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-4xl">
                                                <DialogHeader>
                                                    <DialogTitle>Income Breakdown for {item.month}</DialogTitle>
                                                    <DialogDescription>
                                                        Detailed list of payments, admissions, and expenses for this month.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-h-[60vh] overflow-y-auto p-1">
                                                    <div>
                                                        <h4 className="font-semibold mb-2">Monthly Fee Payments ({item.paymentDetails.length})</h4>
                                                        <Table>
                                                            <TableHeader>
                                                                <TableRow>
                                                                    <TableHead>Member</TableHead>
                                                                    <TableHead className="text-right">Amount</TableHead>
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {item.paymentDetails.map(p => (
                                                                    <TableRow key={p.id}>
                                                                        <TableCell>{p.memberName}</TableCell>
                                                                        <TableCell className="text-right">₹{p.amount.toLocaleString()}</TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    </div>
                                                     <div>
                                                        <h4 className="font-semibold mb-2">Admission Fees ({item.admissionDetails.length})</h4>
                                                        <Table>
                                                            <TableHeader>
                                                                <TableRow>
                                                                    <TableHead>Member</TableHead>
                                                                    <TableHead className="text-right">Amount</TableHead>
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {item.admissionDetails.map(m => (
                                                                    <TableRow key={m.id}>
                                                                        <TableCell>{m.fullName}</TableCell>
                                                                        <TableCell className="text-right">₹{m.admissionFee.toLocaleString()}</TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    </div>
                                                     <div>
                                                        <h4 className="font-semibold mb-2">Expenses ({item.expenseDetails.length})</h4>
                                                        <Table>
                                                            <TableHeader>
                                                                <TableRow>
                                                                    <TableHead>Description</TableHead>
                                                                    <TableHead className="text-right">Amount</TableHead>
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {item.expenseDetails.map(e => (
                                                                    <TableRow key={e.id}>
                                                                        <TableCell>{e.description}</TableCell>
                                                                        <TableCell className="text-right">₹{e.amount.toLocaleString()}</TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    </div>
                                                </div>
                                                <Separator className="my-4" />
                                                <DialogFooter>
                                                    <Button variant="outline" onClick={() => handleGenerateMonthlyPdf(item)}>
                                                        <FileDown className="mr-2 h-4 w-4" />
                                                        Download PDF
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </TableCell>
                                </TableRow>
                               ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            <div className="lg:col-span-1 space-y-8">
                 <Card>
                    <CardHeader>
                        <CardTitle>Add New Expense</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="exp-desc">Description</Label>
                            <Input id="exp-desc" placeholder="e.g., Staff Salary" value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                             <Label htmlFor="exp-amount">Amount (₹)</Label>
                             <Input id="exp-amount" type="number" placeholder="e.g., 15000" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label>Date</Label>
                            <DatePicker
                                date={new Date(newExpense.date)}
                                onDateChange={(date) => {
                                    if(date) {
                                        setNewExpense({...newExpense, date: date.toISOString().split('T')[0]})
                                    }
                                }}
                            />
                        </div>
                        <Button onClick={handleAddExpense} disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Add Expense
                        </Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Expense Log</CardTitle>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                               {expenses.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(exp => (
                                 <TableRow key={exp.id}>
                                    <TableCell className="whitespace-nowrap">{new Date(exp.date).toLocaleDateString()}</TableCell>
                                    <TableCell className="font-medium">{exp.description}</TableCell>
                                    <TableCell className="text-right whitespace-nowrap">₹{exp.amount.toLocaleString()}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteExpense(exp.id)} disabled={isPending}>
                                            <Trash className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                               ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>

    </div>
  );
};

export default IncomePage;
