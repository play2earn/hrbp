const fs = require('fs');

const file = './components/Dashboard.tsx';
let data = fs.readFileSync(file, 'utf8');
const originalData = data;

try {
    // 1. Replacements for Phase 1 (Constants & Types)
    const importsToAdd = `import type { DashboardProps } from './dashboard/dashboardTypes';
import { 
  COLORS, BU_COLOR_MAP, BU_FALLBACK_COLORS, BU_COLORS, 
  LOG_LABELS, STATUS_LABELS, 
  getBuChartColor, getBuColor, getStatusLabel, getStatusBadgeClass, 
  isInterviewScheduledStatus, isClosedStatus, getMilitaryStatusLabel
} from './dashboardConstants';
import { ApplicationDetailModal } from './dashboard/ApplicationDetailModal';
import { ApplicationEditModal } from './dashboard/ApplicationEditModal';
import { ApplicationActionModals } from './dashboard/ApplicationActionModals';
import { OverviewTab } from './dashboard/OverviewTab';
`;

    data = data.replace('export interface DashboardProps {', '// Replaced DashboardProps');
    data = data.replace('  role: string;\n  onLogout: () => void;\n}', '');
    data = data.replace("const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444'];", importsToAdd);

    // Remove BU_COLORS block
    const startConstants = data.indexOf('// BU color mapping');
    const endConstants = data.indexOf('export const Dashboard: React.FC');
    if (startConstants !== -1 && endConstants !== -1) {
        data = data.substring(0, startConstants) + data.substring(endConstants);
    }

    // 2. OverviewTab replacement
    const startOverviewToken = "          {activeTab === 'overview' && (";
    const startOverview = data.indexOf(startOverviewToken);
    if (startOverview !== -1) {
        // We know it ends before QR code config
        const endOverviewToken = "          {activeTab === 'qr' && (";
        const endOverview = data.indexOf(endOverviewToken, startOverview);

        if (endOverview !== -1) {
            // Find the last )} before activeTab === 'qr'
            const activeTabOverviewStr = data.substring(startOverview, endOverview);
            const lastBracket = activeTabOverviewStr.lastIndexOf(')}');

            const newOverview = `          {activeTab === 'overview' && (
            <OverviewTab
              stats={stats}
              fetchData={fetchData}
              applications={filteredData}
              positions={positions}
              departments={departments}
              businessUnits={businessUnits}
              channels={channels}
              appFilters={appFilters}
              setAppFilters={setAppFilters}
              appPage={appPage}
              setAppPage={setAppPage}
              totalAppPages={totalAppPages}
              actionMenu={actionMenu}
              setActionMenu={setActionMenu}
              setViewingApp={setViewingApp}
              setEditingApp={setEditingApp}
              setClaimingApp={setClaimingApp}
              setTransferringApp={setTransferringApp}
              setUnassigningApp={setUnassigningApp}
              setInterviewingApp={setInterviewingApp}
              setRejectingApp={setRejectingApp}
              setApprovingApp={setApprovingApp}
              handleDeletePrompt={handleDeletePrompt}
              isFetchingMore={isFetchingMore}
              fetchMoreApps={fetchMoreApps}
              hasMoreApps={hasMoreApps}
              currentUserId={currentUserId}
              cardViewApp={cardViewApp}
              setCardViewApp={setCardViewApp}
            />
          )}\n\n`;

            data = data.substring(0, startOverview) + newOverview + data.substring(endOverview);
            console.log('Replaced OverviewTab');
        }
    }

    // 3. Detail Modal replacement
    const startDetail = data.indexOf('{/* View Application Modal - Comprehensive View */}');
    const endDetail = data.indexOf('{/* Action Menu Portal'); // Action Menu portal is after Detail Modal
    if (startDetail !== -1 && endDetail !== -1) {
        data = data.substring(0, startDetail) + `{/* Application Detail Modal */}
      <ApplicationDetailModal
        viewingApp={viewingApp}
        setViewingApp={setViewingApp}
        appLogs={appLogs}
        isLoadingLogs={isLoadingLogs}
        setEditingApp={setEditingApp}
        setClaimingApp={setClaimingApp}
        setTransferringApp={setTransferringApp}
        setUnassigningApp={setUnassigningApp}
        setInterviewingApp={setInterviewingApp}
        setInterviewDate={setInterviewDate}
        setRejectingApp={setRejectingApp}
        setRejectComment={setRejectComment}
        setRejectionReason={setRejectionReason}
        setApprovingApp={setApprovingApp}
      />\n\n      ` + data.substring(endDetail);
        console.log('Replaced Detail Modal');
    } else {
        // Action menu portal might be further down or different. Let's just find the very next </Modal> wait..
        // Detail Modal starts around 1748. Next modal is Edit.
        const startEdit = data.indexOf('{/* Edit Application Modal */}');
        if (startDetail !== -1 && startEdit !== -1) {
            data = data.substring(0, startDetail) + `{/* Application Detail Modal */}
      <ApplicationDetailModal
        viewingApp={viewingApp}
        setViewingApp={setViewingApp}
        appLogs={appLogs}
        isLoadingLogs={isLoadingLogs}
        setEditingApp={setEditingApp}
        setClaimingApp={setClaimingApp}
        setTransferringApp={setTransferringApp}
        setUnassigningApp={setUnassigningApp}
        setInterviewingApp={setInterviewingApp}
        setInterviewDate={setInterviewDate}
        setRejectingApp={setRejectingApp}
        setRejectComment={setRejectComment}
        setRejectionReason={setRejectionReason}
        setApprovingApp={setApprovingApp}
      />\n\n      ` + data.substring(startEdit);
            console.log('Replaced Detail Modal');
        }
    }

    // 4. Edit Modal
    const startEdit2 = data.indexOf('{/* Edit Application Modal */}');
    const startApprove = data.indexOf('{/* Approve Application Dialog */}');
    if (startEdit2 !== -1 && startApprove !== -1) {
        data = data.substring(0, startEdit2) + `{/* Edit Application Modal */}
      <ApplicationEditModal
        editingApp={editingApp}
        setEditingApp={setEditingApp}
        editForm={editForm}
        setEditForm={setEditForm}
        departments={departments}
        positions={positions}
        businessUnits={businessUnits}
        channels={channels}
        currentUserId={currentUserId}
        currentUserName={currentUserName}
        showToast={showToast}
        fetchData={fetchData}
      />\n\n      ` + data.substring(startApprove);
        console.log('Replaced Edit Modal');
    }

    // 5. Action Modals
    const startActions = data.indexOf('{/* Approve Application Dialog */}');
    // Confirm Delete Action is the last Action modal, but it ends with </Modal>
    if (startActions !== -1) {
        const endStr = '{/* Confirm Delete Action */}';
        const startConfirmDelete = data.indexOf(endStr);
        if (startConfirmDelete !== -1) {
            const endOfModals = data.indexOf('</Modal>', startConfirmDelete) + 8;
            data = data.substring(0, startActions) + `{/* Action Modals Collection */}
      <ApplicationActionModals
        approvingApp={approvingApp}
        setApprovingApp={setApprovingApp}
        claimingApp={claimingApp}
        setClaimingApp={setClaimingApp}
        transferringApp={transferringApp}
        setTransferringApp={setTransferringApp}
        unassigningApp={unassigningApp}
        setUnassigningApp={setUnassigningApp}
        interviewingApp={interviewingApp}
        setInterviewingApp={setInterviewingApp}
        interviewDate={interviewDate}
        setInterviewDate={setInterviewDate}
        rejectingApp={rejectingApp}
        setRejectingApp={setRejectingApp}
        rejectComment={rejectComment}
        setRejectComment={setRejectComment}
        rejectionReason={rejectionReason}
        setRejectionReason={setRejectionReason}
        actionLoading={actionLoading}
        currentUserId={currentUserId}
        currentUserName={currentUserName}
        showToast={showToast}
        fetchData={fetchData}
        setViewingApp={setViewingApp}
        deletePromptApp={deletePromptApp}
        setDeletePromptApp={setDeletePromptApp}
      />\n` + data.substring(endOfModals);
            console.log('Replaced Action Modals');
        }
    }

    fs.writeFileSync(file, data);
    console.log('Complete');
} catch (e) {
    fs.writeFileSync(file, originalData);
    console.error(e);
}
