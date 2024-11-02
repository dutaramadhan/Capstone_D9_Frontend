import React from "react";

export function Card({ className, title, children, ...props }) {
  return (
    <div
      className={`rounded-lg border bg-white shadow ${className}`}
      {...props}
    >
      {title && (
        <h3 className="sm:text-sm lg:text-lg font-normal leading-none tracking-tight p-4">
          {title}
        </h3>
      )}
      <div className="flex flex-col space-y-1.5 p-6 pt-0">{children}</div>
    </div>
  );
}
