import React from 'react'

const Button = ({ children, variant = "primary", size = "md", asChild, ...props }) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

  const variantStyles = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500",
    outline: "border border-gray-400 text-gray-800 hover:bg-gray-100 focus:ring-gray-400",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    neon: "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 focus:ring-purple-500",
  };

  const sizeStyles = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  const className = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} rounded-md`;

  // If asChild is true, clone the child element and pass the className
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      className: `${className} ${children.props.className || ''}`,
      ...props
    });
  }

  return (
    <button
      className={className}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button