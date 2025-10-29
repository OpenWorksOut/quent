import { NavLink } from "react-router-dom";
import {
  Home,
  LayoutDashboard,
  History,
  Send,
  User,
  LogOut,
  CreditCard,
  PiggyBank,
  Settings,
  HelpCircle,
  Bell,
  Menu,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "../ui/logo";
import { useState } from "react";

const navigationItems = [
  { name: "Home", path: "/", icon: Home, category: "main" },
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    category: "main",
  },
  {
    name: "Transactions",
    path: "/transactions",
    icon: History,
    category: "main",
  },
  { name: "Transfer", path: "/transfer", icon: Send, category: "main" },
  { name: "Cards", path: "/cards", icon: CreditCard, category: "banking" },
  { name: "Savings", path: "/savings", icon: PiggyBank, category: "banking" },
  { name: "Profile", path: "/profile", icon: User, category: "account" },
  { name: "Settings", path: "/settings", icon: Settings, category: "account" },
  { name: "Help", path: "/help", icon: HelpCircle, category: "support" },
  {
    name: "Notifications",
    path: "/notifications",
    icon: Bell,
    category: "account",
  },
];

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileSidebar = ({ isOpen, onClose }: MobileSidebarProps) => {
  const handleLogout = () => {
    // Handle logout logic here
    window.location.href = "/login";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="md:hidden fixed inset-0 z-50 bg-black/50"
          />

          {/* Sidebar */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="md:hidden fixed inset-y-0 left-0 z-50 w-72 bg-sidebar overflow-y-auto"
          >
            <div className="flex flex-col h-full pt-5 pb-20">
              <div className="flex items-center justify-between px-6 mb-8">
                <Logo variant="white" />
                <button
                  onClick={onClose}
                  className="p-2 text-white/80 hover:text-white rounded-lg hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Notification Link */}
              <NavLink
                to="/notifications"
                onClick={onClose}
                className={({ isActive }) =>
                  `mx-6 mb-6 flex items-center justify-between px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`
                }
              >
                <div className="flex items-center">
                  <Bell className="w-5 h-5 mr-2" />
                  <span className="text-sm font-medium">Notifications</span>
                </div>
                <span className="bg-white text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                  2
                </span>
              </NavLink>

              <nav className="flex-1 px-3 space-y-6">
                {/* Main Navigation */}
                <div>
                  <h3 className="px-3 text-xs font-semibold text-white/60 uppercase tracking-wider">
                    Main
                  </h3>
                  <div className="mt-2 space-y-1">
                    {navigationItems
                      .filter((item) => item.category === "main")
                      .map((item) => {
                        const Icon = item.icon;
                        return (
                          <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={onClose}
                            end={item.path === "/"}
                            className={({ isActive }) =>
                              `group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                                isActive
                                  ? "bg-white/10 text-white shadow-md"
                                  : "text-white/90 hover:bg-white/10 hover:text-white"
                              }`
                            }
                          >
                            <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                            {item.name}
                          </NavLink>
                        );
                      })}
                  </div>
                </div>

                {/* Banking */}
                <div>
                  <h3 className="px-3 text-xs font-semibold text-white/60 uppercase tracking-wider">
                    Banking
                  </h3>
                  <div className="mt-2 space-y-1">
                    {navigationItems
                      .filter((item) => item.category === "banking")
                      .map((item) => {
                        const Icon = item.icon;
                        return (
                          <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={onClose}
                            className={({ isActive }) =>
                              `group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                                isActive
                                  ? "bg-white/10 text-white shadow-md"
                                  : "text-white/90 hover:bg-white/10 hover:text-white"
                              }`
                            }
                          >
                            <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                            {item.name}
                          </NavLink>
                        );
                      })}
                  </div>
                </div>

                {/* Account & Support */}
                <div>
                  <h3 className="px-3 text-xs font-semibold text-white/60 uppercase tracking-wider">
                    Account
                  </h3>
                  <div className="mt-2 space-y-1">
                    {navigationItems
                      .filter(
                        (item) =>
                          item.category === "account" ||
                          item.category === "support"
                      )
                      .map((item) => {
                        const Icon = item.icon;
                        return (
                          <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={onClose}
                            className={({ isActive }) =>
                              `group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                                isActive
                                  ? "bg-white/10 text-white shadow-md"
                                  : "text-white/90 hover:bg-white/10 hover:text-white"
                              }`
                            }
                          >
                            <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                            {item.name}
                          </NavLink>
                        );
                      })}
                  </div>
                </div>
              </nav>

              {/* Logout Button */}
              <div className="px-3 mt-auto">
                <button
                  onClick={handleLogout}
                  className="group flex w-full items-center px-3 py-2 text-sm font-medium rounded-lg text-white/90 hover:bg-white/10 hover:text-white transition-all"
                >
                  <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
                  Logout
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
