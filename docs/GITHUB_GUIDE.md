# GitHub 사용 가이드 - HS-Road 팀원용

이 문서는 HS-Road 프로젝트에 참여하는 비전공자 팀원이 GitHub를 사용해 코드를 공유하는 방법을 설명합니다.

목표는 어렵게 Git을 공부하는 것이 아니라, **내가 맡은 작업을 안전하게 올리고 PR을 만드는 것**입니다.

---

## 0. 전체 흐름

```txt
GitHub 회원가입
→ Git 설치
→ 리포지토리 초대 수락
→ 프로젝트 코드 내려받기
→ 내 브랜치 만들기
→ 작업하기
→ git add
→ git commit
→ git push
→ Pull Request 만들기
→ 전공자/기술 리드가 merge
```

중요한 규칙:

```txt
비전공자는 main, dev 브랜치에 직접 push하지 않습니다.
비전공자는 Pull Request까지만 만듭니다.
merge는 전공자/기술 리드만 합니다.
```

---

## 1. GitHub 회원가입

GitHub는 쉽게 말하면 **코드를 저장하고 공유하는 Google Drive** 같은 서비스입니다.

해야 할 일:

1. GitHub 접속
2. Sign up 클릭
3. 이메일, 비밀번호, 사용자 이름 입력
4. 이메일 인증
5. 로그인
6. 팀장에게 GitHub 아이디 공유

예시:

```txt
제 GitHub 아이디는 hsroad-user 입니다.
```

---

## 2. Git 설치

Git은 내 컴퓨터와 GitHub를 연결해주는 도구입니다.

### Windows

1. Git 공식 사이트에서 Windows용 Git 다운로드
2. 설치 파일 실행
3. 설치 옵션은 대부분 기본값으로 Next 클릭
4. 설치 완료 후 터미널에서 확인

```bash
git --version
```

정상 예시:

```bash
git version 2.xx.x
```

### Mac

터미널에서 확인:

```bash
git --version
```

설치되어 있지 않으면 설치 안내가 뜹니다.

Homebrew를 사용한다면:

```bash
brew install git
```

### Git 사용자 정보 설정

처음 한 번만 설정합니다.

```bash
git config --global user.name "본인이름"
git config --global user.email "GitHub가입이메일"
```

확인:

```bash
git config --global --list
```

---

## 3. VS Code 설치

VS Code는 코드를 편집하는 프로그램입니다.

터미널 열기:

```txt
상단 메뉴 → Terminal → New Terminal
```

단축키:

```txt
Windows: Ctrl + `
Mac: Control + `
```

---

## 4. 리포지토리 초대 수락

팀장이 GitHub 리포지토리에 초대하면 GitHub 알림 또는 이메일이 옵니다.  
초대를 수락하면 프로젝트 코드에 접근할 수 있습니다.

---

## 5. 프로젝트 코드 내려받기

처음 한 번만 합니다.

```bash
git clone 리포지토리주소
cd hs-road
npm install
```

예시:

```bash
git clone https://github.com/team-name/hs-road.git
cd hs-road
npm install
```

---

## 6. 브랜치 이해하기

```txt
main
→ 최종 발표용 안정 버전

dev
→ 개발 내용을 모으는 브랜치

feature/이름이니셜
→ 각자 작업하는 개인 브랜치
```

예시:

```txt
feature/kkm
feature/pmj
feature/kyw
feature/sjh
feature/oym
feature/cym
```

중요:

```txt
main 브랜치 직접 수정 금지
dev 브랜치 직접 수정 금지
내 feature 브랜치에서만 작업
```

---

## 7. 작업 시작 전 최신 코드 받기

```bash
git checkout dev
git pull origin dev
```

뜻:

```txt
git checkout dev
→ dev 브랜치로 이동

git pull origin dev
→ GitHub에 있는 최신 dev 코드를 내 컴퓨터로 가져오기
```

---

## 8. 내 작업 브랜치 만들기

```bash
git checkout -b feature/내이니셜
```

예시:

```bash
git checkout -b feature/kkm
```

이미 만든 브랜치로 이동할 때:

```bash
git checkout feature/kkm
```

---

