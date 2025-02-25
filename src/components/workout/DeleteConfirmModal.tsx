import React from 'react';

interface DeleteConfirmModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmModal({ onConfirm, onCancel }: DeleteConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6">
        <h3 className="text-lg font-semibold text-gray-900">确认删除</h3>
        <p className="mt-2 text-gray-600">
          您确定要删除这个训练计划吗？此操作无法撤销。
        </p>
        <div className="mt-4 flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            确认删除
          </button>
        </div>
      </div>
    </div>
  );
}