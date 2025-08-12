import Header from "@/components/header";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ShieldAlert, UserX } from "lucide-react";
import React from "react";
import { getMember } from "@/lib/actions";

export default async function MemberProfilePage({ params: { id } }: { params: { id: string } }) {
  const member = await getMember(id);

  if (!member) {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 bg-background py-12 md:py-24">
                <div className="container px-4 md:px-6">
                    <Card className="max-w-2xl mx-auto text-center">
                        <CardHeader>
                            <UserX className="h-16 w-16 mx-auto text-destructive" />
                            <CardTitle className="mt-4">Member Not Found</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>The member profile you are looking for does not exist.</p>
                        </CardContent>
                    </Card>
                </div>
            </main>
            <Footer />
        </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-background py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="flex flex-col items-center text-center p-6">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={member.photoUrl} alt={member.fullName} data-ai-hint="profile avatar" />
                <AvatarFallback>{member.fullName.charAt(0)}</AvatarFallback>
              </Avatar>
              <CardTitle className="text-3xl font-headline">{member.fullName}</CardTitle>
              <p className="text-muted-foreground">Member ID: {member.memberId}</p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="font-medium text-muted-foreground">Status</span>
                  <span className="font-semibold capitalize">{member.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-muted-foreground">Member Since</span>
                  <span className="font-semibold">{new Date(member.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>
              <div className="mt-6 p-4 bg-secondary/50 rounded-lg flex items-center">
                  <ShieldAlert className="h-5 w-5 mr-3 text-accent"/>
                  <p className="text-sm text-muted-foreground">
                    For privacy, contact information is not displayed on public profiles.
                  </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
