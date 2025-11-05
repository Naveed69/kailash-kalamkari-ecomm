import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user ?? null);
      setLoading(false);
    };
    getUser();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-muted text-muted-foreground">
  {/* Header shown only on mobile and tablet (hidden on large/desktop) */}
  <header className="bg-white border-b sticky top-0 z-20 md:hidden lg:hidden">

        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              {/* sidebar toggle for mobile */}
              <button
                className="md:hidden p-2 rounded hover:bg-slate-100"
                aria-label="Toggle menu"
                onClick={() => setOpen((s) => !s)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>

              <Link to="/admin" className="font-bold text-lg">Admin Panel</Link>
              <div className="hidden md:block ml-4">
                <nav className="flex items-center gap-4 text-sm text-muted-foreground">
                  <Link to="/admin" className="hover:underline">Dashboard</Link>
                  <Link to="/admin/products" className="hover:underline">Products</Link>
                  <Link to="/" className="hover:underline">Store</Link>
                </nav>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:block">
                <input
                  placeholder="Search admin..."
                  className="input input-sm"
                  aria-label="Search admin"
                />
              </div>

              <div className="relative">
                <button
                  className="flex items-center gap-2 rounded p-1 hover:bg-slate-100"
                  aria-haspopup="true"
                  aria-expanded={userMenuOpen}
                  onClick={() => setUserMenuOpen((s) => !s)}
                >
                  <span className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-sm">{user?.email?.[0]?.toUpperCase() ?? "A"}</span>
                  <span className="hidden sm:inline text-sm">{user?.email ?? "Admin"}</span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white border rounded shadow z-30">
                    <div className="p-2 text-sm">{user?.email}</div>
                    <div className="border-t" />
                    <button className="w-full text-left px-3 py-2 hover:bg-slate-50" onClick={() => { setUserMenuOpen(false); navigate('/'); }}>View store</button>
                    <button className="w-full text-left px-3 py-2 hover:bg-slate-50" onClick={logout}>Logout</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        {/* Sidebar for md+ */}
        <aside className={`hidden md:block w-64 shrink-0 bg-white border rounded p-4 h-[calc(100vh-96px)] sticky top-20`}> 
          <nav className="flex flex-col gap-2">
            <Link to="/admin" className="py-2 px-3 rounded hover:bg-slate-100">Dashboard</Link>
            <Link to="/admin/products" className="py-2 px-3 rounded hover:bg-slate-100">Products</Link>
                            <Link to="/" className="py-2 px-3 rounded hover:bg-slate-100">Store</Link>

            {/* <Link to="/admin/orders" className="py-2 px-3 rounded hover:bg-slate-100">Orders</Link> */}
            {/* <Link to="/admin/customers" className="py-2 px-3 rounded hover:bg-slate-100">Customers</Link> */}
            <div className="mt-4 border-t pt-3">
              <div className="text-xs text-muted-foreground">Account</div>
              <div className="mt-2 text-sm">{user?.email}</div>
            </div>
          </nav>
        </aside>

        {/* Mobile sidebar overlay */}
        {open && (
          <div className="md:hidden fixed inset-0 bg-black/40 z-40" onClick={() => setOpen(false)}>
            <div className="absolute left-0 top-0 bottom-0 w-64 bg-white p-4" onClick={(e) => e.stopPropagation()}>
              <nav className="flex flex-col gap-2">
                <Link to="/admin" className="py-2 px-3 rounded hover:bg-slate-100">Dashboard</Link>
                <Link to="/admin/products" className="py-2 px-3 rounded hover:bg-slate-100">Products</Link>
                <Link to="/" className="py-2 px-3 rounded hover:bg-slate-100">Store</Link>
                <div className="mt-4 border-t pt-3">
                  <div className="text-sm">{user?.email}</div>
                  <button className="btn w-full mt-2" onClick={logout}>Logout</button>
                </div>
              </nav>
            </div>
          </div>
        )}

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
};
