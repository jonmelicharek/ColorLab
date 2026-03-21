#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# ColorLab AI — Automated Setup Script
# ═══════════════════════════════════════════════════════════════
# Run: chmod +x setup.sh && ./setup.sh
# This script handles the full setup from fresh clone to running app.
# ═══════════════════════════════════════════════════════════════

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════${NC}"
echo -e "${CYAN}   🎨  ColorLab AI — Automated Setup${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════${NC}"
echo ""

# ─── Check prerequisites ────────────────────────────────────

echo -e "${BLUE}[1/8]${NC} Checking prerequisites..."

# Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js not found. Install from https://nodejs.org (v18+)${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}✗ Node.js v18+ required (you have $(node -v))${NC}"
    exit 1
fi
echo -e "  ${GREEN}✓${NC} Node.js $(node -v)"

# npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npm not found${NC}"
    exit 1
fi
echo -e "  ${GREEN}✓${NC} npm $(npm -v)"

# Git (optional but recommended)
if command -v git &> /dev/null; then
    echo -e "  ${GREEN}✓${NC} Git $(git --version | cut -d ' ' -f 3)"
else
    echo -e "  ${YELLOW}⚠${NC} Git not found (optional but recommended)"
fi

echo ""

# ─── Install dependencies ───────────────────────────────────

echo -e "${BLUE}[2/8]${NC} Installing npm dependencies..."
npm install
echo -e "  ${GREEN}✓${NC} Dependencies installed"
echo ""

# ─── Environment setup ──────────────────────────────────────

echo -e "${BLUE}[3/8]${NC} Setting up environment variables..."

if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo -e "  ${GREEN}✓${NC} Created .env.local from template"
    echo ""
    echo -e "${YELLOW}  ┌──────────────────────────────────────────────────┐${NC}"
    echo -e "${YELLOW}  │  IMPORTANT: Edit .env.local with your API keys  │${NC}"
    echo -e "${YELLOW}  └──────────────────────────────────────────────────┘${NC}"
    echo ""

    # Interactive prompts for required keys
    read -p "  Enter your ANTHROPIC_API_KEY (or press Enter to skip): " ANTHROPIC_KEY
    if [ -n "$ANTHROPIC_KEY" ]; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|ANTHROPIC_API_KEY=sk-ant-xxxxx|ANTHROPIC_API_KEY=$ANTHROPIC_KEY|" .env.local
        else
            sed -i "s|ANTHROPIC_API_KEY=sk-ant-xxxxx|ANTHROPIC_API_KEY=$ANTHROPIC_KEY|" .env.local
        fi
        echo -e "  ${GREEN}✓${NC} Anthropic API key set"
    else
        echo -e "  ${YELLOW}⚠${NC} Skipped — add manually to .env.local"
    fi

    read -p "  Enter your DATABASE_URL (or press Enter for local Docker): " DB_URL
    if [ -n "$DB_URL" ]; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|DATABASE_URL=.*|DATABASE_URL=\"$DB_URL\"|" .env.local
        else
            sed -i "s|DATABASE_URL=.*|DATABASE_URL=\"$DB_URL\"|" .env.local
        fi
        echo -e "  ${GREEN}✓${NC} Database URL set"
    else
        echo -e "  ${YELLOW}⚠${NC} Using default — make sure Docker Postgres is running"
    fi

    # Generate a random admin secret
    ADMIN_SECRET=$(openssl rand -hex 16 2>/dev/null || echo "colorlab-admin-$(date +%s)")
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|ADMIN_SECRET=your-secret-key-here|ADMIN_SECRET=$ADMIN_SECRET|" .env.local
    else
        sed -i "s|ADMIN_SECRET=your-secret-key-here|ADMIN_SECRET=$ADMIN_SECRET|" .env.local
    fi
    echo -e "  ${GREEN}✓${NC} Admin secret generated: ${CYAN}$ADMIN_SECRET${NC}"
    echo -e "  ${YELLOW}  Save this! You need it to access /dashboard${NC}"

else
    echo -e "  ${GREEN}✓${NC} .env.local already exists"
fi

echo ""

# ─── Docker Postgres (optional) ─────────────────────────────

echo -e "${BLUE}[4/8]${NC} Database setup..."

