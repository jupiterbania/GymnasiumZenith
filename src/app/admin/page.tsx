
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, UserCheck, Image as ImageIcon, IndianRupee, FileText, Loader2, RefreshCw } from "lucide-react";
import { Member, GalleryItem, Post } from "@/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { getMembers, getGalleryItems, getPosts } from "@/lib/actions";
import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRefresh } from "@/hooks/use-refresh";

const DashboardPage = () => {
    const [members, setMembers] = useState<Member[]>([]);
    const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const { refresh } = useRefresh();

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [membersData, galleryData, postsData] = await Promise.all([
                getMembers(),
                getGalleryItems(),
                getPosts(),
            ]);
            setMembers(membersData);
            setGalleryItems(galleryData);
            setPosts(postsData);
        } catch (error) {
            toast({ title: "Error", description: "Failed to load dashboard data.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Auto-refresh data every 30 seconds to keep dashboard current
    useEffect(() => {
        const interval = setInterval(() => {
            loadData();
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, [loadData]);


    const totalMembers = members.length;
    const activeMembers = members.filter(m => m.status === 'active').length;
    const totalGalleryItems = galleryItems.length;
    const monthlyRevenue = members
        .filter(m => m.status === 'active')
        .reduce((acc, member) => acc + member.monthlyFee, 0);

    const stats = [
        { title: "Total Members", value: totalMembers.toString(), icon: <Users className="h-6 w-6 text-muted-foreground" />, color: "text-blue-500", href: "/admin/members" },
        { title: "Active Members", value: activeMembers.toString(), icon: <UserCheck className="h-6 w-6 text-muted-foreground" />, color: "text-green-500", href: "/admin/members" },
        { title: "Gallery Items", value: totalGalleryItems.toString(), icon: <ImageIcon className="h-6 w-6 text-muted-foreground" />, color: "text-purple-500", href: "/admin/gallery" },
        { title: "Posts", value: posts.length.toString(), icon: <FileText className="h-6 w-6 text-muted-foreground" />, color: "text-orange-500", href: "/admin/posts" },
    ];

    if (isLoading) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
                <Button 
                    variant="outline" 
                    onClick={loadData}
                    disabled={isLoading}
                    className="flex items-center gap-2"
                >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh Data
                </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                    <Link href={stat.href} key={index}>
                        <Card className="hover:bg-muted/50 transition-colors">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                                {stat.icon}
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold ${stat.color}`}>
                                    {stat.value}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Current statistics
                                </p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold font-headline">Recent Posts</h2>
                    <Button variant="outline" asChild>
                        <Link href="/admin/posts">View All Posts <ArrowRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    {posts.slice(0, 2).map(post => (
                        <Card key={post.id} className="overflow-hidden flex">
                            {post.imageUrl && (
                                <div className="relative w-1/3">
                                    <Image src={post.imageUrl} alt={post.title} fill className="object-cover" data-ai-hint="post image" />
                                </div>
                            )}
                            <div className="flex flex-col justify-between p-4 w-2/3">
                                <div>
                                    <CardTitle className="text-lg font-headline leading-tight">{post.title}</CardTitle>
                                    <p className="text-sm text-muted-foreground mt-1">{new Date(post.createdAt).toLocaleDateString()}</p>
                                    <CardDescription className="mt-2 line-clamp-2">{post.content}</CardDescription>
                                </div>
                                <Button variant="link" className="p-0 h-auto self-start mt-4">
                                    <Link href="/admin/posts">Read More</Link>
                                </Button>
                            </div>
                        </Card>
                    ))}
                     {posts.length === 0 && (
                        <p className="text-muted-foreground col-span-2">No posts have been created yet.</p>
                    )}
                </div>
            </div>

             <div className="space-y-4">
                <h2 className="text-2xl font-bold font-headline">Monthly Revenue</h2>
                <Link href="/admin/income">
                    <Card className="hover:bg-muted/50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Revenue for Current Active Members
                            </CardTitle>
                            <IndianRupee className="h-6 w-6 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-yellow-500">
                               ₹{monthlyRevenue.toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                This is the projected revenue for the current month based on active subscriptions.
                            </p>
                        </CardContent>
                    </Card>
                </Link>
            </div>

        </div>
    );
};

export default DashboardPage;
