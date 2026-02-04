import React, { useState } from 'react';

import { ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline'; // Import icons

const SelectPerson = ({ list, onSelect, className = '' }) => {
  const [selected, setSelected] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Map list to options
  const options = list ? list.map((item) => ({
    id: item.id,
    label: item.displayName,
    value: item.id,
  })) : [];

  const handleSelect = (option) => {
    setSelected(option.label);
    setIsOpen(false);
    onSelect(option.id);
  };

  return (
    <div className={`relative w-full ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all hover:border-emerald-300 dark:hover:border-emerald-700"
      >
        <span className={`text-sm font-medium truncat ${selected ? "text-slate-700 dark:text-slate-200" : "text-slate-400"}`}>
          {selected || "저장된 프로필 선택"}
        </span>
        <ChevronDownIcon className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-[100]" onClick={() => setIsOpen(false)}></div>
          <ul className="absolute z-[101] mt-2 w-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl max-h-60 overflow-auto animate-in fade-in zoom-in-95 duration-200 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
            {options.length > 0 ? (
              options.map((option) => (
                <li
                  key={option.id}
                  onClick={() => handleSelect(option)}
                  className="px-4 py-2.5 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 cursor-pointer flex items-center justify-between group transition-colors"
                >
                  <span className={`text-sm ${selected === option.label ? 'font-bold text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'}`}>
                    {option.label}
                  </span>
                  {selected === option.label && <CheckIcon className="w-4 h-4 text-emerald-500" />}
                </li>
              ))
            ) : (
                <li className="px-4 py-3 text-sm text-slate-400 text-center">
                    저장된 프로필이 없습니다
                </li>
            )}
          </ul>
        </>
      )}
    </div>
  );
};

export default SelectPerson;