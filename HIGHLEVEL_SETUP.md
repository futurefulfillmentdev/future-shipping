# HighLevel Integration Setup Guide - Agency Account

## Overview
The Future Fulfillment Quiz integrates with HighLevel CRM to automatically capture leads and store detailed quiz responses as custom fields.

**⚠️ AGENCY ACCOUNT SETUP** - This guide is specifically for HighLevel Agency accounts.

**✨ SILENT INTEGRATION** - The HighLevel integration is completely invisible to users. If credentials are missing or there are API issues, the quiz continues normally with no error messages shown to users.

## Step 1: Get HighLevel Agency API Credentials

### 1.1 Generate Agency API Key
1. Log into your **HighLevel Agency Dashboard** (not sub-account)
2. Navigate to **Settings → Integrations → API**
3. Click **"Create App"** or use existing app
4. Generate **Private Integration** or **Public App** token
5. **Required Scopes/Permissions:**
   - `contacts.write` - Create and update contacts
   - `contacts.read` - Read contact information
   - `locations.read` - Access location information
6. Copy the API key (format varies by integration type)

### 1.2 Get Target Location ID
**Option A: From Agency Dashboard**
1. In Agency Dashboard, go to **Locations**
2. Find the target sub-account/location
3. Click on the location name
4. Copy the Location ID from the URL or settings
5. Format: `abcd1234-5678-90ef-ghij-klmnopqrstuv`

**Option B: From Sub-Account**
1. Log into the specific sub-account where leads should go
2. Go to **Settings → General**
3. Find **"Location ID"** 
4. Copy this ID

### 1.3 Agency vs Sub-Account Token Differences
- **Agency Token**: Can access multiple locations, requires `locationId` in API calls
- **Sub-Account Token**: Limited to one location, auto-scoped
- **We're using Agency setup**: Allows centralized management

## Step 2: Configure Environment Variables

Create a `.env.local` file in the `quiz-app` directory:

```bash
# HighLevel Agency Account Configuration
# Copy this template and fill in your actual credentials

# ========================================
# REQUIRED: HighLevel Agency API Credentials
# ========================================

# Your HighLevel Agency API Key
# Get this from: Agency Dashboard → Settings → Integrations → API
# Required Scopes: contacts.write, contacts.read, locations.read
# Format varies by integration type:
#   - Private Integration: May start with "eyJ..." (JWT format)
#   - Public App: Custom prefix based on your app setup
#   - Agency Integration: App-specific format
HL_API_KEY=your_agency_api_key_here

# Target Location ID (Sub-Account ID where leads should be created)
# Get this from: Agency Dashboard → Locations → Select Location → Copy ID
# Or from Sub-Account: Settings → General → Location ID
# Format: UUID with dashes (e.g., abcd1234-5678-90ef-ghij-klmnopqrstuv)
HL_LOCATION_ID=target_location_id_for_leads

# ========================================
# OPTIONAL: Development & Debug Settings
# ========================================

# Enable debug logging (development only)
# Set to "true" to see detailed API requests/responses
# Remove or set to "false" for production
HL_DEBUG=true
```

### Environment Variable Details:

- **`HL_API_KEY`**: Your agency-level API key
  - **Agency Integration**: Starts with app-specific prefix
  - **Private Integration**: May start with `eyJ...` (JWT format)
  - **Public App**: Custom format based on your app setup

- **`HL_LOCATION_ID`**: Target sub-account ID where leads should be created
  - Format: UUID with dashes
  - Example: `abcd1234-5678-90ef-ghij-klmnopqrstuv`
  - This is the specific location/sub-account in your agency

- **`HL_DEBUG`**: Enable detailed logging (development only)
  - Set to `true` to see detailed API requests/responses in server logs
  - Set to `false` or remove for production (completely silent operation)
  - **Important**: Even with debug enabled, users never see any error messages

