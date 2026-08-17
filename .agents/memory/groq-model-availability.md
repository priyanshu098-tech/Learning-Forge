---
name: Groq model availability
description: Groq model IDs can vary by account and may be decommissioned.
---

Do not assume a legacy Groq model ID is still callable. Query the configured key's live model catalog when a request returns a model-decommissioned or model-not-found error, then choose an available model that supports the required response features.

**Why:** Groq can remove older model IDs and account access can differ from public examples, so a copied model name may fail even when the SDK and secret are configured correctly.

**How to apply:** Keep the response-format and validation contract independent from the model choice, and verify the selected model with a live `/api/generate` request after configuration changes.