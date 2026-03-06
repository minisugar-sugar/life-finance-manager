# Life Finance Manager (MVP)

개인 재정관리 서비스 MVP입니다.

## 포함 기능
- 월간 대시보드 화면 (GitHub Pages에서는 localStorage 기반)
- 보험 관리(추가/수정/삭제)
- 월간 돈 기록(입력/수정/삭제/월별조회/차트)
- 은퇴 추천 리포트 + 목표 빠른 설정
- 계산기 페이지 (`/calculators`) - 단리/복리/예금/적금/대출(원리금균등/원금균등/만기일시)/은퇴 목표 + 전체회차 CSV 다운로드
- 배당 계산기 (`/dividend`) - 연간 배당금, 월/분기 배당, 재투자 n년 결과
- 은퇴 리포트 페이지 (`/retirement`) - 월 부족분 및 행동 추천 + 목표 빠른설정 폼
- 간편 로그인 페이지 (`/login`) - 이메일 기반 사용자 데이터 분리(MVP)
- 메인 화면 카드 + 보험 등록 폼 + 보험 테이블 UI
- Prisma 스키마(수입/지출/투자/저축/보험/은퇴)

## 실행
```bash
npm install
npm run dev
```

## GitHub Pages 배포
- main에 푸시하면 GitHub Actions가 자동으로 정적 사이트를 빌드해 Pages에 배포합니다.
- GitHub Pages에서는 서버 API 대신 브라우저 저장소(localStorage)로 동작합니다.

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
