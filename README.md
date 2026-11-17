<div align="center">
  <h1 align="center">Rich Calendar Demo</h1>
</div>

<br />

데모페이지: https://demo.richcalendar.kro.kr/
RichCalendar GitHub: https://github.com/spare8433/rich-calendar_FE

## E2E 테스트

E2E 테스트는 Playwright로 실제 브라우저에서 앱을 실행해 확인합니다. 최초 1회 Chromium 브라우저를 설치한 다음 테스트를 실행하세요.
Windows PowerShell에서 실행 정책 때문에 `pnpm` 스크립트 실행이 차단되면 명령의 `pnpm`을 `pnpm.cmd`로 바꿔 실행하세요.

```bash
pnpm exec playwright install chromium
pnpm test:e2e
```

`pnpm test:e2e`는 테스트 서버를 자동으로 시작하고 종료합니다. `/e2e`에는 제공된 26개 TC(TC-CAL-UC-002~028 중 001·008 제외)의 브라우저 검증이 포함되어 있습니다. TC-012·013의 새로고침 후 데이터 유지는 데모가 메모리 상태만 사용해 예상 실패로 표시되며, TC-028은 태그 필터가 사이드 메뉴에 적용되지 않는 현재 동작을 예상 실패로 기록합니다. 실패한 테스트의 브라우저 추적 파일은 `test-results`에 저장되며, 보고서는 다음 명령으로 열 수 있습니다.

```bash
pnpm exec playwright show-report
```