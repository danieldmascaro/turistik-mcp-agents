import { motion } from "framer-motion";
import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";

const VARIANT_CLASSES = {
  primary: "bg-blue-600 hover:bg-blue-700 text-white",
  secondary: "bg-gray-200 hover:bg-gray-300 text-black",
  danger: "bg-red-600 hover:bg-red-700 text-white",
  outline: "border border-blue-600 text-blue-600 hover:bg-blue-100",
} as const;

const SIZE_CLASSES = {
  sm: "py-1 px-3 text-sm",
  md: "py-2 px-6 text-base",
  lg: "py-3 px-8 text-lg",
} as const;

type ButtonVariant = keyof typeof VARIANT_CLASSES;
type ButtonSize = keyof typeof SIZE_CLASSES;

type ButtonAsButton = {
  as?: 'button';
} & ButtonHTMLAttributes<HTMLButtonElement>;

type ButtonAsAnchor = {
  as: 'a';
} & AnchorHTMLAttributes<HTMLAnchorElement>;

type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  className?: string;
} & (ButtonAsButton | ButtonAsAnchor);

const Button = (props: ButtonProps) => {
  const {
    as = 'button',
    variant = 'primary',
    size = 'md',
    loading = false,
    icon = null,
    className = '',
    children,
    ...rest
  } = props;
  const variantClass = VARIANT_CLASSES[variant];
  const sizeClass = SIZE_CLASSES[size];
  const classes = `rounded-md font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${variantClass} ${sizeClass} ${className}`;

  if (as === 'a') {
    const { href, target, rel } = rest as AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <motion.a
        href={href}
        target={target}
        rel={rel}
        whileTap={{ scale: 0.96 }}
        whileHover={{ scale: 1.02 }}
        className={classes}
      >
        {icon && <span className="text-lg">{icon}</span>}
        {children}
      </motion.a>
    );
  }
  const { type = 'button', onClick, disabled = false } = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-disabled={disabled}
      aria-busy={loading}
      whileTap={{ scale: 0.96 }}
      whileHover={{ scale: 1.02 }}
      className={classes}
    >
      {loading ? (
        <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
      ) : (
        <>
          {icon && <span className="text-lg">{icon}</span>}
          {children}
        </>
      )}
    </motion.button>
  );
};

export default Button;