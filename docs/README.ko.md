# Commitchi 한국어 가이드

Commitchi는 GitHub 공개 커밋 활동으로 키우는 작은 README 다마고치입니다. 커밋이 먹이가 되고, 먹이를 먹은 만큼 경험치가 쌓입니다. 오래 활동하지 않으면 죽고, 죽은 뒤 다시 커밋하면 새 세대로 태어납니다.

세대마다 8종의 캐릭터 중 하나가 배정됩니다. `pet/characters.mjs`가 계정과 세대를 기준으로 캐릭터를 결정하므로 `tkv00`의 1세대는 기존 `spark` 캐릭터로 유지됩니다. 이후 세대는 8종 순서대로 진행하고 9세대부터 같은 순환을 다시 사용합니다. 즉 8세대 주기로 반복되며, 모든 사용자에게 영원히 유일한 캐릭터를 보장하지 않습니다. 한 8세대 주기 안에서는 같은 캐릭터를 반복하지 않습니다. 캐릭터 이미지는 미리 생성된 파일을 사용하므로 업데이트마다 AI 이미지 생성 비용이 발생하지 않습니다. 캐릭터가 죽어도 종족 실루엣은 유지되고 상태만 사망 표시로 바뀝니다.

소스 레포지토리는 private으로 유지할 수 있습니다. GitHub 기여 데이터를 확인한 뒤 생성된 SVG 두 개만 공개 프로필 레포지토리의 지정 브랜치에 배포하는 구조입니다.

## 프로필 README에 붙이기

게시 설정이 끝나면 프로필 README에 아래 Markdown을 추가합니다.

```md
![Commitchi](https://raw.githubusercontent.com/tkv00/tkv00/commitchi-assets/assets/commitchi.svg)
```

화면 테마에 따라 자동으로 바꾸려면 다음 HTML을 사용할 수 있습니다.

```html
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/tkv00/tkv00/commitchi-assets/assets/commitchi.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/tkv00/tkv00/commitchi-assets/assets/commitchi-light.svg">
  <img alt="Commitchi" src="https://raw.githubusercontent.com/tkv00/tkv00/commitchi-assets/assets/commitchi.svg">
</picture>
```

배지는 `560 × 200` 크기의 SVG이며 레벨, 성장 단계, 먹이, XP, 체력, 연속 활동 일수, 마지막 활동일, 전체 공개 커밋 수를 표시합니다.

## 키우는 규칙

- 커밋 2개마다 먹이 1개를 얻습니다. 커밋이 홀수로 남으면 다음 날 계산에 이어집니다.
- 하루에 자동으로 먹이는 최대 3개를 먹습니다.
- 먹이 1개마다 XP 10을 얻습니다. 현재 레벨을 `L`이라고 할 때 다음 누적 레벨 기준은 `L × (L + 1) × 10`입니다.
- 레벨 1, 3, 6, 10에서 `SEED`, `BABY`, `GROWN`, `CROWN` 단계로 성장합니다.
- 완료된 무커밋 3일이 지나면 위험 상태가 되고, 완료된 무커밋 4일째에 죽습니다.
- 1일의 반영 유예 기간 안에 커밋하면 같은 세대를 살릴 수 있습니다.
- 죽은 뒤 커밋하면 새 세대로 환생합니다. 전체 커밋·먹이 누적값은 저장된 상태에 남습니다.

날짜는 GitHub 응답의 UTC 달력 날짜를 사용합니다. 첫 성공 업데이트가 실행된 날부터 입양하므로 입양일 이전의 활동을 임의로 만들지 않습니다.

기본 설정에서는 공개 레포지토리의 커밋만 계산합니다. 프로필 레포지토리는 `excludeRepository`로 제외해 배지를 배포한 커밋이 먹이가 되지 않게 합니다. 이 버전에서는 private 기여 모드를 지원하지 않습니다.

## 설정

`commitchi.config.json`을 편집합니다.

