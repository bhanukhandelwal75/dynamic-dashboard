# AML Operations Dashboard — Complete Knowledge Base

> **Project:** Paytm AML Operations Dashboard  
> **Owner:** Bhanu Khandelwal (`bhanu.khandelwal@paytmpayments.com`)  
> **GitHub Repo:** `bhanukhandelwal75/dynamic-dashboard` (branch: `main`)  
> **Live URL:** Vercel (auto-deploys on every push to `main`)  
> **Last Updated:** June 2026

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack & Dependencies](#2-tech-stack--dependencies)
3. [Directory Structure](#3-directory-structure)
4. [Architecture & Routing](#4-architecture--routing)
5. [Authentication System](#5-authentication-system)
6. [Global State — DataContext](#6-global-state--datacontext)
7. [Data Pipeline](#7-data-pipeline)
8. [All Pages — Detailed Reference](#8-all-pages--detailed-reference)
9. [Shared Components](#9-shared-components)
10. [Utility Functions](#10-utility-functions)
11. [Proxy Server](#11-proxy-server)
12. [Deployment](#12-deployment)
13. [Known Issues & Gotchas](#13-known-issues--gotchas)
14. [How To — Common Tasks](#14-how-to--common-tasks)

---

## 1. Project Overview

This is a **React 19 Single-Page Application (SPA)** built as an internal operations dashboard for the AML (Anti-Money Laundering) team at Paytm Payments Bank. It is used by analysts, team leads, and compliance officers to:

- Monitor case productivity and analyst performance
- Analyze case ageing and TAT (Turn-Around-Time) breaches
- Extract merchant data from the Boss API and Jocata platform
- Perform MID reconciliation between Boss and Jocata systems
- Run QC checklist analysis on analyst comments
- Screen merchant names against SSG databases
- Access AML training modules with knowledge checks

The app is **completely client-side** — no backend database. Data comes from uploaded Excel/CSV files or API calls via a local CORS proxy server.

---

## 2. Tech Stack & Dependencies

### Runtime Dependencies

| Package | Version | Purpose |
|---|---|---|
| `react` | ^19.2.4 | UI framework |
| `react-dom` | ^19.2.4 | DOM renderer |
| `chart.js` | ^4.5.1 | Charts (bar, line, doughnut) |
| `react-chartjs-2` | ^5.3.1 | React wrapper for Chart.js |
| `xlsx` | ^0.18.5 | Read Excel/CSV files; basic write |
| `xlsx-js-style` | ^1.2.0 | Write styled Excel files (use this for exports with colors/borders) |
| `papaparse` | ^5.5.3 | CSV parsing (used in MIDReconciliation) |
| `html2canvas` | ^1.4.1 | Screenshot DOM elements for PDF export |
| `jspdf` | ^4.2.1 | Generate PDF files from canvas |
| `axios` | ^1.15.2 | HTTP client |
| `express` | ^5.2.1 | Used in proxy_server.cjs |
| `cors` | ^2.8.6 | CORS middleware in proxy server |
| `nodemailer` | ^8.0.7 | Email OTP sending in proxy server |
| `lucide-react` | ^1.11.0 | SVG icon library |
| `cheerio` | ^1.2.0 | Server-side HTML parsing |
| `body-parser` | ^2.2.2 | Request body parsing in proxy |

### Dev Dependencies

| Package | Purpose |
|---|---|
| `vite` ^8.0.1 | Build tool & dev server |
| `@vitejs/plugin-react` ^6.0.1 | Vite React plugin (Babel/SWC transforms) |
| `eslint` | Linting |

### Key Ports

| Service | Port |
|---|---|
| Vite dev server | `5173` |
| Proxy/OTP server | `3001` |
| Python backend (logging) | `5050` |

### NPM Scripts

```bash
npm run dev       # Start Vite dev server on :5173
npm run build     # Production build → dist/
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

---

## 3. Directory Structure

```
dynamic-dashboard/
├── src/
│   ├── App.jsx                     # Root component — layout + state-based routing
│   ├── main.jsx                    # ReactDOM.createRoot entry point
│   ├── index.css                   # ALL global CSS (single file, ~2000+ lines)
│   ├── App.css                     # (legacy, mostly unused)
│   │
│   ├── context/
│   │   └── DataContext.jsx         # Global state: auth, data, filters, upload
│   │
│   ├── utils/
│   │   ├── dataUtils.js            # detectCols, enrichRow, pDate, splitCSVLine, getMonthKey
│   │   ├── exportPdf.js            # exportToPdf() — html2canvas + jsPDF pipeline
│   │   └── Bossextracter_mid.html  # Standalone HTML tool for Boss MID extraction
│   │
│   ├── components/
│   │   ├── Sidebar.jsx             # Left nav + sheet selector + user card
│   │   ├── KpiCard.jsx             # Metric card component
│   │   ├── ChartCard.jsx           # Chart wrapper card
│   │   ├── FilterBar.jsx           # Month/user/level/status filter dropdowns
│   │   ├── ExportButton.jsx        # PDF export trigger button
│   │   └── Pagination.jsx          # Table pagination controls
│   │
│   ├── pages/
│   │   ├── LoginPage.jsx           # Two-step login: password → OTP
│   │   ├── Dashboard.jsx           # Executive dashboard — KPIs + charts
│   │   ├── Productivity.jsx        # Analyst productivity metrics & scoreboard
│   │   ├── Ageing.jsx              # Case ageing bucket analysis
│   │   ├── TeamView.jsx            # Workload heatmap + searchable case table
│   │   ├── MerchantAnalyzer.jsx    # L3 comment / transaction analysis (no DataContext)
│   │   ├── MerchantAnalyzer.css    # Scoped CSS for MerchantAnalyzer
│   │   ├── BossExtractor.jsx       # MID bulk extraction from Boss API (hidden in sidebar)
│   │   ├── bossExtractor.css       # Scoped CSS for BossExtractor
│   │   ├── Training.jsx            # AML training — 5 modules + quiz
│   │   ├── NameScreening.jsx       # SSG name screening (entire tool in an iframe)
│   │   ├── QCSampling.jsx          # Placeholder — "Coming Soon"
│   │   ├── QCSampling.css          # CSS for QCSampling
│   │   ├── MIDReconciliation.jsx   # Boss vs Jocata MID reconciliation
│   │   ├── JocataExtractor.jsx     # Jocata platform data extractor
│   │   ├── JocataExtractor.css     # Scoped CSS for JocataExtractor
│   │   ├── RuleEngine.jsx          # AML rule-based automation engine
│   │   ├── QCChecklistAnalyzer.jsx # QC checklist response analyzer
│   │   └── L1CommentMaker.jsx      # (exists but not wired to sidebar or App.jsx)
│   │
│   └── assets/
│       ├── hero.png
│       ├── react.svg
│       └── vite.svg
│
├── doc/
│   └── KNOWLEDGE_BASE.md           # This file
│
├── public/                         # Static assets served at root
├── index.html                      # Vite HTML entry
├── index1.html                     # Legacy standalone HTML (not part of the React app)
├── practice.html                   # Scratch/practice HTML file
├── proxy_server.cjs                # Node.js CORS proxy + OTP email server
├── vite.config.js                  # Vite config: React plugin, proxy /api → :5050
├── package.json
├── eslint.config.js
└── dist/                           # Vite production build output
```

---

## 4. Architecture & Routing

### No React Router — State-Based Navigation

The app uses a **single `activePage` state string** instead of React Router. This is entirely managed in `App.jsx → AppInner`.

```jsx
// App.jsx
const [activePage, setActivePage] = useState('dashboard');

// Sidebar passes onNavigate={setActivePage}
// Each nav item click calls setActivePage(id)
```

### Page ID → Component Mapping

| `activePage` value | Component | Sidebar Label |
|---|---|---|
| `dashboard` | `<Dashboard />` | Executive Dashboard |
| `productivity` | `<Productivity />` | Productivity |
| `ageing` | `<Ageing />` | Ageing Analysis |
| `team` | `<TeamView />` | Team View |
| `analyzer` | `<MerchantAnalyzer />` | L3 Comment Analyzer |
| `boss-extractor` | `<BossExtractor />` | Boss Extractor *(hidden)* |
| `training` | `<Training />` | AML Training |
| `name-screening` | `<NameScreening />` | Name Screening |
| `qc-sampling` | `<QCSampling />` | QC Sampling *(hidden)* |
| `mid-reconciliation` | `<MIDReconciliation />` | MID Reconciliation |
| `jocata-extractor` | `<JocataExtractor />` | Jocata Extractor |
| `rule-engine` | `<RuleEngine />` | Rule Engine |
| `qc-analyzer` | `<QCChecklistAnalyzer />` | QC Checklist Analyzer |

> **Sidebar hidden items:** `boss-extractor` and `qc-sampling` are commented out in `Sidebar.jsx` navItems array. The pages still exist and are wired in `App.jsx` — just not reachable via nav.

### Layout

```
┌─────────────────────────────────────────────┐
│  <Sidebar>  │  <main className="main">       │
│  (left nav) │  {renderPage()}                │
│             │  (active page fills this area) │
└─────────────────────────────────────────────┘
```

Global file upload input (`<input type="file" accept=".csv,.xls,.xlsx">`) lives in `App.jsx`, hidden. Pages call `onUploadClick()` to trigger it. On file select, `handleUpload(file)` from DataContext is called.

---

## 5. Authentication System

### Users (Hardcoded in DataContext.jsx)

```js
const USERS = {
  deepa: { password: 'deepa123', name: 'Deepa',            role: 'Chief Principal Officer', email: 'deepa1.pandey@paytmpayments.com' },
  bhanu: { password: 'bhanu123', name: 'Bhanu Khandelwal', role: 'Sr. Analyst',              email: 'bhanu.khandelwal@paytmpayments.com' },
  alice: { password: 'bhesh123', name: 'Bhesh',            role: 'Sr. Analyst',              email: 'bhesh.sahu@paytmpayments.com' },
};
```

### Special Admin Bypass (No OTP)

```js
// Login with: username = "admin", password = "admin123"
// Skips OTP entirely, logs in as Test Admin
// Fires a POST to :5050/api/log-admin (Python backend, optional)
```

### Two-Step Login Flow

**Step 1 — Password check (`doLogin`)**
1. User enters username/email + password
2. `doLogin()` in DataContext matches against `USERS`
3. If credentials valid → POST to `http://localhost:3001/api/send-otp` with user's email
4. Proxy server sends OTP via nodemailer
5. Returns `{ success: true, requiresOTP: true, email, userId, user }`

**Step 2 — OTP verification (`verifyOTP`)**
1. User enters 6-digit OTP
2. `verifyOTP()` → POST to `http://localhost:3001/api/verify-otp`
3. On success → `setCurrentUser(user)` + save to `sessionStorage` key `aml_user`
4. Also fires POST to `:5050/api/log-login` (Python logging backend, optional)
5. React re-renders with `currentUser` set → `App.jsx` shows dashboard

**Logout (`doLogout`)**
- Clears `sessionStorage.aml_user`
- Resets all data state (rawData, filters, etc.)

**Session persistence:** Login state stored in `sessionStorage` (survives HMR/refresh, not tab close).

**OTP resend:** 30-second countdown timer; resend button calls `:3001/api/send-otp` again directly.

---

## 6. Global State — DataContext

**File:** `src/context/DataContext.jsx`

All pages consume this via `useData()`. The context wraps the entire app via `<DataProvider>` in `App.jsx`.

### State Variables

| State | Type | Description |
|---|---|---|
| `currentUser` | `object\|null` | Logged-in user object `{name, role, email}` |
| `rawData` | `array` | All enriched rows from uploaded file |
| `filteredData` | `array` | Rows after applying filters |
| `dataHeaders` | `array` | Column header names from uploaded file |
| `CM` | `object` | Column Map — maps semantic keys to actual column names |
| `workbook` | `object\|null` | XLSX workbook object (for multi-sheet files) |
| `sheetNames` | `array` | All sheet names in uploaded workbook |
| `activeSheet` | `number` | Index of currently active sheet |
| `fileName` | `string` | Name of uploaded file |
| `activeSheetName` | `string` | Name of currently active sheet |
| `filters` | `object` | `{ month: '', user: '', level: '', status: '' }` |

### Exposed Functions

| Function | Signature | Description |
|---|---|---|
| `doLogin` | `(idOrEmail, pass) → Promise` | Step 1 auth — validates credentials, sends OTP |
| `verifyOTP` | `(email, otp, user) → Promise` | Step 2 auth — verifies OTP, sets currentUser |
| `doLogout` | `() → void` | Clears user + all data state |
| `handleUpload` | `(file) → void` | Processes uploaded CSV/XLS/XLSX |
| `switchSheet` | `(idx) → void` | Switch active sheet in multi-sheet workbook |
| `applyFilters` | `(newFilters) → void` | Applies filter object, updates filteredData |
| `resetFilters` | `() → void` | Resets all filters, restores filteredData = rawData |
| `setFilters` | `(filters) → void` | Raw setter (exposed for direct use) |
| `setFilteredData` | `(data) → void` | Raw setter (exposed for direct use) |

---

## 7. Data Pipeline

### Upload Flow

```
User picks file → App.jsx hidden input → handleUpload(file)
    ├── .csv  → readCSV()  → FileReader.readAsText()
    └── .xlsx → readExcel() → FileReader.readAsArrayBuffer() → XLSX.read()
                    ↓
              loadSheetByIdx(wb, 0, fname)
                    ↓
              processData(rows, headers, fname, sheetName)
                    ↓
              detectCols(headers) → CM (Column Map)
                    ↓
              rows.map(r => enrichRow(r, CM)) → enriched rows
                    ↓
              setRawData(enriched), setFilteredData(enriched)
```

### Column Detection — `detectCols(headers)` in `dataUtils.js`

Fuzzy-matches header names to semantic keys. Returns a **Column Map (CM)**:

```js
CM = {
  user:        'user_name',          // analyst name column
  level:       'investigation_level', // L1/L2/L3 column
  status:      'disposition_status', // case status column
  subStatus:   'case_sub_status',
  custType:    'customer_type',
  custName:    'customer_name',
  custId:      'customer_id',        // also matches 'kyb'
  createdDate: 'created_date',
  lastAction:  'last_action_date',
  comments:    'comments',           // also 'Comments'
  caseId:      'casenumber',
  month:       'month1',
  actionType:  'action_type',
  ageing:      'ageing',
  l3User:      'l3_user',
  l2User:      'l2_user',
  l1User:      'l1_user',
}
```

Matching is **case-insensitive**, ignores spaces/underscores. Uses `includes()` for partial matching.

### Row Enrichment — `enrichRow(row, CM)` in `dataUtils.js`

Adds computed `_` fields to every row:

| Field | Type | Description |
|---|---|---|
| `_created` | `Date\|null` | Parsed `createdDate` column value |
| `_lastAct` | `Date\|null` | Parsed `lastAction` column value |
| `_ageing` | `number\|null` | Days between `_created` and `_lastAct` (≥0) |
| `_level` | `'L1'\|'L2'\|'L3'\|'OTHER'` | Normalized investigation level |
| `_closed` | `boolean` | Status matches 'close' or 'close - previous sar' or 'complet*' |
| `_open` | `boolean` | Status exactly matches 'open' |
| `_str` | `boolean` | Status exactly matches 'raise str' |
| `_mid` | `string` | MID extracted from comments via regex: `MID\s*[-:]\s*([A-Za-z0-9]+?)(?=Entity|$)` |

### Date Parsing — `pDate(val)` in `dataUtils.js`

Handles all common date formats:
- Unix timestamp (13+ digits)
- Excel serial number (5-6 digits) → `(serial - 25569) * 86400 * 1000`
- `DD/MM/YYYY` or `DD-MM-YYYY`
- `YYYY-MM-DD`
- Native `Date` object (pass-through)

### Filtering Logic

`applyFilters({ month, user, level, status })` chains 4 sequential filters:
- `month`: matches `CM.month` column value OR `_created.toISOString().slice(0,7)`
- `user`: matches `CM.user` column value
- `level`: matches `_level` enriched field
- `status`: matches `CM.status` column value

---

## 8. All Pages — Detailed Reference

### 8.1 LoginPage (`pages/LoginPage.jsx`)

Two-screen login flow:

**Screen 1 (Password):**
- Inputs: Email/Username + Password (show/hide toggle)
- Submit: calls `doLogin()` from DataContext
- On success with `requiresOTP: true` → transitions to OTP screen
- Admin shortcut: `admin` / `admin123` bypasses OTP

**Screen 2 (OTP):**
- Input: 6-digit OTP (numeric only, auto-filter)
- Submit: calls `verifyOTP()` from DataContext
- On success: logs to `:5050/api/log-login`, React re-renders to dashboard
- Resend OTP: 30-second cooldown, calls `:3001/api/send-otp` directly
- Back button: returns to password screen

---

### 8.2 Dashboard (`pages/Dashboard.jsx`)

**Purpose:** Executive KPI overview + charts for the uploaded data file.

**Data source:** `filteredData` from DataContext (falls back to `rawData`).

**Key imports:** `KpiCard`, `FilterBar`, `ChartCard`, `ExportButton`, `getMonthKey`

**Typical KPIs shown:**
- Total cases, Open cases, Closed cases, STR cases
- TAT compliance metrics
- Level-wise breakdown (L1/L2/L3)

**Charts:** Bar/line charts built with Chart.js via canvas refs (`useRef`). Charts are destroyed and recreated on data change via `destroyChart(ref)` helper.

**Export:** PDF via `exportToPdf()` from `utils/exportPdf.js`.

---

### 8.3 Productivity (`pages/Productivity.jsx`)

**Purpose:** Analyst-level productivity metrics with month filter.

**Data source:** `filteredData` / `rawData` from DataContext.

**Key features:**
- Month selector (local state, not global filters)
- All months derived via `getMonthKey(r, CM)` from `dataUtils.js`
- Analyst scoreboard/ranking table (`scoreRows` state)
- Charts: production bar chart, L1/L2 ageing charts

**Chart refs:** `refProd` (canvas), `refL1Age`, `refL2Age`

---

### 8.4 Ageing (`pages/Ageing.jsx`)

**Purpose:** Case ageing analysis — bucket distribution + TAT by analyst/level.

**Data source:** `filteredData` / `rawData` from DataContext.

**Ageing buckets:** `0-10`, `11-15`, `16-25`, `26-30`, `30+` (days)

**Key computations:**
- Open cases with valid `_ageing` field
- Monthly summary by level (L1/L2/L3)
- TAT badge (compliance percentage)

**Charts:** Ageing buckets bar chart + TAT compliance chart

---

### 8.5 TeamView (`pages/TeamView.jsx`)

**Purpose:** Workload heatmap (analyst × month) + searchable/paginated case explorer.

**Data source:** `filteredData` / `rawData` + `CM` from DataContext.

**Heatmap:**
- Rows = unique analysts (`CM.user`)
- Columns = unique months
- Cell color based on case count (4 intensity levels: `#1a73e8` → `#f0f2f5`)

**Case table:**
- Search box filters all columns
- Pagination: 15 rows/page via `Pagination` component
- Status pills: green (closed), red (open), gray (other)
- Ageing color: red (>30 days), amber (>14), green (≤14)

**Exports:** PDF via ExportButton.

---

### 8.6 MerchantAnalyzer (`pages/MerchantAnalyzer.jsx`)

**Purpose:** L3 comment analyzer + transaction data analysis. **Standalone — does NOT use DataContext.** Has its own file upload.

**Data source:** Self-contained file upload, parses its own Excel/CSV.

**Key helpers (all local):**
- `nk(k)` — normalize key (lowercase, remove spaces/dashes)
- `buildColMap(rows)` — builds own column map
- `col(cm, alias)` — fuzzy column lookup
- `gv(row, cm, alias)` — safe value getter
- `gDate/gHour/isNightRow/gAmt/gSettled` — transaction field extractors

**Features:**
- Transaction-level analysis (amounts, settlement, night transactions)
- Chart.js charts for transaction patterns
- Comment quality analysis

**CSS:** `MerchantAnalyzer.css` (scoped)

---

### 8.7 BossExtractor (`pages/BossExtractor.jsx`)

**Purpose:** Bulk MID extraction from the Boss API via CORS proxy.

**Status:** Currently **hidden in sidebar** (commented out in `Sidebar.jsx` navItems).

**How it works:**
- User provides a list of MIDs
- Each MID is queried against Boss API via `http://localhost:3001/proxy`
- Results compiled and exported to Excel

**Requires:** `proxy_server.cjs` running on port 3001 with Boss session cookies.

**CSS:** `bossExtractor.css`

---

### 8.8 Training (`pages/Training.jsx`)

**Purpose:** AML training modules — 5 modules + final quiz.

**No DataContext dependency.** Fully self-contained static content.

**Sections:**

| ID | Module |
|---|---|
| `overview` | Overview |
| `module1` | M1: Regulatory Framework |
| `module2` | M2: KYC / CDD / EDD |
| `module3` | M3: Name Screening |
| `module4` | M4: Transaction Monitoring |
| `module5` | M5: STR Filing |
| `quiz` | Assessment |

**Knowledge Check component:** Interactive MCQ — click to select, instant feedback with correct answer explanation. Once answered, cannot be changed.

**Key compliance facts (hardcoded):**
- FATF Recommendation 20 = STR filing obligation
- PEP = EDD + senior management approval required
- STR workflow: PO approval in Centra (Jocata) → upload to Fingate 2.0
- L1 cannot definitively close → escalate to L2

---

### 8.9 NameScreening (`pages/NameScreening.jsx`)

**Purpose:** SSG name screening tool. The entire tool is an HTML page rendered inside an `<iframe>` using a `srcDoc` blob URL.

**Implementation:** `htmlContent` is a large template string containing a full HTML page with:
- Tailwind CSS (via CDN)
- PapaParse (via CDN)
- Lucide icons (via CDN)
- Drag-and-drop CSV upload
- In-browser processing logic

**No backend required.** Runs entirely client-side within the iframe.

---

### 8.10 QCSampling (`pages/QCSampling.jsx`)

**Status:** Placeholder stub. Returns `<div>QC Sampling - Coming Soon</div>`.

**Sidebar:** Hidden (commented out in navItems).

---

### 8.11 MIDReconciliation (`pages/MIDReconciliation.jsx`)

**Purpose:** Cross-system MID reconciliation between Boss and Jocata exports.

**Imports:** `papaparse`, `xlsx-js-style`

**How it works:**
1. Upload two files: Boss export + Jocata export
2. Click "Run Reconciliation"
3. Compares MIDs between both systems
4. Shows results in tabs: Active, Inactive, Discrepancy, etc.

**Result tabs:** `activeTab` state controls which tab is shown.

**Export:** Styled Excel via `xlsx-js-style`.

---

### 8.12 JocataExtractor (`pages/JocataExtractor.jsx`)

**Purpose:** Extract case data from the Jocata platform.

**How it works:**
- User provides case IDs, date range, session cookie, CSRF token
- Calls `:3001/api/python/status/:jobId` to poll job progress
- Parses CSV result

**Status:** The main active code is the latest uncommented version. Has polling mechanism via `setInterval` and a `logEndRef` for auto-scrolling logs.

**CSS:** `JocataExtractor.css`

---

### 8.13 RuleEngine (`pages/RuleEngine.jsx`)

**Purpose:** AML rule-based automation engine.

**Imports:** `xlsx` (plain, no styles needed here)

**Key utilities:**
- `findCol(headers, candidates)` — strict then fuzzy column finder
- `parseFile(file, cb)` — reads XLSX, finds header row (scans first 5 rows), returns `[rows, headers]`

**Rule column aliases:**
```js
JUC_MID = ['MID','mid','Mid','merchant_id','merchantid']
JUC_KYB = ['KYBID','kyb_id','KYB_ID','kybid','kyb','KYB','Kybid']
```

---

### 8.14 QCChecklistAnalyzer (`pages/QCChecklistAnalyzer.jsx`)

**Purpose:** Analyzes analyst comment quality against a configurable QC checklist.

**Imports:** `xlsx` (plain)

**Storage:** Checklist config saved to `localStorage` key `qc_checklist_config_v4`.

**DEFAULT_CHECKLIST (21 parameters):**

| Parameter | Example Aliases |
|---|---|
| MID | mid, merchant id, pgmid |
| Business Name | business name, legal name, entity name |
| Account Status | account status, acc status, status |
| Onboarding Date | onboarding date, onboarded |
| Category and Subcategory | category, subcategory |
| Merchant Type | merchant type |
| Business Type | business type |
| Entity Type | entity type, constitution |
| GSTIN | gstin, gst, gst no |
| PAN | business pan, company pan, pan |
| Risk Category | risk category, risk rating |
| Payment Method | payment method, payment mode |
| Shop Photo | shop photo, shop image |
| Documents | documents, document, docs |
| LEA Checks | lea notice, lea, law enforcement |
| FIU Alerts | fiu alerts, fiu alert, fiu |
| Previous STR Filled | previous str, str filled, str filed |
| Public Domain | public domain |
| Physical/Online Business | physical/online business |
| Alerted transaction details | alert trigger, rules triggered, transaction value |
| Comments adequately inputed | conclusion (≥200 chars + Conclusion block) |

**Excel output sheets:**
```js
SHEETS = {
  DASHBOARD: "Dashboard",
  RAW:       "Raw",
  SAMPLING:  "Sampling",
  SUMMARY:   "Checklist Summary",
  METADATA:  "Run Metadata"
}
```

**SVG icons (all inline, no icon library):**
UploadCloud, CheckCircle, AlertCircle, Play, Download, TerminalIco, UsersIco, SettingsIco, RotateIco, XIco, Max2, Min2, TrashIco, JsonIco, UpIco, PctIco

---

## 9. Shared Components

### KpiCard (`components/KpiCard.jsx`)

```jsx
<KpiCard
  label="Total Cases"
  value="1,234"
  sub="As of current filter"
  icon="📊"
  variant="blue-v"    // CSS class applied to .kpi
/>
```

**Variants:** `blue-v`, `green-v`, `amber-v`, `red-v`, `purple-v` (defined in `index.css`)

---

### ChartCard (`components/ChartCard.jsx`)

Wrapper card for Chart.js canvases. Takes `title` prop, renders a styled card container.

---

### FilterBar (`components/FilterBar.jsx`)

Global filter controls. Reads/writes filters via DataContext (`applyFilters`, `resetFilters`).

```jsx
<FilterBar show={['month', 'user', 'level', 'status']} />
// show prop controls which filters are visible
// Default: all four
```

Derives unique values from `rawData` via `useMemo`.

Shows live count: `filteredData.length / rawData.length cases`.

---

### ExportButton (`components/ExportButton.jsx`)

Triggers `exportToPdf()`. Takes `elementId` and `pageTitle` props.

---

### Pagination (`components/Pagination.jsx`)

```jsx
<Pagination
  page={page}
  totalPages={totalPages}
  onPageChange={setPage}
/>
```

---

### Sidebar (`components/Sidebar.jsx`)

- Reads `currentUser`, `doLogout`, `sheetNames`, `activeSheet`, `switchSheet` from DataContext
- Shows sheet selector dropdown only when `sheetNames.length > 1` AND `activePage !== 'analyzer'`
- Active nav item gets `active` CSS class
- Bottom user card shows `currentUser.name[0]` as avatar, name, role, logout button

**Currently hidden nav items (commented out):**
- `boss-extractor`
- `qc-sampling`

---

## 10. Utility Functions

### `dataUtils.js`

```js
detectCols(headers)     → CM object
pDate(val)              → Date | null
enrichRow(row, CM)      → enriched row object with _ fields
splitCSVLine(line)      → string[]  (handles quoted commas)
getMonthKey(row, CM)    → 'YYYY-MM' string | null
```

### `exportPdf.js`

```js
exportToPdf(elementId, pageTitle, subTitle?)
```

**How it works:**
1. Selects DOM element by ID
2. Forces `.kpi-card` backgrounds to `#ffffff` (fixes CSS variable transparency in canvas)
3. Captures via `html2canvas` at 3× scale, white background
4. Creates A4 landscape PDF with jsPDF
5. Adds blue header bar with "Dashboard Panel | AML Operations" + title + export date
6. Slices tall content across multiple pages
7. Downloads as `AML-{PageTitle}-{YYYY-MM-DD}.pdf`

---

## 11. Proxy Server

**File:** `proxy_server.cjs`  
**Start:** `node proxy_server.cjs` (from the `dynamic-dashboard` folder)  
**Port:** `3001`

### Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/send-otp` | POST | Sends 6-digit OTP email via nodemailer |
| `/api/verify-otp` | POST | Verifies OTP against in-memory store |
| `/proxy` | POST | CORS proxy — forwards requests to Boss/Jocata APIs with session cookies |

### OTP Details
- Random 6-digit OTP generated server-side
- Stored in memory (not persistent — server restart invalidates all OTPs)
- OTP expiry: **5 minutes**
- Email sent via nodemailer (configure SMTP in proxy_server.cjs)

### Vite Proxy (for development)

`vite.config.js` proxies `/api` → `http://127.0.0.1:5050` (Python logging backend):
```js
proxy: {
  '/api': {
    target: 'http://127.0.0.1:5050',
    changeOrigin: true,
    secure: false,
  }
}
```

This means in dev, `fetch('/api/...')` goes to the Python server. The OTP proxy at `:3001` is called with full URL `http://localhost:3001/api/...`.

---

## 12. Deployment

### Local Development

```bash
# Terminal 1 — React app
cd dynamic-dashboard
npm run dev          # → http://localhost:5173

# Terminal 2 — Proxy server (needed for login OTP + Boss/Jocata extraction)
node proxy_server.cjs   # → http://localhost:3001
```

### Production (Vercel)

- Connected to GitHub repo: `https://github.com/bhanukhandelwal75/dynamic-dashboard`
- Branch: `main`
- Auto-deploys on every push to `main`
- Build command: `npm run build` (Vite)
- Output directory: `dist`

**Important:** The proxy server (`proxy_server.cjs`) does NOT run on Vercel. Features requiring it (login OTP, Boss Extractor, Jocata Extractor) will not work on the live Vercel URL — they need the local Node server.

### To push changes to Vercel

```bash
git add <file>
git commit -m "your message"
git push origin main
# Vercel auto-triggers deploy in ~1-2 minutes
```

---

## 13. Known Issues & Gotchas

### 1. Filename Casing on macOS vs Linux

macOS filesystem is **case-insensitive**. Linux (Vercel build) is **case-sensitive**.

If you rename a file only by changing case (e.g., `Qcchecklistanalyzer.jsx` → `QCChecklistAnalyzer.jsx`), git on macOS will NOT detect the change. Vercel will fail with "Module not found."

**Fix — Two-step git rename:**
```bash
git mv src/pages/OldName.jsx src/pages/temp_name.jsx
git mv src/pages/temp_name.jsx src/pages/NewName.jsx
git commit -m "fix: rename for Linux casing"
git push origin main
```

### 2. xlsx vs xlsx-js-style

- `import * as XLSX from 'xlsx'` — plain SheetJS. **Ignores `.s` style properties silently.** Use for reading files or plain exports.
- `import * as XLSX from 'xlsx-js-style'` — fork with style support. **Required for colored headers, borders, bold text in Excel exports.**

**Files currently using xlsx-js-style:** `MIDReconciliation.jsx`  
**Files using plain xlsx:** `DataContext.jsx`, `RuleEngine.jsx`, `QCChecklistAnalyzer.jsx`, `MerchantAnalyzer.jsx`

### 3. DataContext.jsx Commented-Out History

The file contains 4+ old implementations as comments (old USERS configs, old auth flows, old filter logic). Only the bottom-most uncommented block is live. This is intentional version history — do not delete unless you're sure.

### 4. TypeScript Casing Warning in VSCode

After file renames, VSCode's TypeScript language server may show:
> `File name 'QCChecklistAnalyzer.jsx' differs from already included file name 'Qcchecklistanalyzer.jsx' only in casing`

This is a **stale cache warning, not a real error**. Fix: `Cmd+Shift+P` → `TypeScript: Restart TS Server`.

### 5. Vercel Shows Old Version After Push

If GitHub shows the new commit but Vercel still shows old UI:
1. Check Vercel dashboard for build status (may be failing or still building)
2. If build failed, click deployment to see error log
3. If Vercel webhook is stuck, push an empty commit: `git commit --allow-empty -m "trigger redeploy" && git push`
4. Try hard refresh: `Cmd+Shift+R`

### 6. L1CommentMaker.jsx Exists But Is Unused

`src/pages/L1CommentMaker.jsx` exists but is **not imported in App.jsx** and **not wired to any route**. It's dead code.

### 7. Admin Login Shows OTP Screen Bug

In `LoginPage.jsx`, the `handleLogin` function has a bug: after the `if (result.requiresOTP)` block that handles the OTP step, there's **duplicate code** that unconditionally sets OTP state and calls `setOtpStep(true)` — this means even admin (requiresOTP: false) will briefly show the OTP screen. This is a known bug.

---

## 14. How To — Common Tasks

### Add a new page

1. Create `src/pages/NewPage.jsx`
2. Import in `App.jsx`: `import NewPage from './pages/NewPage';`
3. Add switch case in `renderPage()`: `case 'new-page': return <NewPage />;`
4. Add to `navItems` array in `Sidebar.jsx`: `{ id: 'new-page', icon: '🆕', label: 'New Page' }`

### Add a new user

Edit `DataContext.jsx`, add to `USERS` object:
```js
newuser: { password: 'pass123', name: 'Full Name', role: 'Analyst', email: 'email@paytmpayments.com' },
```

### Hide a page from sidebar without deleting it

Comment out the nav item in `Sidebar.jsx`:
```js
//{ id: 'page-id', icon: '🔧', label: 'Page Label' },
```
The page is still accessible by manually setting `activePage` state.

### Export data to styled Excel

```js
import * as XLSX from 'xlsx-js-style';

const wb = XLSX.utils.book_new();
const ws = XLSX.utils.aoa_to_sheet([['Header1', 'Header2'], ['Val1', 'Val2']]);

// Apply styles
ws['A1'].s = { font: { bold: true }, fill: { fgColor: { rgb: '1a73e8' } }, font: { color: { rgb: 'FFFFFF' } } };

XLSX.utils.book_append_sheet(wb, ws, 'Sheet Name');
XLSX.writeFile(wb, 'output.xlsx');
```

### Switch active sheet in uploaded workbook

Handled automatically by the sheet selector dropdown in Sidebar. Calls `switchSheet(idx)` from DataContext.

### Run a local build to test before pushing

```bash
cd dynamic-dashboard
npm run build
# If it says "✓ built in Xms" — safe to push
# If it shows errors — fix before pushing
```

### Commit and push all local changes

```bash
git add src/           # or specific file
git commit -m "describe what changed"
git push origin main
```

---

*End of Knowledge Base — keep this file updated as the project evolves.*
