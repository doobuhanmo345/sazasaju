'use client';

import Link from 'next/link';
import {
    CommandLineIcon,
    PencilSquareIcon,
    ArrowLeftIcon
} from '@heroicons/react/24/outline';

export default function AdminPromptPage() {
    const menuItems = [
        {
            title: 'Prompt Preview',
            description: '프롬프트 생성 결과 및 변수 확인',
            href: '/admin/prompt/preview',
            icon: CommandLineIcon,
            color: 'bg-indigo-500 text-white',
        },
        {
            title: 'Edit Prompt',
            description: '프롬프트 템플릿 수정 (준비중)',
            href: '/admin/prompt/edit',
            icon: PencilSquareIcon,
            color: 'bg-orange-500 text-white',
        },
    ];

    return (
        <div className="bg-gray-50 dark:bg-gray-900 transition-colors duration-300 max-w-4xl m-auto min-h-screen">
            <div className="max-w-4xl mx-auto space-y-8 p-8">

                <header className="text-center space-y-4 mb-10">
                    <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
                        Prompt Engineering
                    </h1>
                    <p className="text-gray-500">
                        프롬프트 도구 선택
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {menuItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex flex-col p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all hover:scale-105 group"
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${item.color} shadow-md group-hover:shadow-lg transition-all`}>
                                <item.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                                {item.title}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                                {item.description}
                            </p>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
