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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Post } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

interface AddPostDialogProps {
    post?: Post;
    onAddPost?: (post: Omit<Post, 'id' | 'createdAt'>) => void;
    onUpdatePost?: (post: Post) => void;
    children: React.ReactNode;
}

export default function AddPostDialog({ post, onAddPost, onUpdatePost, children }: AddPostDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Post>>({});
  const { toast } = useToast();
  const isEditMode = !!post;

  useEffect(() => {
    if (post && open) {
        setFormData(post);
    } else {
        setFormData({
            title: "",
            content: "",
            imageUrl: "",
            redirectUrl: "",
            showOnHomepage: false,
        });
    }
  }, [post, open]);

  const handleChange = (field: keyof Omit<Post, 'id' | 'createdAt'>, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange('imageUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
        toast({
            title: "Missing Fields",
            description: "Please fill out the title and content.",
            variant: "destructive"
        })
        return;
    }

    if (isEditMode && onUpdatePost) {
        onUpdatePost(formData as Post);
    } else if (onAddPost) {
        onAddPost(formData as Omit<Post, 'id' | 'createdAt'>);
    }
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">{isEditMode ? 'Edit Post' : 'Add New Post'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update the details of the post.' : 'Create a new post for announcements or news.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
                <div className="space-y-2">
                    <Label htmlFor="title">
                    Title
                    </Label>
                    <Input
                    id="title"
                    value={formData.title || ''}
                    onChange={(e) => handleChange('title', e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="content">
                    Content
                    </Label>
                    <Textarea
                    id="content"
                    value={formData.content || ''}
                    onChange={(e) => handleChange('content', e.target.value)}
                    rows={5}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="redirectUrl">Redirect URL (Optional)</Label>
                    <Input
                        id="redirectUrl"
                        value={formData.redirectUrl || ''}
                        onChange={(e) => handleChange('redirectUrl', e.target.value)}
                        placeholder="https://example.com/target-page"
                    />
                </div>

                <Tabs defaultValue="url" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="url">URL</TabsTrigger>
                        <TabsTrigger value="upload">Upload</TabsTrigger>
                    </TabsList>
                    <TabsContent value="url" className="pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="imageUrl">Image URL</Label>
                            <Input
                                id="imageUrl"
                                value={formData.imageUrl || ''}
                                onChange={(e) => handleChange('imageUrl', e.target.value)}
                                placeholder="https://placehold.co/1200x600.png"
                            />
                        </div>
                    </TabsContent>
                    <TabsContent value="upload" className="pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="file">Upload Image</Label>
                            <Input id="file" type="file" onChange={handleFileChange} accept="image/*" />
                        </div>
                    </TabsContent>
                </Tabs>
                
                {formData.imageUrl && (
                    <div className="space-y-2">
                        <Label>Preview</Label>
                        <img src={formData.imageUrl} alt="Preview" className="w-full h-auto rounded-md object-cover max-h-48" />
                    </div>
                )}

                 <div className="flex items-center space-x-2 pt-2">
                    <Switch
                        id="showOnHomepage"
                        checked={formData.showOnHomepage}
                        onCheckedChange={(checked) => handleChange('showOnHomepage', checked)}
                    />
                    <Label htmlFor="showOnHomepage">Show on Homepage</Label>
                </div>
            </div>
            <DialogFooter>
            <Button type="submit">Save {isEditMode ? 'Changes' : 'Post'}</Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
