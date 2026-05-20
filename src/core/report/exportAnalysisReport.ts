import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import type { AnalysisInfoState, AnalysisType, PersistedAnalysisResults } from "../../types/analysis";

interface ExportAnalysisReportInput {
  analysisType: AnalysisType;
  defaultTitle: string;
  info: AnalysisInfoState;
  formData: Record<string, unknown>;
  results: PersistedAnalysisResults;
  scores?: Record<string, unknown> | null;
}

const suspiciousTextPattern = /[\u00c2\u00c3\u00c4\u00c5\u00e2\ufffd]/;

const repairBrokenTurkishText = (value: string): string => {
  if (!value || !suspiciousTextPattern.test(value)) {
    return value;
  }

  const replacements: Array<[string, string]> = [
    ["\u00c4\u00b1", "\u0131"],
    ["\u00c4\u00b0", "\u0130"],
    ["\u00c4\u009f", "\u011f"],
    ["\u00c4\u009e", "\u011e"],
    ["\u00c3\u00bc", "\u00fc"],
    ["\u00c3\u009c", "\u00dc"],
    ["\u00c3\u00b6", "\u00f6"],
    ["\u00c3\u0096", "\u00d6"],
    ["\u00c3\u00a7", "\u00e7"],
    ["\u00c3\u0087", "\u00c7"],
    ["\u00c5\u009f", "\u015f"],
    ["\u00c5\u009e", "\u015e"],
    ["\u00e2\u20ac\u201c", "-"],
    ["\u00e2\u20ac\u201d", "-"],
    ["\u00e2\u20ac\u02dc", "'"],
    ["\u00e2\u20ac\u2122", "'"],
    ["\u00e2\u20ac\u0153", "\""],
    ["\u00e2\u20ac\ufffd", "\""],
    ["\u00c2 ", " "],
  ];

  let nextValue = value;
  for (const [broken, fixed] of replacements) {
    nextValue = nextValue.split(broken).join(fixed);
  }

  try {
    const bytes = Uint8Array.from(Array.from(nextValue).map((char) => char.charCodeAt(0) & 0xff));
    const decoded = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
    const currentScore = (nextValue.match(suspiciousTextPattern) ?? []).length;
    const decodedScore = (decoded.match(suspiciousTextPattern) ?? []).length;
    return decodedScore < currentScore ? decoded : nextValue;
  } catch {
    return nextValue;
  }
};

const escapeHtml = (value: string): string =>
  repairBrokenTurkishText(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const normalizeLabel = (key: string): string =>
  repairBrokenTurkishText(
    key
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase())
  );

