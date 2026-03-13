# WhatsApp Webhook Modularization - Approved Plan
## Status: [ ] In Progress

### 1. Create server/routes/webhook.js ✅ DONE
   - GET /webhook: verification with VERIFY_TOKEN="chamunda123" (mode/subscribe check)
   - POST /webhook: extract processIncomingMessage, sendAutoReply logic from index.js
   - Export router

### 2. Update server/index.js ✅ DONE
   - Import webhook routes
   - Mount: app.use('/api/whatsapp', webhookRouter);
   - Remove inline app.get/post('/api/whatsapp/webhook')
   - Keep other routes (send/bulk/customers) inline for now

### 3. Test webhook
   ```bash
   # Verify
   curl "http://localhost:3002/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=chamunda123&hub.challenge=test"
   
   # Should return: test (status 200)
   ```

### 4. Restart server
   ```bash
   node server/index.js
   ```

### 5. [ ] Complete - attempt_completion

**Notes:** Path /api/whatsapp/webhook preserved. No frontend changes. Uses existing MongoDB/messages/customers logic.