```json
{
  "owner": "tkv00",
  "name": "커밋치",
  "excludeRepository": "tkv00/tkv00",
  "publicRepository": "tkv00/tkv00",
  "publicBranch": "commitchi-assets"
}
```

`owner`는 기여 데이터를 읽을 GitHub 계정입니다. `excludeRepository`는 레포지토리 이름을 대소문자 구분 없이 비교합니다. `publicRepository`와 `publicBranch`는 생성된 `commitchi.svg`, `commitchi-light.svg`를 받을 공개 프로필 레포지토리와 브랜치입니다.

## 로컬 실행

런타임 의존성 없이 Node.js로 테스트합니다.

```sh
npm test
```

GitHub 토큰을 환경 변수로 넣어 업데이트합니다.

```sh
PET_OWNER=tkv00 PET_GITHUB_TOKEN="$GITHUB_TOKEN" npm run update
```

업데이트는 전체 누락 구간을 검증한 뒤 `pet/data/ledger.json`, `pet/data/state.json`, SVG를 기록합니다. GitHub API 오류, 불완전한 페이지, 잘못된 응답이 발생하면 기존 상태를 보존합니다. 수정된 기여 데이터도 반영할 수 있도록 매번 최근 7일의 겹치는 기간을 다시 조회합니다.

브라우저에서 실제 배지와 데모 상태를 확인합니다.

```sh
npm run preview
```

갤러리 미리보기에서는 8종 전체를 보고 선택한 캐릭터의 레벨·기분·테마 데모를 확인할 수 있습니다. 데모 조작은 fixture만 렌더링하며 저장된 실제 펫 상태를 수정하지 않습니다.

## private 소스와 public 배포

소스 레포지토리는 private으로 두고 GitHub Actions가 4시간마다 업데이트합니다. `PUBLISH_DEPLOY_KEY`가 있을 때만 publisher를 호출합니다. 시크릿이 없으면 소스 상태와 생성물만 갱신하고 공개 레포지토리에는 push하지 않습니다.

`PUBLISH_DEPLOY_KEY`에는 지정한 public 프로필 레포지토리에 대한 write 권한이 필요합니다. 현재 키를 발급하거나 등록하는 작업은 끝나지 않았으므로, 시크릿을 등록하기 전에는 배지가 자동 게시되지 않습니다. publisher는 설정된 asset 브랜치와 생성 이미지 두 파일만 변경하도록 동작합니다.

GitHub 토큰이나 private key를 이미지 URL, README, 커밋, 이슈에 넣지 마세요. 위 raw URL에는 공개 레포지토리와 브랜치 정보만 포함됩니다.

현재 계정 플랜에서는 private 소스 레포지토리용 GitHub Pages를 사용할 수 없으므로, 공개 프로필 레포지토리의 전용 브랜치에 SVG를 게시하는 경로를 사용합니다. 이는 모든 GitHub 계정과 플랜에 대한 일반적인 제한을 뜻하지 않습니다.

## 캐릭터 로스터와 파일

- `pet/characters.mjs`: 8종 캐릭터 로스터와 계정·세대 매핑
- `assets/sprites/commitchi.png`: `spark`, 기존 토끼 병아리 캐릭터
- `assets/sprites/mogu.png`: 산호색 버섯 캐릭터
- `assets/sprites/pudding.png`: 아쿠아색 물방울 캐릭터
- `assets/sprites/luna.png`: 라벤더 박쥐 캐릭터
- `assets/sprites/bolt.png`, `moss.png`, `ember.png`, `cloud.png`: 나머지 4종
- `assets/commitchi.svg`: 현재 상태의 어두운 테마 배지
- `assets/commitchi-light.svg`: 현재 상태의 밝은 테마 배지

캐릭터는 Commitchi를 위해 만든 오리지널 픽셀 에셋입니다. 제공된 이미지는 밝고 수집 가능한 분위기를 잡기 위한 참고로만 사용했으며, 캐릭터·레이아웃·상표를 복사하지 않았습니다.

기여 방법은 [CONTRIBUTING.md](../CONTRIBUTING.md)를 확인하세요.
