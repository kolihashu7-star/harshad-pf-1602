# Chamunda Digital (CD) - Smart PF Audit & CRM System

## Project Overview
- **Project Name**: Chamunda Digital - Smart PF Audit & CRM System
- **Type**: Full-stack Web Application with Chrome Extension
- **Core Functionality**: Automated PF audit, customer management, PDF report generation, WhatsApp CRM automation
- **Target Users**: PF Consultants, HR Professionals, Admin Users

---

## Tech Stack
- **Frontend**: React.js with Vite, Tailwind CSS
- **Backend**: Node.js with Express
- **Database**: MongoDB (using in-memory mock for demo)
- **PDF Generation**: jsPDF with html2canvas
- **Chrome Extension**: Manifest V3
- **State Management**: React Context API

---

## UI/UX Specification

### Color Palette
- **Primary**: `#1a1a2e` (Deep Navy)
- **Secondary**: `#16213e` (Dark Blue)
- **Accent**: `#e94560` (Coral Red)
- **Success**: `#00d9a5` (Mint Green)
- **Warning**: `#ffc93c` (Golden Yellow)
- **Error**: `#ff6b6b` (Soft Red)
- **Background**: `#0f0f1a` (Near Black)
- **Surface**: `#1f1f35` (Card Background)
- **Text Primary**: `#ffffff`
- **Text Secondary**: `#a0a0b0`

### Typography
- **Font Family**: 'Poppins' for headings, 'Inter' for body
- **Headings**: 24px (h1), 20px (h2), 16px (h3)
- **Body**: 14px regular, 12px small
- **Font Weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

### Layout Structure
- **Sidebar**: Fixed left, 260px width, collapsible
- **Main Content**: Fluid width with max-width 1400px
- **Header**: Fixed top, 64px height
- **Cards**: 16px padding, 12px border-radius, subtle shadow
- **Responsive Breakpoints**: Mobile (<768px), Tablet (768-1024px), Desktop (>1024px)

### Visual Effects
- **Card Shadows**: `0 4px 20px rgba(0, 0, 0, 0.3)`
- **Hover Effects**: Scale 1.02, shadow increase
- **Transitions**: 0.3s ease-in-out
- **Glassmorphism**: Background blur on modals
- **Gradients**: Subtle gradient overlays on headers

---

## Page Structure

### 1. Dashboard (Home)
- **Stats Cards**: Total Customers, Pending Audits, Alerts, Revenue
- **Recent Customers Table**: Last 10 entries with quick actions
- **Alert Summary**: High priority alerts count
- **Quick Actions**: Add Customer, Run Audit, Sync Data

### 2. Customer Management
- **Customer List**: Searchable, sortable table
- **Customer ID Format**: CD-000001 (auto-incrementing)
- **Search Fields**: Name, Mobile, UAN, Customer ID
- **Customer Profile**: Full details, PF history, documents

### 3. Smart Audit
- **Audit Dashboard**: Overview of all audit results
- **Rule Engine Results**:
  - 60-Day Unemployment Rule
  - Service Reset Logic
  - Pension Eligibility (9.5 Years)
  - Transfer Warning
  - 58 Age Rule
  - Missing Contribution Audit

### 4. Admin Panel (Rule Engine)
- **Configurable Settings**:
  - TDS Limit: ₹50,000
  - Service Gap Days: 60 days
  - Advance Gap Days: 60 days
  - Service Years for Pension: 9.5 years
- **Message Templates**: Hindi/English for WhatsApp and Reports

### 5. Reports & PDF
- **Service History Timeline**: Visual graph 2015-2026
- **Employer Rating**: Trust Score based on payment timing
- **TDS & 15G/15H Alerts**: Conditional display
- **Health Score**: 0-100 rating

### 6. WhatsApp CRM
- **Message Templates**: Configurable automated messages
- **Customer Journey**: Timeline of interactions
- **Automation Rules**: Advance alerts, marketing stop

### 7. Settings
- **Google Drive Integration**: OAuth setup
- **Chrome Extension Status**: Connection indicator
- **Admin Profile**: User management

---

## Functionality Specification

### Core Features

#### 1. Customer ID Auto-Generation
- Format: `CD-000001` (prefix + 6-digit counter)
- Auto-increment on each new customer
- Unique constraint in database

#### 2. Search Function
- Real-time search by: Name, Mobile, UAN, Customer ID
- Debounced input (300ms)
- Highlight matched text

#### 3. Cloud Storage (Google Drive)
- Path structure: `Chamunda_Digital/[Customer_ID]/[Report_Name_Date].pdf`
- OAuth2 authentication flow
- Automatic upload on report generation

#### 4. Data Sync (Chrome Extension)
- Manual sync button
- Fetch data from EPFO portal via extension
- Prevent duplicate records (check existing UAN/Member ID)

### Admin Panel Rules

#### TDS Limit
- Default: ₹50,000
- Configurable via admin panel
- Used in PDF report alerts

#### Service Gap Days
- Default: 60 days (Unemployment/Final Settlement)
- Configurable
- Used in unemployment calculation

