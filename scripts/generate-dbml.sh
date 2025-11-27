#!/bin/bash

# =============================================================================
# DBDocs DBML 생성 스크립트
# 
# 사용법: ./scripts/generate-dbml.sh
# 
# 필요 조건:
#   - Docker가 실행 중이어야 함
#   - @dbml/cli가 설치되어 있어야 함 (npm install -g @dbml/cli)
# =============================================================================

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 설정
DB_HOST="localhost"
DB_PORT="54322"
DB_USER="erd-test"
DB_PASSWORD="erd-test"
DB_NAME="erd-test"
OUTPUT_FILE="database.dbml"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   DBDocs DBML 생성 스크립트${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 1. Docker 컨테이너 확인
echo -e "${YELLOW}[1/5] Docker 컨테이너 확인 중...${NC}"
if ! docker ps | grep -q "postgres-erd"; then
    echo -e "${YELLOW}      PostgreSQL 컨테이너가 실행 중이 아닙니다. 시작합니다...${NC}"
    docker-compose up -d
    echo -e "${YELLOW}      컨테이너가 준비될 때까지 대기 중...${NC}"
    sleep 5
fi
echo -e "${GREEN}      ✓ PostgreSQL 컨테이너 실행 중${NC}"

# 2. 데이터베이스 연결 확인
echo -e "${YELLOW}[2/5] 데이터베이스 연결 확인 중...${NC}"
MAX_RETRIES=10
RETRY_COUNT=0
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if docker exec postgres-erd pg_isready -U $DB_USER -d $DB_NAME > /dev/null 2>&1; then
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo -e "${YELLOW}      데이터베이스 연결 대기 중... ($RETRY_COUNT/$MAX_RETRIES)${NC}"
    sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo -e "${RED}      ✗ 데이터베이스 연결 실패${NC}"
    exit 1
fi
echo -e "${GREEN}      ✓ 데이터베이스 연결 성공${NC}"

# 3. TypeORM 스키마 동기화
echo -e "${YELLOW}[3/5] TypeORM 스키마 동기화 중...${NC}"
DB_HOST=$DB_HOST DB_PORT=$DB_PORT DB_USERNAME=$DB_USER DB_PASSWORD=$DB_PASSWORD DB_DATABASE=$DB_NAME TYPEORM_SYNC=true \
    npx ts-node -r tsconfig-paths/register ./scripts/sync-schema.ts
echo -e "${GREEN}      ✓ 스키마 동기화 완료${NC}"

# 4. SQL 스키마 추출
echo -e "${YELLOW}[4/5] SQL 스키마 추출 중...${NC}"
docker exec postgres-erd pg_dump -U $DB_USER -d $DB_NAME \
    --schema-only --no-owner --no-privileges > schema.sql
echo -e "${GREEN}      ✓ schema.sql 생성 완료${NC}"

# 5. DBML 변환
echo -e "${YELLOW}[5/5] DBML 변환 중...${NC}"
yarn sql2dbml schema.sql --postgres -o $OUTPUT_FILE
echo -e "${GREEN}      ✓ $OUTPUT_FILE 생성 완료${NC}"

# 정리
rm -f schema.sql

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   완료!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "생성된 파일: ${BLUE}$OUTPUT_FILE${NC}"
echo ""
echo -e "다음 명령어로 dbdocs에 배포할 수 있습니다:"
echo -e "  ${YELLOW}dbdocs build $OUTPUT_FILE --project=<프로젝트명>${NC}"
echo ""

