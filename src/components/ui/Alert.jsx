import React from 'react';

const alertVariants = {
  default: 'bg-gray-100 text-gray-900 border-gray-200',
  destructive: 'bg-red-50 text-red-900 border-red-200',
  success: 'bg-green-50 text-green-900 border-green-200',
  warning: 'bg-yellow-50 text-yellow-900 border-yellow-200',
  info: 'bg-blue-50 text-blue-900 border-blue-200'
};

export const Alert = React.forwardRef(({ className = '', variant = 'default', children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      role="alert"
      className={`relative w-full rounded-lg border p-4 ${alertVariants[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

Alert.displayName = 'Alert';

export const AlertTitle = React.forwardRef(({ className = '', children, ...props }, ref) => {
  return (
    <h5
      ref={ref}
      className={`mb-1 font-medium leading-none tracking-tight ${className}`}
      {...props}
    >
      {children}
    </h5>
  );
});

AlertTitle.displayName = 'AlertTitle';

export const AlertDescription = React.forwardRef(({ className = '', children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`text-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

AlertDescription.displayName = 'AlertDescription';