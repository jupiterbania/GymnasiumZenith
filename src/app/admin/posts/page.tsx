
"use client";

import { useState, useEffect, useTransition, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreVertical, Edit, Trash, PlusCircle, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { Post } from '@/types';
import AddPostDialog from './add-post-dialog';
import Image from 'next/image';
import { getPosts, addPost, updatePost, deletePost } from '@/lib/actions';

const PostsAdminPage = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isPending, startTransition] = useTransition();

    const loadPosts = useCallback(async () => {
        setIsLoading(true);
        try {
            const postsData = await getPosts();
            setPosts(postsData);
        } catch (error) {
            toast({ title: "Error", description: "Failed to load posts.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        loadPosts();
    }, [loadPosts]);

    const handleAddPost = (item: Omit<Post, 'id' | 'createdAt'>) => {
        startTransition(async () => {
            try {
                const newPostData: Omit<Post, 'id'> = {
                    ...item,
                    createdAt: new Date().toISOString(),
                };
                await addPost(newPostData);
                await loadPosts();
                toast({ title: "Post Added", description: `"${item.title}" has been added.` });
            } catch (error) {
                toast({ title: "Error", description: "Failed to add post.", variant: "destructive" });
            }
        });
    };

    const handleUpdatePost = (item: Post) => {
        startTransition(async () => {
            try {
                await updatePost(item);
                await loadPosts();
                toast({ title: "Post Updated", description: `"${item.title}" has been updated.` });
            } catch (error) {
                 toast({ title: "Error", description: "Failed to update post.", variant: "destructive" });
            }
        });
    }

    const handleDeletePost = (postId: string) => {
        startTransition(async () => {
            try {
                await deletePost(postId);
                await loadPosts();
                toast({ title: "Post Deleted", description: "The post has been deleted.", variant: "destructive" });
            } catch (error) {
                toast({ title: "Error", description: "Failed to delete post.", variant: "destructive" });
            }
        });
    }
    
    const PostCardWrapper = ({ post, children }: {post: Post, children: React.ReactNode}) => {
        if (post.redirectUrl) {
            return (
                <a href={post.redirectUrl} target="_blank" rel="noopener noreferrer" className="h-full flex flex-col">
                    {children}
                </a>
            )
        }
        return <>{children}</>;
    }

  if (isLoading) {
    return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">Posts Management</h1>
        <AddPostDialog onAddPost={handleAddPost}>
            <Button><PlusCircle className="mr-2 h-4 w-4" /> Add New Post</Button>
        </AddPostDialog>
      </div>
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Card key={post.id} className="overflow-hidden flex flex-col hover:shadow-lg transition-shadow">
            <PostCardWrapper post={post}>
                {post.imageUrl && (
                    <CardHeader className="p-0">
                        <div className="relative h-48 w-full">
                            <Image
                                src={post.imageUrl}
                                alt={post.title}
                                fill
                                className="object-cover"
                                data-ai-hint="post image"
                            />
                        </div>
                    </CardHeader>
                )}
                <CardContent className="p-4 flex-1">
                    <CardTitle className="text-lg font-headline leading-tight">{post.title}</CardTitle>
                    <CardDescription className="mt-2 line-clamp-3">{post.content}</CardDescription>
                </CardContent>
            </PostCardWrapper>
            <CardFooter className="p-4 pt-0 flex justify-between items-center bg-card mt-auto">
                 <p className="text-sm text-muted-foreground">{new Date(post.createdAt).toLocaleDateString()}</p>
                 <AlertDialog>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <AddPostDialog post={post} onUpdatePost={handleUpdatePost}>
                               <Button variant="ghost" className="w-full justify-start text-sm font-normal p-2 h-auto">
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </Button>
                            </AddPostDialog>
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                                    <Trash className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </AlertDialogTrigger>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the post.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeletePost(post.id)} disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Continue
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                 </AlertDialog>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PostsAdminPage;
