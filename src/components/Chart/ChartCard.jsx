import React from "react";

export function Card({ className, children, ...props }) {
  return (
    <div
      className={`rounded-lg border bg-white shadow ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }) {
  return (
    <h3
      className={`sm:text-sm lg:text-lg font-semibold leading-none tracking-tight ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardContent({ className, children, ...props }) {
  return (
    <div className={`sm:text-sm lg:text-lg pt-0 ${className}`} {...props}>
      {children}
    </div>
  );
}
