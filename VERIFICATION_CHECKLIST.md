# HighLevel Integration Verification Checklist

## 🔧 Pre-Setup Verification

### HighLevel Account Preparation
- [ ] **HighLevel sub-account access confirmed**
  - Can log into HighLevel dashboard
  - Have admin permissions for the location
  - Can access Settings section

- [ ] **API Token generated successfully**
  - Generated from Settings → API → Personal Access Tokens
  - Token name: "Future Fulfillment Quiz" 
  - Permission: `contacts.write` enabled
  - Token copied (starts with `eyJ...`)

- [ ] **Location ID obtained**
  - Found in Settings → General
  - Format: UUID with dashes (e.g., `abcd1234-5678-90ef-ghij-klmnopqrstuv`)
  - Copied correctly

## 📁 Environment Setup

### .env.local Configuration
- [ ] **File exists in project root**
  - Location: `quiz-app/.env.local`
  - Not committed to git (in .gitignore)

- [ ] **Credentials properly set**
  ```bash
  HL_API_KEY=eyJ... # (your actual token)
  HL_LOCATION_ID=abcd1234-5678... # (your actual ID)
  ```

- [ ] **Development server restarted**
  - Stopped previous `npm run dev`
  - Restarted after adding .env.local
  - No environment variable errors in console

## 🗃️ HighLevel Custom Fields Setup

### Required Fields Created (14 total)
- [ ] **Core Business Data (3 fields)**
  - Products (Text)
  - Product Category (Text)  
  - Website (Text)

- [ ] **Volume & Scale (2 fields)**
  - Monthly Orders (Text)
  - SKU Range (Text)

- [ ] **Package Characteristics (2 fields)**
  - Package Weight (Text)
  - Package Size (Text)

- [ ] **Current Setup & Challenges (3 fields)**
  - Current Shipping Method (Text)
  - Biggest Shipping Problem (Text)
  - Shipping Cost Per Order (Text)

- [ ] **Customer Expectations (2 fields)**
  - Customer Location (Text)
  - Delivery Expectation (Text)

- [ ] **Lead Qualification (2 fields)**
  - Quiz Completed (Text)
  - Lead Source (Text)

### Field Validation
- [ ] **Field names match exactly** (case-sensitive)
- [ ] **All fields set to "Text" type**
- [ ] **No required fields** (all optional)
- [ ] **Fields visible in contact forms**

## 🧪 API Connection Testing

### Test Endpoint Verification
Access: `http://localhost:3000/api/test-highlevel`

- [ ] **Success Response (200)**
  ```json
  {
    "success": true,
    "message": "HighLevel connection successful",
    "location": {
      "name": "Your Location Name",
      "id": "your-location-id", 
      "timezone": "America/New_York"
    }
  }
  ```

- [ ] **Error Responses Handled**
  - 400: Missing credentials error
  - 401: Authentication failed
  - 403: Access denied
  - 500: API connection failed

## 📝 Full Integration Testing

### Quiz Completion Test
1. **Navigate to quiz**: `http://localhost:3000/quiz`
2. **Complete all steps** with test data:
   - Name: Test User
   - Email: test@example.com (use unique email)
   - Phone: Valid phone number
   - Fill all quiz steps
3. **Submit quiz** and check logs

### Console Log Verification
- [ ] **Success Messages**
  ```
  "Creating HighLevel contact for: test@example.com"
  "HighLevel contact created successfully: [contact-id]"
  "HighLevel sync successful: Contact created [contact-id]"
  ```

- [ ] **OR Update Messages** (if email exists)
  ```
  "Contact exists, attempting to update..."
  "Updating existing contact: [contact-id]"
  "HighLevel contact updated successfully"
  "HighLevel sync successful: Contact updated [contact-id]"
  ```

### HighLevel Dashboard Verification
- [ ] **Contact appears in HighLevel**
  - Go to Contacts section in HighLevel
  - Search for test email address
  - Contact record exists

- [ ] **All custom fields populated**
  - View contact details
  - All 14 custom fields have values
  - Data matches quiz responses
  - Quiz Completed timestamp present

## 🚨 Error Handling Testing

### Graceful Failure Tests
- [ ] **Invalid API Key Test**
  - Temporarily change HL_API_KEY to invalid value
  - Complete quiz
  - Verify: Quiz continues, error logged, user reaches results

- [ ] **Invalid Location ID Test**  
  - Temporarily change HL_LOCATION_ID to invalid value
  - Complete quiz
  - Verify: Quiz continues, error logged, user reaches results

- [ ] **Network Failure Simulation**
  - Disconnect internet during quiz submission
  - Verify: Quiz continues, error logged, user reaches results

## 🔍 Debug Mode Testing

### Enable Debug Mode
- [ ] **Add to .env.local**: `HL_DEBUG_MODE=true`
- [ ] **Restart development server**
- [ ] **Complete test quiz**
- [ ] **Verify debug output**:
  ```
  "HighLevel payload:" + full JSON payload
  ```

## 🚀 Production Readiness

### Deployment Preparation  
- [ ] **Environment variables configured in hosting platform**
  - HL_API_KEY set correctly
  - HL_LOCATION_ID set correctly
  - No debug mode in production

- [ ] **Production API key** (if different from development)
  - Generated with same permissions
  - Tested in production environment

- [ ] **Final production test**
  - Complete quiz in production
  - Verify contact creation in HighLevel
  - Check all custom fields populated

## ✅ Sign-Off Checklist

### Technical Requirements Met
- [ ] All 14 custom fields created and properly named
- [ ] API connection successful (test endpoint passes)  
- [ ] Full integration test successful (contact created)
- [ ] Error handling working (graceful failures)
- [ ] Production environment configured

### Business Requirements Met
- [ ] Quiz data captures all required lead information
- [ ] HighLevel receives complete lead profiles
- [ ] Lead source tracking implemented ("Future Fulfillment Quiz")
- [ ] Timestamp tracking implemented (Quiz Completed field)
- [ ] Duplicate handling working (updates existing contacts)

### Quality Assurance
- [ ] No errors blocking user experience
- [ ] All console errors resolved
- [ ] Documentation updated and accurate
- [ ] Team trained on troubleshooting process

---

## 📞 Support Information

**If tests fail, check:**
1. API key format (starts with `eyJ...`)
2. Custom field names (exact case match)
3. Network connectivity
4. HighLevel service status

**For debugging:**
1. Enable debug mode in .env.local
2. Check browser console logs
3. Review HighLevel activity logs
4. Verify API permissions in HighLevel

**Success Criteria:**
✅ Test endpoint returns success
✅ Quiz completion creates/updates contact
✅ All 14 custom fields populated  
✅ No user experience interruptions
✅ Production deployment working

**Date Completed:** ___________
**Verified By:** ___________
**Sign-off:** ___________ 