"use client";

import { Fragment, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  body?: ReactNode | string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "primary" | "danger";
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl";
};

export default function Modal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  body,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "primary",
  maxWidth = "md",
}: ModalProps) {
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "4xl": "max-w-4xl",
  };
  if (!isOpen) return null;

  const confirmButtonClasses =
    confirmVariant === "danger"
      ? "bg-red-600 hover:bg-red-700 text-white"
      : "bg-[#00FF87] hover:brightness-110 text-zinc-900";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={`relative bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl ${maxWidthClasses[maxWidth]} w-full pointer-events-auto`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                {/* Title */}
                {title && (
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                    {title}
                  </h3>
                )}

                {/* Message */}
                {message && (
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
                    {message}
                  </p>
                )}

                {/* Body */}
                {body && (
                  <div className="mb-6">
                    {typeof body === "string" ? (
                      <div
                        dangerouslySetInnerHTML={{ __html: body }}
                        className="text-sm text-zinc-700 dark:text-zinc-300"
                      />
                    ) : (
                      body // React component
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors duration-200"
                  >
                    {cancelText}
                  </button>
                  <button
                    onClick={onConfirm}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${confirmButtonClasses}`}
                  >
                    {confirmText}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