## 9. 작업하기

VS Code에서 내가 맡은 파일을 수정합니다.

주의:

```txt
내 담당 파일만 수정하기
.env 파일 수정하지 않기
package.json 수정하지 않기
main/dev 브랜치에서 작업하지 않기
다른 팀원 파일을 수정해야 하면 먼저 이야기하기
```

현재 브랜치 확인:

```bash
git branch
```

---

## 10. 변경 파일 확인

```bash
git status
```

자주 봐야 하는 이유:

```txt
내가 수정하지 말아야 할 파일이 바뀌었는지 확인하기 위해서
```

---

## 11. 저장할 파일 고르기

처음에는 아래 명령어를 사용해도 됩니다.

```bash
git add .
```

조금 더 안전한 방법:

```bash
git add 파일경로
```

예시:

```bash
git add src/components/reviews/ReviewForm.tsx
```

---

## 12. 변경 내용 저장하기

```bash
git commit -m "작업 내용"
```

좋은 예시:

```bash
git commit -m "장소 카드 UI 추가"
git commit -m "북마크 버튼 클릭 기능 추가"
git commit -m "리뷰 폼 오류 수정"
```

나쁜 예시:

```bash
git commit -m "수정"
git commit -m "asdf"
git commit -m "완성"
```

---

## 13. GitHub에 올리기

```bash
git push origin 브랜치이름
```

예시:

```bash
git push origin feature/kkm
```

처음 push할 때 아래 안내가 나올 수 있습니다.

```bash
git push --set-upstream origin feature/kkm
```

이 경우 안내에 나온 명령어를 그대로 복사해서 실행합니다.

---

## 14. Pull Request 만들기

PR은 **내 작업을 dev 브랜치에 합쳐달라고 요청하는 것**입니다.

절차:

1. GitHub 리포지토리 접속
2. Pull requests 탭 클릭
3. New pull request 클릭
4. base를 `dev`로 선택
5. compare를 내 브랜치로 선택
6. 제목 작성
7. 작업 내용 작성
8. Create pull request 클릭

가장 중요한 설정:

```txt
base: dev
compare: feature/내브랜치
```

잘못된 설정:

```txt
base: main
compare: feature/내브랜치
```

---

## 15. git merge란?

merge는 브랜치의 작업 내용을 다른 브랜치에 합치는 것입니다.

예시:

```txt
feature/oym에서 만든 리뷰 기능
→ dev 브랜치에 합치기
```

우리 팀 규칙:

```txt
비전공자는 merge하지 않습니다.
전공자/기술 리드만 merge합니다.
```

---

## 16. 매일 작업 순서 요약

처음 한 번만:

```bash
git clone 리포지토리주소
cd hs-road
npm install
```

매일 작업 시작:

```bash
git checkout dev
git pull origin dev
git checkout -b feature/내이니셜
```

이미 브랜치가 있으면:

```bash
git checkout feature/내이니셜
```

작업 후:

```bash
git status
git add .
git commit -m "작업 내용"
git push origin feature/내이니셜
```

마지막:

```txt
GitHub에서 PR 만들기
base: dev
compare: feature/내이니셜
```

---

## 17. 자주 나오는 문제

### git: command not found

Git이 설치되지 않았거나 터미널이 Git을 찾지 못하는 상태입니다.

해결:

```txt
Git 설치 확인
터미널 재시작
git --version 실행
```

### npm: command not found

Node.js가 설치되지 않은 상태입니다.

해결:

```txt
Node.js 설치
터미널 재시작
npm --version 실행
```

### Permission denied

GitHub 권한 또는 로그인 문제입니다.

해결:

```txt
리포지토리 초대 수락 확인
GitHub 계정 확인
팀장에게 권한 확인 요청
```

### Merge conflict

같은 파일의 같은 부분을 여러 사람이 수정해서 충돌이 난 상태입니다.

해결:

```txt
혼자 해결하지 않기
BRANCH_CONFLICT_GUIDE.md를 보고 상황 정리하기
```

---

## 18. 한 줄 요약

```txt
내 브랜치에서 작업하고, push하고, PR만 만든다.
merge는 기술 리드가 한다.
```
