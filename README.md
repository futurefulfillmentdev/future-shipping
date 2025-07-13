# Future Fulfillment Quiz

A sophisticated quiz application that analyzes shipping needs and recommends optimal fulfillment strategies for e-commerce businesses.

## Features

- 15-step interactive quiz collecting business data
- AI-powered fulfillment strategy recommendations
- Shipping health score calculation
- Savings projections and educational content
- HighLevel CRM integration for lead management

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env.local` file in the root directory:

```bash
# HighLevel API Configuration
HL_API_KEY=your_highlevel_api_key_here
HL_LOCATION_ID=your_location_id_here
```

#### Getting HighLevel Credentials:

1. **HL_API_KEY**: 
   - Log into your HighLevel sub-account
   - Go to Settings → API → Personal Access Tokens
   - Create a token with `contacts.write` permission
   - Copy the Bearer token

2. **HL_LOCATION_ID**:
   - In HighLevel, go to Settings → General
   - Copy the Location ID (sub-account ID)

### 3. HighLevel Custom Fields Setup

The integration requires these custom fields in your HighLevel location:

**Required Custom Fields:**
- Products (Text)
- Product Category (Text)
- Website (Text)
- Monthly Orders (Text)
- SKU Range (Text)
- Package Weight (Text)
- Package Size (Text)
- Current Shipping Method (Text)
- Biggest Shipping Problem (Text)
- Shipping Cost Per Order (Text)
- Customer Location (Text)
- Delivery Expectation (Text)
- Quiz Completed (Text)
- Lead Source (Text)

**To create custom fields in HighLevel:**
1. Go to Settings → Custom Fields
2. Add each field as "Text" type
3. Make sure field names match exactly as listed above

### 4. Run Development Server
```bash
npm run dev
```

## HighLevel Integration Features

- **Automatic Contact Creation**: Creates new contacts or updates existing ones
- **Complete Data Capture**: All quiz responses stored as custom fields
- **Lead Qualification**: Product category and business size for lead scoring
- **Source Tracking**: Tracks leads from the quiz with timestamps
- **Error Handling**: Graceful fallbacks if HighLevel is unavailable

## Data Flow

1. User completes quiz → Data transformed to FormAnswers format
2. Parallel actions:
   - Data saved to localStorage for result generation
   - API call to `/api/highlevel` with form data
3. HighLevel service creates/updates contact with all custom fields
4. User sees results page with personalized recommendations

## Development

The quiz logic is primarily in:
- `/src/app/quiz/page.tsx` - Quiz interface and data collection
- `/src/lib/futureFulfillmentAdvisor.ts` - Decision logic and result generation
- `/src/lib/highLevelService.ts` - HighLevel API integration
- `/src/app/api/highlevel/route.ts` - API endpoint for HighLevel sync

## Deployment

Ensure environment variables are set in your hosting platform before deployment.
