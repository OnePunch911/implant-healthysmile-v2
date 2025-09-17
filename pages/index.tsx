import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Head from 'next/head'

interface FormData {
  name: string
  phone: string
  email?: string
  region: string
  terms: boolean
}

interface FormErrors {
  name?: string
  phone?: string
  terms?: string
}

interface LocationRequestData {
  patientName: string
  phoneNumber: string
  email: string
  region: string
}

interface EmailField {
  id: string
  label: string
  value: string
  required: boolean
}

interface EmailTemplateData {
  fields: EmailField[]
  timestamp: string
  patientName: string
  phoneNumber: string
  email: string
  region: string
}

export default function LandingPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    email: '',
    region: '',
    terms: false
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const regions = [
    { value: '', label: '지역 선택' },
    { value: '서울특별시', label: '서울특별시' },
    { value: '부산광역시', label: '부산광역시' },
    { value: '대구광역시', label: '대구광역시' },
    { value: '인천광역시', label: '인천광역시' },
    { value: '광주광역시', label: '광주광역시' },
    { value: '대전광역시', label: '대전광역시' },
    { value: '울산광역시', label: '울산광역시' },
    { value: '경기도', label: '경기도' },
    { value: '강원도', label: '강원도' },
    { value: '충청북도', label: '충청북도' },
    { value: '충청남도', label: '충청남도' },
    { value: '전라북도', label: '전라북도' },
    { value: '전라남도', label: '전라남도' },
    { value: '경상북도', label: '경상북도' },
    { value: '경상남도', label: '경상남도' },
    { value: '제주특별자치도', label: '제주특별자치도' }
  ]

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요.'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = '연락처를 입력해주세요.'
    } else if (!/^01[0-9]-?[0-9]{4}-?[0-9]{4}$/.test(formData.phone.replace(/-/g, ''))) {
      newErrors.phone = '올바른 연락처 형식을 입력해주세요.'
    }

    if (!formData.terms) {
      newErrors.terms = '개인정보 수집 및 이용에 동의해주세요.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/[^\d]/g, '')
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setFormData(prev => ({ ...prev, phone: formatted }))

    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setSubmissionStatus('idle')

    try {
      const requestData: LocationRequestData = {
        patientName: formData.name,
        phoneNumber: formData.phone,
        email: formData.email || '',
        region: formData.region
      }

      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      if (response.ok) {
        setSubmissionStatus('success')
        setShowSuccessModal(true)
        setFormData({
          name: '',
          phone: '',
          email: '',
          region: '',
          terms: false
        })
      } else {
        throw new Error('Failed to submit')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      setSubmissionStatus('error')
      alert('전송 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  const scrollToForm = () => {
    const formElement = document.getElementById('consultation-form')
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Auto-scroll to form when page loads
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToForm()
    }, 1000) // 1 second delay to allow page to load

    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      <Head>
        <title>임플란트 전문의 찾기 - 헬시스마일</title>
        <meta name="description" content="임플란트 전문의와 신뢰할 수 있는 치과병원을 찾아보세요. 헬시스마일에서 최고의 임플란트 치료를 받으실 수 있습니다." />
        <meta name="keywords" content="임플란트, 치과, 전문의, 헬시스마일, 치과병원" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index, follow" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preload" href="/images/page1-1.jpeg" as="image" />
      </Head>
      <div className="landing-container">
      {/* Page 1 - Long vertical image */}
      <section className="page1-section" aria-label="임플란트 정보">
        <Image
          src="/images/page1-1.jpeg"
          alt="임플란트 치료 정보 - 안전하고 전문적인 임플란트 시술"
          width={750}
          height={2500}
          priority
          quality={95}
          style={{
            width: '100%',
            height: 'auto',
            display: 'block'
          }}
        />
      </section>

      {/* Page 2 - Form Section */}
      <section className="form-section" aria-label="상담 신청 폼">
        <div className="form-container" id="consultation-form">
          <h2>임플란트 전문의 찾기</h2>
          <p>지역별 임플란트 전문의를 찾아드립니다</p>

          <form onSubmit={handleSubmit} className="consultation-form" noValidate>
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                이름 *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`form-input ${errors.name ? 'error' : ''}`}
                placeholder="이름을 입력해주세요"
                required
                aria-describedby={errors.name ? "name-error" : undefined}
              />
              {errors.name && (
                <span id="name-error" className="error-message" role="alert">
                  {errors.name}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="phone" className="form-label">
                연락처 *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handlePhoneChange}
                className={`form-input ${errors.phone ? 'error' : ''}`}
                placeholder="010-0000-0000"
                required
                aria-describedby={errors.phone ? "phone-error" : undefined}
              />
              {errors.phone && (
                <span id="phone-error" className="error-message" role="alert">
                  {errors.phone}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                이메일 (선택)
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="form-input"
                placeholder="email@example.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="region" className="form-label">
                지역 선택
              </label>
              <select
                id="region"
                name="region"
                value={formData.region}
                onChange={handleInputChange}
                className="form-select"
              >
                {regions.map((region) => (
                  <option key={region.value} value={region.value}>
                    {region.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="terms-group">
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="terms"
                  name="terms"
                  checked={formData.terms}
                  onChange={handleInputChange}
                  className={`form-checkbox ${errors.terms ? 'error' : ''}`}
                  required
                  aria-describedby={errors.terms ? "terms-error" : undefined}
                />
                <label htmlFor="terms" className="checkbox-label">
                  개인정보 수집 및 이용에 동의합니다 *{' '}
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="terms-link"
                    aria-label="개인정보 처리방침 상세보기"
                  >
                    (상세보기)
                  </button>
                </label>
              </div>
              {errors.terms && (
                <span id="terms-error" className="error-message" role="alert">
                  {errors.terms}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="submit-button"
              aria-describedby={isLoading ? "loading-status" : undefined}
              style={{ zIndex: 10 }}
            >
              {isLoading ? (
                <>
                  <span id="loading-status" className="sr-only">전송 중</span>
                  전송 중...
                </>
              ) : (
                '전문의 찾기'
              )}
            </button>
          </form>
        </div>
      </section>

      {/* Terms Modal */}
      {showTermsModal && (
        <div className="modal-overlay" onClick={() => setShowTermsModal(false)} style={{ zIndex: 9999 }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>개인정보 수집 및 이용 동의</h3>
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="close-button"
                aria-label="모달 닫기"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <h4>1. 개인정보의 수집 및 이용목적</h4>
              <p>수집하는 개인정보는 임플란트 전문의 매칭 서비스 제공을 위해 사용됩니다.</p>

              <h4>2. 수집하는 개인정보의 항목</h4>
              <ul>
                <li>필수항목: 이름, 연락처, 지역</li>
                <li>선택항목: 이메일</li>
              </ul>

              <h4>3. 개인정보의 보유 및 이용기간</h4>
              <p>수집된 개인정보는 서비스 제공 완료 후 지체 없이 파기됩니다.</p>

              <h4>4. 개인정보 제공 거부권</h4>
              <p>귀하는 개인정보 수집 및 이용에 대한 동의를 거부할 권리가 있으나, 이 경우 서비스 이용이 제한될 수 있습니다.</p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="modal-confirm-button"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal-overlay" onClick={() => setShowSuccessModal(false)}>
          <div className="modal-content success-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>신청 완료</h3>
              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="close-button"
                aria-label="모달 닫기"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>상담 신청이 성공적으로 접수되었습니다.</p>
              <p>빠른 시일 내에 연락드리겠습니다.</p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="modal-confirm-button"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
      </div>

      <style jsx>{`
        .landing-container {
          min-height: 100vh;
          background-color: #ffffff;
        }

        .page1-section {
          width: 100%;
          display: flex;
          justify-content: center;
          background-color: #ffffff;
        }

        .form-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 60px 20px;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .form-container {
          background: white;
          padding: 40px;
          border-radius: 20px;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 500px;
          position: relative;
        }

        .form-container h2 {
          color: #333;
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 10px;
          text-align: center;
        }

        .form-container p {
          color: #666;
          text-align: center;
          margin-bottom: 30px;
          font-size: 16px;
        }

        .consultation-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-label {
          font-weight: 600;
          margin-bottom: 8px;
          color: #333;
          font-size: 14px;
        }

        .form-input,
        .form-select {
          padding: 12px 16px;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          font-size: 16px;
          transition: border-color 0.3s ease;
          background-color: #ffffff;
        }

        .form-input:focus,
        .form-select:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-input.error,
        .form-select.error {
          border-color: #e74c3c;
        }

        .error-message {
          color: #e74c3c;
          font-size: 12px;
          margin-top: 4px;
          font-weight: 500;
        }

        .terms-group {
          margin: 10px 0;
        }

        .checkbox-group {
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }

        .form-checkbox {
          margin-top: 2px;
          flex-shrink: 0;
        }

        .form-checkbox.error {
          outline: 2px solid #e74c3c;
        }

        .checkbox-label {
          font-size: 14px;
          color: #555;
          line-height: 1.4;
          cursor: pointer;
        }

        .terms-link {
          color: #667eea;
          text-decoration: underline;
          background: none;
          border: none;
          padding: 0;
          font-size: inherit;
          cursor: pointer;
        }

        .terms-link:hover {
          color: #5a6fd8;
        }

        .submit-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 16px 32px;
          border: none;
          border-radius: 8px;
          font-size: 18px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          margin-top: 10px;
          position: relative;
        }

        .submit-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
        }

        .submit-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          max-width: 600px;
          width: 100%;
          max-height: 80vh;
          overflow-y: auto;
          position: relative;
        }

        .modal-header {
          padding: 20px 20px 10px;
          border-bottom: 1px solid #eee;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h3 {
          margin: 0;
          color: #333;
          font-size: 20px;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #999;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-button:hover {
          color: #333;
        }

        .modal-body {
          padding: 20px;
        }

        .modal-body h4 {
          color: #333;
          margin: 20px 0 10px 0;
          font-size: 16px;
        }

        .modal-body p,
        .modal-body li {
          color: #666;
          line-height: 1.6;
          margin-bottom: 10px;
        }

        .modal-body ul {
          padding-left: 20px;
        }

        .modal-footer {
          padding: 10px 20px 20px;
          display: flex;
          justify-content: center;
        }

        .modal-confirm-button {
          background: #667eea;
          color: white;
          padding: 10px 30px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 16px;
        }

        .modal-confirm-button:hover {
          background: #5a6fd8;
        }

        .success-modal .modal-body {
          text-align: center;
          padding: 30px 20px;
        }

        .success-modal .modal-body p {
          color: #333;
          font-size: 16px;
          margin-bottom: 10px;
        }

        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        @media (max-width: 768px) {
          .form-section {
            padding: 40px 15px;
          }

          .form-container {
            padding: 30px 20px;
          }

          .form-container h2 {
            font-size: 24px;
          }

          .modal-content {
            margin: 10px;
            max-height: 90vh;
          }

          .modal-header,
          .modal-body,
          .modal-footer {
            padding: 15px;
          }
        }

        @media (max-width: 480px) {
          .form-container {
            padding: 25px 15px;
          }

          .form-container h2 {
            font-size: 22px;
          }

          .submit-button {
            font-size: 16px;
            padding: 14px 28px;
          }
        }
      `}</style>
    </>
  )
}