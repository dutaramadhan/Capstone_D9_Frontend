export default function ConfirmationToast({ message, onConfirm, onCancel }) {
  <div className="text-center">
    <p className="mb-4 text-lg font-medium">{message}</p>
    <div className="flex justify-center space-x-4">
      <button
        className="px-4 py-2 bg-green-500 text-white rounded"
        onClick={onConfirm}
      >
        Yakin
      </button>
      <button
        className="px-4 py-2 bg-red-500 text-white rounded"
        onClick={onCancel}
      >
        Batal
      </button>
    </div>
  </div>;
}
