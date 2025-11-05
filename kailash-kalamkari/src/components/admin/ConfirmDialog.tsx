import React from "react";

type Props = {
  open: boolean;
  title?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export const ConfirmDialog: React.FC<Props> = ({ open, title = "Are you sure?", onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-4 rounded shadow max-w-sm w-full">
        <h3 className="font-bold">{title}</h3>
        <div className="mt-4 flex justify-end gap-2">
          <button className="btn" onClick={onCancel}>Cancel</button>
          <button className="btn btn-destructive" onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
};
