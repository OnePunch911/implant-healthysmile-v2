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
          src="/images/page1-1.jpeg"
          alt="임플란트 건강한미소 - 전문 임플란트 치료 정보"
          width={500}
          height={1200}
          className="page1-image"
          priority
        />
        {/* Force deployment - version 20250922 */}
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
                <h4>개인정보 취급방침</h4>
                <p>'본원'은 고객님의 개인정보를 중요시하며, 「개인정보 보호법」 및 관련 법령을 준수하고 있습니다.</p>
                <p>본원은 개인정보취급방침을 통하여 고객님께서 제공하시는 개인정보가 어떠한 용도와 방식으로 이용되며, 개인정보보호를 위해 어떠한 조치가 취해지고 있는지 알려드립니다.</p>
                <p>본원은 개인정보취급방침을 개정하는 경우 웹사이트 공지사항(또는 개별공지)을 통하여 공지할 것입니다.</p>

                <h5>1. 수집하는 개인정보의 항목 및 수집방법</h5>
                <p>본원은 상담 신청을 위해 다음과 같은 최소한의 개인정보를 수집합니다.</p>
                <ul>
                  <li>필수항목 : 성명, 연락처(전화번호)</li>
                  <li>수집방법 : 홈페이지 상담 신청 폼</li>
                </ul>

                <h5>2. 개인정보의 수집 및 이용목적</h5>
                <p>본원은 수집한 개인정보를 다음의 목적을 위해 활용합니다.</p>
                <ul>
                  <li>상담 신청에 따른 본인 확인 및 연락</li>
                  <li>상담 안내 및 예약 지원</li>
                  <li>서비스 이용 관련 문의 처리</li>
                </ul>

                <h5>3. 개인정보의 보유 및 이용기간</h5>
                <p>본원은 개인정보의 수집 목적 또는 제공받은 목적이 달성되면 지체 없이 파기합니다.</p>
                <p>단, 관계 법령의 규정에 의하여 보존할 필요성이 있는 경우에는 해당 법령에서 정한 기간 동안 보관할 수 있습니다.</p>
                <ul>
                  <li>상담 신청 기록 : 상담 종료 후 1년간 보관</li>
                  <li>소비자의 불만 또는 분쟁처리에 관한 기록 : 3년 (전자상거래 등에서의 소비자보호에 관한 법률)</li>
                  <li>본인 확인에 관한 기록 : 6개월 (정보통신망 이용촉진 및 정보보호 등에 관한 법률)</li>
                  <li>방문 기록(IP 등 로그기록) : 3개월 (통신비밀보호법)</li>
                </ul>
              </div>
            )}
            {/* Page 3 - Submit button overlay */}
            <button
              type="submit"
              className={`overlay-submit-button ${isSubmitting ? 'loading' : ''}`}
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
          </form>
        </div>
      </section>
    </div>
  )
}