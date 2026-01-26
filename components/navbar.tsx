'use client';

import Link from 'next/link';
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { BookOpen, PenTool, Search, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <BookOpen className="h-8 w-8 indigo-600" />
                        <span className="text-xl front-bold text-indigo-600">NovelTH</span>
                    </Link>

                    {/* Search Bar - ซ่อนบนมือถือ */}
                    <div className="hidden md:flex flex-1 max-w-md mx-8">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="ค้นหานิยาย..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* เมนู */}
                    <div className="hidden md:flex items-center gap-4">
                        <Link href="/novels" className="text-gray-600 hover:text-indigo-900">
                            นิยายทั้งหมด
                        </Link>

                        <SignedOut>
                            <SignInButton mode="modal">
                                <button className="px-4 py-2 text-gray-600 hover:text-gray-900">
                                    เข้าสู่ระบบ
                                </button>
                            </SignInButton>
                            <SignUpButton mode="modal">
                                <button className="px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700">
                                    สมัครสมาชิก
                                </button>
                            </SignUpButton>
                        </SignedOut>

                        <SignedIn>
                            <Link href="/write" className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                                <PenTool className="h-4 w-4" />
                                เขียนนิยาย
                            </Link>
                            <UserButton afterSignOutUrl="/" />
                        </SignedIn>
                    </div>

                    {/* Mobile Menu Button */}
                    <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? (<X className="h-6 w-6 text-gray-600" />) : (<Menu className="h-6 w-6 text-gray-600" />)}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden py-4 boeder-t">
                        {/* Search Bar บนมือถือ */}
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="ค้นหานิยาย..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <Link href="/novels" className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                onClick={() => setIsMenuOpen(false)}>
                                นิยายทั้งหมด
                            </Link>

                            <SignedOut>
                                <SignInButton mode="modal">
                                    <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-left">
                                        เข้าสู่ระบบ
                                    </button>
                                </SignInButton>
                                <SignUpButton mode="modal">
                                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                                        สมัครสมาชิก
                                    </button>
                                </SignUpButton>
                            </SignedOut>

                            <SignedIn>
                                <Link href="/write" className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                    onClick={() => setIsMenuOpen(false)}>
                                    <PenTool className="h-4 w-4" />
                                    เขียนนิยาย
                                </Link>
                            </SignedIn>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}