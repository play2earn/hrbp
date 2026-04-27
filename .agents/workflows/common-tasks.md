---
description: Patterns and common workflows inside the HRBP Dashboard React codebase
---

# Common Tasks inside the Recruitment Dashboard

This workflow document outlines how to properly execute common tasks in the HRBP Recruitment App without risking regressions.

## 1. Adding a new Application "Status" (e.g., Background Check)
If the recruitment team decides to map a new state for a candidate's application, do the following:

- **Update `components/dashboard/dashboardConstants.ts`**:
  - Add to `LOG_LABELS` if logging should produce a user-friendly label.
  - Add to `STATUS_LABELS` (ex: `Pending`, `Reviewing`) for standard translation.
  - Ensure `getStatusBadgeClass()` and `getStatusLabel()` accommodate the new status styling.
- **Update the Supabase Enums / Database**:
  - Make sure the remote Database accepts this status type string inside `application_status` constraints or policies if they exist.
- **Update Tab Views**:
  - Open `components/dashboard/OverviewTab.tsx`. Check if table filtering/grouping needs to handle this specific status.

## 2. Invoking Server-side API / Email Functions
- **Do not fetch via Supabase directly inside React Components.** Use the central orchestrator wrapper `lib/api.ts`.
- `api.ts` maps `api.applications.fetch(...)` or `api.auth.updateUserStatus(...)`.
- We use Supabase edge functions to perform complex/auth-dependent routes like Emailing.
  - To send an Interview Email, look for the endpoint call inside `ApplicationActionModals.tsx` -> `InterviewModal`. The underlying function hits the Edge function.
- If you add a new endpoint fetch, add the signature in `lib/api.ts` first, then call `await api.resource.method().`

## 3. Creating a new Tab or Module inside the Dashboard
- **File Hierarchy**: Create the new tab in `components/dashboard/MyNewTab.tsx`.
- **Global State**: If the new tab needs application data, pass it as a prop from `components/Dashboard.tsx`.
- **Routing**: In `Dashboard.tsx`, locate the `activeTab === 'something'` section and append your component underneath.
- Example:
  ```tsx
  {activeTab === 'mynewtab' && (
      <MyNewTab 
         data={applications} 
         onRefresh={fetchData} 
      />
  )}
  ```

## 4. UI Library Protocol
- Always use the predefined components wrapper:
  ```tsx
  import { Card, Button, Modal } from '../UIComponents';
  ```
- Make sure to use Tailwind CSS natively (`className="bg-gray-100 p-4 rounded-lg"`) rather than inline `style={{}}` attributes!
- The system heavily relies on `lucide-react` for iconography. Look at `import { ... } from 'lucide-react';`.
- Modals should heavily separate view vs. layout.

// turbo-all
