# 🚀 배포 완료 - 서비스 설정 가이드

**배포된 사이트:** https://implant-smile.vercel.app

현재 프론트엔드는 성공적으로 배포되었지만, 백엔드 서비스들을 연결해야 실제 기능이 작동합니다.

## 📋 현재 상태

✅ **완료됨:**
- GitHub 리포지토리: https://github.com/OnePunch911/implant-healthysmile-v2
- Vercel 배포: https://implant-smile.vercel.app
- Next.js 앱 정상 로딩

⏳ **설정 필요:**
- Supabase 데이터베이스 연결
- 이메일 서비스 연결
- Vercel 환경변수 설정

## 🗄️ 1단계: Supabase 설정

### 1.1 Supabase 프로젝트 생성
1. https://supabase.com 에서 로그인
2. "New Project" 클릭
3. 프로젝트 이름: `implant-healthysmile`
4. 데이터베이스 비밀번호 설정 (안전한 곳에 저장!)
5. Region: `Northeast Asia (Seoul)` 또는 `Southeast Asia (Singapore)` 선택

### 1.2 데이터베이스 스키마 생성
Supabase Dashboard → SQL Editor → New query에서 실행:

\`\`\`sql
-- 상담신청 테이블 생성
CREATE TABLE landing_leads (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL CHECK (char_length(trim(name)) BETWEEN 1 AND 15),
    phone VARCHAR(20) NOT NULL CHECK (phone ~ '^\d{3}-\d{4}-\d{4}$'),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Row Level Security 활성화 (보안)
ALTER TABLE landing_leads ENABLE ROW LEVEL SECURITY;

-- Service Role에서만 접근 가능하도록 정책 설정
CREATE POLICY "Service role can manage all data" ON landing_leads
    FOR ALL USING (auth.role() = 'service_role');

-- 성능 최적화를 위한 인덱스 생성
CREATE INDEX idx_landing_leads_created_at ON landing_leads(created_at DESC);
CREATE INDEX idx_landing_leads_phone ON landing_leads(phone);

-- 테이블 설명 추가
COMMENT ON TABLE landing_leads IS '임플란트 상담신청 리드 데이터';
COMMENT ON COLUMN landing_leads.name IS '고객 이름 (1-15자)';
COMMENT ON COLUMN landing_leads.phone IS '전화번호 (010-1234-5678 형식)';
COMMENT ON COLUMN landing_leads.created_at IS '신청 시간 (한국 표준시 기준)';
\`\`\`

### 1.3 환경변수 정보 수집
Supabase Dashboard → Settings → API에서 다음 정보 복사:
- **Project URL**: `https://xxxxx.supabase.co`
- **Service Role Key**: `eyJ...` (긴 토큰, 안전하게 보관!)

## 📧 2단계: 이메일 서비스 설정

### 옵션 1: SendGrid (추천)
1. https://sendgrid.com 가입
2. API Keys → Create API Key
3. 권한: "Full Access" 또는 "Mail Send" 선택
4. API Key 복사 (안전하게 보관!)
5. Sender Authentication → Single Sender Verification
6. 발신자 이메일 인증 완료

### 옵션 2: Resend (간단함)
1. https://resend.com 가입
2. API Keys → Create API Key
3. API Key 복사
4. 기본 도메인 사용 또는 커스텀 도메인 설정

### 옵션 3: Mailgun (고급)
1. https://mailgun.com 가입
2. 도메인 설정 및 DNS 레코드 추가
3. API Key 및 도메인 정보 수집

## ⚙️ 3단계: Vercel 환경변수 설정

### 3.1 Vercel 대시보드 접속
1. https://vercel.com 로그인
2. `implant-smile` 프로젝트 클릭
3. Settings → Environment Variables

### 3.2 환경변수 추가
다음 변수들을 **Production**, **Preview**, **Development** 모두에 추가:

