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
  category?: string; // Product category for return risk analysis
};

/**
 * Pushes contact + custom field data to GoHighLevel using API v2.
 * 
 * Custom Fields Handling:
 * - Uses field names (keys) as per HighLevel API v2 for contact creation
 * - Field names must match exactly with custom fields created in HighLevel
 * - All custom fields are set as "Text" type in HighLevel
 * 
 * Requires the following env vars (set in .env.local):
 *   HL_API_KEY           – Bearer token (sub-account) with contacts.write permission
 *   HL_LOCATION_ID       – Location (sub-account) ID where the contact lives
 */
export async function pushToHighLevel(answers: FormAnswers) {
  const apiKey = process.env.HL_API_KEY;
  const locationId = process.env.HL_LOCATION_ID;
  const debugMode = process.env.HL_DEBUG === 'true';

  if (!apiKey || !locationId) {
    if (debugMode) {
    console.warn("HighLevel creds missing – skipping sync");
      console.warn("Please set HL_API_KEY and HL_LOCATION_ID in .env.local");
    }
    return { success: false, error: "Missing credentials" };
  }

  // Validate API key format (HighLevel tokens typically start with 'eyJ')
  if (!apiKey.startsWith('eyJ') && debugMode) {
    console.warn("HL_API_KEY format looks incorrect. Should start with 'eyJ'");
  }

  /* ---------------- assemble payload ---------------- */
  const [firstName, ...rest] = answers.full_name.split(" ");
  const lastName = rest.join(" ") || "-";

  // Extract primary product category for lead scoring
  const primaryCategory = answers.products.split(',')[0]?.trim() || answers.products;

  const payload: Record<string, any> = {
    locationId,
    firstName,
    lastName,
    email: answers.email || undefined,
    phone: answers.phone || undefined,
    website: answers.website_url || undefined,
    source: "Future Fulfillment Quiz", // Track lead source
    tags: ["QUIZ"],
    customFields: [
      // Core business data
      { key: "Products", value: answers.products },
      { key: "Product Category", value: primaryCategory },
      { key: "Website", value: answers.website_url },
      
      // Volume and scale
      { key: "Volume", value: answers.monthly_orders_choice }, // Primary field - maps to {{ contact.volume }}
      { key: "Monthly Orders", value: answers.monthly_orders_choice }, // Backup/legacy field
      { key: "SKU Range", value: answers.sku_range_choice },
      
      // Package characteristics
      { key: "Package Weight", value: answers.package_weight_choice },
      { key: "Package Size", value: answers.package_size_choice },
      
      // Current setup and challenges
      { key: "Current Shipping Method", value: answers.current_shipping_method },
      { key: "Biggest Shipping Problem", value: answers.biggest_shipping_problem },
      { key: "Shipping Cost Per Order", value: answers.shipping_cost_choice },
      
      // Customer expectations
      { key: "Customer Location", value: answers.customer_location_choice },
      { key: "Delivery Expectation", value: answers.delivery_expectation_choice },
      
      // Lead qualification metadata
      { key: "Quiz Completed", value: new Date().toISOString() },
      { key: "Lead Source", value: "Future Fulfillment Quiz" }
    ].filter(field => field.value && field.value.trim() !== '') // Remove empty values
  };

  if (debugMode) {
    console.log("HighLevel payload:", JSON.stringify(payload, null, 2));
  }

  try {
    // 1. Attempt to create new contact
    if (debugMode) {
      console.log("Creating HighLevel contact for:", answers.email);
    }
    const createRes = await fetch("https://rest.gohighlevel.com/v1/contacts/", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
      cache: "no-store"
    });

    if (createRes.ok) {
      const contactData = await createRes.json();
      if (debugMode) {
        console.log("HighLevel contact created successfully:", contactData.id);
      }
      return { success: true, contactId: contactData.id, action: "created" };
    }

    const errorText = await createRes.text();
    
    // Check for specific error types
    if (createRes.status === 401) {
      if (debugMode) {
        console.error("HighLevel authentication failed - check API key");
      }
      return { success: false, error: "Authentication failed", status: 401 };
    }
    
    if (createRes.status === 403) {
      if (debugMode) {
        console.error("HighLevel access denied - check API permissions");
      }
      return { success: false, error: "Access denied", status: 403 };
    }

    // Check if contact already exists (duplicate email)
    const isDuplicate = createRes.status === 409 || 
                       createRes.status === 422 ||
                       errorText.toLowerCase().includes("duplicate") || 
                       errorText.toLowerCase().includes("already exists") ||
                       errorText.toLowerCase().includes("unique constraint");

    if (!isDuplicate) {
      if (debugMode) {
      console.error("HighLevel create failed", createRes.status, errorText);
      }
      return { success: false, error: errorText, status: createRes.status };
    }

    if (debugMode) {
      console.log("Contact exists, attempting to update...");
    }

    // 2. Search for existing contact by email
    const searchRes = await fetch(
      `https://rest.gohighlevel.com/v1/contacts/?locationId=${locationId}&email=${encodeURIComponent(answers.email)}`,
      {
      headers: { "Authorization": `Bearer ${apiKey}` }
      }
    );

    if (!searchRes.ok) {
      const searchError = await searchRes.text();
      if (debugMode) {
        console.error("HighLevel search failed", searchRes.status, searchError);
      }
      return { success: false, error: "Search failed", status: searchRes.status };
    }

    const { contacts = [] } = (await searchRes.json()) as any;
    const existing = contacts[0];
    
    if (!existing?.id) {
      if (debugMode) {
      console.error("No existing contact found after duplicate response");
      }
      return { success: false, error: "Contact not found after duplicate error" };
    }

    // 3. Update existing contact
    if (debugMode) {
      console.log("Updating existing contact:", existing.id);
    }
    const updateRes = await fetch(`https://rest.gohighlevel.com/v1/contacts/${existing.id}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
      cache: "no-store"
    });

    if (!updateRes.ok) {
      const updateError = await updateRes.text();
      if (debugMode) {
        console.error("HighLevel update failed", updateRes.status, updateError);
      }
      return { success: false, error: updateError, status: updateRes.status };
    }

    if (debugMode) {
      console.log("HighLevel contact updated successfully");
    }
    return { success: true, contactId: existing.id, action: "updated" };

  } catch (err) {
    if (debugMode) {
    console.error("HighLevel push exception", err);
    }
    return { 
      success: false, 
      error: err instanceof Error ? err.message : "Unknown error" 
    };
  }
} 