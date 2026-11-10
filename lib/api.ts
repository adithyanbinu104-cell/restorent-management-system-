const SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL!;

export async function fetchItems() {
  const res = await fetch(`${SCRIPT_URL}?action=item`, { next: { revalidate: 30 } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchOrders() {
  const res = await fetch(`${SCRIPT_URL}?action=order`, { next: { revalidate: 30 } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function postItem(body: Record<string, unknown>) {
  const res = await fetch(SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "item", ...body }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function postOrder(body: Record<string, unknown>) {
  const res = await fetch(SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "order", ...body }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
