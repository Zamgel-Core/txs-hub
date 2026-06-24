// 📍 Ruta del archivo: src/services/groupsReportService.ts

import ExcelJS from "exceljs";

import { supabase } from "@/src/lib/supabase";

type GroupLevel = "principiante" | "intermedio" | "avanzado" | string;

export type GroupsReportOptions = {
  startDate: string;
  endDate: string;
  groupId?: string;
  level?: "all" | "principiante" | "intermedio" | "avanzado";
  includeStudents: boolean;
  includeAttendance: boolean;
  includePayments: boolean;
  includeInactiveStudents: boolean;
};

export type GroupsReportGroup = {
  id: string;
  name: string;
  instructor: string | null;
  days: string | null;
  schedule: string | null;
  level: GroupLevel;
  sort_order: number | null;
  is_active: boolean;
  created_at: string | null;
};

export type GroupsReportStudent = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  group_id: string | null;
  membership_type: string | null;
  membership_status: string | null;
  membership_start_date: string | null;
  membership_end_date: string | null;
  annual_fee_status: string | null;
  annual_fee_paid_at: string | null;
  annual_fee_expires_at: string | null;
  is_active: boolean;
  is_deleted: boolean | null;
  created_at: string | null;
};

export type GroupsReportAttendance = {
  id: string;
  student_id: string;
  group_id: string | null;
  attendance_date: string;
  status: string;
  notes: string | null;
  created_at: string | null;
};

export type GroupsReportPayment = {
  id: string;
  student_id: string;
  payment_date: string;
  concept: string;
  method: string;
  amount: number;
  status: string;
  notes: string | null;
  membership_start_date: string | null;
  membership_end_date: string | null;
  created_at: string | null;
};

export type GroupsReportData = {
  groups: GroupsReportGroup[];
  students: GroupsReportStudent[];
  attendance: GroupsReportAttendance[];
  payments: GroupsReportPayment[];
};

export type GroupsReportPreview = {
  groupsCount: number;
  studentsCount: number;
  activeStudentsCount: number;
  attendanceCount: number;
  presentsCount: number;
  absencesCount: number;
  lateCount: number;
  paymentsCount: number;
  paymentsTotal: number;
};

const TXS_EXCEL_COLORS = {
  black: "FF111111",
  dark: "FF18181B",
  gold: "FFEAB308",
  goldDark: "FFB8860B",
  white: "FFFFFFFF",
  zinc: "FF71717A",
  emerald: "FF10B981",
  red: "FFEF4444",
  sky: "FF0EA5E9",
};

const moneyFormat = '"$"#,##0.00';
const integerFormat = "#,##0";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(value || 0);
}

function formatShortDate(value?: string) {
  if (!value) return "";

  return new Date(`${value}T00:00:00`).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDateTime(value?: string | null) {
  if (!value) return "";

  return new Date(value).toLocaleString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getLevelLabel(level?: string | null) {
  if (level === "principiante") return "Principiante";
  if (level === "intermedio") return "Intermedio";
  if (level === "avanzado") return "Avanzado";
  return level || "Sin nivel";
}

function getAttendanceLabel(status: string) {
  if (status === "presente") return "Presente";
  if (status === "falta") return "Falta";
  if (status === "retardo") return "Retardo";
  return status || "Sin estado";
}

function downloadExcelBuffer(buffer: BlobPart, filename: string) {
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

async function getImageBase64FromPublicPath(path: string) {
  try {
    const response = await fetch(path);

    if (!response.ok) return null;

    const blob = await response.blob();

    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn(`No se pudo cargar imagen para Excel: ${path}`, error);
    return null;
  }
}

function setColumnWidths(
  worksheet: ExcelJS.Worksheet,
  widths: Record<string, number>,
) {
  Object.entries(widths).forEach(([key, width]) => {
    worksheet.getColumn(key).width = width;
  });
}

function styleHeaderRow(row: ExcelJS.Row) {
  row.height = 24;

  row.eachCell((cell) => {
    cell.font = {
      name: "Calibri",
      size: 11,
      bold: true,
      color: { argb: TXS_EXCEL_COLORS.black },
    };

    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: TXS_EXCEL_COLORS.gold },
    };

    cell.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };

    cell.border = {
      top: { style: "thin", color: { argb: TXS_EXCEL_COLORS.goldDark } },
      left: { style: "thin", color: { argb: TXS_EXCEL_COLORS.goldDark } },
      bottom: { style: "thin", color: { argb: TXS_EXCEL_COLORS.goldDark } },
      right: { style: "thin", color: { argb: TXS_EXCEL_COLORS.goldDark } },
    };
  });
}

