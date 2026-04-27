---
description: Architecture map and state documentation for the HRBP Dashboard
---

# HRBP Dashboard Architecture

The recruitment dashboard has been refactored into a modular, orchestrator-based structure. This document serves as a technical compass for AI agents interacting with the `Dashboard.tsx` ecosystem.

## Components Map

The top-level orchestrator is `Dashboard.tsx` (~800 lines). It handles global state, route handling (`activeTab`), and top-level data fetching. It passes local context down as props to pure presentation/controller components.

### 1. Modals (`components/dashboard/*Modal.tsx`)
Because Modals sit on top of the layout, their state is often decoupled from the active tab. All Modals are fully extracted.

- **`ApplicationDetailModal.tsx`**: Renders candidate details, status tracking logs, military bilingual statuses, and triggers action modals. Prop `viewingApp` opens it.
- **`ApplicationEditModal.tsx`**: Renders the form for modifying an active Application (`editingApp`). Connects to MasterData sources (business units, channels). Handles "status revert" logic securely.
- **`ApplicationActionModals.tsx`**: This file contains *nine* distinct modals. It groups small modal popups for quick interaction states:
  - `ClaimModal`
  - `UnassignModal`  
  - `TransferModal`
  - `InterviewModal`
  - `ApproveModal`
  - `RejectModal`
  - `DeleteModal`
  - `ConfirmDisableModal`
Extremely useful for keeping the parent DOM unpolluted.

### 2. Tabs (`components/dashboard/*Tab.tsx`)
The `Dashboard.tsx` router switches the main content body based on `activeTab`. Each extracted Tab manages internal view complexity.

- **`OverviewTab.tsx`**: Massive tab. Expects the full applications data pool to compute local pagination and handle rich search/filtering (via `filteredData`). Responsible for applications table/list view and charts.
- **`QRGeneratorTab.tsx`**: Lightweight form logic. Dispatches to QR generator API. Renders logs and controls the local logs table filter map.
- **`UserManagementTab.tsx`**: Visible only when `role === 'admin'`. Handles pending/active users table and Add New User logic. Manages local UI interactions rather than pushing states back to the orchestrator.
- **`ReportsTab.tsx` (Inline)**: Currently relies heavily on API endpoints to paint dashboard metrics.
- **`MasterDataConfig.tsx` (Pre-separated)**: Entire master routing and editing components exist outside in their own class files.

### 3. Utility (`components/dashboard/dashboard*.ts`)
- **`dashboardConstants.ts`**: Colors array constants, fallback BU structures, status label maps, UI helpers (getBuColor, isClosedStatus, etc). Update this *first* if business units or tags evolve!
- **`dashboardTypes.ts`**: Form interface mapping. DashboardProps and generic filters.

## State Ownership Cheat Sheet

| State Item | Owned By | Passed To | Usage Constraint |
|---|---|---|---|
| `applications` Array | `Dashboard.tsx` | `OverviewTab.tsx` | Do not filter in parent! Filter logic in Overview Tab. |
| Pagination state | `OverviewTab.tsx` (Local) | Self | Wait, no. Pagination is local or passed? Currently, it is computed via passed state in `Dashboard.tsx` to handle UI lifting. (Be aware, we pushed everything via explicit react props). |
| Data Dictionaries | `Dashboard.tsx` | Almost all components | Channels, Departments, BusinessUnits |
| Application Status | Database & API | Modals | Action actions must be executed through `api.*` methods to generate audit logs! Do NOT update JS object directly. |

## Important Rules

1. **No direct database updates outside `api.*`.** `Dashboard.tsx` relies exclusively on `lib/api.ts` which calls Supabase DB and Supabase Edge functions (e.g. `send-email`).
2. **Never inline large components in `Dashboard.tsx`.** Maintain the strict orchestrator bounds by placing large features inside `components/dashboard/`.
3. **Be careful with Modal hierarchy.** Modals inside Modals (e.g. Action Modal nested inside Detail Modal) need appropriate state cleanup mechanism via `onClose` callbacks to unmount both appropriately.
