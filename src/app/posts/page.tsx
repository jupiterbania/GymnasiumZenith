import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Post } from '@/types';
import { getPosts } from '@/lib/actions';
import { ArrowRight } from 'lucide-react';

// Force dynamic rendering to get fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const PostsPage = async () => {
    const posts = await getPosts();

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">
                <section className="w-full py-12 md:py-24">
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                                Latest Posts
                            </h1>
                            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                Stay updated with the latest news and updates from Gymnasium Zenith.
                            </p>
                        </div>
                        
                        {posts.length > 0 ? (
                            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                                {posts.map(post => (
                                    <Card key={post.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                                        <CardContent className="p-0">
                                            {post.imageUrl && (
                                                <div className="relative h-48 w-full">
                                                    <Image 
                                                        src={post.imageUrl} 
                                                        alt={post.title} 
                                                        fill 
                                                        className="object-cover group-hover:scale-105 transition-transform duration-300" 
                                                    />
                                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                                                </div>
                                            )}
                                            <div className="p-6">
                                                <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
                                                <p className="text-muted-foreground text-sm mb-4">{post.content}</p>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-muted-foreground">
                                                        {new Date(post.createdAt).toLocaleDateString()}
                                                    </span>
                                                    {post.redirectUrl && (
                                                        <Link 
                                                            href={post.redirectUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs text-primary hover:underline flex items-center gap-1"
                                                        >
                                                            Read More <ArrowRight className="h-3 w-3" />
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-muted-foreground py-12">
                                <p>No posts have been published yet. Check back soon for updates!</p>
                            </div>
                        )}
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default PostsPage;