### ⚠️ Important Security Notes:
- **Never commit the `.env.local` file to version control**
- Add `.env.local` to your `.gitignore` file if not already there
- Use different API keys for development vs production
- Regenerate keys if compromised
- Monitor API usage in your agency dashboard

## Step 3: Test the Integration

### 3.1 Verify Configuration
```bash
# Run the development server
npm run dev

# Test the HighLevel connection
curl http://localhost:3000/api/test-highlevel
```

### 3.2 Expected Test Results
**✅ Success Response:**
```json
{
  "success": true,
  "message": "HighLevel connection verified",
  "details": {
    "hasCredentials": true,
    "locationAccess": true,
    "apiVersion": "v2"
  }
}
```

**❌ Error Response Examples:**
```json
{
  "success": false,
  "error": "Invalid agency credentials",
  "details": {
    "hasApiKey": true,
    "hasLocationId": true,
    "message": "Check API key permissions and location access"
  }
}
```

## Step 4: Custom Fields Setup in HighLevel

### 4.1 Create Custom Fields (if needed)
The integration will automatically create these custom fields in your target location:

- `quiz_products` - Products sold
- `quiz_package_weight` - Package weight range
- `quiz_package_size` - Package size category
- `quiz_monthly_orders` - Monthly order volume
- `quiz_customer_location` - Customer geography
- `quiz_current_shipping` - Current shipping method
- `quiz_shipping_problem` - Biggest shipping challenge
- `quiz_sku_range` - Number of SKUs
- `quiz_delivery_expectation` - Customer delivery expectations
- `quiz_shipping_cost` - Current shipping costs
- `quiz_category` - Product category
- `quiz_completed_at` - Quiz completion timestamp
- `quiz_lead_source` - Source tracking
- `quiz_recommendation` - Fulfillment recommendation

### 4.2 Verify Custom Fields
1. Go to your target sub-account in HighLevel
2. Navigate to **Settings → Custom Fields**
3. Look for fields starting with `quiz_`
4. Fields are auto-created on first contact sync

## Step 5: Agency Account Specific Notes

### 5.1 Multi-Location Management
- Agency accounts can target different locations by changing `HL_LOCATION_ID`
- Consider using different environment files for different client locations
- Each location maintains its own custom field schema

### 5.2 Rate Limits & Best Practices
- Agency accounts may have higher rate limits
- API calls are scoped to the specified location
- Monitor usage across all locations in agency dashboard

### 5.3 Permissions & Access
- Ensure agency has full access to target location
- Verify the sub-account allows API access
- Check that contact creation permissions are enabled

## Troubleshooting

### Debugging HighLevel Integration

**The integration is designed to be completely invisible to users.** If there are issues, users will never see error messages - the quiz continues normally.

### Enable Debug Mode for Development

To see what's happening behind the scenes, set `HL_DEBUG=true` in your `.env.local` file:

```bash
HL_DEBUG=true
```

Then check your **server logs** (not browser console) for detailed information:

```bash
# Run the development server
npm run dev

# Complete a quiz and check the terminal output
```

### Common Agency Account Issues:

1. **"Unauthorized" Error**
   - Check API key permissions for target location
   - Verify location is active in your agency
   - Ensure proper scopes are granted

2. **"Location Not Found"**
   - Double-check Location ID format
   - Verify location exists in your agency
   - Check if location is archived or inactive

3. **"Custom Fields Not Created"**
   - Verify contact creation succeeded first
   - Custom fields auto-create with first contact
   - Check sub-account custom field limits

4. **Rate Limiting**
   - Agency accounts typically have generous limits
   - Implement retry logic for production use
   - Monitor API usage in agency dashboard

## Next Steps

1. ✅ Set up environment variables
2. ✅ Test connection with `/api/test-highlevel`
3. ✅ Complete a test quiz to verify data flow
4. ✅ Check HighLevel for new contact and custom fields
5. ✅ Monitor integration in production

For support, check the [HighLevel Agency API Documentation](https://highlevel.stoplight.io/) or contact HighLevel support with your agency account details. 