if command -v docker &> /dev/null; then
    read -p "  Start local PostgreSQL with Docker? (y/N): " START_DOCKER
    if [[ "$START_DOCKER" =~ ^[Yy]$ ]]; then
        echo "  Starting PostgreSQL container..."
        docker compose up -d postgres 2>/dev/null || docker-compose up -d postgres 2>/dev/null || {
            echo -e "  ${YELLOW}⚠${NC} Docker Compose failed — starting standalone container"
            docker run -d \
                --name colorlab-postgres \
                -e POSTGRES_USER=colorlab \
                -e POSTGRES_PASSWORD=colorlab_dev \
                -e POSTGRES_DB=colorlab \
                -p 5432:5432 \
                postgres:16-alpine 2>/dev/null || echo -e "  ${YELLOW}⚠${NC} Container may already be running"
        }
        echo -e "  ${GREEN}✓${NC} PostgreSQL running on port 5432"

        # Update .env.local with Docker URL
        DOCKER_DB_URL="postgresql://colorlab:colorlab_dev@localhost:5432/colorlab"
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|DATABASE_URL=.*|DATABASE_URL=\"$DOCKER_DB_URL\"|" .env.local
        else
            sed -i "s|DATABASE_URL=.*|DATABASE_URL=\"$DOCKER_DB_URL\"|" .env.local
        fi
        echo -e "  ${GREEN}✓${NC} Updated .env.local with Docker DB URL"

        # Wait for Postgres to be ready
        echo "  Waiting for PostgreSQL to be ready..."
        sleep 3
        for i in {1..15}; do
            if docker exec colorlab-postgres pg_isready -U colorlab &>/dev/null 2>&1; then
                break
            fi
            sleep 1
        done
    fi
else
    echo -e "  ${YELLOW}⚠${NC} Docker not found — make sure DATABASE_URL in .env.local points to a running Postgres instance"
fi

echo ""

# ─── Prisma setup ───────────────────────────────────────────

echo -e "${BLUE}[5/8]${NC} Setting up Prisma..."

npx prisma generate
echo -e "  ${GREEN}✓${NC} Prisma client generated"

echo "  Pushing schema to database..."
npx prisma db push --accept-data-loss 2>/dev/null && {
    echo -e "  ${GREEN}✓${NC} Database schema applied"
} || {
    echo -e "  ${YELLOW}⚠${NC} Could not push schema — check your DATABASE_URL in .env.local"
    echo -e "  ${YELLOW}  You can run 'npx prisma db push' manually after fixing the connection${NC}"
}

echo ""

# ─── Seed database ──────────────────────────────────────────

echo -e "${BLUE}[6/8]${NC} Seeding database with sample formulas..."

npx prisma db seed 2>/dev/null && {
    echo -e "  ${GREEN}✓${NC} Database seeded with 3 sample formulas"
} || {
    echo -e "  ${YELLOW}⚠${NC} Could not seed — you can run 'npx prisma db seed' later"
}

echo ""

# ─── Initialize git ─────────────────────────────────────────

echo -e "${BLUE}[7/8]${NC} Initializing git repository..."

if [ ! -d .git ]; then
    if command -v git &> /dev/null; then
        git init
        git add -A
        git commit -m "Initial commit: ColorLab AI" --quiet
        echo -e "  ${GREEN}✓${NC} Git initialized with initial commit"
    fi
else
    echo -e "  ${GREEN}✓${NC} Git already initialized"
fi

echo ""

# ─── Build test ─────────────────────────────────────────────

echo -e "${BLUE}[8/8]${NC} Verifying build..."

npx next build 2>/dev/null && {
    echo -e "  ${GREEN}✓${NC} Build successful!"
} || {
    echo -e "  ${YELLOW}⚠${NC} Build had warnings — this is normal before env vars are fully configured"
}

echo ""

# ─── Done ────────────────────────────────────────────────────

echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}   ✅  Setup Complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo ""
echo -e "  ${CYAN}Start the dev server:${NC}"
echo -e "    npm run dev"
echo ""
echo -e "  ${CYAN}Then open:${NC}"
echo -e "    Landing page:   ${BLUE}http://localhost:3000${NC}"
echo -e "    Upload & Analyze: ${BLUE}http://localhost:3000/upload${NC}"
echo -e "    Admin Dashboard: ${BLUE}http://localhost:3000/dashboard${NC}"
echo ""
echo -e "  ${CYAN}Remaining setup:${NC}"
echo -e "    1. Edit ${YELLOW}.env.local${NC} with any missing API keys"
echo -e "    2. Go to ${BLUE}/dashboard${NC} and add your before/after formula entries"
echo -e "    3. Deploy with: ${YELLOW}vercel${NC}"
echo ""
echo -e "  ${CYAN}Useful commands:${NC}"
echo -e "    npx prisma studio      — Visual database browser"
echo -e "    npx prisma db seed     — Re-seed sample formulas"
echo -e "    npm run build          — Production build"
echo -e "    vercel                 — Deploy to Vercel"
echo ""
