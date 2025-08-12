
"use client"

import * as React from "react"
import { Row, Table } from "@tanstack/react-table"
import { MoreHorizontal, Trash, Edit, History, Bell, ExternalLink, User, FileDown, CreditCard, XCircle, Moon, CheckCircle } from "lucide-react"
import Link from "next/link"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { Member } from "@/types"
import { useToast } from "@/hooks/use-toast"
import { AddMemberDialog } from "./add-member-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface MemberActionsProps<TData> {
  row: Row<TData>
  table: Table<TData>
}

function MemberDetailRow({label, value}: {label: string, value: string | undefined | null}) {
    if (!value) return null;
    return (
        <div className="flex justify-between py-2 border-b">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-sm font-medium">{value}</p>
        </div>
    )
}

export function MemberActions<TData extends Member>({ row, table }: MemberActionsProps<TData>) {
  const member = row.original;
  const { toast } = useToast();
  const [dialogContent, setDialogContent] = React.useState<"payments" | "profile" | null>(null);

  const handleSendReminder = () => {
    console.log("Sending reminder to:", member.fullName);
    toast({
      title: "Reminder Sent",
      description: `A payment reminder has been sent to ${member.fullName}.`,
    });
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text("Gymnasium Zenith", 14, 22);
    doc.setFontSize(12);
    doc.text("Member Payment Details", 14, 30);
    
    doc.setFontSize(10);
    doc.text(`Member: ${member.fullName}`, 14, 40);
    doc.text(`Member ID: ${member.memberId}`, 14, 45);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 45);

    autoTable(doc, {
      startY: 55,
      head: [['Date', 'Month', 'Amount (INR)', 'Status']],
      body: member.payments?.sort((a, b) => new Date(b.month).getTime() - new Date(a.month).getTime()).map(p => [
        p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : 'N/A',
        p.month,
        p.status === 'Inactive' ? 'N/A' : `INR ${p.amount.toLocaleString()}`,
        p.status
      ]) || [],
      theme: 'grid',
      headStyles: {
        fillColor: [86, 75, 255]
      },
      styles: {
        font: 'helvetica',
        fontSize: 10,
      },
      didParseCell: (data) => {
        if (data.row.section === 'body') {
          const status = data.cell.raw;
          if (status === 'Paid') {
            data.cell.styles.textColor = [40, 167, 69];
          } else if (status === 'Unpaid') {
            data.cell.styles.textColor = [220, 53, 69];
          } else if (status === 'Inactive') {
            data.cell.styles.textColor = [108, 117, 125];
          }
        }
      }
    });

    // Add payment summary with net totals
    const paidPayments = member.payments?.filter(p => p.status === 'Paid') || [];
    const unpaidPayments = member.payments?.filter(p => p.status === 'Unpaid') || [];
    const totalPaid = paidPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalUnpaid = unpaidPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalPayments = member.payments?.reduce((sum, p) => p.status !== 'Inactive' ? sum + p.amount : sum, 0) || 0;

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 10,
      head: [['Payment Summary', 'Amount (INR)']],
      body: [
        ['Total Paid Amount', `INR ${totalPaid.toLocaleString()}`],
        ['Total Unpaid Amount', `INR ${totalUnpaid.toLocaleString()}`],
        ['Net Total Payments', `INR ${totalPayments.toLocaleString()}`],
      ],
      theme: 'grid',
      headStyles: { fillColor: [86, 75, 255], fontStyle: 'bold' },
      bodyStyles: { fontStyle: 'bold' },
      didParseCell: (data) => {
        if (data.row.index === 0 && data.column.index === 1) { // Total Paid
          data.cell.styles.textColor = [40, 167, 69];
        } else if (data.row.index === 1 && data.column.index === 1) { // Total Unpaid
          data.cell.styles.textColor = [220, 53, 69];
        } else if (data.row.index === 2 && data.column.index === 1) { // Net Total
          data.cell.styles.textColor = [86, 75, 255];
        }
      }
    });

    doc.save(`payment-history-${member.memberId}.pdf`);
    toast({
        title: "Download Started",
        description: "Your PDF is being downloaded.",
    });
  }
  
  const dob = new Date(member.dob);
  const today = new Date();
  const age = today.getFullYear() - dob.getFullYear() - (today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate()) ? 1 : 0);


  return (
    <Dialog onOpenChange={(open) => !open && setDialogContent(null)}>
        <AlertDialog>
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DialogTrigger asChild onSelect={() => setDialogContent('profile')}>
                    <DropdownMenuItem>
                        <User className="mr-2 h-4 w-4" />
                        View profile
                    </DropdownMenuItem>
                </DialogTrigger>
                <DialogTrigger asChild onSelect={() => setDialogContent('payments')}>
                    <DropdownMenuItem>
                        <History className="mr-2 h-4 w-4" />
                        Payment history
                    </DropdownMenuItem>
                </DialogTrigger>
                <DropdownMenuItem onClick={handleDownloadPdf}>
                    <FileDown className="mr-2 h-4 w-4" />
                    Download payment details
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSendReminder}>
                    <Bell className="mr-2 h-4 w-4" />
                    Send reminder
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href={`/members/${member.memberId}`}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View public profile
                    </Link>
                </DropdownMenuItem>
                 <AddMemberDialog 
                    member={member} 
                    onUpdateMember={(updatedMember) => table.options.meta?.updateMember(updatedMember)}
                >
                    <Button variant="ghost" className="w-full justify-start text-sm font-normal p-2 h-auto">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit member
                    </Button>
                 </AddMemberDialog>
                
                <AlertDialogTrigger asChild>
                    <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                        <Trash className="mr-2 h-4 w-4" />
                        Delete member
                    </DropdownMenuItem>
                </AlertDialogTrigger>
            </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the member
                    and remove their data from our servers.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => table.options.meta?.deleteMember(member.id)}>
                        Continue
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>

        </AlertDialog>
         <DialogContent className="sm:max-w-lg">
            {dialogContent === 'profile' && (
                <>
                <DialogHeader>
                    <DialogTitle>Member Profile</DialogTitle>
                </DialogHeader>
                <div className="mt-4 space-y-4">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={member.photoUrl} data-ai-hint="member photo" />
                            <AvatarFallback>{member.fullName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="text-xl font-bold font-headline">{member.fullName}</h3>
                            <p className="text-muted-foreground">ID: {member.memberId}</p>
                            <Badge variant={member.status === 'active' ? 'default' : 'secondary'} className="mt-1 capitalize">{member.status}</Badge>
                        </div>
                    </div>
                    <div className="space-y-2 pt-4">
                        <MemberDetailRow label="Gender" value={member.gender} />
                        <MemberDetailRow label="Age" value={`${age} years`} />
                        <MemberDetailRow label="Date of Birth" value={new Date(member.dob).toLocaleDateString()} />
                        <MemberDetailRow label="Phone" value={member.phone} />
                        <MemberDetailRow label="Email" value={member.email} />
                        <MemberDetailRow label="Blood Group" value={member.bloodGroup} />
                        <MemberDetailRow label="Join Date" value={new Date(member.startDate).toLocaleDateString()} />
                        <MemberDetailRow label="Notes" value={member.notes} />
                    </div>
                </div>
                </>
            )}
            {dialogContent === 'payments' && (
                <>
                <DialogHeader>
                    <DialogTitle>Payment History: {member.fullName}</DialogTitle>
                    <DialogDescription>View and manage all payment records. Inactive months are not charged.</DialogDescription>
                </DialogHeader>
                <div className="mt-4 max-h-[60vh] overflow-y-auto">
                    {member.payments && member.payments.length > 0 ? (
                        <div className="space-y-4 pr-4">
                            {[...member.payments].sort((a, b) => new Date(b.month).getTime() - new Date(a.month).getTime()).map(p => (
                                <Card key={p.id}>
                                    <CardHeader className="p-4">
                                        <div className="flex justify-between items-center">
                                            <CardTitle className="text-base">{p.month}</CardTitle>
                                            <Badge 
                                                variant={p.status === 'Paid' ? 'default' : p.status === 'Unpaid' ? 'destructive' : 'secondary'} 
                                                className="capitalize"
                                            >
                                                {p.status === 'Inactive' && <Moon className="mr-1 h-3 w-3" />}
                                                {p.status}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0">
                                         <p className="text-sm text-muted-foreground">
                                            {p.status === 'Paid' ? `Paid on: ${new Date(p.paymentDate!).toLocaleDateString()}` : p.status === 'Unpaid' ? `Amount Due: ₹${p.amount}` : 'No payment due for this month.'}
                                        </p>
                                    </CardContent>
                                    <Separator />
                                    <CardFooter className="p-4 justify-end gap-2">
                                        {p.status === 'Unpaid' && (
                                            <>
                                                <Button size="sm" variant="outline" onClick={() => table.options.meta?.markAsPaid(member.id, p.id)}>
                                                    <CreditCard className="mr-2 h-4 w-4" />
                                                    Mark as Paid
                                                </Button>
                                                <Button size="sm" variant="ghost" onClick={() => table.options.meta?.markMonthAsInactive(member.id, p.month)}>
                                                    <Moon className="mr-2 h-4 w-4" />
                                                    Mark Inactive
                                                </Button>
                                            </>
                                        )}
                                        {p.status === 'Paid' && (
                                            <>
                                                <Button size="sm" variant="ghost" onClick={() => table.options.meta?.markAsUnpaid(member.id, p.id)}>
                                                    <XCircle className="mr-2 h-4 w-4" />
                                                    Mark Unpaid
                                                </Button>
                                                 <Button size="sm" variant="ghost" onClick={() => table.options.meta?.markMonthAsInactive(member.id, p.month)}>
                                                    <Moon className="mr-2 h-4 w-4" />
                                                    Mark Inactive
                                                </Button>
                                            </>
                                        )}
                                        {p.status === 'Inactive' && (
                                            <Button size="sm" variant="outline" onClick={() => table.options.meta?.markMonthAsActive(member.id, p.month)}>
                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                Mark Active
                                            </Button>
                                        )}
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <p>No payment history found.</p>
                    )}
                </div>
                </>
            )}
        </DialogContent>
    </Dialog>
  )
}
