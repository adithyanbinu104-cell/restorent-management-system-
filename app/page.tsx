"use client";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { MenuItem, normalizeItem, normalizeOrder, RestaurantOrder } from "@/lib/types";
import { Search, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Cart = Record<string, { id: string; name: string; price: number; qty: number; maxStock: number }>;

const LOCAL_IMAGES: Record<string, string> = {
  IT0001: "/images/IT0001.jpg",
  IT0002: "/images/IT0002.jpg",
  IT0003: "/images/IT0003.jpg",
  IT0004: "/images/IT0004.jpg",
  IT0005: "/images/IT0005.jpg",
  IT0006: "/images/IT0006.jpg",
  IT0007: "/images/IT0007.jpg",
  IT0008: "/images/IT0008.jpg",
  IT0009: "/images/IT0009.jpg",
  IT0010: "/images/IT0010.jpg",
  IT0011: "/images/IT0011.jpg",
};

function localImage(id: string) {
  return LOCAL_IMAGES[id];
}

export default function Home() {
  const router = useRouter();
  const { addToCart } = useCart();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<RestaurantOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"menu" | "orders">("menu");
  const [cart, setCart] = useState<Cart>({});
  const [drawerItem, setDrawerItem] = useState<MenuItem | null>(null);
  const [drawerQty, setDrawerQty] = useState(1);
  const [toast, setToast] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
const [slide, setSlide] = useState(0);
const HERO_IMAGES = ["/images/hero/chicken-biriyani.jpg","/images/hero/beef-biriyani.jpg","/images/hero/veg-biriyani.jpg","/images/hero/chicken-fried-rice.jpg","/images/hero/egg-fried-rice.jpg","/images/hero/veg-fried-rice.jpg","/images/hero/chicken-noodles.jpg","/images/hero/egg-noodles.jpg","/images/hero/veg-noodles.jpg","/images/hero/paneer-butter-masala.jpg","/images/hero/chicken-alfaham.jpg"];
useEffect(() => { const t = setInterval(() => setSlide((s) => (s + 1) % HERO_IMAGES.length), 4000); return () => clearInterval(t); }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [ir, or] = await Promise.all([fetch("/api/items"), fetch("/api/orders")]);
      const ij = await ir.json();
      const oj = await or.json();
      const newItems: MenuItem[] = ij.success ? (ij.data || []).map(normalizeItem) : [];
      if (ij.success) setItems(newItems);
      if (oj.success) {
        const os = (oj.data || []).map((o: Record<string, unknown>) => normalizeOrder(o));
        setOrders(os.map((o: RestaurantOrder) => ({ ...o, itemName: newItems.find((i) => i.itemId === o.itemId)?.itemName || o.itemId })));
      }
      if (!ij.success) setError(ij.error || "Failed to load items");
      if (!oj.success) setError(oj.error || "Failed to load orders");
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("rms_cart");
      if (raw) setCart(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem("rms_cart", JSON.stringify(cart)); } catch {}
  }, [cart]);

  const filtered = items.filter((i) => i.itemName.toLowerCase().includes(query.toLowerCase()));
  const cartCount = Object.values(cart).reduce((s, c) => s + c.qty, 0);
  const cartTotal = Object.values(cart).reduce((s, c) => s + c.price * c.qty, 0);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }

  function cardInc(item: MenuItem) {
    setCart((prev) => {
      const c = prev[item.itemId] || { id: item.itemId, name: item.itemName, price: item.price, qty: 0, maxStock: item.stock };
      if (c.qty < item.stock) {
        showToast("Added " + item.itemName + " to order");
        return { ...prev, [item.itemId]: { ...c, qty: c.qty + 1 } };
      }
      showToast("Maximum available stock reached");
      return prev;
    });
  }

  function openDrawer(item: MenuItem) {
    setDrawerItem(item);
    setDrawerQty(1);
  }

  function commitDrawerAdd() {
    if (!drawerItem) return;
    setCart((prev) => {
      const c = prev[drawerItem.itemId] || { id: drawerItem.itemId, name: drawerItem.itemName, price: drawerItem.price, qty: 0, maxStock: drawerItem.stock };
      const add = Math.min(drawerQty, drawerItem.stock - c.qty);
      if (add <= 0) { showToast("Maximum available stock reached"); return prev; }
      showToast("Added " + drawerItem.itemName + " to order");
      return { ...prev, [drawerItem.itemId]: { ...c, qty: c.qty + add } };
    });
    setDrawerItem(null);
  }

  async function proceedToCheckout() {
    try {
      for (const c of Object.values(cart)) {
        await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemId: c.id, quantity: c.qty, payment: "pending" }),
        });
      }
      setCart({});
      await load();
      setTab("orders");
      showToast("Order submitted");
    } catch (e) {
      setError(String(e));
    }
  }

  return (
    <div className="min-h-screen bg-[#18120f] text-[#ece0da]">
      <header className="sticky top-0 z-50 bg-[#120d0a]/90 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <div className="h-20 max-w-7xl mx-auto px-4 md:px-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#2f2925] flex items-center justify-center shadow-[0_0_12px_rgba(242,202,80,0.15)]">
              <span className="text-[#f2ca50]">☕</span>
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl tracking-wider text-[#f2ca50]" style={{ fontFamily: "var(--font-domine)" }}>SAMSONS</span>
              <span className="text-xs uppercase tracking-widest text-[#d0c5af]">Cafe</span>
            </div>
          </div>
          <button onClick={() => router.push("/cart")} className="relative w-10 h-10 rounded-full bg-[#2f2925] flex items-center justify-center text-[#f2ca50]">
            🛍
            {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-[#f2ca50] text-[#120d0a] text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{cartCount}</span>}
          </button>
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-full bg-[#201a17]">
            <button onClick={() => setTab("menu")} className={`px-4 py-1 rounded-full text-sm ${tab === "menu" ? "bg-[#d4af37] text-[#554300] shadow" : "text-[#d0c5af]"}`}>Menu Items</button>
            <button onClick={() => setTab("orders")} className={`px-4 py-1 rounded-full text-sm ${tab === "orders" ? "bg-[#d4af37] text-[#554300] shadow" : "text-[#d0c5af]"}`}>Orders & Checkout</button>
          </nav>
        </div>
      </header>

      <main className="w-full pt-20 min-h-screen pb-28">
        <div className="max-w-7xl mx-auto px-4 md:px-10 pt-6">
          {error && <div className="mb-4 p-3 rounded bg-red-900/40 text-red-300">{error}</div>}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-[#201a17] rounded-xl overflow-hidden animate-pulse">
                  <div className="w-full aspect-[4/3] bg-[#2f2925]" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-[#2f2925] rounded w-3/4" />
                    <div className="h-4 bg-[#2f2925] rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "menu" && !loading && (
            <>
              <div className="relative rounded-xl p-6 md:p-8 shadow-xl overflow-hidden mb-8 min-h-[220px]">
  <video className="absolute inset-0 w-full h-full pointer-events-none" autoPlay muted loop playsInline preload="auto" style={{ objectFit: "cover", objectPosition: "center" }}>
    <source src="/videos/restaurant-hero.mp4" type="video/mp4" />
  </video>
  <div className="absolute inset-0 bg-black/30" />
  <div className="absolute inset-0 bg-black/25" />
  <div className="absolute inset-0 bg-gradient-to-r from-[#120d0a]/40 via-transparent to-[#120d0a]/40" />
                <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-[#f2ca50]/10 blur-3xl pointer-events-none"></div>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#f2ca50] shadow-[0_0_8px_rgba(242,202,80,0.8)]"></span>
                      <span className="font-label-sm uppercase tracking-widest text-[#f2ca50]" style={{ fontFamily: "var(--font-space-grotesk)" }}>DAILY PROVISIONS</span>
                    </div>
                    <h1 className="font-headline-xl text-[#ece0da] tracking-wide mt-2" style={{ fontFamily: "var(--font-domine)" }}>HOTTEST TODAY</h1>
                    <p className="font-body-md text-[#d0c5af] max-w-xl mt-2" style={{ fontFamily: "var(--font-manrope)" }}>Curated artisanal dishes cooked fresh to order.</p>
                  </div>
                  <div className="flex items-center gap-2 bg-[#201a17] px-4 py-2.5 rounded-full shadow-inner">
                    <Search size={18} className="text-[#f2ca50]" />
                    <input value={query} onChange={(e) => setQuery(e.target.value)} className="bg-transparent text-[#ece0da] placeholder:text-[#99907c] text-sm focus:outline-none w-36 sm:w-48" placeholder="Search menu..." />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-6">
                <span className="font-label-lg uppercase tracking-wider text-[#eaca8b]" style={{ fontFamily: "var(--font-space-grotesk)" }}>Catalogue Selection</span>
                <span className="text-xs text-[#d0c5af]">{filtered.length} Items Available</span>
              </div>

              {filtered.length === 0 && !loading && (
                <div className="text-center text-[#d0c5af] py-12">No menu items available.</div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filtered.map((item) => (
                  <div key={item.itemId} onClick={() => openDrawer(item)} className="group relative bg-[#201a17] hover:bg-[#241e1b] rounded-xl overflow-hidden shadow-lg transition-all duration-300 flex flex-col justify-between cursor-pointer">
                    <div className="relative w-full aspect-[4/3] overflow-hidden bg-[#120d0a]">
                      <img alt={item.itemName} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" decoding="async" src={item.image || "/placeholder.svg"} onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }} />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#201a17] via-transparent to-black/40"></div>
                      <div className="absolute top-3 left-3 bg-[#120d0a]/80 backdrop-blur-md px-2.5 py-1 rounded-full">
                        <span className="text-xs text-[#f2ca50] font-semibold" style={{ fontFamily: "var(--font-space-grotesk)" }}>{item.itemId}</span>
                      </div>
                      <div className="absolute top-3 right-3 flex items-center gap-1 bg-[#2f2925]/90 backdrop-blur-md px-2.5 py-1 rounded-full">
                        <span className={`w-1.5 h-1.5 rounded-full ${item.stock > 0 ? "bg-emerald-400" : "bg-red-400"}`}></span>
                        <span className="text-xs text-[#d0c5af]">{item.stock} in stock</span>
                      </div>
                    </div>
                    <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                      <div>
                        <h3 className="font-headline-sm text-[#ece0da] group-hover:text-[#f2ca50] transition-colors" style={{ fontFamily: "var(--font-domine)" }}>{item.itemName}</h3>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex flex-col">
                          <span className="font-label-sm uppercase tracking-wider text-[#d0c5af]" style={{ fontFamily: "var(--font-space-grotesk)" }}>Price</span>
                          <span className="font-label-lg text-[#f2ca50] tracking-tight" style={{ fontFamily: "var(--font-space-grotesk)" }}>₹{item.price}</span>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); addToCart({ id: item.itemId, name: item.itemName, price: item.price, maxStock: item.stock, image: item.image || "" }); router.push("/cart"); }} className="w-9 h-9 rounded-full bg-[#f2ca50] hover:bg-[#ffe088] text-[#120d0a] flex items-center justify-center shadow-md transition-all active:scale-95">
                          <ShoppingCart size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === "orders" && !loading && (
            <div className="bg-[#201a17] rounded-xl p-6 overflow-x-auto">
              <h2 className="text-xl font-bold text-[#f2ca50] mb-4" style={{ fontFamily: "var(--font-domine)" }}>Orders</h2>
              <table className="w-full text-sm">
                <thead className="text-[#d0c5af]">
                  <tr>
                    <th className="text-left py-2">Order ID</th>
                    <th className="text-left py-2">Item</th>
                    <th className="text-left py-2">Qty</th>
                    <th className="text-left py-2">Unit Price</th>
                    <th className="text-left py-2">Total</th>
                    <th className="text-left py-2">Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.orderId} className="border-t border-[#3d2e1e]">
                      <td className="py-2">{o.orderId}</td>
                      <td className="py-2">{o.itemName || o.itemId}</td>
                      <td className="py-2">{o.quantity}</td>
                      <td className="py-2">₹{o.singleItemPrice}</td>
                      <td className="py-2">₹{o.totalPrice}</td>
                      <td className="py-2">{o.payment}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Bottom cart bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#120d0a]/95 backdrop-blur-xl shadow-[0_-8px_30px_rgba(0,0,0,0.6)] py-4 px-4 md:px-10">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#2f2925] flex items-center justify-center relative shadow-inner">
                <span className="text-[#f2ca50] text-xl">🛍</span>
                <span className="absolute -top-1 -right-1 bg-[#f2ca50] text-[#120d0a] text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md">{cartCount}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-sm uppercase tracking-wider text-[#d0c5af]" style={{ fontFamily: "var(--font-space-grotesk)" }}>TRAY TOTAL</span>
                <span className="font-label-lg text-[#f2ca50] tracking-wide" style={{ fontFamily: "var(--font-space-grotesk)" }}>₹{cartTotal}.00</span>
              </div>
            </div>
            <button onClick={proceedToCheckout} className="px-6 md:px-8 py-3 rounded-full bg-gradient-to-r from-[#d4af37] via-[#f2ca50] to-[#ffe088] text-[#120d0a] font-label-lg tracking-wider uppercase flex items-center gap-2 shadow-[0_4px_20px_rgba(242,202,80,0.3)] transition-all active:scale-95">
              PROCEED TO PAYMENTS
            </button>
          </div>
        </div>
      )}

      {/* Item drawer */}
      {drawerItem && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#201a17] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="relative w-full aspect-video bg-[#120d0a] overflow-hidden">
              <img alt={drawerItem.itemName} className="w-full h-full object-cover" src={drawerItem.image || "/placeholder.svg"} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#201a17] via-transparent to-black/30"></div>
              <button onClick={() => setDrawerItem(null)} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#120d0a]/80 text-[#ece0da] hover:text-[#f2ca50] flex items-center justify-center backdrop-blur-md shadow-md transition-colors">✕</button>
              <div className="absolute bottom-4 left-4 flex items-center gap-2">
                <span className="bg-[#f2ca50]/20 backdrop-blur-md text-[#f2ca50] px-3 py-1 rounded-full font-label-sm uppercase tracking-wider font-semibold" style={{ fontFamily: "var(--font-space-grotesk)" }}>Dish</span>
                <span className="bg-[#120d0a]/80 backdrop-blur-md text-[#d0c5af] px-3 py-1 rounded-full font-label-sm" style={{ fontFamily: "var(--font-space-grotesk)" }}>{drawerItem.itemId}</span>
              </div>
            </div>
            <div className="p-6 flex flex-col gap-4 overflow-y-auto">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-headline-md text-[#ece0da]" style={{ fontFamily: "var(--font-domine)" }}>{drawerItem.itemName}</h2>
                  <p className="font-label-sm text-[#eaca8b] mt-1" style={{ fontFamily: "var(--font-space-grotesk)" }}>{drawerItem.stock} Available in Root Stock</p>
                </div>
                <div className="text-right">
                  <span className="font-label-sm text-[#d0c5af] block uppercase" style={{ fontFamily: "var(--font-space-grotesk)" }}>Unit Price</span>
                  <span className="font-label-lg text-[#f2ca50]" style={{ fontFamily: "var(--font-space-grotesk)" }}>₹{drawerItem.price}</span>
                </div>
              </div>
              <div className="bg-[#241e1b] rounded-xl p-4 flex items-center justify-between mt-2">
                <div className="flex flex-col">
                  <span className="font-label-sm uppercase text-[#d0c5af]" style={{ fontFamily: "var(--font-space-grotesk)" }}>Select Quantity</span>
                </div>
                <div className="flex items-center gap-4 bg-[#3a3330] px-3 py-1.5 rounded-full">
                  <button onClick={() => setDrawerQty((q) => Math.max(1, q - 1))} className="w-7 h-7 rounded-full bg-[#201a17] hover:bg-[#f2ca50] hover:text-[#120d0a] text-[#f2ca50] flex items-center justify-center transition-colors">−</button>
                  <span className="font-label-md text-[#ece0da] font-bold min-w-[20px] text-center" style={{ fontFamily: "var(--font-space-grotesk)" }}>{drawerQty}</span>
                  <button onClick={() => setDrawerQty((q) => Math.min(drawerItem.stock, q + 1))} className="w-7 h-7 rounded-full bg-[#201a17] hover:bg-[#f2ca50] hover:text-[#120d0a] text-[#f2ca50] flex items-center justify-center transition-colors">+</button>
                </div>
              </div>
              <button onClick={commitDrawerAdd} className="w-full mt-2 py-3.5 px-6 rounded-full bg-[#f2ca50] hover:bg-[#ffe088] text-[#120d0a] font-label-lg uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-[0.98]" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                ADD TO TRAY • ₹{drawerItem.price * drawerQty}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed top-24 right-6 z-50 bg-[#2f2925] text-[#ece0da] px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 transition-all">
          <span className="text-[#f2ca50]">✓</span>
          <span className="font-body-sm" style={{ fontFamily: "var(--font-manrope)" }}>{toast}</span>
        </div>
      )}
    </div>
  );
}