\`\`\`bash
# Supabase 설정
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key

# 보안 설정 (32자 랜덤 문자열)
IP_HASH_SALT=random-32-character-string-here

# 이메일 설정 (SendGrid 예시)
MAIL_PROVIDER=sendgrid
MAIL_API_KEY=SG.your-sendgrid-api-key
MAIL_FROM=noreply@yourdomain.com
MAIL_TO=admin@yourdomain.com

# 환경 설정
NODE_ENV=production
\`\`\`

### 3.3 재배포
환경변수 저장 후 Vercel이 자동으로 재배포합니다.

## 🧪 4단계: 기능 테스트

### 4.1 폼 제출 테스트
1. https://implant-smile.vercel.app 접속
2. 테스트 데이터 입력:
   - 이름: `홍길동`
   - 전화: `010-1234-5678`
   - 개인정보 동의 체크
3. "상담신청하기" 버튼 클릭
4. "상담 신청이 완료되었습니다!" 메시지 확인

### 4.2 데이터베이스 확인
Supabase Dashboard → Table editor → `landing_leads`에서 데이터 저장 확인

### 4.3 이메일 발송 테스트
다음 URL로 수동 테스트:
\`\`\`
https://implant-smile.vercel.app/api/export-mail
\`\`\`

성공 시 JSON 응답:
\`\`\`json
{"ok": true, "count": 1}
\`\`\`

## 🔄 5단계: 크론잡 확인

### 5.1 Vercel Pro 플랜 확인
- 크론잡은 Vercel Pro 플랜에서만 사용 가능
- Hobby 플랜에서는 크론잡이 실행되지 않음

### 5.2 크론잡 설정 확인
Vercel Dashboard → Functions → Cron Jobs에서 다음 확인:
- Path: `/api/export-mail`
- Schedule: `0 0 * * *` (매일 한국시간 오전 9시)

## 🚨 문제 해결

### 자주 발생하는 오류들

#### 1. 폼 제출 시 "서버 오류"
**원인**: 환경변수 미설정 또는 Supabase 연결 실패
**해결**:
- Vercel 환경변수 다시 확인
- Supabase URL과 Service Role Key 정확성 확인
- Vercel Functions 로그 확인: `vercel logs`

#### 2. 이메일 발송 실패
**원인**: 이메일 API 키 오류 또는 발신자 인증 미완료
**해결**:
- 이메일 서비스 API 키 재확인
- SendGrid의 경우 Sender Authentication 완료 여부 확인
- 발신자 이메일 주소 인증 상태 확인

#### 3. 크론잡 미실행
**원인**: Vercel Hobby 플랜 또는 설정 오류
**해결**:
- Vercel 플랜 확인 (Pro 플랜 필요)
- 크론 설정 문법 확인
- Vercel Dashboard에서 Cron Jobs 섹션 확인

### 디버깅 방법

#### Vercel 로그 확인
\`\`\`bash
# 실시간 로그 스트리밍
vercel logs --follow

# 특정 함수 로그
vercel logs --function=/api/lead
\`\`\`

#### API 엔드포인트 직접 테스트
\`\`\`bash
# 폼 제출 테스트
curl -X POST https://implant-smile.vercel.app/api/lead \
  -H "Content-Type: application/json" \
  -d '{"name":"테스트","phone":"010-1234-5678","consent":true}'

# 이메일 발송 테스트
curl https://implant-smile.vercel.app/api/export-mail
\`\`\`

## ✅ 최종 체크리스트

설정 완료 후 다음 항목들을 확인하세요:

- [ ] Supabase 프로젝트 생성 및 스키마 적용
- [ ] 이메일 서비스 가입 및 API 키 발급
- [ ] Vercel 환경변수 모든 항목 설정
- [ ] 폼 제출 테스트 성공
- [ ] 데이터베이스에 데이터 저장 확인
- [ ] 이메일 발송 테스트 성공
- [ ] 크론잡 설정 확인 (Pro 플랜인 경우)

## 🎯 완료!

모든 설정이 완료되면 다음과 같은 완전한 기능이 제공됩니다:

1. **랜딩페이지**: 모바일 최적화된 임플란트 상담 신청 페이지
2. **실시간 검증**: 이름, 전화번호 형식 검증 및 시각적 피드백
3. **데이터 저장**: Supabase PostgreSQL에 안전한 데이터 저장
4. **자동 이메일**: 매일 오전 9시 Excel 리포트 자동 발송
5. **관리 기능**: Supabase 대시보드를 통한 데이터 관리

**지원이 필요한 경우:**
- GitHub Issues: https://github.com/OnePunch911/implant-healthysmile-v2/issues
- 배포 가이드: [DEPLOYMENT.md](./DEPLOYMENT.md)

---

🚀 **임플란트 건강한미소 상담 신청 시스템이 준비되었습니다!**