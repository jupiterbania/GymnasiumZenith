import { Table } from "@tanstack/react-table";
import { ObjectId } from "mongodb";

export type Payment = {
    id: string;
    memberId: string;
    amount: number;
    paymentDate: string | null; // Can be null if unpaid
    month: string; // e.g., "January 2024"
    status: 'Paid' | 'Unpaid' | 'Inactive';
};

export type MemberStatus = {
    id: string;
    status: 'active' | 'inactive';
    startDate: string;
    endDate: string | null; // null means it's the current status
};

export type Member = {
    _id?: ObjectId;
    id: string;
    memberId: string;
    fullName: string;
    dob: string;
    gender: 'Male' | 'Female' | 'Other';
    phone: string;
    email?: string;
    bloodGroup: string;
    admissionFee: number;
    monthlyFee: number;
    startDate: string; // The very first join date
    notes?: string;
    photoUrl?: string;
    status: 'active' | 'inactive'; // Current overall status
    statusHistory: MemberStatus[];
    payments?: Payment[];
    showOnHomepage?: boolean;
};

export type GalleryItem = {
    _id?: ObjectId;
    id: string;
    title: string;
    description?: string;
    type: 'image' | 'video';
    url: string;
    category: 'Events' | 'Workout Sessions' | 'Transformations' | string;
    createdAt: string;
    image: string;
    hint?: string;
    showOnHomepage?: boolean;
};

export type Post = {
    _id?: ObjectId;
    id: string;
    title: string;
    content: string;
    imageUrl?: string;
    createdAt: string;
    redirectUrl?: string;
    showOnHomepage?: boolean;
}

export type Expense = {
    _id?: ObjectId;
    id: string;
    description: string;
    amount: number;
    date: string;
}

// This allows us to pass functions to the table meta
declare module '@tanstack/react-table' {
    interface TableMeta<TData extends Member> {
      updateMember: (member: Member) => void
      deleteMember: (memberId: string) => void
      markAsPaid: (memberId: string, paymentId: string) => void
      markAsUnpaid: (memberId: string, paymentId: string) => void
      markMonthAsActive: (memberId: string, month: string) => void
      markMonthAsInactive: (memberId: string, month: string) => void
    }
  }
  
