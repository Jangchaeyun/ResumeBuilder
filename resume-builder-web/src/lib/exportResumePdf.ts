import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

const A4_WIDTH_MM = 210
const A4_HEIGHT_MM = 297

export function sanitizeResumeFilename(title: string): string {
  const base = title.trim() || 'resume'
  const safe = base.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_').replace(/\s+/g, '_')
  return safe.slice(0, 80) || 'resume'
}

/** 미리보기 DOM을 A4 PDF로 변환합니다. */
export async function exportResumePdfBlob(element: HTMLElement): Promise<Blob> {
  if (document.fonts?.ready) {
    await document.fonts.ready
  }

  const canvas = await html2canvas(element, {
    scale: 3,
    useCORS: true,
    allowTaint: false,
    backgroundColor: '#ffffff',
    logging: false,
    windowWidth: element.scrollWidth,
    onclone: (doc) => {
      const cloned = doc.querySelector('.resume-doc')
      if (cloned instanceof HTMLElement) {
        cloned.style.boxShadow = 'none'
      }
    },
  })

  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageWidth = A4_WIDTH_MM
  const pageHeight = A4_HEIGHT_MM
  const imgHeightMm = (canvas.height * pageWidth) / canvas.width

  let heightLeft = imgHeightMm
  let position = 0

  pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeightMm)
  heightLeft -= pageHeight

  while (heightLeft > 0) {
    position = heightLeft - imgHeightMm
    pdf.addPage()
    pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeightMm)
    heightLeft -= pageHeight
  }

  return pdf.output('blob')
}

export async function downloadResumePdf(element: HTMLElement, filename: string): Promise<void> {
  const blob = await exportResumePdfBlob(element)
  const name = filename.endsWith('.pdf') ? filename : `${filename}.pdf`
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = name
  link.click()
  URL.revokeObjectURL(url)
}
