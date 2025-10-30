import React from "react";
import { cn } from "../../utils";
import { MessageCircle } from "lucide-react";

export const Button = ({
  variant = "primary",
  children,
  className,
  icon: Icon,
  ...props
}) => {
  const base = "rounded-xl font-medium transition-all duration-300 flex items-center justify-center";

  const variants = {
    primary: "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg px-6 py-3",
    whatsapp: "bg-[#25D366] hover:bg-[#128C7E] text-white shadow-lg px-6 py-3",
    outline: "border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-6 py-3",
    ghost: "hover:bg-blue-50 text-blue-600 px-6 py-3",
  };

  return (
    <button className={cn(base, variants[variant], className)} {...props}>
      {Icon && <Icon className="w-5 h-5 mr-2" />}
      {children}
    </button>
  );
};