function applyAutoFilter(
  worksheet: ExcelJS.Worksheet,
  headerRowNumber: number,
  columnCount: number,
) {
  worksheet.autoFilter = {
    from: { row: headerRowNumber, column: 1 },
    to: { row: headerRowNumber, column: columnCount },
  };
}

function applyBodyStyle(
  worksheet: ExcelJS.Worksheet,
  startRow: number,
  endRow: number,
  columnCount: number,
) {
  for (let rowNumber = startRow; rowNumber <= endRow; rowNumber += 1) {
    const row = worksheet.getRow(rowNumber);
    const isEven = rowNumber % 2 === 0;

    for (let columnNumber = 1; columnNumber <= columnCount; columnNumber += 1) {
      const cell = row.getCell(columnNumber);
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: isEven ? "FFF8FAFC" : TXS_EXCEL_COLORS.white },
      };
      cell.border = {
        bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
      };
      cell.alignment = {
        vertical: "middle",
        wrapText: true,
      };
    }
  }
}

function addNoDataMessage(
  worksheet: ExcelJS.Worksheet,
  rowNumber: number,
  message: string,
  columnCount: number,
) {
  worksheet.mergeCells(rowNumber, 1, rowNumber, columnCount);
  const cell = worksheet.getCell(rowNumber, 1);
  cell.value = message;
  cell.font = {
    name: "Calibri",
    italic: true,
    color: { argb: TXS_EXCEL_COLORS.zinc },
  };
  cell.alignment = { vertical: "middle", horizontal: "center" };
}

function addKpiBlock(
  worksheet: ExcelJS.Worksheet,
  range: string,
  label: string,
  value: string | number,
  accentColor: string,
) {
  worksheet.mergeCells(range);
  const cell = worksheet.getCell(range.split(":")[0]);
  cell.value = `${label}\n${value}`;
  cell.font = {
    name: "Calibri",
    size: 12,
    bold: true,
    color: { argb: TXS_EXCEL_COLORS.white },
  };
  cell.alignment = {
    vertical: "middle",
    horizontal: "center",
    wrapText: true,
  };
  cell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: TXS_EXCEL_COLORS.black },
  };
  cell.border = {
    top: { style: "medium", color: { argb: accentColor } },
    left: { style: "medium", color: { argb: accentColor } },
    bottom: { style: "medium", color: { argb: accentColor } },
    right: { style: "medium", color: { argb: accentColor } },
  };
}

function getStudentsByGroupMap(students: GroupsReportStudent[]) {
  return students.reduce<Record<string, GroupsReportStudent[]>>(
    (acc, student) => {
      if (!student.group_id) return acc;
      if (!acc[student.group_id]) acc[student.group_id] = [];
      acc[student.group_id].push(student);
      return acc;
    },
    {},
  );
}

function getGroupNameMap(groups: GroupsReportGroup[]) {
  return groups.reduce<Record<string, GroupsReportGroup>>((acc, group) => {
    acc[group.id] = group;
    return acc;
  }, {});
}

function getStudentMap(students: GroupsReportStudent[]) {
  return students.reduce<Record<string, GroupsReportStudent>>(
    (acc, student) => {
      acc[student.id] = student;
      return acc;
    },
    {},
  );
}

