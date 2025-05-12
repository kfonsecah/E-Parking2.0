'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const tabs = [
  { name: 'Menú', href: '/parking/overview' },
  { name: 'Parking', href: '/parking/plots' },
  { name: 'Entrada', href: '/parking/entry' },
  { name: 'Caja', href: '/parking/cashier-exit' }, 
];

export default function ParkingNavBar() {
  const pathname = usePathname();

  return (
    <nav className="bg-transparent">
      <div className="px-6 border-b border-gray-300">
        <div className="flex space-x-10 relative">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;

            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={clsx(
                  'relative pt-2 pb-1 text-sm font-medium text-gray-600 transition-colors hover:text-teal-600',
                  isActive && 'text-teal-600'
                )}
              >
                {tab.name}
                {isActive && (
                  <span className="absolute -bottom-[1px] left-0 w-full h-[2px] bg-teal-600" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
