import React, { useState, useRef, useEffect } from "react";
import { X, Check, AlertTriangle, Info, CheckCircle, XCircle, ChevronDown, Search, Loader2 } from "lucide-react";

// ─── Button ─────────────────────────────────────────────────────────────────

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline" | "success";
type ButtonSize = "xs" | "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
}

const btnBase =
  "inline-flex items-center justify-center gap-2 font-medium rounded-lg cursor-pointer select-none transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2";

const btnVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-[#2563EB] text-white hover:bg-[#1D4ED8] active:bg-[#1E3A8A] focus-visible:outline-[#2563EB] shadow-sm",
  secondary:
    "bg-[#F1F5F9] text-[#334155] hover:bg-[#E2E8F0] active:bg-[#CBD5E1] focus-visible:outline-[#2563EB]",
  ghost:
    "bg-transparent text-[#334155] hover:bg-[#F1F5F9] active:bg-[#E2E8F0] focus-visible:outline-[#2563EB]",
  danger:
    "bg-[#DC2626] text-white hover:bg-[#B91C1C] active:bg-[#991B1B] focus-visible:outline-[#DC2626] shadow-sm",
  outline:
    "bg-transparent text-[#334155] border border-[#E2E8F0] hover:bg-[#F8FAFC] hover:border-[#CBD5E1] focus-visible:outline-[#2563EB]",
  success:
    "bg-[#059669] text-white hover:bg-[#047857] active:bg-[#065F46] focus-visible:outline-[#059669] shadow-sm",
};

const btnSizes: Record<ButtonSize, string> = {
  xs: "text-xs px-2.5 py-1.5 h-7",
  sm: "text-sm px-3 py-1.5 h-8",
  md: "text-sm px-4 py-2 h-9",
  lg: "text-base px-5 py-2.5 h-11",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  iconRight,
  fullWidth,
  children,
  className = "",
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`${btnBase} ${btnVariants[variant]} ${btnSizes[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? <Loader2 size={14} className="spin" /> : icon}
      {children}
      {!loading && iconRight}
    </button>
  );
}

// ─── Badge ───────────────────────────────────────────────────────────────────

type BadgeVariant = "blue" | "green" | "orange" | "red" | "yellow" | "purple" | "gray" | "default";

interface BadgeProps {
  variant?: BadgeVariant;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

const badgeVariants: Record<BadgeVariant, string> = {
  blue: "bg-[#EFF6FF] text-[#1D4ED8] border border-[#DBEAFE]",
  green: "bg-[#ECFDF5] text-[#047857] border border-[#D1FAE5]",
  orange: "bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA]",
  red: "bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]",
  yellow: "bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A]",
  purple: "bg-[#F5F3FF] text-[#6D28D9] border border-[#DDD6FE]",
  gray: "bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0]",
  default: "bg-[#F1F5F9] text-[#334155] border border-[#E2E8F0]",
};

const badgeDotColors: Record<BadgeVariant, string> = {
  blue: "bg-[#2563EB]",
  green: "bg-[#059669]",
  orange: "bg-[#EA580C]",
  red: "bg-[#DC2626]",
  yellow: "bg-[#D97706]",
  purple: "bg-[#7C3AED]",
  gray: "bg-[#64748B]",
  default: "bg-[#94A3B8]",
};

export function Badge({ variant = "default", dot, children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${badgeVariants[variant]} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${badgeDotColors[variant]}`}
        />
      )}
      {children}
    </span>
  );
}

// ─── Status Chip (Emergency Status) ──────────────────────────────────────────

type StatusType =
  | "submitted"
  | "assigned"
  | "accepted"
  | "en_route"
  | "arrived"
  | "resolved"
  | "cancelled"
  | "pending"
  | "active"
  | "inactive"
  | "verified"
  | "rejected";

