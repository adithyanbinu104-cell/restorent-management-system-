"use client";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, total, itemCount } = useCart();
  const items = Object.values(cart);
  const [showCheckout, setShowCheckout] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function placeOrder() {
    setSubmitting(true);
    setError(null);
    try {
      for (const c of items) {
        await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemId: c.id, quantity: c.qty, payment: "pending" }),
        });
      }
      clearCart();
      setDone(true);
    } catch (e) {
      setError(String(e));
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-[#18120f] text-[#ece0da] p-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#f2ca50] mb-4" style={{ fontFamily: "var(--font-domine)" }}>Order Placed!</h1>
          <Link href="/" className="px-6 py-3 rounded-full bg-[#f2ca50] text-[#120d0a] font-bold">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#18120f] text-[#ece0da] p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#f2ca50]" style={{ fontFamily: "var(--font-domine)" }}>Cart</h1>
          <Link href="/" className="text-[#d0c5af] hover:text-[#f2ca50]">Continue Shopping</Link>
        </div>
        {items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#d0c5af] mb-4">Your cart is empty</p>
            <Link href="/" className="px-6 py-3 rounded-full bg-[#f2ca50] text-[#120d0a] font-bold">Go to Menu</Link>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {items.map((c) => (
                <div key={c.id} className="bg-[#201a17] rounded-xl p-4 flex items-center gap-4">
                  <img src={c.image || "/placeholder.svg"} alt={c.name} className="w-20 h-20 object-cover rounded-lg" onError={(e)=>{(e.target as HTMLImageElement).src="/placeholder.svg";}} />
                  <div className="flex-1">
                    <div className="text-xs text-[#d0c5af]">{c.id}</div>
                    <div className="font-bold text-[#ece0da]">{c.name}</div>
                    <div className="text-[#f2ca50]">₹{c.price}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(c.id, c.qty - 1)} className="w-8 h-8 rounded-full bg-[#2f2925] text-[#f2ca50]">-</button>
                    <span className="min-w-[20px] text-center">{c.qty}</span>
                    <button onClick={() => updateQuantity(c.id, c.qty + 1)} className="w-8 h-8 rounded-full bg-[#2f2925] text-[#f2ca50]">+</button>
                  </div>
                  <div className="text-[#f2ca50] font-bold">₹{c.price * c.qty}</div>
                  <button onClick={() => removeFromCart(c.id)} className="text-red-400 hover:text-red-300">✕</button>
                </div>
              ))}
            </div>
            <div className="mt-6 bg-[#201a17] rounded-xl p-6">
              <div className="flex justify-between mb-2"><span>Items</span><span>{itemCount}</span></div>
              <div className="flex justify-between mb-2"><span>Subtotal</span><span>₹{total}</span></div>
              <div className="flex justify-between mb-4 font-bold"><span>Total</span><span className="text-[#f2ca50]">₹{total}</span></div>
              {!showCheckout ? (
                <button onClick={() => setShowCheckout(true)} className="w-full px-6 py-3 rounded-full bg-[#f2ca50] text-[#120d0a] font-bold">Proceed to Checkout</button>
              ) : (
                <div className="space-y-3">
                  <div className="bg-[#241e1b] rounded-xl p-4">
                    <h3 className="text-[#f2ca50] font-bold mb-2">Payment</h3>
                    <p className="text-[#d0c5af] text-sm mb-3">Complete your order.</p>
                    {error && <div className="mb-3 p-2 rounded bg-red-900/40 text-red-300 text-sm">{error}</div>}
                    <button onClick={placeOrder} disabled={submitting} className="w-full px-6 py-3 rounded-full bg-[#f2ca50] text-[#120d0a] font-bold disabled:opacity-50">
                      {submitting ? "Processing..." : "Pay & Place Order"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}