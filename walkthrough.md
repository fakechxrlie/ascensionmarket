# Redesign & Custom Popups Overhaul Complete

We have successfully replaced all default browser dialogs with custom, premium inline elements, restricted bid inputs, simplified the main landing page, and renamed application navigation parameters.

## Style & Dialog Features:
1. **Landing Page Overhaul:**
   * Simplified the homepage content to feature a direct description of the Ascension marketplace, removing all mock logs, system monitors, and fake statistics.
   * Renders a clean grid layout containing the vertical **`3 / 4`** ratio game selection card links.
2. **Custom Inline Modals & Banners:**
   * **Edit Bid:** Clicking EDIT on a bid now changes the listing row into an **inline text input** with SAVE and CANCEL actions instead of using a browser `prompt` popup.
   * **Delete Bid:** Clicking DELETE now turns the row into an inline confirmation banner: **`DELETE THIS BID? YES / NO`** instead of using a browser `confirm` popup.
   * **Custom Alerts:** Replaced all browser `alert()` popups on the Job Board and Bids list with sleek, monospace **`[SYSTEM STATUS: ...]`** toast bars that display at the top of the interface.
3. **Restricted Bid Input:**
   * Added `min="0"` and validation check to prevent entering negative numbers in the bid box.
   * Removed Firefox/Safari input scroll arrows globally so number input stays clean and boxy.
4. **Copywriting Cleanup:**
   * Replaced the text "Submit KYC Application" in the global navigation bar with **"Become a Booster"**.
   * Replaced the dashboard reminder label with **"BECOME A BOOSTER"**.
