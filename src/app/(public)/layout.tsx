import VisitTracker from '@/components/public/VisitTracker';
import FixedBackground from '@/components/public/FixedBackground';
import { ControllerModeProvider } from '@/contexts/ControllerModeContext';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="public-shell">
      <FixedBackground />
      <VisitTracker />
      <ControllerModeProvider>
        <main className="public-main">{children}</main>
      </ControllerModeProvider>
    </div>
  );
}
