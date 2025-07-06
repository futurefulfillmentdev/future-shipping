import "server-only";

// Using a lightweight alias to avoid circular export; matches shape of QuizFormAnswers
type FormAnswers = {
  full_name: string;
  email: string;
  phone: string;
  website_url: string;
  products: string;
  package_weight_choice: string;
  package_size_choice: string;
  monthly_orders_choice: string;
  customer_location_choice: string;
  current_shipping_method: string;
  biggest_shipping_problem: string;
  sku_range_choice: string;
  delivery_expectation_choice: string;
  shipping_cost_choice: string;
};

/**
 * Pushes contact + custom field data to GoHighLevel using API v2.
 * Requires the following env vars (set in .env.local):
 *   HL_API_KEY           – Bearer token (sub-account) with contacts.write
 *   HL_LOCATION_ID       – Location (sub-account) ID where the contact lives
 */
export async function pushToHighLevel(answers: FormAnswers) {
  const apiKey = process.env.HL_API_KEY;
  const locationId = process.env.HL_LOCATION_ID;

  if (!apiKey || !locationId) {
    console.warn("HighLevel creds missing – skipping sync");
    return;
  }

  /* ---------------- assemble payload ---------------- */
  const [firstName, ...rest] = answers.full_name.split(" ");
  const lastName = rest.join(" ") || "-";

  const payload: Record<string, any> = {
    locationId,
    firstName,
    lastName,
    email: answers.email || undefined,
    phone: answers.phone || undefined,
    website: answers.website_url || undefined,
    customFields: [
      { key: "Products", value: answers.products },
      { key: "Monthly Orders", value: answers.monthly_orders_choice },
      { key: "Current Shipping Method", value: answers.current_shipping_method },
      { key: "Biggest Shipping Problem", value: answers.biggest_shipping_problem },
      { key: "SKU Range", value: answers.sku_range_choice },
      { key: "Delivery Expectation", value: answers.delivery_expectation_choice },
      { key: "Shipping Cost", value: answers.shipping_cost_choice }
    ]
  };

  try {
    // 1. Attempt to create
    const createRes = await fetch("https://api.gohighlevel.com/v2/contacts/", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
      cache: "no-store"
    });

    if (createRes.ok) return;

    const errorText = await createRes.text();
    // If duplicate (contact exists) fall through to update path
    const duplicate = createRes.status === 409 || errorText.toLowerCase().includes("duplicate") || errorText.toLowerCase().includes("already exists");

    if (!duplicate) {
      console.error("HighLevel create failed", createRes.status, errorText);
      return;
    }

    // 2. Lookup existing contact by email (simple search)
    const searchRes = await fetch(`https://api.gohighlevel.com/v2/contacts/?locationId=${locationId}&email=${encodeURIComponent(answers.email)}`, {
      headers: { "Authorization": `Bearer ${apiKey}` }
    });

    if (!searchRes.ok) {
      console.error("HighLevel search failed", searchRes.status, await searchRes.text());
      return;
    }

    const { contacts = [] } = (await searchRes.json()) as any;
    const existing = contacts[0];
    if (!existing?.id) {
      console.error("No existing contact found after duplicate response");
      return;
    }

    // 3. Update contact
    const updateRes = await fetch(`https://api.gohighlevel.com/v2/contacts/${existing.id}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
      cache: "no-store"
    });

    if (!updateRes.ok) {
      console.error("HighLevel update failed", updateRes.status, await updateRes.text());
    }
  } catch (err) {
    console.error("HighLevel push exception", err);
  }
} 