const formatValue = (value: unknown): string => {
  if (typeof value === "boolean") return value ? "Evet" : "Hay\u0131r";
  if (value === null || value === undefined) return "-";
  if (Array.isArray(value)) return value.map((item) => formatValue(item)).join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const buildInfoRows = (info: AnalysisInfoState): string => {
  const rows: Array<[string, string]> = [
    ["Analiz Ad\u0131", info.title.trim() || "-"],
    ["M\u00fc\u015fteri", info.customerName.trim() || "-"],
    ["Vergi No", info.customerTaxNumber.trim() || "-"],
    ["NACE Kodu", info.customerNaceCode.trim() || "-"],
    ["Sekt\u00f6r", info.customerSector.trim() || "-"],
    ["Durum", info.status],
    ["Not", info.notes.trim() || "-"],
  ];

  return rows
    .map(([label, value]) => `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`)
    .join("");
};

const getResultTitle = (item: Record<string, unknown>): string => {
  const candidates = [item.supportName, item.programName, item.name, item.title, item.id];

  for (const value of candidates) {
    if (typeof value === "string" && value.trim()) return value;
  }

  return "Kay\u0131t";
};

const getArrayField = (item: Record<string, unknown>, key: string): string[] => {
  const value = item[key];
  if (!Array.isArray(value)) return [];
  return value.map((entry) => String(entry)).filter(Boolean);
};

const toList = (items: string[]): string => {
  if (!items.length) return "";
  return `<ul>${items.map((entry) => `<li>${escapeHtml(entry)}</li>`).join("")}</ul>`;
};

const buildResultCards = (items: Array<Record<string, unknown>>): string => {
  if (!items.length) {
    return `<p class="empty">Bu grupta kay\u0131t bulunmuyor.</p>`;
  }

  return items
    .map((item) => {
      const title = getResultTitle(item);
      const status = String(item.status ?? "-");
      const institution = String(item.institution ?? "-");
      const nextAction = String(item.nextAction ?? "-");
      const riskNote = String(item.riskNote ?? "-");
      const whyEligible = getArrayField(item, "whyEligible");
      const whyNotEligible = getArrayField(item, "whyNotEligible");
      const howToBecomeEligible = getArrayField(item, "howToBecomeEligible");

      return `
        <article class="card">
          <h4>${escapeHtml(title)}</h4>
          <p><strong>Durum:</strong> ${escapeHtml(status)}</p>
          <p><strong>Kurum:</strong> ${escapeHtml(institution)}</p>
          <p><strong>Sonraki Aksiyon:</strong> ${escapeHtml(nextAction)}</p>
          <p><strong>Risk Notu:</strong> ${escapeHtml(riskNote)}</p>
          ${whyEligible.length ? `<p><strong>Neden Uygun?</strong></p>${toList(whyEligible)}` : ""}
          ${whyNotEligible.length ? `<p><strong>Neden Sa\u011flanmad\u0131?</strong></p>${toList(whyNotEligible)}` : ""}
          ${howToBecomeEligible.length ? `<p><strong>Nas\u0131l Sa\u011flanabilir?</strong></p>${toList(howToBecomeEligible)}` : ""}
        </article>
      `;
    })
    .join("");
};

const buildScores = (scores?: Record<string, unknown> | null): string => {
  if (!scores || !Object.keys(scores).length) {
    return '<p class="empty">Skor bilgisi bulunmuyor.</p>';
  }

  const rows = Object.entries(scores)
    .map(([key, value]) => {
      const text = typeof value === "object" && value !== null ? JSON.stringify(value) : formatValue(value);
      return `<tr><th>${escapeHtml(normalizeLabel(key))}</th><td>${escapeHtml(text)}</td></tr>`;
    })
    .join("");

  return `<table>${rows}</table>`;
};

const buildFormRows = (formData: Record<string, unknown>): string => {
  const rows = Object.entries(formData)
    .map(([key, value]) => `<tr><th>${escapeHtml(normalizeLabel(key))}</th><td>${escapeHtml(formatValue(value))}</td></tr>`)
    .join("");

  return rows || `<tr><th>Form</th><td>-</td></tr>`;
};

const buildHtml = (input: ExportAnalysisReportInput): string => {
  const reportTitle = input.info.title.trim() || input.defaultTitle;
  const now = new Date().toLocaleString("tr-TR");

  return `<!doctype html>
<html lang="tr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(reportTitle)} - Rapor</title>
    <style>
      * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      body { margin: 0; background: #ffffff; color: #0f172a; font-family: "Segoe UI", Arial, "Helvetica Neue", sans-serif; line-height: 1.5; }
      .report-shell { width: 794px; margin: 0 auto; background: #ffffff; padding: 28px 28px 36px; }
      h1, h2, h3, h4 { margin: 0 0 8px; }
      h1 { font-size: 26px; line-height: 1.2; }
      h2 { margin-top: 22px; padding-bottom: 8px; border-bottom: 1px solid #e2e8f0; font-size: 18px; }
      h3 { margin-top: 16px; font-size: 16px; }
      h4 { font-size: 15px; line-height: 1.35; }
      .note { margin: 4px 0; color: #475569; font-size: 12px; }
      .stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-top: 10px; }
      .stat { border: 1px solid #dbe7ff; border-radius: 14px; padding: 14px 16px; background: linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%); }
      .stat strong { display: block; margin-bottom: 4px; color: #334155; font-size: 13px; }
      .stat span { display: block; font-size: 24px; font-weight: 700; color: #0f172a; }
      table { width: 100%; margin-top: 10px; border-collapse: collapse; table-layout: fixed; }
      th, td { border: 1px solid #e2e8f0; padding: 10px 12px; text-align: left; vertical-align: top; word-break: break-word; font-size: 12.5px; }
      th { width: 30%; background: #f8fafc; color: #334155; font-weight: 600; }
      td { background: #ffffff; }
      .card { margin: 12px 0; padding: 14px 16px; border: 1px solid #d8e1f0; border-radius: 14px; background: #fcfdff; break-inside: avoid; page-break-inside: avoid; }
      p { margin: 6px 0; font-size: 13px; }
      ul { margin: 6px 0 10px 18px; padding: 0; }
      li { margin: 2px 0; font-size: 12.5px; }
      .empty { color: #475569; font-style: italic; }
    </style>
  </head>
  <body>
    <div class="report-shell">
      <h1>${escapeHtml(reportTitle)}</h1>
      <p class="note"><strong>Mod\u00fcl:</strong> ${escapeHtml(normalizeLabel(input.analysisType))}</p>
      <p class="note"><strong>Rapor Tarihi:</strong> ${escapeHtml(now)}</p>

      <h2>\u00d6zet</h2>
      <div class="stats">
        <div class="stat"><strong>Uygun</strong><span>${input.results.uygun.length}</span></div>
        <div class="stat"><strong>Potansiyel</strong><span>${input.results.potansiyel.length}</span></div>
        <div class="stat"><strong>Riskli</strong><span>${input.results.riskli.length}</span></div>
      </div>

      <h2>M\u00fc\u015fteri ve Analiz Bilgileri</h2>
      <table>${buildInfoRows(input.info)}</table>

      <h2>Skorlar</h2>
      ${buildScores(input.scores)}

      <h2>Sonu\u00e7lar</h2>
      <h3>Uygun</h3>
      ${buildResultCards(input.results.uygun)}
      <h3>Potansiyel</h3>
      ${buildResultCards(input.results.potansiyel)}
      <h3>Riskli</h3>
      ${buildResultCards(input.results.riskli)}

      <h2>Form Cevap \u00d6zeti</h2>
      <table>${buildFormRows(input.formData)}</table>
    </div>
  </body>
</html>`;
};

const openPrintFallback = (html: string): void => {
  const reportWindow = window.open("", "_blank", "noopener,noreferrer");
  if (!reportWindow) {
    throw new Error("Taray\u0131c\u0131 popup penceresini engelledi. L\u00fctfen popup izni verip tekrar deneyin.");
  }

  reportWindow.document.open();
  reportWindow.document.write(html);
  reportWindow.document.close();
  reportWindow.focus();
  window.setTimeout(() => {
    reportWindow.print();
  }, 150);
};

const waitForRenderReady = async (): Promise<void> => {
  if (typeof document !== "undefined" && "fonts" in document) {
    try {
      await (document as Document & { fonts: FontFaceSet }).fonts.ready;
    } catch {
      // Best effort only.
    }
  }

  await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
  await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
};

const createPdfRenderContainer = (html: string): HTMLDivElement => {
  const parser = new DOMParser();
  const parsedDocument = parser.parseFromString(html, "text/html");

  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.top = "0";
  container.style.left = "0";
  container.style.width = "794px";
  container.style.minHeight = "1px";
  container.style.zIndex = "-1";
  container.style.pointerEvents = "none";
  container.style.background = "#ffffff";

  const contentRoot = document.createElement("div");
  contentRoot.style.width = "794px";
  contentRoot.style.background = "#ffffff";

  parsedDocument.querySelectorAll("style").forEach((styleNode) => {
    const styleTag = document.createElement("style");
    styleTag.textContent = styleNode.textContent ?? "";
    contentRoot.appendChild(styleTag);
  });

  Array.from(parsedDocument.body.childNodes).forEach((node) => {
    contentRoot.appendChild(node.cloneNode(true));
  });

  container.appendChild(contentRoot);
  return container;
};

const findWhitespaceAwareBreak = (
  context: CanvasRenderingContext2D,
  canvasWidth: number,
  approxBreakPx: number,
  minBreakPx: number,
  maxBreakPx: number
): number => {
  const searchTop = Math.max(minBreakPx, approxBreakPx - 120);
  const searchBottom = Math.min(maxBreakPx, approxBreakPx + 120);
  let bestBreak = approxBreakPx;
  let bestScore = -1;

  for (let y = searchTop; y <= searchBottom; y += 2) {
    const row = context.getImageData(0, y, canvasWidth, 1).data;
    let brightSamples = 0;
    let sampledPixels = 0;

    for (let index = 0; index < row.length; index += 32) {
      const red = row[index];
      const green = row[index + 1];
      const blue = row[index + 2];
      const alpha = row[index + 3];

      if (alpha > 245 && red > 245 && green > 245 && blue > 245) {
        brightSamples += 1;
      }

      sampledPixels += 1;
    }

    const whitespaceRatio = sampledPixels > 0 ? brightSamples / sampledPixels : 0;
    const distancePenalty = Math.abs(y - approxBreakPx) / 400;
    const score = whitespaceRatio - distancePenalty;

    if (score > bestScore) {
      bestScore = score;
      bestBreak = y;
    }
  }

  return bestBreak;
};

const exportCanvasAsPdf = (canvas: HTMLCanvasElement, fileName: string): void => {
  const doc = new jsPDF({
    unit: "pt",
    format: "a4",
    orientation: "portrait",
    compress: true,
  });

  const margin = 18;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const printableWidth = pageWidth - margin * 2;
  const printableHeight = pageHeight - margin * 2;
  const pxPerPt = canvas.width / printableWidth;
  const pageSliceHeightPx = Math.floor(printableHeight * pxPerPt);
  const minimumSliceHeightPx = Math.floor(pageSliceHeightPx * 0.78);
  const sourceContext = canvas.getContext("2d", { willReadFrequently: true });

  let renderedHeightPx = 0;
  let pageIndex = 0;

  while (renderedHeightPx < canvas.height) {
    const remainingHeightPx = canvas.height - renderedHeightPx;
    let sliceHeightPx = Math.min(pageSliceHeightPx, remainingHeightPx);

    if (
      sourceContext &&
      remainingHeightPx > pageSliceHeightPx &&
      renderedHeightPx + minimumSliceHeightPx < canvas.height
    ) {
      const approxBreakPx = renderedHeightPx + pageSliceHeightPx;
      const minBreakPx = renderedHeightPx + minimumSliceHeightPx;
      const maxBreakPx = Math.min(canvas.height - 1, renderedHeightPx + pageSliceHeightPx + 120);
      const adjustedBreakPx = findWhitespaceAwareBreak(
        sourceContext,
        canvas.width,
        approxBreakPx,
        minBreakPx,
        maxBreakPx
      );

      sliceHeightPx = adjustedBreakPx - renderedHeightPx;
    }

    const pageCanvas = document.createElement("canvas");
    pageCanvas.width = canvas.width;
    pageCanvas.height = sliceHeightPx;

    const context = pageCanvas.getContext("2d");
    if (!context) {
      throw new Error("PDF i\u00e7in sayfa g\u00f6rseli olu\u015fturulamad\u0131.");
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
    context.drawImage(
      canvas,
      0,
      renderedHeightPx,
      canvas.width,
      sliceHeightPx,
      0,
      0,
      canvas.width,
      sliceHeightPx
    );

    const imageData = pageCanvas.toDataURL("image/png", 1);
    const renderedHeightPt = sliceHeightPx / pxPerPt;

    if (pageIndex > 0) {
      doc.addPage();
    }

    doc.addImage(imageData, "PNG", margin, margin, printableWidth, renderedHeightPt, undefined, "FAST");

    renderedHeightPx += sliceHeightPx;
    pageIndex += 1;
  }

  doc.save(fileName);
};

export const exportAnalysisReport = async (input: ExportAnalysisReportInput): Promise<void> => {
  if (typeof window === "undefined") {
    throw new Error("Rapor \u00e7\u0131kt\u0131s\u0131 yaln\u0131zca taray\u0131c\u0131da olu\u015fturulabilir.");
  }

  const html = buildHtml(input);
  const safeTitle = (input.info.title.trim() || input.defaultTitle).replace(/[\\/:*?"<>|]+/g, "-");
  const fileName = `${safeTitle}-rapor.pdf`;

  const container = createPdfRenderContainer(html);
  const renderTarget = container.firstElementChild as HTMLElement | null;
  document.body.appendChild(container);

  try {
    await waitForRenderReady();

    if (!renderTarget || renderTarget.scrollHeight < 8 || !renderTarget.textContent?.trim()) {
      throw new Error("PDF render i\u00e7eri\u011fi haz\u0131rlanamad\u0131.");
    }

    const canvas = await html2canvas(renderTarget, {
      backgroundColor: "#ffffff",
      useCORS: true,
      scale: Math.min(2.5, Math.max(2, window.devicePixelRatio || 1)),
      width: 794,
      windowWidth: 794,
      scrollX: 0,
      scrollY: 0,
    });

    exportCanvasAsPdf(canvas, fileName);
  } catch (error) {
    console.error("PDF olu\u015fturulamad\u0131, yazd\u0131r fallback \u00e7al\u0131\u015ft\u0131r\u0131l\u0131yor.", error);
    openPrintFallback(html);
  } finally {
    document.body.removeChild(container);
  }
};
