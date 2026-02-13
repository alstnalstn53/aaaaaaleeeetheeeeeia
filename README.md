# ALETHEIA

**가림막을 벗기면, 진리가 나타난다.**

대화를 통해 당신의 본질을 발견하는 AI.

---

## 배포 가이드 (15분)

### 1단계: Supabase 설정 (5분)

1. [supabase.com](https://supabase.com) 가입 (GitHub 계정)
2. **New Project** 생성 (이름: aletheia, 비밀번호 설정, 리전: Northeast Asia)
3. 프로젝트가 준비되면 → **SQL Editor** 클릭
4. `setup.sql` 파일 내용 전체를 복사 → 붙여넣기 → **Run** 클릭
5. **Settings → API** 에서 다음 두 값을 복사해둠:
   - `Project URL` → 이게 SUPABASE_URL
   - `anon public` 키 → 이게 SUPABASE_ANON_KEY

### 2단계: GitHub 업로드 (3분)

```bash
# 이 프로젝트 폴더에서
git init
git add .
git commit -m "Aletheia v1.0 beta"

# GitHub에서 새 레포지토리 생성 (aletheia)
git remote add origin https://github.com/[너의계정]/aletheia.git
git branch -M main
git push -u origin main
```

### 3단계: Vercel 배포 (5분)

1. [vercel.com](https://vercel.com) 가입 (GitHub 계정)
2. **Add New → Project** 클릭
3. GitHub에서 `aletheia` 레포 선택 → **Import**
4. **Environment Variables** 섹션에서 3개 추가:

| Key | Value |
|-----|-------|
| `ANTHROPIC_API_KEY` | sk-ant-xxxx... (Anthropic 콘솔에서 발급) |
| `SUPABASE_URL` | https://xxxx.supabase.co (1단계에서 복사) |
| `SUPABASE_ANON_KEY` | eyJxxxx... (1단계에서 복사) |

5. **Deploy** 클릭
6. 완료! `https://aletheia-xxxx.vercel.app` 으로 접속

### 4단계: 테스트

1. 배포된 URL 접속
2. 이름 입력 → 시작
3. Aletheia와 대화
4. 4회 이상 교환 후 → 상단 **Essence** 버튼 클릭
5. Essence Snapshot 확인

---

## 기술 스택

- **Frontend**: HTML, CSS, Vanilla JS
- **Backend**: Vercel Serverless Functions (Node.js)
- **Database**: Supabase (PostgreSQL)
- **AI**: Claude API (Anthropic)

## 비용

- Vercel: 무료
- Supabase: 무료 (500MB)
- GitHub: 무료
- Claude API: 사용량 기반 (~$0.30/대화)

---

*Aletheia v1.0 Beta*
