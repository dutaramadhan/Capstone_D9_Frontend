export default function Sekeleton() {
  return (
    <div className="bg-gray-50 rounded-lg p-6 shadow-lg shadow-inner space-y-6">
      <div className="skeleton-box h-6 bg-gray-300 rounded w-3/4"></div>
      <div className="skeleton-box h-6 bg-gray-300 rounded w-1/2"></div>
      <div className="skeleton-box h-6 bg-gray-300 rounded w-full"></div>
      <div className="skeleton-box h-6 bg-gray-300 rounded w-2/3"></div>
    </div>
  );
}
