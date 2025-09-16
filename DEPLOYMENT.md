# 🚀 임플란트 건강한미소 - 배포 가이드

## 📋 배포 전 체크리스트

### 1. 필수 서비스 준비
- [ ] **Vercel 계정** - https://vercel.com
- [ ] **Supabase 계정** - https://supabase.com
- [ ] **이메일 서비스** (SendGrid/Resend/Mailgun 중 선택)
- [ ] **도메인** (선택사항)

### 2. Supabase 프로젝트 설정

1. **새 프로젝트 생성**
   ```bash
   # Supabase에서 새 프로젝트 생성 후
   # 프로젝트 URL과 Service Role Key 복사
   ```

2. **데이터베이스 스키마 적용**
   ```sql
   -- Supabase SQL Editor에서 실행
   -- lib/supabase/schema.sql 파일 내용 복사 붙여넣기
   ```

3. **Row Level Security 설정 확인**
   - `landing_leads` 테이블에 RLS가 활성화되어야 함
   - 서비스 역할로만 접근 가능하도록 설정됨

### 3. 이메일 서비스 설정

#### SendGrid 사용 시
1. SendGrid 계정 생성 및 API Key 발급
2. 발신자 이메일 인증 완료
3. API Key에 "Mail Send" 권한 부여

#### Resend 사용 시
1. Resend 계정 생성 및 API Key 발급
2. 도메인 인증 (선택사항, 기본 도메인 사용 가능)

#### Mailgun 사용 시
1. Mailgun 계정 생성 및 도메인 설정
2. API Key 및 도메인 정보 확보

### 4. Vercel 프로젝트 배포

#### GitHub 연동 방식 (권장)
1. **저장소를 GitHub에 푸시**
   ```bash
   # GitHub에 새 저장소 생성 후
   git remote add origin https://github.com/username/implant-healthysmile.git
   git branch -M main
   git push -u origin main
   ```

2. **Vercel에서 프로젝트 import**
   - Vercel 대시보드에서 "New Project" 클릭
   - GitHub 저장소 선택 및 import
   - Framework Preset: Next.js 자동 감지

#### 직접 배포 방식
```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 루트에서 배포
vercel

# 프로덕션 배포
vercel --prod
```

### 5. 환경변수 설정

Vercel 대시보드 → Settings → Environment Variables에서 다음 변수들 설정:

```bash
# Supabase
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key

# 보안
IP_HASH_SALT=your-random-32-character-salt-string

# 이메일 (SendGrid 예시)
MAIL_PROVIDER=sendgrid
MAIL_API_KEY=SG.your-sendgrid-api-key
MAIL_FROM=noreply@yourdomain.com
MAIL_TO=admin@yourdomain.com

# 환경
NODE_ENV=production
```

### 6. 크론잡 설정 확인

- **vercel.json**에서 크론 스케줄 확인
- `"schedule": "0 0 * * *"` = 매일 한국시간 오전 9시
- Vercel Pro 플랜에서만 크론잡 사용 가능

### 7. 배포 후 테스트

#### 기본 기능 테스트
1. **랜딩 페이지 로딩**: https://your-domain.vercel.app
2. **폼 제출 테스트**: 실제 데이터 입력 후 제출
3. **데이터베이스 확인**: Supabase에서 데이터 저장 확인
4. **이메일 전송 테스트**: `/api/export-mail` 엔드포인트 직접 호출

#### API 엔드포인트 테스트
```bash
# 폼 제출 테스트
curl -X POST https://your-domain.vercel.app/api/lead \
  -H "Content-Type: application/json" \
  -d '{"name":"테스트","phone":"010-1234-5678","consent":true}'

# 이메일 리포트 테스트 (GET 요청)
curl https://your-domain.vercel.app/api/export-mail
```

## 🔧 문제 해결

### 일반적인 오류들

#### 1. 환경변수 오류
```
Missing required environment variables
```
- Vercel 환경변수 설정 다시 확인
- 변수명 오타 확인
- 재배포 필요

#### 2. Supabase 연결 오류
```
Database connection failed
```
- SUPABASE_URL 형식 확인
- SERVICE_ROLE_KEY 권한 확인
- Row Level Security 설정 확인

#### 3. 이메일 전송 오류
```
Email sending failed
```
- 이메일 API 키 유효성 확인
- 발신자 이메일 인증 상태 확인
- API 사용량 제한 확인

#### 4. 크론잡 미실행
- Vercel Pro 플랜 확인
- 크론 설정 문법 확인
- 함수 실행 로그 확인

### 로그 확인 방법
```bash
# Vercel 함수 로그 확인
vercel logs

# 실시간 로그 스트리밍
vercel logs --follow
```

## 📊 모니터링

### Vercel 대시보드
- 함수 실행 통계
- 오류 발생 현황
- 성능 메트릭

### Supabase 대시보드
- 데이터베이스 사용량
- API 요청 통계
- 실시간 활동 로그

## 🔒 보안 체크리스트

- [ ] 환경변수에 중요 정보 저장 (코드에 하드코딩 금지)
- [ ] Supabase RLS(Row Level Security) 활성화
- [ ] IP 해시 솔트 설정으로 개인정보 보호
- [ ] HTTPS 강제 적용 (Vercel 기본 제공)
- [ ] CORS 설정 확인

## 🚀 성능 최적화

### 이미지 최적화
- Next.js Image 컴포넌트 사용 중
- WebP 형식 자동 변환
- 적응형 이미지 크기 제공

### 캐싱 전략
- 정적 자산 자동 캐싱
- API 응답 캐싱 (필요 시)
- CDN 글로벌 배포

## 🔄 업데이트 배포

```bash
# 코드 변경 후
git add .
git commit -m "기능 업데이트"
git push origin main

# Vercel이 자동으로 감지하여 재배포
```

## 📞 지원

배포 중 문제가 발생하면:
1. 이 가이드의 문제 해결 섹션 확인
2. Vercel/Supabase 공식 문서 참조
3. 로그 파일 확인 후 디버깅