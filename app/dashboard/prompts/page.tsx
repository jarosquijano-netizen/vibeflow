import DashboardShell from '@/components/layout/DashboardShell';
import PromptLibrary from '@/components/prompts/PromptLibrary';

export default function PromptsPage() {
  return (
    <DashboardShell title="Prompt Library" breadcrumb="Dashboard / Prompt Library">
      <PromptLibrary />
    </DashboardShell>
  );
}