export async function getGroupsReportData(
  options: GroupsReportOptions,
): Promise<GroupsReportData> {
  let groupsQuery = supabase
    .from("groups")
    .select(
      "id, name, instructor, days, schedule, level, sort_order, is_active, created_at",
    )
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (options.groupId) {
    groupsQuery = groupsQuery.eq("id", options.groupId);
  }

  if (options.level && options.level !== "all") {
    groupsQuery = groupsQuery.eq("level", options.level);
  }

  const { data: groupsData, error: groupsError } = await groupsQuery;

  if (groupsError) throw new Error(groupsError.message);

  const groups = (groupsData || []) as GroupsReportGroup[];
  const groupIds = groups.map((group) => group.id);

  if (groupIds.length === 0) {
    return {
      groups: [],
      students: [],
      attendance: [],
      payments: [],
    };
  }

  let studentsQuery = supabase
    .from("students")
    .select(
      "id, full_name, email, phone, group_id, membership_type, membership_status, membership_start_date, membership_end_date, annual_fee_status, annual_fee_paid_at, annual_fee_expires_at, is_active, is_deleted, created_at",
    )
    .in("group_id", groupIds)
    .or("is_deleted.eq.false,is_deleted.is.null")
    .order("full_name", { ascending: true });

  if (!options.includeInactiveStudents) {
    studentsQuery = studentsQuery.eq("is_active", true);
  }

  const { data: studentsData, error: studentsError } = await studentsQuery;

  if (studentsError) throw new Error(studentsError.message);

  const students = (studentsData || []) as GroupsReportStudent[];
  const studentIds = students.map((student) => student.id);

  let attendance: GroupsReportAttendance[] = [];
  let payments: GroupsReportPayment[] = [];

  if (options.includeAttendance) {
    const { data: attendanceData, error: attendanceError } = await supabase
      .from("attendance")
      .select(
        "id, student_id, group_id, attendance_date, status, notes, created_at",
      )
      .in("group_id", groupIds)
      .gte("attendance_date", options.startDate)
      .lte("attendance_date", options.endDate)
      .order("attendance_date", { ascending: true });

    if (attendanceError) throw new Error(attendanceError.message);

    attendance = (attendanceData || []) as GroupsReportAttendance[];
  }

  if (options.includePayments && studentIds.length > 0) {
    const { data: paymentsData, error: paymentsError } = await supabase
      .from("payments")
      .select(
        "id, student_id, payment_date, concept, method, amount, status, notes, membership_start_date, membership_end_date, created_at",
      )
      .in("student_id", studentIds)
      .gte("payment_date", options.startDate)
      .lte("payment_date", options.endDate)
      .in("status", ["pagado", "paid"])
      .order("payment_date", { ascending: true });

    if (paymentsError) throw new Error(paymentsError.message);

    payments = (paymentsData || []) as GroupsReportPayment[];
  }

  return {
    groups,
    students,
    attendance,
    payments,
  };
}

export function getGroupsReportPreview(
  data: GroupsReportData,
): GroupsReportPreview {
  const attendance = data.attendance || [];
  const payments = data.payments || [];

  return {
    groupsCount: data.groups.length,
    studentsCount: data.students.length,
    activeStudentsCount: data.students.filter((student) => student.is_active)
      .length,
    attendanceCount: attendance.length,
    presentsCount: attendance.filter((item) => item.status === "presente")
      .length,
    absencesCount: attendance.filter((item) => item.status === "falta").length,
    lateCount: attendance.filter((item) => item.status === "retardo").length,
    paymentsCount: payments.length,
    paymentsTotal: payments.reduce(
      (total, payment) => total + Number(payment.amount || 0),
      0,
    ),
  };
}

