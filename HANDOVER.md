# 프로젝트 인수인계 문서 (HANDOVER)

## 1. 프로젝트 목표

프로젝트명: 오늘의 진짜 정보판 — 데이터가 안 올 때

날씨 API에서 데이터 수신에 실패하더라도 사용자에게 오류 상황을 명확하게 안내하고, 마지막으로 정상 수신한 날씨 데이터를 화면에 유지하는 것이 목표입니다.

주요 기능:
- 네트워크 연결 오류 안내
- HTTP 401, 403, 429 오류 안내
- 잘못된 데이터 형식 및 응답 시간 초과 처리
- 마지막 정상 날씨 데이터 유지
- 재시도 기능 제공
- 오류 발생 후 정상 데이터 복구

## 2. 현재 작업 상태

- GitHub 저장소: https://github.com/khkj03042005-bot/open-meteo-weather-api
- 작업 브랜치: main
- 배포 주소: https://open-meteo-weather-api.onrender.com
- Node.js 버전: v26.13.0
- npm 버전: 11.20.0

### 현재 버전 정보

Git Commit:
- C11 검증 기준 소스 버전 ID: 44cff0629dc7d22968a0483180082dce0916bd3a
- 문서 수정 전 저장소 버전 ID: 50acea04ed7e7dac2df4215d91d529f0dc8feda8

### 테스트 결과

- 전체 테스트: 13개
- 통과: 13개
- 실패: 0개

### 배포 확인

- Render 배포 사이트 접속 확인
- 정상 날씨 데이터 표시 확인
- Health Check 응답 확인

Health Check 주소:
https://open-meteo-weather-api.onrender.com/api/health

확인된 응답:
`{"success":true,"service":"open-meteo-weather-api"}`

마지막 정상 데이터 확인 주소:
https://open-meteo-weather-api.onrender.com/api/last-good

참고: Render 무료 서비스의 재시작이나 재배포 이후에는 저장된 데이터가 초기화될 수 있으므로, 마지막 정상 데이터의 영구 보존은 별도 저장소가 필요합니다.

## 3. 프로젝트 실행 방법

프로젝트 폴더에서 터미널을 열고 아래 명령어를 순서대로 실행합니다.

### 의존성 설치

```powershell
npm.cmd install
```

### 서버 실행

```powershell
npm.cmd start
```

서버 실행 후 브라우저에서 다음 주소로 접속합니다.

http://localhost:3000

서버를 종료할 때는 터미널에서 `Ctrl + C`를 누릅니다.

## 4. 검사 및 테스트 명령어

### 전체 자동 테스트

```powershell
npm.cmd test
```

정상적인 검사 결과:
- 전체 테스트 13개
- 통과 13개
- 실패 0개

### 현재 Git 버전 확인

```powershell
git rev-parse HEAD
```

### Git 변경 사항 확인

```powershell
git status --short
```

### 서버 상태 확인

브라우저에서 아래 주소에 접속합니다.

https://open-meteo-weather-api.onrender.com/api/health

## 5. 주요 기술 및 파일

- Node.js
- Express 기반 서버
- Open-Meteo 날씨 API
- HTML, CSS, JavaScript
- 자동 테스트: Node.js 내장 테스트 기능
- 배포: Render

주요 파일:
- `server.js`: 서버 실행 및 API 처리
- `src/openMeteo.js`: 날씨 API 관련 처리
- `public/index.html`: 웹 화면
- `test/openMeteo.test.js`: 자동 테스트
- `package.json`: 프로젝트 설정 및 실행 명령어

## 6. 인수인계 시 확인 사항

1. 프로젝트 폴더에서 의존성을 설치합니다.
2. 서버를 실행해 웹 화면이 정상적으로 표시되는지 확인합니다.
3. `npm.cmd test`로 자동 테스트를 실행합니다.
4. Git Commit 번호와 변경 사항을 확인합니다.
5. Render 배포 주소와 Health Check 응답을 확인합니다.

현재 확인된 자동 테스트 결과는 13개 통과, 실패 0개입니다.