#### Advance Gap Days
- Default: 60 days (2 months)
- For Form 31 eligibility

#### Service Years for Pension
- Default: 9.5 years (9 years 6 months)
- Sum service from all transferred Member IDs

### Smart Audit Logic

#### 60-Day Unemployment Rule
- Calculate 60 days gap from 'Last Contribution Month'
- Not just Exit Date
- Flag if gap detected without settlement

#### Service Reset Logic
- If Form 19 AND Form 10C = "Settled" for Member ID
- Previous service count = 0
- New service starts from next Company/Member ID

#### Pension Eligibility (9.5 Years)
- Sum service from ALL transferred Member IDs
- If Total ≥ 9.5 years → Alert for Form 10D (Monthly Pension)
- Show warning for non-transferred IDs

#### Transfer Warning
- If multiple Member IDs exist but NOT transferred
- Display "High Alert" message
- Service won't count for pension until transferred

#### 58 Age Rule
- If Age = 58 AND EPS still being deducted → Error
- If Age < 58 → No action
- Calculate from DOB in EPFO data

#### Missing Contribution Audit
- Detect missing months in a year
- Only for records with NO Exit Date
- Flag gap months for investigation

### Smart PDF Report Features

#### Branding
- Chamunda Digital Logo
- Contact Details
- Referral QR Code

#### Service History Timeline
- Linear chart/graph
- Employment periods and gaps
- Date range: 2015-2026

#### Employer Rating (Trust Score)
- Check payment date vs salary date
- If deposit before 15th → "✅ Good Company"
- If deposit after 15th → "⚠️ Delayed Payments"

#### TDS & 15G/15H Alerts
- If Service < 5 years AND Amount ≥ ₹50,000 → "Form 15G/H Mandatory"
- If PAN not linked → "High TDS Alert (34.8%)"

#### Health Score
- Score: 0-100
- Factors: KYC completion, Transfers done, Contributions regular
- Display as progress bar with color coding

### WhatsApp Automation

#### Advance Eligibility Alert
- Trigger: Exactly 2 months after "Illness" (Form 31) settlement
- Message: "Your PF advance is eligible after 2 months..."

#### Marketing Auto-Stop
- Trigger: Form 19 + Form 10C both "Settled"
- Action: Stop all automatic "Advance PF" messages

#### Bank KYC Alert
- Check Bank status
- If NOT "Verified by Employer" → Alert

#### Low Balance Alert
- If withdrawable amount < ₹2,000
- Suggest waiting

---

## Chrome Extension Specification

### Extension Features
- **Manifest Version**: V3
- **Data Extraction**: Content scripts for EPFO pages
- **Fields to Extract**: Name, UAN, Member ID, Father Name, DOJ, DOE, Passbook Balance
- **No Auto-Click**: Only reads data when user visits pages
- **Data Sanitization**: Clean currency symbols, extra spaces
- **Output Format**: JSON
- **API Bridge**: Secure data transfer to backend

### Popup UI
- Detect current EPFO portal
- "Sync to Chamunda Dashboard" button
- Connection status indicator

---

## Acceptance Criteria

### Visual Checkpoints
- [ ] Dark theme with coral accent colors applied consistently
- [ ] Sidebar navigation with icons and labels
- [ ] Cards with proper shadows and hover effects
- [ ] Responsive layout working on mobile/tablet/desktop
- [ ] Loading states and transitions smooth

### Functional Checkpoints
- [ ] Customer ID auto-generates correctly (CD-000001, CD-000002...)
- [ ] Search filters work by Name, Mobile, UAN, Customer ID
- [ ] Admin panel rules are editable and save correctly
- [ ] All 6 audit rules execute and display results
- [ ] PDF generates with all required sections
- [ ] WhatsApp message templates are configurable
- [ ] Chrome extension can extract and sync data

### Performance
- [ ] Page load < 3 seconds
- [ ] Search response < 500ms
- [ ] PDF generation < 5 seconds

---

## File Structure
```
/chamunda-digital
├── /public
│   └── logo.png
├── /src
│   ├── /components
│   │   ├── Sidebar.jsx
│   │   ├── Header.jsx
│   │   ├── StatsCard.jsx
│   │   ├── CustomerTable.jsx
│   │   ├── AuditRuleCard.jsx
│   │   ├── PDFPreview.jsx
│   │   └── WhatsAppPanel.jsx
│   ├── /pages
│   │   ├── Dashboard.jsx
│   │   ├── Customers.jsx
│   │   ├── Audit.jsx
│   │   ├── AdminPanel.jsx
│   │   ├── Reports.jsx
│   │   ├── WhatsApp.jsx
│   │   └── Settings.jsx
│   ├── /context
│   │   └── AppContext.jsx
│   ├── /utils
│   │   ├── auditLogic.js
│   │   ├── pdfGenerator.js
│   │   └── helpers.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── /server
│   └── index.js
├── /extension
│   ├── manifest.json
│   ├── popup.html
│   ├── popup.js
│   ├── content.js
│   └── background.js
├── package.json
├── vite.config.js
└── index.html
```

