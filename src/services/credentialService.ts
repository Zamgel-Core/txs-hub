// 📍 Ruta del archivo: src/services/credentialService.ts

import jsPDF from "jspdf";
import QRCode from "qrcode";

type StudentCredential = {
  id: string;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  qr_token?: string | null;
  membership_status?: string | null;
  membership_end_date?: string | null;
};

type GroupInfo = {
  name: string;
  schedule: string;
  days?: string;
  level?: string;
};

function formatDate(date?: string | null) {
  if (!date) return "Sin fecha";
  const cleanDate = String(date).includes("T")
    ? String(date).split("T")[0]
    : String(date);

  return cleanDate;
}

export async function generateStudentCredentialPdf({
  student,
  groupInfo,
  planName,
}: {
  student: StudentCredential;
  groupInfo: GroupInfo;
  planName: string;
}) {
  if (!student.qr_token) {
    alert("Este alumno no tiene QR generado.");
    return;
  }

  const qrUrl = `${window.location.origin}/admin/escaner?token=${student.qr_token}`;

  const qrImage = await QRCode.toDataURL(qrUrl, {
    width: 500,
    margin: 2,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
  });

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [86, 135],
  });

  pdf.setFillColor(5, 5, 5);
  pdf.rect(0, 0, 86, 135, "F");

  pdf.setDrawColor(234, 179, 8);
  pdf.setLineWidth(1);
  pdf.roundedRect(4, 4, 78, 127, 4, 4);

  pdf.setTextColor(234, 179, 8);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(13);
  pdf.text("TXS ACADEMY", 43, 15, { align: "center" });

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(9);
  pdf.text("Credencial de alumno", 43, 21, { align: "center" });

  pdf.setFillColor(24, 24, 27);
  pdf.circle(43, 36, 12, "F");

  pdf.setTextColor(234, 179, 8);
  pdf.setFontSize(18);
  pdf.text(student.full_name.charAt(0).toUpperCase(), 43, 42, {
    align: "center",
  });

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(10);
  pdf.text(student.full_name, 43, 57, {
    align: "center",
    maxWidth: 70,
  });

  pdf.setTextColor(160, 160, 160);
  pdf.setFontSize(7);
  pdf.text(`ID: ${student.id.slice(0, 8)}`, 43, 63, { align: "center" });

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(7);

  pdf.text(`Grupo: ${groupInfo.name}`, 8, 73, { maxWidth: 70 });
  pdf.text(`Días: ${groupInfo.days || "Sin días"}`, 8, 79, { maxWidth: 70 });
  pdf.text(`Horario: ${groupInfo.schedule}`, 8, 85, { maxWidth: 70 });
  pdf.text(`Plan: ${planName}`, 8, 91, { maxWidth: 70 });
  pdf.text(`Vence: ${formatDate(student.membership_end_date)}`, 8, 97, {
    maxWidth: 70,
  });

  pdf.addImage(qrImage, "PNG", 28, 101, 30, 30);

  pdf.setTextColor(234, 179, 8);
  pdf.setFontSize(6);
  pdf.text("Escanear para registrar asistencia", 43, 133, {
    align: "center",
  });

  pdf.save(`credencial-${student.full_name.replaceAll(" ", "-")}.pdf`);
}
