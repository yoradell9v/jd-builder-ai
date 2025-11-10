export default function Loader() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 border-4 border-[#00FF87]/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-transparent border-t-[#00FF87] rounded-full animate-spin"></div>
      </div>
    </div>
  );
}
