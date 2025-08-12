
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Logo from './logo';
import { useAuth } from '@/hooks/use-auth';
import { LayoutDashboard, Menu, X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './theme-toggle';

const navItems = [
    { href: "/gallery", label: "Gallery" },
    { href: "/members", label: "Members" },
    { href: "/posts", label: "Posts" },
]

const Header = () => {
  const { isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
        <div className="mr-auto flex items-center">
          <Logo />
        </div>

        <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                {navItems.map(item => (
                    <Link key={item.label} href={item.href} className={`transition-colors hover:text-primary ${pathname === item.href ? "text-primary" : ""}`}>
                        {item.label}
                    </Link>
                ))}
            </nav>

            <ThemeToggle />

            <div className="hidden md:block">
                {isAuthenticated ? (
                    <Button asChild variant="outline">
                    <Link href="/admin">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                    </Link>
                    </Button>
                ) : (
                    <Button asChild>
                    <Link href="/login">Sign in</Link>
                    </Button>
                )}
            </div>
           
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden">
                        <Menu className="h-6 w-6" />
                        <span className="sr-only">Open menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full max-w-sm flex flex-col p-0">
                    <SheetHeader className="flex flex-row items-center justify-between border-b p-4">
                        <SheetTitle className="sr-only">Menu</SheetTitle>
                        <Logo />
                         <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <X className="h-6 w-6" />
                                <span className="sr-only">Close menu</span>
                            </Button>
                         </SheetTrigger>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto">
                        <nav className="flex flex-col gap-4 p-4 text-lg font-medium">
                            {navItems.map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`py-2 transition-colors hover:text-primary ${pathname === item.href ? "text-primary" : ""}`}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    </div>
                    <div className="mt-auto p-4 border-t space-y-4">
                        <div className="flex justify-center">
                            <ThemeToggle />
                        </div>
                        {isAuthenticated ? (
                            <Button asChild className="w-full">
                                <Link href="/admin" onClick={() => setIsMenuOpen(false)}>
                                    <LayoutDashboard className="mr-2 h-4 w-4" />
                                    Dashboard
                                </Link>
                            </Button>
                        ) : (
                            <Button asChild className="w-full">
                                <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                                    Sign in
                                </Link>
                            </Button>
                        )}
                    </div>
                </SheetContent>
            </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
