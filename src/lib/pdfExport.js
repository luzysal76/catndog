import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

/**
 * DOM 요소를 PDF로 내보냅니다.
 * html2canvas 스크린샷 방식이므로 한글 깨짐 없음.
 * @param {HTMLElement} element - PDF로 변환할 DOM 요소
 * @param {string} filename - 저장할 파일명 (예: '건강리포트_2024-01.pdf')
 */
export async function exportToPDF(element, filename = '똥체크_리포트.pdf') {
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#FFF8F0',
      logging: false,
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const pdfWidth  = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()
    const imgRatio  = canvas.height / canvas.width
    const imgWidth  = pdfWidth
    const imgHeight = imgWidth * imgRatio

    let position = 0
    let remaining = imgHeight

    // 여러 페이지로 분할
    while (remaining > 0) {
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      remaining -= pdfHeight
      if (remaining > 0) {
        position -= pdfHeight
        pdf.addPage()
      }
    }

    pdf.save(filename)
    return true
  } catch (e) {
    console.error('PDF 내보내기 오류:', e)
    throw new Error('PDF 생성 중 오류가 발생했습니다.')
  }
}

/**
 * 주간 리포트용 PDF 내보내기
 * @param {string} petName
 * @param {string} weekLabel
 * @param {HTMLElement} element
 */
export async function exportWeeklyReport(petName, weekLabel, element) {
  const filename = `똥체크_${petName}_${weekLabel}.pdf`
  return exportToPDF(element, filename)
}
