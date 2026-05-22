import React from 'react';
import Modal from './Modal';
import { Trash2 } from 'lucide-react';

export default function ConfirmDelete({ isOpen, onClose, onConfirm, itemName, loading }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Delete"
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : <><Trash2 size={15} /> Delete</>}
          </button>
        </>
      }
    >
      <p style={{ color: 'var(--text2)', lineHeight: 1.7 }}>
        Are you sure you want to delete <strong style={{ color: 'var(--text)' }}>{itemName}</strong>?
        This action cannot be undone.
      </p>
    </Modal>
  );
}
