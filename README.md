# DBDocs PoC - 브랜치별 ERD 자동 문서화

TypeORM Entity 변경 시 자동으로 ERD를 생성하고 [dbdocs.io](https://dbdocs.io)에 브랜치별로 배포하는 PoC 프로젝트입니다.

## 📋 목차

- [개요](#개요)
- [아키텍처](#아키텍처)
- [브랜치별 배포 전략](#브랜치별-배포-전략)
- [Workflow 동작 방식](#workflow-동작-방식)
- [설정 방법](#설정-방법)
- [프로젝트 구조](#프로젝트-구조)
- [로컬 개발 환경](#로컬-개발-환경)
- [dbdocs 플랜 분석](#dbdocs-플랜-분석)
- [도입 효과 분석](#도입-효과-분석)

---

## 개요

### 문제점

- Entity 변경 시 ERD 문서가 수동으로 업데이트되어야 함
- 개발/스테이징/프로덕션 환경별 스키마 차이를 추적하기 어려움
- 코드와 문서의 동기화가 어려움

### 해결책

- GitHub Actions를 통해 Entity 변경 감지 시 자동으로 ERD 생성
- 브랜치별로 별도의 dbdocs 프로젝트에 배포
- PR 생성 시 자동으로 ERD 링크 코멘트 추가

### 결과물

| 브랜치  | dbdocs 프로젝트 | URL                                         |
| ------- | --------------- | ------------------------------------------- |
| develop | dbdocs-dev      | https://dbdocs.io/angwang-su/dbdocs-dev     |
| staging | dbdocs-staging  | https://dbdocs.io/angwang-su/dbdocs-staging |
| main    | dbdocs-prod     | https://dbdocs.io/angwang-su/dbdocs-prod    |

---

## 아키텍처

```
┌─────────────────────────────────────────────────────────────────┐
│                        GitHub Actions                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Entity 변경 감지 (src/entities/**)                            │
│           ↓                                                     │
│  2. PostgreSQL 서비스 시작                                         │
│           ↓                                                     │
│  3. TypeORM 스키마 동기화 (sync-schema.ts)                         │
│           ↓                                                     │
│  4. pg_dump로 SQL 스키마 추출                                      │
│           ↓                                                     │
│  5. sql2dbml로 DBML 변환                                          │
│           ↓                                                     │
│  6. dbdocs build로 배포                                           │
│           ↓                                                     │
│  7. PR 코멘트 추가 (PR인 경우)                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 브랜치별 배포 전략

### 트리거 조건

| 이벤트 | 브랜치    | 배포 대상      |
| ------ | --------- | -------------- |
| Push   | develop   | dbdocs-dev     |
| PR     | → develop | dbdocs-dev     |
| PR     | → staging | dbdocs-staging |
| PR     | → main    | dbdocs-prod    |

### 파일 변경 감지

다음 파일이 변경될 때만 workflow가 실행됩니다:

- `src/entities/**` - Entity 파일 변경
- `.github/workflows/dbdocs.yml` - Workflow 파일 변경

---

## Workflow 동작 방식

### 1. PostgreSQL 서비스 컨테이너

GitHub Actions에서 PostgreSQL 서비스를 실행하여 스키마 동기화에 사용합니다.

```yaml
services:
  postgres:
    image: postgres:16-alpine
    env:
      POSTGRES_USER: erd-test
      POSTGRES_PASSWORD: erd-test
      POSTGRES_DB: erd-test
```

### 2. TypeORM 스키마 동기화

`scripts/sync-schema.ts`를 실행하여 Entity를 DB에 동기화합니다.

```typescript
await AppDataSource.initialize();
await AppDataSource.synchronize();
```

### 3. SQL → DBML 변환

```bash
# PostgreSQL 스키마 추출
pg_dump --schema-only > schema.sql

# DBML로 변환
sql2dbml schema.sql --postgres -o database.dbml
```

### 4. dbdocs 배포

```bash
# ~/.netrc에 인증 정보 저장
echo "machine api.dbdocs.io login dbdocs password $TOKEN" > ~/.netrc

# 배포
dbdocs build database.dbml --project=dbdocs-dev
```

---

## 설정 방법

### 1. dbdocs 토큰 발급

```bash
# dbdocs CLI 설치
npm install -g dbdocs

# 로그인 실행
dbdocs login
```

1. `dbdocs login` 명령어 실행
2. 로그인 방법 선택 (GitHub/Google)
3. 브라우저에서 인증 완료
4. 리다이렉트된 페이지에서 **토큰 복사**

```
✔ Choose a login method: GitHub/Google
✔ Please input your authentication token: <브라우저에서 복사한 토큰 입력>
✔ Validate token
✔ Save credential
```

### 2. GitHub Secrets 설정

1. Repository → Settings → Environments
2. Environment 생성
3. `DBDOCS_TOKEN` Secret 추가

### 3. Workflow 권한 설정

Repository → Settings → Actions → General에서:

- "Read and write permissions" 활성화
- "Allow GitHub Actions to create and approve pull requests" 활성화

### 4. 팀 단위 워크스페이스 관리

#### 방법 1: 공용 계정 사용 (권장 - CI/CD용)

```
┌─────────────────────────────────────────────────────────┐
│                    공용 dbdocs 계정                      │
│                  (예: team@company.com)                  │
├─────────────────────────────────────────────────────────┤
│  토큰 발급 → GitHub Secrets에 저장                        │
│                      ↓                                   │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                  │
│  │ dev     │  │ staging │  │ prod    │                  │
│  │ project │  │ project │  │ project │                  │
│  └─────────┘  └─────────┘  └─────────┘                  │
└─────────────────────────────────────────────────────────┘
```

- **장점**: 토큰 관리가 단순, CI/CD에 적합
- **단점**: 개별 활동 추적 불가
- **사용 시나리오**: 자동화된 문서 생성/배포

#### 방법 2: 개별 계정 + 프로젝트 공유 (협업용)

```
┌─────────────────────────────────────────────────────────┐
│                   프로젝트 소유자                         │
│              (프로젝트 생성 및 팀원 초대)                   │
├─────────────────────────────────────────────────────────┤
│                         ↓                               │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                  │
│  │ 개발자A  │  │ 개발자B │  │ 개발자C │                   │
│  │ (편집)  │  │ (편집)  │  │ (읽기)  │                   │
│  └─────────┘  └─────────┘  └─────────┘                  │
└─────────────────────────────────────────────────────────┘
```

**설정 방법:**

1. 프로젝트 소유자가 dbdocs.io에서 프로젝트 생성
2. 프로젝트 Settings → Members에서 팀원 이메일로 초대
3. 팀원별 권한 설정 (편집/읽기)
4. 각 팀원은 자신의 계정으로 로그인하여 접근

#### 권장 구성

| 용도               | 계정 유형    | 토큰 관리      |
| ------------------ | ------------ | -------------- |
| **CI/CD 자동화**   | 공용 계정    | GitHub Secrets |
| **수동 편집/확인** | 개별 계정    | 각자 관리      |
| **프로젝트 소유**  | 팀 리드 계정 | 팀원 초대      |

#### CI/CD용 토큰 발급 절차

1. **팀 공용 계정 생성** (예: `devops@company.com`)
2. 해당 계정으로 `dbdocs login` 실행
3. 발급된 토큰을 **GitHub Secrets**에 저장
4. 프로젝트 소유자가 공용 계정을 프로젝트에 초대 (필요시)

> ⚠️ **주의**: 토큰은 계정에 종속됩니다. 공용 계정의 토큰을 사용하면 해당 계정 권한으로 모든 작업이 수행됩니다.

---

## 프로젝트 구조

```
dbdocs-poc/
├── .github/
│   └── workflows/
│       └── dbdocs.yml          # GitHub Actions Workflow
├── src/
│   ├── database/
│   │   └── data-source.ts      # TypeORM DataSource 설정
│   └── entities/               # TypeORM Entity 파일들
│       ├── user.entity.ts
│       ├── product.entity.ts
│       ├── order.entity.ts
│       └── ...
├── scripts/
│   └── sync-schema.ts          # 스키마 동기화 스크립트
├── docker-compose.yml          # 로컬 개발용 PostgreSQL
└── package.json
```

### Entity 목록 (25개)

**관계가 있는 Entity:**

- User, UserProfile, Address
- Category, Product, Tag
- Order, OrderItem, Cart, CartItem
- Review, Payment, Shipment
- Inventory, Wishlist, Refund

**독립적인 Entity:**

- Coupon, Notification, AuditLog
- Setting, Country, Faq
- EmailTemplate, Supplier, Promotion

---

## 로컬 개발 환경

### 요구사항

- Node.js 20+
- Docker & Docker Compose
- Yarn

### 설치 및 실행

```bash
# 의존성 설치
yarn install

# PostgreSQL 시작
docker-compose up -d

# 개발 서버 실행
yarn start:dev
```

### 로컬에서 DBML 생성 테스트

```bash
# PostgreSQL 시작
docker-compose up -d

# 스키마 동기화
npx ts-node scripts/sync-schema.ts

# SQL 추출
PGPASSWORD=erd-test pg_dump -h localhost -p 54322 -U erd-test -d erd-test --schema-only > schema.sql

# DBML 변환
npx @dbml/cli sql2dbml schema.sql --postgres -o database.dbml

# dbdocs 배포 (로그인 필요)
dbdocs login
dbdocs build database.dbml --project=dbdocs-dev
```

---

## 주의사항

### dbdocs 인증

- `DBDOCS_TOKEN` 환경변수는 CI/CD에서 직접 인식되지 않음
- `~/.netrc` 파일에 credential을 저장하는 방식 사용

```bash
# ~/.netrc 형식
machine api.dbdocs.io login dbdocs password <TOKEN>
```

### TypeORM synchronize 옵션

- 개발 환경에서만 `synchronize: true` 사용
- 프로덕션에서는 migration 사용 권장

---

## dbdocs 플랜 분석

### 무료 vs 유료 플랜 비교

| 기능                | Free      | Pro (유료) |
| ------------------- | --------- | ---------- |
| **프로젝트 수**     | ✅ 무제한 | ✅ 무제한  |
| **공개 프로젝트**   | ✅        | ✅         |
| **비공개 프로젝트** | ❌        | ✅         |
| **비밀번호 보호**   | ❌        | ✅         |
| **팀 협업 (초대)**  | 제한적    | 무제한     |
| **접근 권한 관리**  | ❌        | ✅         |
| **커스텀 도메인**   | ❌        | ✅         |
| **기술 지원**       | 커뮤니티  | 우선 지원  |

> ✅ **PoC 확인 결과**: 무료 플랜에서도 다중 프로젝트 생성이 가능합니다.  
> (dbdocs-dev, dbdocs-staging, dbdocs-prod 3개 프로젝트 운영 중)

### 무료 플랜으로 가능한 것

- ✅ 브랜치별 다중 프로젝트 생성 (dev/staging/prod)
- ✅ 공개 ERD 문서 배포
- ✅ CI/CD 자동화 연동
- ✅ PR 코멘트 자동화

### 유료 플랜 도입이 필요한 경우

1. **비공개 프로젝트 필요** ⭐ 핵심
   - 내부 DB 스키마를 외부에 노출하면 안 되는 경우
   - 보안이 중요한 프로젝트
   - **무료 플랜은 모든 프로젝트가 Public**

2. **비밀번호 보호**
   - URL을 알아도 비밀번호 없이 접근 불가
   - 외부 공유 시 보안 강화

3. **팀 협업 기능 확장**
   - 팀원별 세부 권한 관리 (읽기/편집)
   - 대규모 팀 협업

---

## 도입 효과 분석

### 현재 상황 (테이블 50개 이상)

대규모 데이터베이스에서 dbdocs 자동화 도입 시 다음과 같은 효과가 있습니다:

### 1. 직관적인 UI/UX

dbdocs는 ERD를 단순히 보여주는 것을 넘어 **인터랙티브한 탐색 경험**을 제공합니다:

| 기능                 | 설명                                                     |
| -------------------- | -------------------------------------------------------- |
| **테이블 클릭**      | 해당 테이블의 상세 정보 (컬럼, 타입, 제약조건) 즉시 확인 |
| **관계 하이라이트**  | 테이블 선택 시 연관된 테이블과 FK 관계가 시각적으로 강조 |
| **검색 기능**        | 테이블/컬럼명으로 빠른 검색                              |
| **줌 & 팬**          | 대규모 ERD에서 자유로운 탐색                             |
| **다크/라이트 모드** | 개발자 친화적인 테마 지원                                |

**테이블 관계 탐색 예시:**

```
┌─────────────────────────────────────────────────────────────┐
│  users 테이블 클릭 시                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────┐      ┌─────────────┐      ┌─────────┐        │
│   │ orders  │ ←──  │   users     │  ──→ │ reviews │        │
│   └─────────┘      │  (selected) │      └─────────┘        │
│        ↓           │             │           ↓             │
│   ┌─────────┐      │ - id        │      ┌─────────┐        │
│   │ payments│      │ - email     │      │products │        │
│   └─────────┘      │ - name      │      └─────────┘        │
│                    └─────────────┘                          │
│                                                             │
│   → 연관 테이블이 하이라이트되어 관계 파악이 즉시 가능         │
└─────────────────────────────────────────────────────────────┘
```

**50개 이상 테이블에서의 장점:**

- 복잡한 관계도 **클릭 한 번**으로 연관 테이블 확인
- 신규 개발자가 **스스로 탐색**하며 구조 파악 가능
- 기획자/디자이너도 **코드 없이** 데이터 구조 이해

### 2. 문서화 자동화로 인한 효율성 향상

**현재 문제점 (수동 ERD 관리):**

- Entity 변경 시 ERD 도구(dbdiagram, draw.io 등)에서 **수동으로 업데이트** 필요
- 바쁜 일정 속에서 ERD 업데이트가 **누락되거나 지연**됨
- 시간이 지나면 **코드와 문서가 불일치** → 신뢰도 하락
- 환경별(dev/staging/prod) ERD를 **각각 관리**해야 하는 번거로움

**자동화 후 개선점:**

| 항목             | Before (수동)                 | After (자동화)            |
| ---------------- | ----------------------------- | ------------------------- |
| ERD 업데이트     | Entity 변경 후 수동 작업 필요 | PR 머지 시 자동 반영      |
| 문서 동기화      | 누락/지연 가능성 높음         | 항상 최신 상태 유지       |
| 버전별 문서 관리 | 환경별로 별도 관리            | 브랜치별 자동 분리        |
| 작업 트리거      | 담당자가 기억해서 수행        | CI/CD가 자동 감지 및 실행 |

**핵심 가치:**

> Entity 코드만 변경하면 ERD 문서가 **자동으로 최신화**되므로,  
> 개발자는 문서 관리에 신경 쓰지 않고 **개발에만 집중**할 수 있습니다.

### 2. 온보딩 효율화

| 항목                | Before                  | After           |
| ------------------- | ----------------------- | --------------- |
| 신규 개발자 DB 이해 | 1~2주                   | 1~2일           |
| 테이블 관계 파악    | 코드 분석 필요          | 시각적 ERD 확인 |
| 질문/답변 시간      | 시니어 개발자 시간 소모 | 자체 학습 가능  |

### 3. 개발 품질 향상

| 항목                 | 효과                                  |
| -------------------- | ------------------------------------- |
| **스키마 변경 추적** | PR별로 ERD 변경사항 확인 가능         |
| **코드 리뷰 품질**   | Entity 변경 시 ERD 링크로 영향도 파악 |
| **환경별 차이 파악** | dev/staging/prod 스키마 비교 용이     |
| **커뮤니케이션**     | 기획자/디자이너와 데이터 구조 공유    |

### 4. ROI 분석 (50개 테이블 기준)

```
[ 비용 ]
- dbdocs Pro: 약 $9~15/월 (추정)
- 초기 설정: 2~4시간 (1회성)

[ 절감 효과 ]
- 문서화 시간: 4~8시간/월 × 개발자 시급
- 온보딩 시간: 신규 입사자당 3~5일 단축
- 커뮤니케이션 비용: 측정 어려우나 상당한 효과

[ 결론 ]
→ 개발자 2명 이상인 팀에서는 1개월 내 ROI 달성
```

### 5. 50개 이상 테이블에서의 특별한 이점

| 규모          | 수동 관리       | 자동화   |
| ------------- | --------------- | -------- |
| 10개 미만     | 관리 가능       | 선택적   |
| 10~30개       | 어려움          | 권장     |
| **50개 이상** | **거의 불가능** | **필수** |

- **복잡한 관계 시각화**: 50개 이상의 테이블 간 관계를 한눈에 파악
- **변경 영향도 분석**: 특정 테이블 변경 시 연관 테이블 즉시 확인
- **일관성 유지**: 수동 업데이트 시 발생하는 누락/오류 방지

---

## 결론 및 권장사항

### PoC 결과 요약

| 항목           | 결과                        |
| -------------- | --------------------------- |
| 기술적 구현    | ✅ 성공                     |
| 브랜치별 배포  | ✅ 동작 확인                |
| CI/CD 통합     | ✅ GitHub Actions 연동 완료 |
| PR 자동 코멘트 | ✅ 동작 확인                |

### 권장사항

1. **즉시 도입 권장**
   - 50개 이상의 테이블을 보유한 프로젝트에서는 자동화 필수
   - 무료 플랜으로 시작하여 필요시 유료 전환

2. **유료 플랜 검토 시점**
   - 비공개 프로젝트가 필요한 경우
   - 팀원이 5명 이상인 경우
   - 다중 서비스 ERD 관리가 필요한 경우

3. **추가 개선 가능 사항**
   - Slack/Teams 알림 연동
   - 스키마 변경 diff 자동 생성
   - 테이블별 설명 주석 자동 추출

---

## 참고 자료

- [dbdocs.io 공식 문서](https://dbdocs.io/docs)
- [DBML 문법](https://dbml.dbdiagram.io/docs/)
- [TypeORM 공식 문서](https://typeorm.io/)
- [@dbml/cli npm](https://www.npmjs.com/package/@dbml/cli)
