import CoupleBottomNav from "@/components/CoupleBottomNav";

export default async function CoupleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <>
      {/* Extra bottom padding so content is never hidden under fixed nav on mobile */}
      <div style={{ paddingBottom: "calc(56px + env(safe-area-inset-bottom, 16px))" }}>
        {children}
      </div>
      <CoupleBottomNav token={token} />
    </>
  );
}
