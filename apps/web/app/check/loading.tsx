export default function CheckLoading() {
  return (
    <div className="min-h-screen bg-[#f3fbfd] flex items-center justify-center" aria-busy="true" aria-label="Loading check-in">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-4 border-[#90e0ef]/30 border-t-[#0077b6] animate-spin mx-auto mb-4" />
        <p className="text-sm text-[#6b7280]">Setting up your check-in…</p>
      </div>
    </div>
  );
}
