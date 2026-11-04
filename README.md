# Open-Meteo 날씨 API

대전의 현재 날씨를 Open-Meteo에서 가져와 서버 API로 제공하는 Node.js + Express 프로젝트입니다.

## 실행
1. Node.js LTS 설치
2. 프로젝트 폴더에서 터미널 실행
3. `npm install`
4. `npm start`
5. 브라우저에서 `http://localhost:3000`

## API
- `GET /api/weather` : 현재 날씨 JSON
- `GET /api/health` : 서버 상태 확인

## 위치 변경
환경 변수 `CITY_NAME`, `LATITUDE`, `LONGITUDE`를 설정하면 위치를 변경할 수 있습니다. 기본값은 대전입니다.

## 보안
Open-Meteo의 이 기본 API 요청은 API 키가 필요하지 않습니다. 키 기반 API로 교체할 경우 키를 서버 환경 변수에만 저장하고 브라우저 코드에 넣지 마세요. `.env`는 `.gitignore`에 포함되어 있습니다.

## 출처
Weather data by Open-Meteo: https://open-meteo.com/


## 날짜별 날씨 기록 (KST)

- 정상적인 실제 API 호출이 성공하면 `data/weather-history.json`에 기록됩니다.
- 날짜는 `Asia/Seoul` 기준 `YYYY-MM-DD`로 계산합니다.
- 같은 날짜/도시의 기록은 최신 정상 수신값으로 갱신합니다.
- 최근 365일 기록을 보관합니다.
- 조회 API: `GET /api/history`
- 오류 시뮬레이션 응답은 날짜별 정상 기록에 저장되지 않습니다.


## 자동 테스트

프로젝트 폴더에서 의존성을 설치한 뒤 다음 명령으로 저장 기능을 검사합니다.

```powershell
npm.cmd install
npm.cmd test
```

테스트는 KST 날짜 경계, 같은 날짜 기록 갱신, 다른 날짜 분리, 마지막 정상 데이터 저장 및 조회를 확인합니다. 테스트 데이터는 임시 폴더에서 처리하므로 실제 `data` 폴더의 기록을 변경하지 않습니다.


## 카드 5 — 실제 이틀과 어제 대비

- 실제 API를 서로 다른 KST 날짜에 각각 성공 호출해야 비교가 활성화됩니다.
- 날짜별 기록에는 원천(Open-Meteo), 원천 요청 URL, 관측 시각, 수치와 단위를 보관합니다.
- 화면은 가장 최근 날짜와 그 이전 날짜의 기온 차이(최근 날짜 − 이전 날짜)를 다시 계산합니다.
- 첫 날짜 기록만 있으면 비교 대기 상태를 표시합니다. 오류 시뮬레이션은 정상 날짜 기록을 추가하지 않습니다.
- 카드 5 관련 자동 테스트는 원천 URL/관측 시각 보존, 2개 날짜 비교, 기록 부족 시 비교 보류를 확인합니다.


## 오류 안내와 복구 기능

- `GET /api/weather`는 외부 날씨 요청 오류를 `code`, HTTP 상태, 안내 메시지로 구분해 반환합니다.
- 분류 코드: `NETWORK`, `TIMEOUT`, `UPSTREAM_UNAUTHORIZED`, `UPSTREAM_FORBIDDEN`, `RATE_LIMITED`, `UPSTREAM_HTTP`, `INVALID_JSON`, `INVALID_SCHEMA`.
- 오류가 발생하면 마지막 정상 데이터(`lastGood`)를 반환하며, 오류 응답으로 저장된 정상 데이터를 덮어쓰지 않습니다.
- 화면의 **다시 시도** 버튼으로 재요청할 수 있습니다. 요청 성공 시 최신 데이터와 날짜별 기록을 갱신합니다.
- 오류 재현: 화면의 오류 상황 테스트 선택 메뉴에서 timeout, 401, 403, 429, offline, schema를 선택한 뒤 날씨 불러오기를 누릅니다.
- Open-Meteo 기본 예보 API는 API 키가 필요하지 않습니다. 401/403은 과제의 오류 재현을 위한 시뮬레이션일 수 있으며 실제 API 인증 설정이 필요하다는 뜻은 아닙니다.

### 오류 처리 자동 테스트

`npm.cmd test` 실행 시 기존 저장 기능 테스트와 함께 정상 응답, 네트워크 오류, 시간 초과, HTTP 429, 잘못된 JSON, 잘못된 데이터 형식을 검사합니다.
