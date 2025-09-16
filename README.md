# 임플란트 건강한미소 - 상담 신청 랜딩페이지

모바일 중심의 임플란트 상담 신청 랜딩페이지입니다. Next.js로 구현되었으며, Supabase를 데이터베이스로 사용합니다.

## 🎯 프로젝트 개요

### 주요 기능
- **모바일 최적화**: 모바일 환경에서 최적화된 UI/UX
- **3단계 페이지 구성**: 정보 → 폼 → 제출 버튼
- **실시간 검증**: 이름, 전화번호, 개인정보 동의 실시간 유효성 검사
- **자동 이메일 발송**: 매일 오전 9시 엑셀 리포트 자동 발송
- **접근성 준수**: WCAG 가이드라인을 따른 접근성 구현

### 기술 스택
- **Frontend**: Next.js 14, TypeScript, CSS
- **Backend**: Next.js API Routes (서버리스)
- **Database**: Supabase (PostgreSQL)
- **Email**: NodeMailer (SendGrid/Resend/Mailgun)
- **Testing**: Playwright
- **Deployment**: Vercel

## 🚀 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경변수 설정
`.env.example`을 참고하여 `.env.local` 파일을 생성하고 필요한 환경변수를 설정합니다.

```bash
# Supabase 설정
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# 보안 설정
IP_HASH_SALT=your-random-salt-here

# 이메일 설정
MAIL_PROVIDER=sendgrid
MAIL_API_KEY=your-email-api-key-here
MAIL_FROM=noreply@yourdomain.com
MAIL_TO=owner@yourdomain.com
```

### 3. 데이터베이스 설정
Supabase 프로젝트에서 `lib/supabase/schema.sql` 파일의 SQL을 실행합니다.

### 4. 개발 서버 실행
```bash
npm run dev
```

http://localhost:3000 에서 애플리케이션이 실행됩니다.

## 📁 프로젝트 구조

```
├── pages/
│   ├── api/
│   │   ├── lead.ts              # 리드 저장 API
│   │   └── export-mail.ts       # 이메일 발송 API
│   ├── _app.tsx
│   └── index.tsx                # 메인 랜딩 페이지
├── lib/
│   ├── supabase/
│   │   ├── client.ts            # Supabase 클라이언트
│   │   └── schema.sql           # 데이터베이스 스키마
│   ├── email/
│   │   └── service.ts           # 이메일 서비스
│   └── excel/
│       └── export.ts            # 엑셀 생성 유틸
├── src/styles/
│   └── globals.css              # 글로벌 스타일
├── public/images/               # 이미지 파일들
├── tests/e2e/                   # E2E 테스트
└── vercel.json                  # Vercel 크론 설정
```

## 🔧 API 엔드포인트

### POST /api/lead
상담 신청 데이터를 저장합니다.

**Request:**
```json
{
  "name": "홍길동",
  "phone": "010-1234-5678",
  "consent": true
}
```

**Response (성공):**
```json
{
  "ok": true,
  "id": "123",
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

**Error Codes:**
- `invalid_name`: 이름 형식 오류
- `invalid_phone`: 전화번호 형식 오류
- `consent_required`: 개인정보 동의 필요
- `env_missing`: 서버 설정 오류
- `db_error`: 데이터베이스 오류

### GET /api/export-mail
최근 24시간 리드 데이터를 엑셀로 생성하여 이메일로 발송합니다.

**Response (성공):**
```json
{
  "ok": true,
  "count": 5
}
```

## 🧪 테스트

### E2E 테스트 실행
```bash
# 헤드리스 모드
npm run test:e2e

# UI 모드 (브라우저에서 확인)
npx playwright test --ui

# 특정 테스트만 실행
npx playwright test landing-page
```

### 테스트 범위
- **M0**: 페이지 렌더링 및 이미지 표시
- **M1**: 폼 섹션 및 약관 토글 기능
- **M2**: 실시간 폼 검증 (이름, 전화번호, 동의)
- **M3**: 키보드 접근성 및 ARIA 속성
- **M6**: 전체 제출 플로우 및 모바일 뷰

## 🚀 배포

### Vercel 배포
1. Vercel 계정에 GitHub 리포지토리 연결
2. 환경변수 설정 (Production)
3. 자동 배포 완료

### 크론 작업 설정
`vercel.json`에 정의된 크론 작업이 자동으로 설정됩니다:
- **스케줄**: 매일 00:00 UTC (한국시간 09:00)
- **작업**: `/api/export-mail` 호출

### 환경변수 (Production)
Vercel 대시보드에서 다음 환경변수를 설정하세요:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `IP_HASH_SALT`
- `MAIL_PROVIDER`
- `MAIL_API_KEY`
- `MAIL_FROM`
- `MAIL_TO`

## 📊 데이터베이스 스키마

### landing_leads 테이블
```sql
CREATE TABLE landing_leads (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL CHECK (char_length(trim(name)) BETWEEN 1 AND 15),
    phone VARCHAR(20) NOT NULL CHECK (phone ~ '^\d{3}-\d{4}-\d{4}$'),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
```

### 인덱스
- `idx_landing_leads_created_at`: 날짜별 조회 최적화
- `idx_landing_leads_phone`: 전화번호 기반 중복 확인

## 🔒 보안 및 개인정보

### 데이터 보호
- 전화번호는 로그에서 마스킹 처리 (`010-****-1234`)
- Row Level Security (RLS) 활성화
- Service Role Key만 사용 (anon key 금지)

### GDPR/개인정보보호법 준수
- 명시적 동의 수집
- 수집/이용 목적 명시
- 보관기간 1년 설정
- 사용자 동의 철회 권리 안내

## 📈 모니터링

### 로그 확인
- Vercel Functions 로그에서 API 호출 확인
- Supabase 대시보드에서 데이터베이스 상태 확인
- 이메일 발송 로그 모니터링

### 알림 설정
- Vercel에서 배포 실패 알림 설정
- Supabase에서 데이터베이스 알림 설정
- 이메일 서비스 실패 알림 설정

## 🛠 문제 해결

### 일반적인 문제
1. **이미지가 로드되지 않음**: `public/images/` 디렉토리에 이미지 파일 확인
2. **폼 제출 실패**: 환경변수 및 Supabase 연결 확인
3. **이메일 발송 실패**: 이메일 API 키 및 설정 확인
4. **크론 작업 미실행**: Vercel 프로젝트 설정에서 크론 활성화 확인

### 디버깅
```bash
# 로컬 개발 환경에서 API 테스트
curl -X POST http://localhost:3000/api/lead \
  -H "Content-Type: application/json" \
  -d '{"name":"테스트","phone":"010-1234-5678","consent":true}'

# 이메일 발송 테스트
curl http://localhost:3000/api/export-mail
```

## 📞 지원

프로젝트 관련 문의사항이 있으시면 GitHub Issues를 통해 연락주세요.