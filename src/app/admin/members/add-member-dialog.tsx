
"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Trash } from "lucide-react";
import { DatePicker } from "./date-picker";
import { Member, MemberStatus } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { getFeeSettings } from "@/lib/actions";
import { Switch } from "@/components/ui/switch";

interface AddMemberDialogProps {
    member?: Member;
    onAddMember?: (member: Omit<Member, 'id' | 'memberId' | 'statusHistory' | 'status' | 'payments'>) => void;
    onUpdateMember?: (member: Member) => void;
    children: React.ReactNode;
}

export function AddMemberDialog({ member, onAddMember, onUpdateMember, children }: AddMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Member>>({});
  const [dobYear, setDobYear] = useState<string>('');
  const [dobMonth, setDobMonth] = useState<string>('');
  const [dobDay, setDobDay] = useState<string>('');
  const { toast } = useToast();
  const isEditMode = !!member;

  // Generate years (1900 to current year)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i);

  // Generate months
  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  // Generate days (1-31)
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));

  useEffect(() => {
    const initializeForm = async () => {
        if (member && open) {
          setFormData(JSON.parse(JSON.stringify(member))); // Deep copy to avoid direct mutation
          
          // Parse existing DOB
          if (member.dob) {
            const dobDate = new Date(member.dob);
            setDobYear(dobDate.getFullYear().toString());
            setDobMonth(String(dobDate.getMonth() + 1).padStart(2, '0'));
            setDobDay(String(dobDate.getDate()).padStart(2, '0'));
          }
        } else if (!isEditMode && open) {
            let defaultAdmissionFee = 1000;
            let defaultMonthlyFee = 500;
            try {
                const fees = await getFeeSettings();
                defaultAdmissionFee = fees.admissionFee;
                defaultMonthlyFee = fees.monthlyFee;
            } catch (error) {
                console.warn('Could not read fee settings from Firestore');
            }
    
          setFormData({
            fullName: "",
            dob: new Date().toISOString().split('T')[0],
            gender: "Male",
            phone: "",
            email: "",
            bloodGroup: "",
            startDate: new Date().toISOString().split('T')[0],
            notes: "",
            admissionFee: defaultAdmissionFee,
            monthlyFee: defaultMonthlyFee,
            photoUrl: "",
            statusHistory: [],
            showOnHomepage: false,
          });
          
          // Set current date for DOB
          const today = new Date();
          setDobYear(today.getFullYear().toString());
          setDobMonth(String(today.getMonth() + 1).padStart(2, '0'));
          setDobDay(String(today.getDate()).padStart(2, '0'));
        }
    }
    initializeForm();
  }, [member, open, isEditMode]);

  // Update DOB when year, month, or day changes
  useEffect(() => {
    if (dobYear && dobMonth && dobDay) {
      const dobString = `${dobYear}-${dobMonth}-${dobDay}`;
      handleChange('dob', dobString);
    }
  }, [dobYear, dobMonth, dobDay]);

  const handleChange = (field: keyof Member, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleFeeChange = (field: 'admissionFee' | 'monthlyFee', value: string) => {
    const numberValue = value === '' ? 0 : parseInt(value, 10);
    if (!isNaN(numberValue)) {
        handleChange(field, numberValue);
    }
  }

  const handleDateChange = (field: 'startDate', date: Date | undefined) => {
    if(date){
        handleChange(field, date.toISOString().split('T')[0]);
    }
  };
  
  const handleStatusDateChange = (index: number, field: 'startDate' | 'endDate', date: Date | undefined) => {
    if (date && formData.statusHistory) {
        const newStatusHistory = [...formData.statusHistory];
        newStatusHistory[index] = { ...newStatusHistory[index], [field]: date.toISOString().split('T')[0] };
        handleChange('statusHistory', newStatusHistory);
    }
   };
   
  const handleEndDateToggle = (index: number, isCurrent: boolean) => {
    if (formData.statusHistory) {
        const newStatusHistory = [...formData.statusHistory];
        newStatusHistory[index].endDate = isCurrent ? null : new Date().toISOString().split('T')[0];
        handleChange('statusHistory', newStatusHistory);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange('photoUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddStatus = () => {
      const newStatus: MemberStatus = {
          id: `status-${Date.now()}`,
          status: 'active',
          startDate: new Date().toISOString().split('T')[0],
          endDate: null,
      };
      const newStatusHistory = [...(formData.statusHistory || [])];
      
      // End the previous status if it exists and is current
      if (newStatusHistory.length > 0) {
        const lastStatus = newStatusHistory[newStatusHistory.length - 1];
        if (lastStatus.endDate === null) {
            lastStatus.endDate = new Date(new Date(newStatus.startDate).getTime() - 86400000).toISOString().split('T')[0]; // yesterday
        }
      }

      handleChange('statusHistory', [...newStatusHistory.sort((a,b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()), newStatus]);
  };

  const handleRemoveStatus = (index: number) => {
    const newStatusHistory = [...(formData.statusHistory || [])];
    newStatusHistory.splice(index, 1);
    handleChange('statusHistory', newStatusHistory);
  };
  
  const handleStatusTypeChange = (index: number, value: 'active' | 'inactive') => {
    if (formData.statusHistory) {
        const newStatusHistory = [...formData.statusHistory];
        newStatusHistory[index].status = value;
        handleChange('statusHistory', newStatusHistory);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditMode && onUpdateMember) {
        onUpdateMember(formData as Member);
    } else if (onAddMember) {
        onAddMember(formData as Omit<Member, 'id' | 'memberId' | 'statusHistory' | 'status' | 'payments'>);
    }
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Member</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-headline">{isEditMode ? 'Edit Member' : 'Add New Member'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update the details below.' : 'Fill in the form below to add a new member.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
                            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2 sm:pr-4">
                <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" value={formData.fullName || ''} onChange={e => handleChange('fullName', e.target.value)} />
                </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="admissionFee">Admission Fee (₹)</Label>
                        <Input 
                            id="admissionFee" 
                            type="number" 
                            value={formData.admissionFee ?? ''} 
                            onChange={e => handleFeeChange('admissionFee', e.target.value)} 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="monthlyFee">Monthly Fee (₹)</Label>
                        <Input 
                            id="monthlyFee" 
                            type="number" 
                            value={formData.monthlyFee ?? ''} 
                            onChange={e => handleFeeChange('monthlyFee', e.target.value)} 
                        />
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label>Photo</Label>
                    <Tabs defaultValue="url" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="url">URL</TabsTrigger>
                            <TabsTrigger value="upload">Upload</TabsTrigger>
                        </TabsList>
                        <TabsContent value="url" className="pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="photoUrl">Photo URL</Label>
                                <Input id="photoUrl" value={formData.photoUrl || ''} onChange={e => handleChange('photoUrl', e.target.value)} placeholder="https://example.com/photo.png" />
                            </div>
                        </TabsContent>
                        <TabsContent value="upload" className="pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="file">Upload Photo</Label>
                                <Input id="file" type="file" onChange={handleFileChange} accept="image/*" />
                            </div>
                        </TabsContent>
                    </Tabs>
                    {formData.photoUrl && (
                        <div className="flex items-center gap-4 pt-2">
                            <Avatar className="h-20 w-20">
                                <AvatarImage src={formData.photoUrl} />
                                <AvatarFallback>{formData.fullName?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <p className="text-sm text-muted-foreground">Current Photo</p>
                        </div>
                    )}
                 </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="dobYear">Date of Birth - Year</Label>
                        <Select value={dobYear} onValueChange={setDobYear}>
                            <SelectTrigger>
                                <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent>
                                {years.map(year => (
                                    <SelectItem key={year} value={year.toString()}>
                                        {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="dobMonth">Month</Label>
                        <Select value={dobMonth} onValueChange={setDobMonth}>
                            <SelectTrigger>
                                <SelectValue placeholder="Month" />
                            </SelectTrigger>
                            <SelectContent>
                                {months.map(month => (
                                    <SelectItem key={month.value} value={month.value}>
                                        {month.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="dobDay">Day</Label>
                        <Select value={dobDay} onValueChange={setDobDay}>
                            <SelectTrigger>
                                <SelectValue placeholder="Day" />
                            </SelectTrigger>
                            <SelectContent>
                                {days.map(day => (
                                    <SelectItem key={day} value={day}>
                                        {day}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        <Select value={formData.gender} onValueChange={value => handleChange('gender', value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input id="phone" type="tel" value={formData.phone || ''} onChange={e => handleChange('phone', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={formData.email || ''} onChange={e => handleChange('email', e.target.value)} />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="bloodGroup">Blood Group</Label>
                    <Input id="bloodGroup" value={formData.bloodGroup || ''} onChange={e => handleChange('bloodGroup', e.target.value)} />
                </div>
                <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="startDate">Join Date</Label>
                        <DatePicker 
                            date={formData.startDate ? new Date(formData.startDate) : undefined}
                            onDateChange={(date) => handleDateChange('startDate', date)}
                        />
                    </div>
                </div>
                 <div className="flex items-center space-x-2 pt-2">
                    <Switch
                        id="showOnHomepage"
                        checked={formData.showOnHomepage}
                        onCheckedChange={(checked) => handleChange('showOnHomepage', checked)}
                    />
                    <Label htmlFor="showOnHomepage">Show on Homepage</Label>
                </div>
                 {isEditMode && (
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="status-history">
                            <AccordionTrigger>Status History</AccordionTrigger>
                            <AccordionContent>
                                <div className="space-y-4">
                                    {formData.statusHistory?.sort((a,b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()).map((status, index) => (
                                        <div key={status.id} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border rounded-md relative">
                                            <div className="space-y-2">
                                                <Label>Status</Label>
                                                <Select value={status.status} onValueChange={(val: 'active' | 'inactive') => handleStatusTypeChange(index, val)}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="active">Active</SelectItem>
                                                        <SelectItem value="inactive">Inactive</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Start Date</Label>
                                                <DatePicker date={new Date(status.startDate)} onDateChange={(date) => handleStatusDateChange(index, 'startDate', date)} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>End Date</Label>
                                                 {status.endDate === null ? (
                                                    <Button variant="outline" size="sm" onClick={() => handleEndDateToggle(index, false)}>Set End Date</Button>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <DatePicker date={new Date(status.endDate)} onDateChange={(date) => handleStatusDateChange(index, 'endDate', date)} />
                                                        <Button variant="link" size="sm" onClick={() => handleEndDateToggle(index, true)}>Current</Button>
                                                    </div>
                                                )}
                                            </div>
                                            <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => handleRemoveStatus(index)}>
                                                <Trash className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button type="button" variant="outline" onClick={handleAddStatus}>Add Status Period</Button>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                 )}
                <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea id="notes" value={formData.notes || ''} onChange={e => handleChange('notes', e.target.value)} placeholder="Any additional notes..."/>
                </div>
            </div>
            <DialogFooter>
                <Button type="submit">Save {isEditMode ? 'Changes' : 'Member'}</Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
