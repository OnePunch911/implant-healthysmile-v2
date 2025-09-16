#!/usr/bin/env node
/**
 * 환경변수 검증 스크립트
 * 배포 전에 필요한 모든 환경변수가 설정되었는지 확인
 */

const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'IP_HASH_SALT',
  'MAIL_PROVIDER',
  'MAIL_API_KEY',
  'MAIL_FROM',
  'MAIL_TO'
];

const optionalEnvVars = [
  'NODE_ENV',
  'DEBUG'
];

console.log('🔍 환경변수 검증 시작...\n');

let hasErrors = false;

// 필수 환경변수 검증
console.log('📋 필수 환경변수 확인:');
requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  if (!value) {
    console.log(`❌ ${envVar}: 누락`);
    hasErrors = true;
  } else {
    // 민감한 정보는 일부만 표시
    let displayValue = value;
    if (envVar.includes('KEY') || envVar.includes('SALT')) {
      displayValue = value.substring(0, 8) + '...';
    }
    console.log(`✅ ${envVar}: ${displayValue}`);
  }
});

// 선택적 환경변수 확인
console.log('\n📝 선택적 환경변수:');
optionalEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  if (value) {
    console.log(`✅ ${envVar}: ${value}`);
  } else {
    console.log(`⚪ ${envVar}: 미설정 (선택사항)`);
  }
});

// 환경변수 값 검증
console.log('\n🔬 환경변수 값 검증:');

// Supabase URL 형식 검증
const supabaseUrl = process.env.SUPABASE_URL;
if (supabaseUrl && !supabaseUrl.startsWith('https://') && !supabaseUrl.includes('supabase.co')) {
  console.log('⚠️  SUPABASE_URL 형식이 올바르지 않을 수 있습니다');
}

// 이메일 프로바이더 검증
const mailProvider = process.env.MAIL_PROVIDER;
const validProviders = ['sendgrid', 'resend', 'mailgun'];
if (mailProvider && !validProviders.includes(mailProvider)) {
  console.log(`⚠️  MAIL_PROVIDER가 유효하지 않습니다. 지원되는 프로바이더: ${validProviders.join(', ')}`);
}

// 이메일 형식 검증
const mailFrom = process.env.MAIL_FROM;
const mailTo = process.env.MAIL_TO;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (mailFrom && !emailRegex.test(mailFrom)) {
  console.log('⚠️  MAIL_FROM 이메일 형식이 올바르지 않습니다');
}

if (mailTo && !emailRegex.test(mailTo)) {
  console.log('⚠️  MAIL_TO 이메일 형식이 올바르지 않습니다');
}

// Salt 길이 검증
const salt = process.env.IP_HASH_SALT;
if (salt && salt.length < 16) {
  console.log('⚠️  IP_HASH_SALT가 너무 짧습니다 (최소 16자 권장)');
}

// 결과 요약
console.log('\n📊 검증 결과:');
if (hasErrors) {
  console.log('❌ 검증 실패: 누락된 필수 환경변수가 있습니다');
  console.log('\n💡 해결 방법:');
  console.log('1. .env.local 파일 생성 (개발환경)');
  console.log('2. Vercel 대시보드에서 환경변수 설정 (프로덕션)');
  console.log('3. .env.example 파일 참고');
  process.exit(1);
} else {
  console.log('✅ 모든 필수 환경변수가 설정되었습니다!');
  console.log('\n🚀 배포 준비 완료');
}

// 배포 체크리스트
console.log('\n📋 배포 전 체크리스트:');
console.log('□ GitHub 리포지토리에 코드 푸시 완료');
console.log('□ Vercel 프로젝트 생성 완료');
console.log('□ Vercel에서 환경변수 설정 완료');
console.log('□ Supabase 프로젝트 및 데이터베이스 스키마 설정 완료');
console.log('□ 이메일 서비스 API 키 및 발신자 인증 완료');
console.log('□ 로컬에서 기능 테스트 완료');