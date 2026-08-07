# Spatial Archive

지도 위에서 사라지는 장소의 3D 공간 기록을 탐색하는 정적 웹 아카이브입니다.

## Stack

- React 19
- Vite 8
- TypeScript
- React Router (HashRouter)
- MapLibre GL

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

`main` 브랜치에 push하면 `.github/workflows/deploy-pages.yml`이 GitHub Pages용 정적 빌드를 생성합니다. 라우팅은 정적 호스팅에서 새로고침 오류가 발생하지 않도록 hash 기반 URL을 사용합니다.
