"use client";
import Link from "next/link";
import type React from "react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import Image from "next/image";

interface MenuItemProps {
  title: string;
  icon: string;
  link?: string;
  submenu?: { title: string; link: string; icon: string }[];
  isCollapsed?: boolean;
  onNavigate?: () => void;
}

const SidebarItem: React.FC<MenuItemProps> = ({
  title,
  icon,
  link,
  submenu,
  isCollapsed = false,
  onNavigate,
}) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (route?: string) => {
    if (route && pathname === route) return true;
    if (submenu) return submenu.some((item) => pathname === item.link);
    return false;
  };

  const isSubmenuActive = (route: string) => pathname === route;

  const activeStyle = `
    bg-gradient-to-r from-emerald-700 to-cyan-800 text-white rounded-lg 
    transition-all duration-500 ease-in-out 
    shadow-md opacity-100
  `;
  const baseStyle = `
    text-black hover:bg-emerald-200 
    transition-all duration-500 ease-in-out 
    opacity-70
  `;

  const containerStyle = `${isActive(link) ? activeStyle : baseStyle} flex items-center justify-between px-4 py-2 cursor-pointer`;

  const handleToggle = () => {
    if (!link && !isCollapsed) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="w-full">
      {/* Opción principal con link */}
      {link ? (
        <Link href={link} className="block" onClick={onNavigate}>
          <div className={containerStyle}>
            <div className="flex items-center space-x-3 ml-2">
              {icon && (
                <div className="w-6 h-6 flex items-center justify-center">
                  <Image
                    src={icon || "/placeholder.svg"}
                    alt={title}
                    width={24}
                    height={24}
                    className="w-6 h-6 object-contain"
                  />
                </div>
              )}
              {!isCollapsed && <span>{title}</span>}
            </div>
            {!isCollapsed && submenu && (
              <span className="ml-auto">
                {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </span>
            )}
          </div>
        </Link>
      ) : (
        <div className={containerStyle} onClick={handleToggle}>
          <div className="flex items-center space-x-3 ml-2">
            {icon && (
              <div className="w-6 h-6 flex items-center justify-center">
                <Image src={icon || "/placeholder.svg"} alt={title} width={24} height={24} />
              </div>
            )}
            {!isCollapsed && <span>{title}</span>}
          </div>
          {!isCollapsed && submenu && (
            <span className="ml-auto">
              {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </span>
          )}
        </div>
      )}

      {/* Submenú */}
      {!isCollapsed && submenu && (
        <div
          className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${
            isOpen ? "max-h-[300px]" : "max-h-0"
          }`}
        >
          <div className="pl-12 text-sm">
            {submenu.map((item, index) => (
              <Link key={index} href={item.link} className="block" onClick={onNavigate}>
                <div
                  className={`py-2 hover:text-emerald-600 ${
                    isSubmenuActive(item.link) ? "text-emerald-600 font-semibold" : ""
                  }`}
                >
                  • {item.title}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SidebarItem;
