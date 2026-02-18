'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthContext } from '@/contexts/useAuthContext';
import {
    UsersIcon,
    CommandLineIcon,
    ChatBubbleBottomCenterTextIcon,
    AcademicCapIcon,
    Cog6ToothIcon
} from '@heroicons/react/24/outline';

const navItems = [
    { name: 'Overview', href: '/admin', exact: true },
    { name: 'Prompt Engineering', href: '/admin/prompt', icon: CommandLineIcon },
    { name: 'User Management', href: '/admin/users', icon: UsersIcon },
    { name: 'Consultants', href: '/admin/consultants', icon: AcademicCapIcon },
    { name: 'Inquiries', href: '/admin/inquiries', icon: ChatBubbleBottomCenterTextIcon },
    { name: 'System', href: '/admin/system', icon: Cog6ToothIcon },
];

export default function AdminLayout({ children }) {
    const { user, userData } = useAuthContext();
    const pathname = usePathname();

    // Basic role check - let the page components handle specific redirections or detailed messages
    // avoiding a flash of generic content if possible
    if (!user || (userData?.role !== 'admin' && userData?.role !== 'super_admin')) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-400">
                Checking permissions...
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            {/* Top Navigation Bar */}
            <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-8">
                            <div className="flex-shrink-0">
                                <span className="font-black text-xl text-gray-900 dark:text-white tracking-tight">
                                    Admin<span className="text-indigo-500">.</span>
                                </span>
                            </div>
                            <div className="hidden md:block">
                                <div className="flex items-baseline space-x-4">
                                    {navItems.map((item) => {
                                        const isActive = item.exact
                                            ? pathname === item.href
                                            : pathname.startsWith(item.href);

                                        return (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${isActive
                                                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                                                        : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                                    }`}
                                            >
                                                {item.icon && <item.icon className={`w-4 h-4 ${isActive ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'}`} />}
                                                {item.name}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* User Profile / Logout Placeholder */}
                        <div className="hidden md:block">
                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <p className="text-xs font-bold text-gray-900 dark:text-white">{userData?.displayName || 'Admin'}</p>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">{userData?.role}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
}
