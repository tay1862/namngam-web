# Settings API Fix Complete! ✅

## 🐛 Problem

Settings page was getting error when saving:
```
PrismaClientValidationError: 
Unknown argument `siteDescription_lo`
Unknown argument `contactEmail`
Unknown argument `facebookUrl`
Unknown argument `whatsappNumber`
```

**Cause:** Field names in Settings form didn't match Prisma schema

---

## ✅ Solution

Updated Settings API and Settings page to match Prisma schema field names.

### Changed Fields:

| Old Field Name | New Field Name | Description |
|----------------|----------------|-------------|
| `siteDescription_*` | `defaultMetaDesc_*` | Default meta description (SEO) |
| `contactEmail` | `email` | Contact email |
| `contactPhone` | `phone` | Contact phone |
| `contactAddress_*` | `address_*` | Physical address |
| `facebookUrl` | `facebookPage` | Facebook page URL |
| `whatsappNumber` | `whatsapp` | WhatsApp number |
| ~~`instagramUrl`~~ | *(removed)* | Not in schema |

---

## 📝 Schema Fields (SiteSettings)

According to `prisma/schema.prisma`:

### Multi-language Fields:
```prisma
siteName_lo, siteName_th, siteName_zh, siteName_en
address_lo, address_th, address_zh, address_en (Text)
defaultMetaDesc_lo, defaultMetaDesc_th, defaultMetaDesc_zh, defaultMetaDesc_en (Text)
whatsappMessage_lo, whatsappMessage_th, whatsappMessage_zh, whatsappMessage_en (Text)
maintenanceMessage_lo, maintenanceMessage_th, maintenanceMessage_zh, maintenanceMessage_en (Text)
```

### Single Fields:
```prisma
logo (String)
favicon (String)
homeBg, aboutBg, productsBg, articlesBg (String)
email, phone (String)
whatsapp (String)
facebookPage, lineId (String)
googleAnalyticsId, facebookPixelId (String)
isUnderMaintenance (Boolean)
```

---

## 🔧 Files Modified

### 1. Settings API (`src/app/api/settings/route.ts`)

**Changed default values:**
```typescript
// Before:
{
  siteDescription_lo: '',
  contactEmail: '',
  contactPhone: '',
  contactAddress_lo: '',
  facebookUrl: '',
  whatsappNumber: '',
  instagramUrl: '',
}

// After:
{
  defaultMetaDesc_lo: '',
  email: '',
  phone: '',
  address_lo: '',
  facebookPage: '',
  whatsapp: '',
}
```

### 2. Settings Page (`src/app/admin/settings/page.tsx`)

**Changed form fields:**
```typescript
// Before:
register('siteDescription_lo')
register('contactEmail')
register('facebookUrl')
register('whatsappNumber')
register('instagramUrl')

// After:
register('defaultMetaDesc_lo')
register('email')
register('facebookPage')
register('whatsapp')
// Removed instagramUrl
```

**Changed labels:**
- "Site Description" → "Default Meta Description"
- "Contact Address" → "Address"
- "Facebook URL" → "Facebook Page URL"
- "WhatsApp Number" → "WhatsApp Number" (field name changed)
- Removed "Instagram URL" field

---

## 🧪 Testing

### Test Settings Save:

1. **Login to Admin:**
```
http://localhost:3001/admin/login
```

2. **Go to Settings:**
```
http://localhost:3001/admin/settings
```

3. **Fill Form:**
```
Site Information (4 languages):
- Site Name: NAMNGAM
- Default Meta Description: (SEO description)
- Address: (Physical address)

Contact Information:
- Email: contact@namngam.com
- Phone: +856 20 1234 5678

Social Media:
- Facebook Page URL: https://facebook.com/namngam
- LINE ID: @namngam
- WhatsApp Number: 8562012345678
```

4. **Upload Logo:**
- Click "Upload Logo"
- Select or upload image

5. **Click "Save Settings":**
```
✅ Should see: "Settings saved successfully!"
✅ No more errors!
```

---

