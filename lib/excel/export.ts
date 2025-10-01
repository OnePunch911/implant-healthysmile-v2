import ExcelJS from 'exceljs'
import { LandingLead } from '../supabase/client'

export interface ExcelData {
  '이름': string
  '전화번호': string
  '신청시간': string
}

export async function createExcelBuffer(leads: LandingLead[]): Promise<Buffer> {
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

  // Create workbook
  const workbook = new ExcelJS.Workbook()

  // Create main data worksheet
  const today = new Date()
  const kstToday = new Date(today.getTime() + (9 * 60 * 60 * 1000))
  const sheetName = kstToday.toISOString().split('T')[0]
  const worksheet = workbook.addWorksheet(sheetName)

  // Define columns
  worksheet.columns = [
    { header: '이름', key: '이름', width: 15 },
    { header: '전화번호', key: '전화번호', width: 15 },
    { header: '신청시간', key: '신청시간', width: 20 }
  ]

  // Style the header row
  worksheet.getRow(1).font = { bold: true }
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE6E6FA' }
  }
  worksheet.getRow(1).border = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  }

  // Add data rows
  worksheet.addRows(excelData)

  // Add metadata worksheet
  const metadataSheet = workbook.addWorksheet('보고서_정보')

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

  metadataSheet.columns = [
    { header: '', key: 'key', width: 15 },
    { header: '', key: 'value', width: 30 }
  ]

  metadataData.forEach(row => {
    metadataSheet.addRow({ key: row[0], value: row[1] })
  })

  // Write workbook to buffer
  const buffer = await workbook.xlsx.writeBuffer()
  return Buffer.from(buffer)
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