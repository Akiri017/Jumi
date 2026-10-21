import { PhoneFrame } from '@/components/layout/phone-frame';

// Every app screen renders inside one shared phone frame, so it doesn't remount between routes.
export default function PhoneLayout({ children }: { children: React.ReactNode }) {
  return <PhoneFrame>{children}</PhoneFrame>;
}
