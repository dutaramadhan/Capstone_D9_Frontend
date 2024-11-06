export function Card({ className, title, children, icon: Icon, ...props }) {
  return (
    <div
      className={`rounded-lg border bg-white shadow ${className}`}
      {...props}
    >
      {title && (
        <div className="flex items-center space-x-2 p-4">
          {Icon && <Icon className="w-6 h-6 text-gray-500" />}{" "}
          <h3 className="text-sm lg:text-lg font-medium leading-none tracking-tight">
            {title}
          </h3>
        </div>
      )}
      <div className="flex flex-col space-y-1.5 p-6 pt-0">{children}</div>
    </div>
  );
}
