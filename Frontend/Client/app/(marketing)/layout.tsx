import { SiteChrome } from "@/components/layout/site-chrome";

export default function MarketingLayout({ children }: LayoutProps<"/">) {
  return <SiteChrome>{children}</SiteChrome>;
}