const statusConfig: Record<StatusType, { label: string; variant: BadgeVariant; dot?: boolean }> = {
  submitted: { label: "Submitted", variant: "blue", dot: true },
  assigned: { label: "Assigned", variant: "purple", dot: true },
  accepted: { label: "Accepted", variant: "yellow", dot: true },
  en_route: { label: "En Route", variant: "orange", dot: true },
  arrived: { label: "Arrived", variant: "blue", dot: true },
  resolved: { label: "Resolved", variant: "green", dot: false },
  cancelled: { label: "Cancelled", variant: "gray", dot: false },
  pending: { label: "Pending", variant: "yellow", dot: true },
  active: { label: "Active", variant: "green", dot: true },
  inactive: { label: "Inactive", variant: "gray", dot: false },
  verified: { label: "Verified", variant: "green", dot: false },
  rejected: { label: "Rejected", variant: "red", dot: false },
};

export function StatusChip({ status }: { status: StatusType }) {
  const config = statusConfig[status] || { label: status, variant: "default" as BadgeVariant };
  return (
    <Badge variant={config.variant} dot={config.dot}>
      {config.label}
    </Badge>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export function Input({
  label,
  error,
  hint,
  prefixIcon,
  suffixIcon,
  fullWidth,
  className = "",
  id,
  ...rest
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className={`flex flex-col gap-1.5 ${fullWidth ? "w-full" : ""}`}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-[#334155]">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {prefixIcon && (
          <span className="absolute left-3 text-[#94A3B8] pointer-events-none flex items-center">
            {prefixIcon}
          </span>
        )}
        <input
          id={inputId}
          className={`w-full h-9 px-3 py-2 text-sm bg-white border rounded-lg text-[#0F172A] placeholder:text-[#94A3B8] transition-all duration-150
            ${prefixIcon ? "pl-9" : ""}
            ${suffixIcon ? "pr-9" : ""}
            ${error
              ? "border-[#DC2626] focus:border-[#DC2626] focus:ring-2 focus:ring-[#FCA5A5] focus:ring-offset-0"
              : "border-[#E2E8F0] hover:border-[#CBD5E1] focus:border-[#2563EB] focus:ring-2 focus:ring-[#DBEAFE] focus:ring-offset-0"
            }
            outline-none ${className}`}
          {...rest}
        />
        {suffixIcon && (
          <span className="absolute right-3 text-[#94A3B8] pointer-events-none flex items-center">
            {suffixIcon}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-[#DC2626]">{error}</p>}
      {hint && !error && <p className="text-xs text-[#64748B]">{hint}</p>}
    </div>
  );
}

// ─── Textarea ─────────────────────────────────────────────────────────────────

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
}

export function Textarea({ label, error, hint, fullWidth, className = "", id, ...rest }: TextareaProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className={`flex flex-col gap-1.5 ${fullWidth ? "w-full" : ""}`}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-[#334155]">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={`w-full px-3 py-2.5 text-sm bg-white border rounded-lg text-[#0F172A] placeholder:text-[#94A3B8] transition-all duration-150 resize-none
          ${error
            ? "border-[#DC2626] focus:border-[#DC2626] focus:ring-2 focus:ring-[#FCA5A5] focus:ring-offset-0"
            : "border-[#E2E8F0] hover:border-[#CBD5E1] focus:border-[#2563EB] focus:ring-2 focus:ring-[#DBEAFE] focus:ring-offset-0"
          }
          outline-none ${className}`}
        rows={4}
        {...rest}
      />
      {error && <p className="text-xs text-[#DC2626]">{error}</p>}
      {hint && !error && <p className="text-xs text-[#64748B]">{hint}</p>}
    </div>
  );
}

// ─── Select ───────────────────────────────────────────────────────────────────

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  options: { value: string; label: string }[];
}

export function Select({ label, error, fullWidth, options, className = "", id, ...rest }: SelectProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className={`flex flex-col gap-1.5 ${fullWidth ? "w-full" : ""}`}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-[#334155]">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={inputId}
          className={`w-full h-9 pl-3 pr-8 text-sm bg-white border rounded-lg text-[#0F172A] appearance-none cursor-pointer transition-all duration-150
            ${error
              ? "border-[#DC2626] focus:border-[#DC2626]"
              : "border-[#E2E8F0] hover:border-[#CBD5E1] focus:border-[#2563EB] focus:ring-2 focus:ring-[#DBEAFE] focus:ring-offset-0"
            }
            outline-none ${className}`}
          {...rest}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
      </div>
      {error && <p className="text-xs text-[#DC2626]">{error}</p>}
    </div>
  );
}

// ─── SearchInput ──────────────────────────────────────────────────────────────

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export function SearchInput({ className = "", ...rest }: SearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
      <input
        type="search"
        className="w-full h-9 pl-9 pr-3 text-sm bg-white border border-[#E2E8F0] rounded-lg text-[#0F172A] placeholder:text-[#94A3B8] hover:border-[#CBD5E1] focus:border-[#2563EB] focus:ring-2 focus:ring-[#DBEAFE] focus:ring-offset-0 outline-none transition-all"
        {...rest}
      />
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
  onClick?: () => void;
}

const cardPadding = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

export function Card({ children, className = "", padding = "md", hover, onClick }: CardProps) {
  return (
    <div
      className={`bg-white border border-[#E2E8F0] rounded-xl ${cardPadding[padding]}
        ${hover ? "hover:border-[#CBD5E1] hover:shadow-sm cursor-pointer transition-all duration-150" : ""}
        ${onClick ? "cursor-pointer" : ""}
        ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  changeType?: "up" | "down" | "neutral";
  icon: React.ReactNode;
  color?: "blue" | "green" | "orange" | "red" | "purple";
  className?: string;
}

const statColors = {
  blue: { bg: "bg-[#EFF6FF]", text: "text-[#2563EB]" },
  green: { bg: "bg-[#ECFDF5]", text: "text-[#059669]" },
  orange: { bg: "bg-[#FFF7ED]", text: "text-[#EA580C]" },
  red: { bg: "bg-[#FEF2F2]", text: "text-[#DC2626]" },
  purple: { bg: "bg-[#F5F3FF]", text: "text-[#7C3AED]" },
};

export function StatCard({ label, value, change, changeType = "neutral", icon, color = "blue", className = "" }: StatCardProps) {
  const colors = statColors[color];
  return (
    <Card className={`flex items-start gap-4 ${className}`}>
      <div className={`w-10 h-10 rounded-lg ${colors.bg} ${colors.text} flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-[#64748B] uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-semibold text-[#0F172A] font-[family-name:var(--font-display)] mt-0.5">{value}</p>
        {change && (
          <p className={`text-xs mt-0.5 ${changeType === "up" ? "text-[#059669]" : changeType === "down" ? "text-[#DC2626]" : "text-[#64748B]"}`}>
            {change}
          </p>
        )}
      </div>
    </Card>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  footer?: React.ReactNode;
}

const modalSizes = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
};

export function Modal({ open, onClose, title, children, size = "md", footer }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className={`relative w-full ${modalSizes[size]} bg-white rounded-2xl shadow-xl scale-in`}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
            <h2 className="text-base font-semibold text-[#0F172A] font-[family-name:var(--font-display)]">{title}</h2>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-[#94A3B8] hover:text-[#334155] hover:bg-[#F1F5F9] transition-all"
            >
              <X size={16} />
            </button>
          </div>
        )}
        <div className="px-6 py-5">{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-[#E2E8F0] flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

const toastConfig = {
  success: { icon: CheckCircle, bg: "bg-[#ECFDF5]", border: "border-[#D1FAE5]", text: "text-[#047857]", iconColor: "text-[#059669]" },
  error: { icon: XCircle, bg: "bg-[#FEF2F2]", border: "border-[#FECACA]", text: "text-[#B91C1C]", iconColor: "text-[#DC2626]" },
  warning: { icon: AlertTriangle, bg: "bg-[#FFFBEB]", border: "border-[#FDE68A]", text: "text-[#92400E]", iconColor: "text-[#D97706]" },
  info: { icon: Info, bg: "bg-[#EFF6FF]", border: "border-[#DBEAFE]", text: "text-[#1D4ED8]", iconColor: "text-[#2563EB]" },
};

export function ToastContainer({ toasts, onRemove }: { toasts: ToastItem[]; onRemove: (id: string) => void }) {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => {
        const conf = toastConfig[t.type];
        const Icon = conf.icon;
        return (
          <div
            key={t.id}
            className={`toast-slide flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg min-w-72 max-w-sm pointer-events-auto ${conf.bg} ${conf.border}`}
          >
            <Icon size={16} className={`${conf.iconColor} flex-shrink-0 mt-0.5`} />
            <p className={`text-sm font-medium flex-1 ${conf.text}`}>{t.message}</p>
            <button
              onClick={() => onRemove(t.id)}
              className={`${conf.iconColor} opacity-60 hover:opacity-100 transition-opacity`}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (type: ToastType, message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };

  const removeToast = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return { toasts, addToast, removeToast, toast: addToast };
}

// ─── Alert ────────────────────────────────────────────────────────────────────

interface AlertProps {
  type?: ToastType;
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export function Alert({ type = "info", title, children, onClose, className = "" }: AlertProps) {
  const conf = toastConfig[type];
  const Icon = conf.icon;
  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${conf.bg} ${conf.border} ${className}`}>
      <Icon size={16} className={`${conf.iconColor} flex-shrink-0 mt-0.5`} />
      <div className="flex-1">
        {title && <p className={`text-sm font-semibold ${conf.text}`}>{title}</p>}
        <p className={`text-sm ${conf.text} ${title ? "mt-0.5 opacity-80" : ""}`}>{children}</p>
      </div>
      {onClose && (
        <button onClick={onClose} className={`${conf.iconColor} opacity-60 hover:opacity-100`}>
          <X size={14} />
        </button>
      )}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

export function SkeletonCard() {
  return (
    <Card>
      <div className="flex items-start gap-4">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    </Card>
  );
}

// ─── Divider ─────────────────────────────────────────────────────────────────

export function Divider({ className = "" }: { className?: string }) {
  return <hr className={`border-0 border-t border-[#E2E8F0] ${className}`} />;
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

interface AvatarProps {
  name: string;
  src?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  online?: boolean;
}

const avatarColors = [
  "bg-[#EFF6FF] text-[#2563EB]",
  "bg-[#ECFDF5] text-[#059669]",
  "bg-[#FFF7ED] text-[#EA580C]",
  "bg-[#F5F3FF] text-[#7C3AED]",
  "bg-[#FFFBEB] text-[#D97706]",
];

const avatarSizes = {
  xs: "w-6 h-6 text-xs",
  sm: "w-7 h-7 text-xs",
  md: "w-8 h-8 text-sm",
  lg: "w-10 h-10 text-sm",
  xl: "w-12 h-12 text-base",
};

export function Avatar({ name, src, size = "md", online }: AvatarProps) {
  const colorClass = avatarColors[name.charCodeAt(0) % avatarColors.length];
  const sizeClass = avatarSizes[size];
  const initials = name.split(" ").slice(0, 2).map((s) => s[0]).join("").toUpperCase();

  return (
    <div className="relative inline-flex">
      <div className={`rounded-full flex items-center justify-center font-semibold flex-shrink-0 overflow-hidden ${sizeClass} ${src ? "" : colorClass}`}>
        {src ? (
          <img src={src} alt={name} className="w-full h-full object-cover" />
        ) : (
          initials
        )}
      </div>
      {online !== undefined && (
        <span
          className={`absolute bottom-0 right-0 rounded-full border-2 border-white w-2.5 h-2.5 ${online ? "bg-[#059669]" : "bg-[#94A3B8]"}`}
        />
      )}
    </div>
  );
}

// ─── Table ────────────────────────────────────────────────────────────────────

interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
  width?: string;
}

interface TableProps<T extends Record<string, unknown>> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}

export function Table<T extends Record<string, unknown>>({ columns, data, onRowClick, emptyMessage = "No data available" }: TableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-[#E2E8F0]">
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ width: col.width }}
                className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wide whitespace-nowrap"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-[#94A3B8]">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={i}
                className={`border-b border-[#F1F5F9] last:border-0 ${onRowClick ? "hover:bg-[#F8FAFC] cursor-pointer" : ""} transition-colors`}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3.5 text-sm text-[#334155] whitespace-nowrap">
                    {col.render ? col.render(row) : (row[col.key] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

interface PaginationProps {
  page: number;
  total: number;
  perPage: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, total, perPage, onChange }: PaginationProps) {
  const totalPages = Math.ceil(total / perPage);
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-[#E2E8F0]">
      <p className="text-sm text-[#64748B]">
        Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} of {total}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-[#64748B] hover:bg-[#F1F5F9] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <ChevronDown size={14} className="rotate-90" />
        </button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-all
              ${p === page
                ? "bg-[#2563EB] text-white shadow-sm"
                : "text-[#64748B] hover:bg-[#F1F5F9]"
              }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onChange(page + 1)}
          disabled={page === totalPages}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-[#64748B] hover:bg-[#F1F5F9] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <ChevronDown size={14} className="-rotate-90" />
        </button>
      </div>
    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className = "" }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-16 px-6 ${className}`}>
      <div className="w-12 h-12 rounded-2xl bg-[#F1F5F9] text-[#94A3B8] flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-[#334155] mb-1">{title}</h3>
      {description && <p className="text-sm text-[#64748B] max-w-sm mb-4">{description}</p>}
      {action}
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, active, onChange, className = "" }: TabsProps) {
  return (
    <div className={`flex items-center gap-1 border-b border-[#E2E8F0] ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-all
            ${active === tab.id
              ? "text-[#2563EB] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#2563EB] after:rounded-t-full"
              : "text-[#64748B] hover:text-[#334155] hover:bg-[#F8FAFC] rounded-t-lg"
            }`}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={`px-1.5 py-0.5 rounded-full text-xs font-semibold ${active === tab.id ? "bg-[#EFF6FF] text-[#2563EB]" : "bg-[#F1F5F9] text-[#64748B]"}`}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ─── ConfirmDialog ────────────────────────────────────────────────────────────

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      size="sm"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onCancel}>{cancelLabel}</Button>
          <Button variant={variant} size="sm" onClick={onConfirm}>{confirmLabel}</Button>
        </>
      }
    >
      <div className="text-center">
        <div className={`w-10 h-10 rounded-full mx-auto mb-3 flex items-center justify-center ${variant === "danger" ? "bg-[#FEF2F2] text-[#DC2626]" : "bg-[#EFF6FF] text-[#2563EB]"}`}>
          <AlertTriangle size={20} />
        </div>
        <h3 className="text-base font-semibold text-[#0F172A] mb-1 font-[family-name:var(--font-display)]">{title}</h3>
        <p className="text-sm text-[#64748B]">{description}</p>
      </div>
    </Modal>
  );
}

// ─── Toggle ───────────────────────────────────────────────────────────────────

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, disabled }: ToggleProps) {
  return (
    <label className={`flex items-center gap-3 ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
      <div
        className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${checked ? "bg-[#2563EB]" : "bg-[#CBD5E1]"}`}
        onClick={() => !disabled && onChange(!checked)}
      >
        <div
          className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${checked ? "translate-x-4" : "translate-x-0.5"}`}
        />
      </div>
      {label && <span className="text-sm text-[#334155]">{label}</span>}
    </label>
  );
}

// ─── RiskLevel ────────────────────────────────────────────────────────────────

export function RiskLevel({ level }: { level: "low" | "medium" | "high" | "critical" }) {
  const config = {
    low: { label: "Low Risk", color: "text-[#059669]", bg: "bg-[#059669]", bars: 1 },
    medium: { label: "Medium Risk", color: "text-[#D97706]", bg: "bg-[#D97706]", bars: 2 },
    high: { label: "High Risk", color: "text-[#EA580C]", bg: "bg-[#EA580C]", bars: 3 },
    critical: { label: "Critical Risk", color: "text-[#DC2626]", bg: "bg-[#DC2626]", bars: 4 },
  }[level];

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-end gap-0.5">
        {[1, 2, 3, 4].map((bar) => (
          <div
            key={bar}
            style={{ height: `${bar * 4 + 4}px` }}
            className={`w-1.5 rounded-sm ${bar <= config.bars ? config.bg : "bg-[#E2E8F0]"}`}
          />
        ))}
      </div>
      <span className={`text-xs font-semibold ${config.color}`}>{config.label}</span>
    </div>
  );
}
