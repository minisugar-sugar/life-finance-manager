# Life Finance Manager (MVP)

개인 재정관리 서비스 MVP입니다.

## 포함 기능
- 월간 대시보드 API (`/api/dashboard/summary`)
- 보험 CRUD API (`/api/insurance`)
- 메인 화면 카드 + 보험 테이블 UI
- Prisma 스키마(수입/지출/투자/저축/보험/은퇴)

## 실행
```bash
npm install
npx prisma generate
npm run dev
```

## DB
`.env`에 아래를 설정하세요.
```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB"
```

## 다음 단계
1. 인증(NextAuth) 연결
2. 보험 입력/수정 폼 추가
3. 계산기 페이지(예금/적금/대출/배당/은퇴) 연결
4. 은퇴 추천 엔진(API) 추가

> 본 서비스는 정보 제공 목적이며 투자자문이 아닙니다.
