
import Link from 'next/link';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Member } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getMembers } from '@/lib/actions';

// Force dynamic rendering to get fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const MembersPage = async () => {
    const members = await getMembers();

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">
                <section className="w-full py-12 md:py-24">
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                            <h1 className="text-3xl font-bold font-headline tracking-tighter sm:text-5xl">
                                Our Members
                            </h1>
                            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                Our community is our strength. Get to know our dedicated members.
                            </p>
                        </div>
                        {members.length > 0 ? (
                            <div className="grid gap-8 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                                {members.map(member => (
                                    <div key={member.memberId} className="flex flex-col items-center text-center">
                                        <Avatar className="h-24 w-24 mb-4">
                                            <AvatarImage src={member.photoUrl || 'https://placehold.co/128x128.png'} alt={member.fullName} data-ai-hint="member portrait" />
                                            <AvatarFallback>{member.fullName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <h3 className="font-semibold font-headline text-lg">{member.fullName}</h3>
                                        <Link href={`/members/${member.id}`} className="text-sm text-primary hover:underline">
                                            View Profile
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-muted-foreground py-12">
                                <p>No members found. Be the first to join!</p>
                            </div>
                        )}
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default MembersPage;
