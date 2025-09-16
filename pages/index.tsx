import { useState, FormEvent, ChangeEvent } from 'react'
import Image from 'next/image'

interface FormData {
  name: string
  phone: string
  consent: boolean
}

interface FormErrors {
  name?: string
  phone?: string
  consent?: string
}

interface SubmissionResponse {
  ok: boolean
  id?: string
  created_at?: string
  code?: string
}

export default function Home() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    consent: false
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [showTerms, setShowTerms] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [showErrorEffect, setShowErrorEffect] = useState(false)

  // Format phone number with auto-hyphen insertion
  const formatPhoneNumber = (value: string): string => {
    const numbers = value.replace(/[^0-9]/g, '')
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`
  }

  // Validation functions
  const validateName = (name: string): string | undefined => {
    const trimmedName = name.trim()
    if (!trimmedName) return '이름을 입력해주세요'
    if (trimmedName.length > 15) return '이름은 15자 이하로 입력해주세요'
    return undefined
  }

  const validatePhone = (phone: string): string | undefined => {
    if (!phone) return '전화번호를 입력해주세요'
    const phoneRegex = /^\d{3}-\d{4}-\d{4}$/
    if (!phoneRegex.test(phone)) return '올바른 전화번호 형식이 아닙니다 (010-1234-5678)'
    return undefined
  }

  const validateConsent = (consent: boolean): string | undefined => {
    if (!consent) return '개인정보 수집·이용에 동의해주세요'
    return undefined
  }

  // Handle input changes
  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFormData(prev => ({ ...prev, name: value }))

    // Clear error when user starts typing
    if (errors.name) {
      setErrors(prev => ({ ...prev, name: undefined }))
    }
  }

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    if (formatted.replace(/[^0-9]/g, '').length <= 11) {
      setFormData(prev => ({ ...prev, phone: formatted }))

      // Clear error when user starts typing
      if (errors.phone) {
        setErrors(prev => ({ ...prev, phone: undefined }))
      }
    }
  }

  const handleConsentChange = (e: ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked
    setFormData(prev => ({ ...prev, consent: checked }))

    // Clear error when user checks
    if (errors.consent && checked) {
      setErrors(prev => ({ ...prev, consent: undefined }))
    }
  }

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    // Validate all fields
    const nameError = validateName(formData.name)
    const phoneError = validatePhone(formData.phone)
    const consentError = validateConsent(formData.consent)

    const newErrors: FormErrors = {
      name: nameError,
      phone: phoneError,
      consent: consentError
    }

    setErrors(newErrors)

    // Check if there are any errors
    if (nameError || phoneError || consentError) {
      // Show error effect animation
      setShowErrorEffect(true)
      setTimeout(() => setShowErrorEffect(false), 600) // Clear after animation completes
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          phone: formData.phone,
          consent: formData.consent
        }),
      })

      const result: SubmissionResponse = await response.json()

      if (result.ok) {
        setIsSuccess(true)
        setFormData({ name: '', phone: '', consent: false })
        setErrors({})
      } else {
        let errorMessage = '제출 중 오류가 발생했습니다. 다시 시도해주세요.'

        switch (result.code) {
          case 'invalid_name':
            setErrors(prev => ({ ...prev, name: '올바른 이름을 입력해주세요' }))
            return
          case 'invalid_phone':
            setErrors(prev => ({ ...prev, phone: '올바른 전화번호를 입력해주세요' }))
            return
          case 'consent_required':
            setErrors(prev => ({ ...prev, consent: '개인정보 수집·이용에 동의해주세요' }))
            return
          case 'env_missing':
            errorMessage = '시스템 설정 오류입니다. 관리자에게 문의해주세요.'
            break
          case 'db_error':
            errorMessage = '데이터 저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
            break
        }

        alert(errorMessage)
      }
    } catch (error) {
      console.error('Form submission error:', error)
      alert('네트워크 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleTerms = () => {
    setShowTerms(!showTerms)
  }

  if (isSuccess) {
    return (
      <div className="landing-container">
        <div className="success-section">
          <h2>상담 신청이 완료되었습니다!</h2>
          <p>빠른 시일 내에 연락드리겠습니다.</p>
          <p>감사합니다.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="landing-container">
      {/* Page 1 - Long vertical image */}
      <section className="page1-section" aria-label="임플란트 정보">
        <Image
          src="/images/page1.jpeg"
          alt="임플란트 건강한미소 - 전문 임플란트 치료 정보"
          width={500}
          height={1200}
          className="page1-image"
          priority
        />
      </section>

      {/* Page 2 - Form section */}
      <section className="page2-section" aria-label="상담 신청 폼">
        <div className="page2-form-container">
          <Image
            src="/images/page2.png"
            alt="임플란트 건강한미소 - 상담 신청 안내"
            width={500}
            height={600}
            className="page2-background"
          />

          <form onSubmit={handleSubmit} noValidate className="overlay-form">
            <div className="overlay-input-group name-input">
              <label htmlFor="name" className="sr-only">이름</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleNameChange}
                className={`overlay-input ${errors.name && showErrorEffect ? 'pulse' : ''}`}
                maxLength={15}
                placeholder="이름을 입력해 주세요"
                required
              />
            </div>

            <div className="overlay-input-group phone-input">
              <label htmlFor="phone" className="sr-only">전화번호</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handlePhoneChange}
                className={`overlay-input ${errors.phone && showErrorEffect ? 'pulse' : ''}`}
                placeholder="전화번호를 입력해 주세요"
                required
              />
            </div>

            <div className="overlay-checkbox-group">
              <input
                type="checkbox"
                id="consent"
                name="consent"
                checked={formData.consent}
                onChange={handleConsentChange}
                required
                className={`overlay-checkbox ${errors.consent && showErrorEffect ? 'pulse' : ''}`}
              />
              <label htmlFor="consent" className="overlay-checkbox-label">
                개인정보 수집·이용에 동의합니다{' '}
                <button
                  type="button"
                  className="terms-toggle"
                  onClick={toggleTerms}
                  aria-expanded={showTerms}
                  aria-controls="terms-content"
                >
                  약관보기
                </button>
              </label>
            </div>

            {showTerms && (
              <div id="terms-content" className="overlay-terms-content-v2">
                <h4>개인정보 수집·이용 동의서</h4>
                <ul>
                  <li><strong>수집항목:</strong> 이름, 전화번호</li>
                  <li><strong>수집목적:</strong> 임플란트 상담 안내 및 예약 관리</li>
                  <li><strong>보관기간:</strong> 1년 (상담 완료 후)</li>
                  <li><strong>수집주체:</strong> 임플란트 건강한미소</li>
                </ul>
                <p>위의 개인정보 수집·이용에 대한 동의를 거부할 권리가 있으나, 동의 거부 시 상담 서비스 이용이 제한될 수 있습니다.</p>
              </div>
            )}
          </form>

          {/* Page 3 - Submit button overlay */}
          <button
            type="submit"
            className={`overlay-submit-button ${isSubmitting ? 'loading' : ''}`}
            onClick={handleSubmit}
            disabled={isSubmitting}
            aria-label="상담신청하기"
          >
            <Image
              src="/images/page3.png"
              alt="상담신청하기"
              width={300}
              height={60}
              className="overlay-submit-image"
            />
            {isSubmitting && (
              <span className="sr-only">상담 신청 중...</span>
            )}
          </button>
        </div>
      </section>
    </div>
  )
}