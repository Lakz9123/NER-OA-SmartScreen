export default function RoleBadge() {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    const user = JSON.parse(userStr);
    
    return (
      <div className="fixed top-4 right-4 bg-slate-900/80 backdrop-blur-sm border border-slate-700 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full z-[100] pointer-events-none shadow-xl flex items-center">
        <span className={`w-2 h-2 rounded-full mr-2 ${user.role === 'admin' ? 'bg-amber-400' : 'bg-teal-400'}`}></span>
        {user.role === 'admin' ? 'Admin' : 'Health Worker'}
      </div>
    );
  } catch {
    return null;
  }
}
