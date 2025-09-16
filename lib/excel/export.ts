import * as XLSX from 'xlsx'
import { LandingLead } from '../supabase/client'

export interface ExcelData {
  '이름': string
  '전화번호': string
  '신청시간': string
}

export function createExcelBuffer(leads: LandingLead[]): Buffer {
  // Convert leads to Excel data format
  const excelData: ExcelData[] = leads.map(lead => {
    // Convert UTC to Korea Standard Time (KST)
    const kstDate = new Date(new Date(lead.created_at).getTime() + (9 * 60 * 60 * 1000))

    const timeStr = kstDate.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Asia/Seoul'
    })

    return {
      '이름': lead.name,
      '전화번호': lead.phone,
      '신청시간': timeStr
    }
  })

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet(excelData)

  // Set column widths for better readability
  const columnWidths = [
    { wch: 15 }, // 이름
    { wch: 15 }, // 전화번호
    { wch: 20 }, // 신청시간
  ]
  worksheet['!cols'] = columnWidths

  // Style the header row
  const headerStyle = {
    font: { bold: true },
    fill: { fgColor: { rgb: "E6E6FA" } },
    border: {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" }
    }
  }

  // Apply header styling (if there's data)
  if (excelData.length > 0) {
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:C1')
    for (let col = range.s.c; col <= range.e.c; col++) {
      const headerCell = worksheet[XLSX.utils.encode_cell({ r: 0, c: col })]
      if (headerCell) {
        headerCell.s = headerStyle
      }
    }
  }

  // Add worksheet to workbook
  const today = new Date()
  const kstToday = new Date(today.getTime() + (9 * 60 * 60 * 1000))
  const sheetName = kstToday.toISOString().split('T')[0]

  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

  // Add metadata sheet with summary
  const metadataData = [
    ['보고서 정보', ''],
    ['생성일시', kstToday.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })],
    ['총 신청건수', excelData.length.toString()],
    ['데이터 범위', '최근 24시간'],
    ['', ''],
    ['컬럼 설명', ''],
    ['이름', '고객 이름 (1-15자)'],
    ['전화번호', '고객 전화번호 (010-****-**** 형식)'],
    ['신청시간', '상담 신청 접수 시간 (한국 표준시)']
  ]

  const metadataSheet = XLSX.utils.aoa_to_sheet(metadataData)
  metadataSheet['!cols'] = [{ wch: 15 }, { wch: 30 }]
  XLSX.utils.book_append_sheet(workbook, metadataSheet, '보고서_정보')

  // Write workbook to buffer
  const excelBuffer = XLSX.write(workbook, {
    type: 'buffer',
    bookType: 'xlsx'
  })

  return Buffer.from(excelBuffer)
}

// Utility function to get date range for export
export function getExportDateRange(): { startDate: Date; endDate: Date } {
  const now = new Date()
  const kstNow = new Date(now.getTime() + (9 * 60 * 60 * 1000)) // Convert to KST

  // Get yesterday's date in KST
  const yesterday = new Date(kstNow)
  yesterday.setDate(yesterday.getDate() - 1)
  yesterday.setHours(0, 0, 0, 0)

  const startDate = new Date(yesterday.getTime() - (9 * 60 * 60 * 1000)) // Convert back to UTC

  // End date is start of today in KST
  const today = new Date(kstNow)
  today.setHours(0, 0, 0, 0)
  const endDate = new Date(today.getTime() - (9 * 60 * 60 * 1000)) // Convert back to UTC

  return { startDate, endDate }
}

// Get date range for last 24 hours
export function getLast24HoursRange(): { startDate: Date; endDate: Date } {
  const endDate = new Date()
  const startDate = new Date(endDate.getTime() - (24 * 60 * 60 * 1000))

  return { startDate, endDate }
}