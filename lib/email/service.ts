import nodemailer from 'nodemailer'
import { LandingLead } from '../supabase/client'

export interface EmailConfig {
  provider: 'sendgrid' | 'resend' | 'mailgun'
  apiKey: string
  from: string
  to: string
}

export class EmailService {
  private config: EmailConfig

  constructor() {
    const provider = process.env.MAIL_PROVIDER as EmailConfig['provider']
    const apiKey = process.env.MAIL_API_KEY
    const from = process.env.MAIL_FROM
    const to = process.env.MAIL_TO

    if (!provider || !apiKey || !from || !to) {
      throw new Error('Missing email configuration environment variables')
    }

    this.config = { provider, apiKey, from, to }
  }

  private createTransporter() {
    switch (this.config.provider) {
      case 'sendgrid':
        return nodemailer.createTransport({
          service: 'SendGrid',
          auth: {
            user: 'apikey',
            pass: this.config.apiKey
          }
        })

      case 'mailgun':
        // Assuming Mailgun SMTP configuration
        return nodemailer.createTransport({
          host: 'smtp.mailgun.org',
          port: 587,
          secure: false,
          auth: {
            user: 'postmaster@your-mailgun-domain.com', // Replace with your Mailgun domain
            pass: this.config.apiKey
          }
        })

      case 'resend':
        return nodemailer.createTransport({
          host: 'smtp.resend.com',
          port: 587,
          secure: false,
          auth: {
            user: 'resend',
            pass: this.config.apiKey
          }
        })

      default:
        throw new Error(`Unsupported email provider: ${this.config.provider}`)
    }
  }

  async sendLeadReport(leads: LandingLead[], excelBuffer: Buffer): Promise<void> {
    const transporter = this.createTransporter()

    const today = new Date()
    const kstDate = new Date(today.getTime() + (9 * 60 * 60 * 1000)) // Convert to KST
    const dateStr = kstDate.toISOString().split('T')[0]

    const subject = `임플란트 상담 신청 현황 - ${dateStr}`
    const leadCount = leads.length

    let htmlBody = `
      <h2>임플란트 상담 신청 현황</h2>
      <p><strong>조회 날짜:</strong> ${dateStr}</p>
      <p><strong>신청 건수:</strong> ${leadCount}건</p>

      ${leadCount > 0 ? `
      <h3>신청 목록</h3>
      <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%; margin-top: 10px;">
        <thead>
          <tr style="background-color: #f5f5f5;">
            <th>이름</th>
            <th>전화번호</th>
            <th>신청시간</th>
          </tr>
        </thead>
        <tbody>
          ${leads.map(lead => {
            const kstCreatedAt = new Date(new Date(lead.created_at).getTime() + (9 * 60 * 60 * 1000))
            const timeStr = kstCreatedAt.toLocaleString('ko-KR', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            })
            return `
              <tr>
                <td>${lead.name}</td>
                <td>${lead.phone}</td>
                <td>${timeStr}</td>
              </tr>
            `
          }).join('')}
        </tbody>
      </table>
      ` : '<p>오늘은 신청이 없었습니다.</p>'}

      <hr style="margin: 20px 0;">
      <p style="font-size: 12px; color: #666;">
        이 메일은 매일 오전 9시에 자동으로 발송됩니다.<br>
        임플란트 건강한미소 상담 신청 시스템
      </p>
    `

    const textBody = `
임플란트 상담 신청 현황

조회 날짜: ${dateStr}
신청 건수: ${leadCount}건

${leadCount > 0 ?
  '신청 목록:\n' + leads.map(lead => {
    const kstCreatedAt = new Date(new Date(lead.created_at).getTime() + (9 * 60 * 60 * 1000))
    const timeStr = kstCreatedAt.toLocaleString('ko-KR')
    return `- ${lead.name} (${lead.phone}) - ${timeStr}`
  }).join('\n')
  : '오늘은 신청이 없었습니다.'
}

이 메일은 매일 오전 9시에 자동으로 발송됩니다.
임플란트 건강한미소 상담 신청 시스템
    `

    const mailOptions = {
      from: this.config.from,
      to: this.config.to,
      subject,
      text: textBody,
      html: htmlBody,
      attachments: leadCount > 0 ? [{
        filename: `임플란트_상담신청_${dateStr}.xlsx`,
        content: excelBuffer,
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }] : undefined
    }

    try {
      await transporter.sendMail(mailOptions)
      console.log(`Lead report email sent successfully to ${this.config.to}`)
    } catch (error) {
      console.error('Failed to send lead report email:', error)
      throw new Error(`Email sending failed: ${error}`)
    }
  }

  // Test email configuration
  async testConnection(): Promise<boolean> {
    try {
      const transporter = this.createTransporter()
      await transporter.verify()
      return true
    } catch (error) {
      console.error('Email configuration test failed:', error)
      return false
    }
  }
}