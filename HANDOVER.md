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
- 최신 기능·검사 기준 저장소 HEAD (문서 갱신 직전): `cba9cb1900ed52cf79669dc09934f3f0ad8c6d72`
- 이 문서 갱신은 위 HEAD를 기준으로 한 문서 전용 변경이며, 기능 소스 파일은 변경하지 않습니다.
- 기존 인수인계 문서 수정 이력: `50acea04ed7e7dac2df4215d91d529f0dc8feda8`

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


## 7. T05 후속 기준 점검 메모 (2026-11-13)

- 현재 기능·검사 기준 HEAD는 위에 기록한 `cba9cb1900ed52cf79669dc09934f3f0ad8c6d72`입니다.
- C09 관련 고정 검사: AI A와 AI B의 10개 고정 검사 결과는 기존 기록상 모두 PASS입니다. AI B의 상세 로그에서는 검사 #5~#9도 PASS로 확인되었습니다.
- C23/C24는 실제 AI 작업 소요 시간과 실제 AI 요청 횟수입니다. 60분/20회는 제한값이며 실제 사용량으로 간주하지 않습니다. 실제 수치는 별도 증거가 확보될 때까지 미확인입니다.
- C37: 공개 Git 커밋 메타데이터에 작성자 이메일이 포함된 커밋이 확인되었습니다. 과거 커밋 이력의 이메일을 이 문서 수정만으로 제거할 수는 없습니다. GitHub 계정의 이메일 공개 설정과 이후 커밋용 비공개 noreply 주소 설정을 확인해야 합니다.
- C38: 현재 확인한 8개 커밋의 변경 diff에서 일반적인 개인 키·토큰·자격 증명 패턴은 발견되지 않았습니다. 이는 전체 저장소 및 모든 Git 객체에 대한 완전한 비밀정보 검사가 아닙니다.
- C05~C07, C16 등 공식 카드의 정확한 문구와 원본 증거가 확보되지 않은 항목은 임의로 PASS/FAIL 처리하지 않습니다.
