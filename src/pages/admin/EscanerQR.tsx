// 📍 Ruta del archivo: src/pages/admin/EscanerQR.tsx

import { useEffect, useRef, useState } from "react";
import {
  Camera,
  CheckCircle2,
  Loader2,
  QrCode,
  RefreshCcw,
  XCircle,
} from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";

import { Button } from "@/src/components/ui/Button";
import { Card, CardContent } from "@/src/components/ui/Card";
import {
  extractQrToken,
  registerAttendanceByQr,
  QrAttendanceStudent,
} from "@/src/services/qrAttendanceService";

const scannerElementId = "txs-qr-scanner";

export function EscanerQR() {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const processingRef = useRef(false);

  const [manualToken, setManualToken] = useState("");
  const [scanning, setScanning] = useState(true);
  const [loading, setLoading] = useState(false);
  const [lastStudent, setLastStudent] = useState<QrAttendanceStudent | null>(
    null,
  );
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleRegister(rawValue: string) {
    if (processingRef.current) return;

    const token = extractQrToken(rawValue);

    if (!token) {
      setError("QR inválido.");
      return;
    }

    try {
      processingRef.current = true;
      setLoading(true);
      setError("");
      setMessage("");
      setLastStudent(null);

      const student = await registerAttendanceByQr(token);

      setLastStudent(student);
      setMessage("Asistencia registrada correctamente.");
      setManualToken("");
      setScanning(false);

      await scannerRef.current?.clear();
      scannerRef.current = null;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo registrar la asistencia.",
      );
    } finally {
      setLoading(false);

      setTimeout(() => {
        processingRef.current = false;
      }, 1500);
    }
  }

  function startScanner() {
    setScanning(true);
    setError("");
    setMessage("");
    setLastStudent(null);
  }

  useEffect(() => {
    if (!scanning) return;

    const element = document.getElementById(scannerElementId);
    if (!element || scannerRef.current) return;

    const scanner = new Html5QrcodeScanner(
      scannerElementId,
      {
        fps: 10,
        qrbox: {
          width: 260,
          height: 260,
        },
        rememberLastUsedCamera: true,
        supportedScanTypes: [],
      },
      false,
    );

    scanner.render(
      async (decodedText) => {
        await handleRegister(decodedText);
      },
      () => {},
    );

    scannerRef.current = scanner;

    return () => {
      scannerRef.current?.clear().catch(() => {});
      scannerRef.current = null;
    };
  }, [scanning]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.35em] text-yellow-500">
          TXS Academy
        </p>
        <h1 className="mt-2 text-3xl font-black text-white">Escáner QR</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Escanea la credencial del alumno para registrar asistencia automática.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-zinc-800 bg-zinc-950/80">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-yellow-500/10 text-yellow-400">
                <Camera className="h-5 w-5" />
              </div>

              <div>
                <h2 className="font-bold text-white">Cámara</h2>
                <p className="text-sm text-zinc-400">
                  Permite acceso a la cámara del dispositivo.
                </p>
              </div>
            </div>

            {scanning ? (
              <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-black p-3">
                <div id={scannerElementId} className="text-white" />
              </div>
            ) : (
              <div className="flex min-h-[340px] flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-black/60 p-6 text-center">
                <QrCode className="mb-4 h-16 w-16 text-yellow-400" />
                <p className="text-lg font-bold text-white">Escaneo pausado</p>
                <p className="mt-2 text-sm text-zinc-400">
                  Presiona reiniciar para escanear otra credencial.
                </p>

                <Button
                  onClick={startScanner}
                  className="mt-5 gap-2 rounded-xl bg-yellow-500 text-black hover:bg-yellow-400"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Escanear otro QR
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-zinc-800 bg-zinc-950/80">
            <CardContent className="p-5">
              <h2 className="font-bold text-white">Registro manual</h2>
              <p className="mt-1 text-sm text-zinc-400">
                Úsalo si la cámara no detecta el QR.
              </p>

              <div className="mt-4 space-y-3">
                <input
                  value={manualToken}
                  onChange={(event) => setManualToken(event.target.value)}
                  placeholder="Pega aquí el token o URL del QR"
                  className="h-12 w-full rounded-xl border border-zinc-800 bg-black px-4 text-sm text-white outline-none focus:border-yellow-500"
                />

                <Button
                  disabled={loading || !manualToken.trim()}
                  onClick={() => handleRegister(manualToken)}
                  className="w-full gap-2 rounded-xl bg-yellow-500 text-black hover:bg-yellow-400 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <QrCode className="h-4 w-4" />
                  )}
                  Registrar asistencia
                </Button>
              </div>
            </CardContent>
          </Card>

          {(message || error || lastStudent) && (
            <Card
              className={`border ${
                error
                  ? "border-red-500/40 bg-red-950/20"
                  : "border-emerald-500/40 bg-emerald-950/20"
              }`}
            >
              <CardContent className="p-5">
                {error ? (
                  <div className="flex gap-3">
                    <XCircle className="mt-0.5 h-6 w-6 text-red-400" />
                    <div>
                      <p className="font-bold text-red-300">Error</p>
                      <p className="mt-1 text-sm text-red-100">{error}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <CheckCircle2 className="mt-0.5 h-6 w-6 text-emerald-400" />
                    <div>
                      <p className="font-bold text-emerald-300">{message}</p>

                      {lastStudent && (
                        <div className="mt-4 space-y-1 text-sm text-zinc-200">
                          <p className="text-lg font-black text-white">
                            {lastStudent.full_name}
                          </p>
                          <p>
                            Grupo:{" "}
                            <span className="font-semibold">
                              {lastStudent.groups?.name || "Sin grupo"}
                            </span>
                          </p>
                          <p>
                            Horario:{" "}
                            <span className="font-semibold">
                              {lastStudent.groups?.schedule || "Sin horario"}
                            </span>
                          </p>
                          <p>
                            Nivel:{" "}
                            <span className="font-semibold">
                              {lastStudent.groups?.level || "Sin nivel"}
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
