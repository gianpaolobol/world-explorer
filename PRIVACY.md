# Privacy — development policy

World Explorer is under development. This document describes design requirements, not a verified production privacy notice.

Learning history should be stored locally by default, with deletion and export controls. No credentials, personal data, private logs or API keys may be committed to this public repository. External maps, imagery, speech and AI services may process requests under their own terms; these integrations must be documented before release. Cloud synchronization and analytics require a separate assessment and appropriate user controls. A complete GDPR notice identifying actual processing, legal bases, retention, recipients and contact details must be prepared before production deployment.

Optional boundary display fetches pinned public datasets from GitHub. Optional nearby-image search sends only atlas camera coordinates (not device location or learning history) to Wikimedia Commons, and loads selected thumbnails from Wikimedia's image host. Requests omit credentials and referrers where supported; providers still receive network metadata such as IP. No automatic photo requests on country changes.
