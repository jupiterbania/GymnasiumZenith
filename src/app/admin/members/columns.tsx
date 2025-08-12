
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Member } from "@/types"
import { Badge } from "@/components/ui/badge"
import { MemberActions } from "./member-actions"

export const columns: ColumnDef<Member>[] = [
  {
    id: "srNo",
    header: "#",
    cell: ({ row }) => {
        return <div>{row.index + 1}</div>
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "memberId",
    header: "Member ID",
  },
  {
    accessorKey: "fullName",
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Full Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const variant = status === "active" ? "default" : "secondary";
        return <Badge variant={variant} className="capitalize">{status}</Badge>
    }
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment Status",
    cell: ({ row }) => {
        const payments = row.original.payments || [];
        if (payments.length === 0) {
            return <Badge variant="secondary">No Payments</Badge>
        }
        const lastPayment = payments.sort((a, b) => new Date(b.month.split(' ')[1]).getFullYear() - new Date(a.month.split(' ')[1]).getFullYear() || new Date(b.month).getMonth() - new Date(a.month).getMonth())[0];
        const status = lastPayment?.status === 'Paid' ? 'Paid' : 'Unpaid';
        const variant = status === "Paid" ? "default" : "destructive";
        return <Badge variant={variant} className="capitalize">{status}</Badge>
    }
  },
  {
    accessorKey: "startDate",
    header: "Join Date",
    cell: ({ row }) => {
        const date = new Date(row.getValue("startDate"))
        const formatted = date.toLocaleDateString("en-US", {
            year: 'numeric', month: 'long', day: 'numeric'
        });
        return <div>{formatted}</div>
    }
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const member = row.original
      return <MemberActions row={row} table={table} />
    },
  },
]
