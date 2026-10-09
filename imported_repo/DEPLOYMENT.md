# AkaziConnect redirect deployment

The static redirect pages and Akazi app in this folder have **not been deployed**. This build does not confirm that `akaziconnect.com` is serving these files.

To make the branded links work, publish the **contents** of `outputs/akazi-rwanda-jobs/` as the web root for `https://akaziconnect.com/`. Configure the domain’s DNS, hosting, and HTTPS certificate with the hosting provider. Keep the `apply/` directories and `redirect-map.json` at the root. The host must serve each `apply/{slug}/index.html` when a request arrives with the trailing slash, including for static directory indexes.

After deployment, verify a normal web redirect, the FH destination (its source explicitly uses HTTP), and the email redirects on supported desktop and mobile browsers. Each page includes a meta-refresh fallback and a visible link to the original destination if automatic redirection is blocked. For `mailto:` destinations, the page’s web canonical is the source listing because an email URI is not a canonical web URL; the exact email destination remains in the redirect metadata, script, fallback anchor, and manifest.

The app also links to each original source listing separately so people can verify dates and instructions. Do not treat `redirect-map.json` as evidence that the domain is live; it is only the route manifest for this build.