export async function exportGroupsExcel(options: GroupsReportOptions) {
  const data = await getGroupsReportData(options);
  const preview = getGroupsReportPreview(data);
  const studentsByGroup = getStudentsByGroupMap(data.students);
  const groupMap = getGroupNameMap(data.groups);
  const studentMap = getStudentMap(data.students);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Zamgel Core";
  workbook.created = new Date();

  const summarySheet = workbook.addWorksheet("Dashboard", {
    properties: { defaultRowHeight: 22 },
  });

  summarySheet.views = [{ state: "frozen", ySplit: 9 }];
  summarySheet.getColumn("A").width = 16;
  summarySheet.getColumn("B").width = 16;
  summarySheet.getColumn("C").width = 16;
  summarySheet.getColumn("D").width = 16;
  summarySheet.getColumn("E").width = 16;
  summarySheet.getColumn("F").width = 16;
  summarySheet.getColumn("G").width = 16;
  summarySheet.getColumn("H").width = 16;
  summarySheet.getColumn("I").width = 16;
  summarySheet.getColumn("J").width = 16;

  summarySheet.mergeCells("A1:J5");
  const headerCell = summarySheet.getCell("A1");
  headerCell.value = `TXS HUB\nREPORTE DE GRUPOS\n${formatShortDate(options.startDate)} - ${formatShortDate(options.endDate)}`;
  headerCell.font = {
    name: "Calibri",
    size: 16,
    bold: true,
    color: { argb: TXS_EXCEL_COLORS.white },
  };
  headerCell.alignment = {
    vertical: "middle",
    horizontal: "center",
    wrapText: true,
  };
  headerCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: TXS_EXCEL_COLORS.black },
  };

  [1, 2, 3, 4, 5].forEach((rowNumber) => {
    summarySheet.getRow(rowNumber).height = 24;
  });

  const [txsLogoBase64, zcLogoBase64] = await Promise.all([
    getImageBase64FromPublicPath("/branding/logo_TSX.png"),
    getImageBase64FromPublicPath("/branding/zamgelcore-zc-logo.png"),
  ]);

  if (txsLogoBase64) {
    const logoId = workbook.addImage({
      base64: txsLogoBase64,
      extension: "png",
    });
    summarySheet.addImage(logoId, {
      tl: { col: 0.25, row: 0.35 },
      ext: { width: 92, height: 92 },
    });
  }

  if (zcLogoBase64) {
    const zcId = workbook.addImage({ base64: zcLogoBase64, extension: "png" });
    summarySheet.addImage(zcId, {
      tl: { col: 8.25, row: 0.35 },
      ext: { width: 100, height: 100 },
    });
  }

  summarySheet.mergeCells("H6:J6");
  const poweredCell = summarySheet.getCell("H6");
  poweredCell.value = "Powered by Zamgel Core";
  poweredCell.font = {
    name: "Calibri",
    size: 9,
    italic: true,
    color: { argb: TXS_EXCEL_COLORS.zinc },
  };
  poweredCell.alignment = { horizontal: "center" };

  summarySheet.getCell("A7").value = "Generado";
  summarySheet.getCell("C7").value = formatDateTime(new Date().toISOString());
  summarySheet.getCell("A8").value = "Filtro";
  summarySheet.getCell("C8").value = options.groupId
    ? groupMap[options.groupId]?.name || "Grupo específico"
    : options.level && options.level !== "all"
      ? getLevelLabel(options.level)
      : "Todos los grupos";

  ["A7", "A8"].forEach((cellAddress) => {
    summarySheet.getCell(cellAddress).font = {
      name: "Calibri",
      bold: true,
      color: { argb: TXS_EXCEL_COLORS.zinc },
    };
  });
  ["C7", "C8"].forEach((cellAddress) => {
    summarySheet.getCell(cellAddress).font = {
      name: "Calibri",
      bold: true,
      color: { argb: TXS_EXCEL_COLORS.black },
    };
  });

  addKpiBlock(
    summarySheet,
    "A10:B12",
    "GRUPOS",
    preview.groupsCount,
    TXS_EXCEL_COLORS.gold,
  );
  addKpiBlock(
    summarySheet,
    "C10:D12",
    "ALUMNOS",
    preview.studentsCount,
    TXS_EXCEL_COLORS.emerald,
  );
  addKpiBlock(
    summarySheet,
    "E10:F12",
    "PRESENTES",
    preview.presentsCount,
    TXS_EXCEL_COLORS.sky,
  );
  addKpiBlock(
    summarySheet,
    "G10:H12",
    "FALTAS",
    preview.absencesCount,
    TXS_EXCEL_COLORS.red,
  );
  addKpiBlock(
    summarySheet,
    "I10:J12",
    "PAGOS",
    formatCurrency(preview.paymentsTotal),
    TXS_EXCEL_COLORS.gold,
  );

  addKpiBlock(
    summarySheet,
    "A14:B16",
    "ASISTENCIAS",
    preview.attendanceCount,
    TXS_EXCEL_COLORS.sky,
  );
  addKpiBlock(
    summarySheet,
    "C14:D16",
    "RETARDOS",
    preview.lateCount,
    TXS_EXCEL_COLORS.gold,
  );
  addKpiBlock(
    summarySheet,
    "E14:F16",
    "PAGOS REG.",
    preview.paymentsCount,
    TXS_EXCEL_COLORS.emerald,
  );
  addKpiBlock(
    summarySheet,
    "G14:H16",
    "ACTIVOS",
    preview.activeStudentsCount,
    TXS_EXCEL_COLORS.emerald,
  );
  addKpiBlock(
    summarySheet,
    "I14:J16",
    "INACTIVOS",
    Math.max(0, preview.studentsCount - preview.activeStudentsCount),
    TXS_EXCEL_COLORS.red,
  );

  summarySheet.mergeCells("A26:J28");
  const footerCell = summarySheet.getCell("A26");
  footerCell.value = "Desarrollado por Zamgel Core\nMoneda: MXN";
  footerCell.font = {
    name: "Calibri",
    size: 10,
    color: { argb: TXS_EXCEL_COLORS.zinc },
  };
  footerCell.alignment = {
    vertical: "middle",
    horizontal: "center",
    wrapText: true,
  };
  footerCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF8FAFC" },
  };

  const groupsSheet = workbook.addWorksheet("Grupos", {
    properties: { defaultRowHeight: 22 },
  });
  groupsSheet.views = [{ state: "frozen", ySplit: 1 }];
  setColumnWidths(groupsSheet, {
    A: 34,
    B: 18,
    C: 18,
    D: 18,
    E: 24,
    F: 13,
    G: 12,
    H: 15,
    I: 15,
    J: 15,
    K: 15,
    L: 15,
  });
  groupsSheet.addRow([
    "Grupo",
    "Nivel",
    "Instructor",
    "Días",
    "Horario",
    "Orden",
    "Activo",
    "Alumnos",
    "Presentes",
    "Faltas",
    "Retardos",
    "Pagos MXN",
  ]);
  styleHeaderRow(groupsSheet.getRow(1));

  data.groups.forEach((group) => {
    const groupStudents = studentsByGroup[group.id] || [];
    const groupAttendance = data.attendance.filter(
      (record) => record.group_id === group.id,
    );
    const groupStudentIds = new Set(groupStudents.map((student) => student.id));
    const groupPayments = data.payments.filter((payment) =>
      groupStudentIds.has(payment.student_id),
    );

    groupsSheet.addRow([
      group.name,
      getLevelLabel(group.level),
      group.instructor || "Sin instructor",
      group.days || "Sin días",
      group.schedule || "Sin horario",
      group.sort_order || "",
      group.is_active ? "Sí" : "No",
      groupStudents.length,
      groupAttendance.filter((item) => item.status === "presente").length,
      groupAttendance.filter((item) => item.status === "falta").length,
      groupAttendance.filter((item) => item.status === "retardo").length,
      groupPayments.reduce(
        (total, payment) => total + Number(payment.amount || 0),
        0,
      ),
    ]);
  });

  if (data.groups.length === 0) {
    addNoDataMessage(
      groupsSheet,
      2,
      "No hay grupos para el filtro seleccionado.",
      12,
    );
  } else {
    applyBodyStyle(groupsSheet, 2, data.groups.length + 1, 12);
  }
  groupsSheet.getColumn("L").numFmt = moneyFormat;
  groupsSheet.getColumn("H").numFmt = integerFormat;
  applyAutoFilter(groupsSheet, 1, 12);

  if (options.includeStudents) {
    const studentsSheet = workbook.addWorksheet("Alumnos por grupo", {
      properties: { defaultRowHeight: 22 },
    });
    studentsSheet.views = [{ state: "frozen", ySplit: 1 }];
    setColumnWidths(studentsSheet, {
      A: 32,
      B: 32,
      C: 18,
      D: 30,
      E: 20,
      F: 18,
      G: 18,
      H: 18,
      I: 18,
      J: 16,
      K: 16,
      L: 18,
    });

    studentsSheet.addRow([
      "Alumno",
      "Correo",
      "Teléfono",
      "Grupo",
      "Horario",
      "Membresía",
      "Estado membresía",
      "Inicio membresía",
      "Vence membresía",
      "Anualidad",
      "Activo",
      "Registrado",
    ]);
    styleHeaderRow(studentsSheet.getRow(1));

    data.students.forEach((student) => {
      const group = student.group_id ? groupMap[student.group_id] : null;

      studentsSheet.addRow([
        student.full_name,
        student.email || "Sin correo",
        student.phone || "Sin teléfono",
        group?.name || "Sin grupo",
        group?.schedule || "Sin horario",
        student.membership_type || "Sin plan",
        student.membership_status || "Sin estado",
        student.membership_start_date
          ? formatShortDate(student.membership_start_date)
          : "Sin fecha",
        student.membership_end_date
          ? formatShortDate(student.membership_end_date)
          : "Sin fecha",
        student.annual_fee_status || "Sin estado",
        student.is_active ? "Sí" : "No",
        formatDateTime(student.created_at),
      ]);
    });

    if (data.students.length === 0) {
      addNoDataMessage(
        studentsSheet,
        2,
        "No hay alumnos para el filtro seleccionado.",
        12,
      );
    } else {
      applyBodyStyle(studentsSheet, 2, data.students.length + 1, 12);
    }
    applyAutoFilter(studentsSheet, 1, 12);
  }

  if (options.includeAttendance) {
    const attendanceSheet = workbook.addWorksheet("Asistencia", {
      properties: { defaultRowHeight: 22 },
    });
    attendanceSheet.views = [{ state: "frozen", ySplit: 1 }];
    setColumnWidths(attendanceSheet, {
      A: 16,
      B: 30,
      C: 28,
      D: 20,
      E: 20,
      F: 16,
      G: 34,
      H: 20,
    });
    attendanceSheet.addRow([
      "Fecha",
      "Alumno",
      "Grupo",
      "Días",
      "Horario",
      "Estado",
      "Notas",
      "Registrado",
    ]);
    styleHeaderRow(attendanceSheet.getRow(1));

    data.attendance.forEach((record) => {
      const student = studentMap[record.student_id];
      const group = record.group_id ? groupMap[record.group_id] : null;

      attendanceSheet.addRow([
        formatShortDate(record.attendance_date),
        student?.full_name || "Alumno no encontrado",
        group?.name || "Sin grupo",
        group?.days || "Sin días",
        group?.schedule || "Sin horario",
        getAttendanceLabel(record.status),
        record.notes || "",
        formatDateTime(record.created_at),
      ]);
    });

    if (data.attendance.length === 0) {
      addNoDataMessage(
        attendanceSheet,
        2,
        "No hay asistencias en este rango.",
        8,
      );
    } else {
      applyBodyStyle(attendanceSheet, 2, data.attendance.length + 1, 8);
    }
    applyAutoFilter(attendanceSheet, 1, 8);
  }

  if (options.includePayments) {
    const paymentsSheet = workbook.addWorksheet("Pagos", {
      properties: { defaultRowHeight: 22 },
    });
    paymentsSheet.views = [{ state: "frozen", ySplit: 1 }];
    setColumnWidths(paymentsSheet, {
      A: 16,
      B: 30,
      C: 28,
      D: 24,
      E: 15,
      F: 15,
      G: 16,
      H: 18,
      I: 18,
      J: 34,
    });
    paymentsSheet.addRow([
      "Fecha pago",
      "Alumno",
      "Grupo",
      "Concepto",
      "Método",
      "Monto",
      "Estado",
      "Inicio",
      "Vence",
      "Notas",
    ]);
    styleHeaderRow(paymentsSheet.getRow(1));

    data.payments.forEach((payment) => {
      const student = studentMap[payment.student_id];
      const group = student?.group_id ? groupMap[student.group_id] : null;

      paymentsSheet.addRow([
        formatShortDate(payment.payment_date),
        student?.full_name || "Alumno no encontrado",
        group?.name || "Sin grupo",
        payment.concept || "Pago",
        payment.method || "Sin método",
        Number(payment.amount || 0),
        payment.status || "Sin estado",
        payment.membership_start_date
          ? formatShortDate(payment.membership_start_date)
          : "",
        payment.membership_end_date
          ? formatShortDate(payment.membership_end_date)
          : "",
        payment.notes || "",
      ]);
    });

    if (data.payments.length === 0) {
      addNoDataMessage(paymentsSheet, 2, "No hay pagos en este rango.", 10);
    } else {
      applyBodyStyle(paymentsSheet, 2, data.payments.length + 1, 10);
    }
    paymentsSheet.getColumn("F").numFmt = moneyFormat;
    applyAutoFilter(paymentsSheet, 1, 10);
  }

  const filename = `TXS_Grupos_${options.startDate}_${options.endDate}.xlsx`;
  const buffer = await workbook.xlsx.writeBuffer();
  downloadExcelBuffer(buffer, filename);
}
