import dynamic from "next/dynamic";
import { Manrope } from "next/font/google";

const manropeFont = Manrope({
  subsets: ["latin"],
});

const Drawer = dynamic(async () => (await import("antd")).Drawer, {
  ssr: false,
});

export default function QuickPreview({ open, children, title, onClose }: any) {
  return (
    <Drawer
      getContainer={false}
      open={open}
      title={title}
      className={manropeFont.className}
      onClose={onClose}
    >
      {children}
    </Drawer>
  );
}