## 📊 Current Settings Structure

```
SiteSettings {
  ┌─ Multi-Language ─────────────────┐
  │ siteName (4 languages)           │
  │ defaultMetaDesc (4 languages)    │
  │ address (4 languages)            │
  │ whatsappMessage (4 languages)    │
  │ maintenanceMessage (4 languages) │
  └──────────────────────────────────┘
  
  ┌─ Images ──────────────────────────┐
  │ logo                              │
  │ favicon                           │
  │ homeBg, aboutBg, productsBg, etc. │
  └───────────────────────────────────┘
  
  ┌─ Contact ─────────────────────────┐
  │ email                             │
  │ phone                             │
  │ whatsapp                          │
  └───────────────────────────────────┘
  
  ┌─ Social Media ────────────────────┐
  │ facebookPage                      │
  │ lineId                            │
  └───────────────────────────────────┘
  
  ┌─ Analytics ───────────────────────┐
  │ googleAnalyticsId                 │
  │ facebookPixelId                   │
  └───────────────────────────────────┘
  
  ┌─ Maintenance ─────────────────────┐
  │ isUnderMaintenance (boolean)      │
  │ maintenanceMessage (4 languages)  │
  └───────────────────────────────────┘
}
```

---

## 🎯 What Changed

### Settings Page UI:

**Before:**
```
Site Information:
- Site Name
- Site Description        ← Changed to Meta Description
- Contact Address         ← Changed to Address

Contact Information:
- Email (contactEmail)    ← Changed to email
- Phone (contactPhone)    ← Changed to phone

Social Media:
- Facebook URL            ← Changed to Facebook Page URL
- LINE ID
- WhatsApp Number         ← Field name changed
- Instagram URL           ← Removed
```

**After:**
```
Site Information:
- Site Name
- Default Meta Description  ← For SEO
- Address

Contact Information:
- Email (email)
- Phone (phone)

Social Media:
- Facebook Page URL
- LINE ID
- WhatsApp Number
```

---

## ✅ Verification

**Build Status:** ✅ Success

**Changes:**
- ✅ API field names match schema
- ✅ Form field names match schema
- ✅ No more validation errors
- ✅ Settings can be saved
- ✅ All 4 languages supported

---

## 📝 Notes

**Why "defaultMetaDesc" instead of "siteDescription"?**
- Schema uses `defaultMetaDesc_*` for SEO meta descriptions
- This is the default description for pages that don't have their own
- More accurate naming for SEO purposes

**Instagram URL Removed:**
- Not in the Prisma schema
- Can be added later if needed by:
  1. Adding field to Prisma schema
  2. Running `prisma db push`
  3. Adding to Settings form

**WhatsApp Message:**
- Schema has `whatsappMessage_*` (4 languages)
- Not added to form yet
- This is the default message when clicking WhatsApp button
- Can be added in future if needed

---

## 🚀 Next Steps (Optional)

If you want to add more settings fields:

1. **Add to Prisma Schema:**
```prisma
model SiteSettings {
  // ... existing fields
  instagramUrl  String?
  twitterUrl    String?
}
```

2. **Push to Database:**
```bash
npm run db:push
```

3. **Add to Settings Form:**
```typescript
<Input
  label="Instagram URL"
  {...register('instagramUrl')}
  placeholder="https://instagram.com/namngam"
/>
```

4. **Update API default values:**
```typescript
data: {
  // ... existing fields
  instagramUrl: '',
}
```

---

## 🎉 Summary

**Problem Fixed:** ✅ Settings API validation error

**Cause:** Field names mismatch between form and database schema

**Solution:** Updated field names to match Prisma schema

**Result:** Settings page now works correctly and can save all data!

---

**Settings page is now fully functional!** 🎉

You can now:
- ✅ Configure site information (4 languages)
- ✅ Set contact details (email, phone)
- ✅ Add social media links (Facebook, LINE, WhatsApp)
- ✅ Upload logo
- ✅ Save without errors!

© 2024 NAMNGAM ORIGINAL
