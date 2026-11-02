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
