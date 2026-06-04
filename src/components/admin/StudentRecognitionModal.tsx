// 📍 Ruta del archivo: src/components/admin/StudentRecognitionModal.tsx

import { useEffect, useMemo, useState } from "react";
import { Loader2, Trophy, X } from "lucide-react";

import {
  createStudentRecognition,
  getStudentRecognitionSummary,
  recognitionOptions,
  type RecognitionType,
} from "@/src/services/recognitionsService";

interface StudentRecognitionModalProps {
  student: {
    id: string;
    full_name: string;
  };
  onClose: () => void;
}

export function StudentRecognitionModal({
  student,
  onClose,
}: StudentRecognitionModalProps) {
  const [selectedType, setSelectedType] =
    useState<RecognitionType>("positive_attitude");
  const [notes, setNotes] = useState("");
  const [summary, setSummary] = useState<
    Array<(typeof recognitionOptions)[number] & { count: number }>
  >([]);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const totalRecognitions = useMemo(
    () => summary.reduce((total, item) => total + item.count, 0),
    [summary],
  );

  useEffect(() => {
    loadSummary();
  }, [student.id]);

  async function loadSummary() {
    try {
      setLoadingSummary(true);
      const data = await getStudentRecognitionSummary(student.id);
      setSummary(data);
    } catch (error) {
      console.error(error);
      setSummary([]);
    } finally {
      setLoadingSummary(false);
    }
  }

  async function handleSave() {
    try {
      setSaving(true);
      setSuccessMessage("");

      await createStudentRecognition({
        studentId: student.id,
        recognitionType: selectedType,
        notes,
      });

      setNotes("");
      setSuccessMessage("Reconocimiento guardado correctamente.");
      await loadSummary();
    } catch (error) {
      console.error(error);
      alert("No se pudo guardar el reconocimiento.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-yellow-500/20 bg-[#080808] shadow-2xl shadow-yellow-900/10">
        <div className="flex items-start justify-between gap-4 border-b border-zinc-900 p-5 sm:p-6">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-yellow-300">
              <Trophy className="h-3.5 w-3.5" />
              TXS Reconocimientos
            </div>

            <h2 className="text-2xl font-black text-white">
              Reconocer alumno
            </h2>
            <p className="mt-1 text-sm text-zinc-400">{student.full_name}</p>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-zinc-800 p-2 text-zinc-400 transition hover:border-red-500/40 hover:text-red-400"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 p-5 sm:p-6">
          <div className="rounded-2xl border border-zinc-900 bg-black/35 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="font-bold text-white">Resumen actual</p>
              <span className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-xs font-bold text-yellow-300">
                Total: {totalRecognitions}
              </span>
            </div>

            {loadingSummary ? (
              <div className="flex h-16 items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-yellow-400" />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {summary.map((item) => (
                  <div
                    key={item.type}
                    className="flex items-center justify-between rounded-xl border border-zinc-900 bg-[#111111] px-3 py-2"
                  >
                    <span className="text-sm text-zinc-300">
                      {item.emoji} {item.label}
                    </span>
                    <span className="font-black text-yellow-300">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="mb-3 block text-sm font-bold text-zinc-300">
              Tipo de reconocimiento
            </label>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {recognitionOptions.map((option) => {
                const isSelected = selectedType === option.type;

                return (
                  <button
                    key={option.type}
                    type="button"
                    onClick={() => setSelectedType(option.type)}
                    className={`rounded-2xl border p-4 text-left transition ${
                      isSelected
                        ? "border-yellow-500/50 bg-yellow-500/10 text-white"
                        : "border-zinc-900 bg-black/35 text-zinc-300 hover:border-yellow-500/25"
                    }`}
                  >
                    <div className="text-lg font-black">
                      {option.emoji} {option.label}
                    </div>
                    <p className="mt-1 text-xs text-zinc-500">
                      {option.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-zinc-300">
              Nota opcional
            </label>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              placeholder="Ej. Siempre apoya a sus compañeros durante la práctica."
              className="w-full resize-none rounded-xl border border-zinc-800 bg-[#111111] px-4 py-3 text-zinc-100 outline-none transition focus:border-yellow-500/40"
            />
          </div>

          {successMessage && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-300">
              {successMessage}
            </div>
          )}
        </div>

        <div className="flex flex-col justify-end gap-3 border-t border-zinc-900 p-5 sm:flex-row sm:p-6">
          <button
            onClick={onClose}
            className="rounded-xl border border-zinc-800 px-6 py-3 font-bold text-zinc-300 transition hover:border-red-500/40 hover:text-red-400"
          >
            Cerrar
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-500 px-6 py-3 font-black text-black transition hover:bg-yellow-400 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Trophy className="h-5 w-5" />
                Guardar reconocimiento
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
