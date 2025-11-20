
from playwright.sync_api import Page, expect, sync_playwright
import time
import os

def verify_navigation_fix(page: Page):
    # 1. Go to Landing
    page.goto("http://localhost:3000")

    page.wait_for_load_state("domcontentloaded")

    # 2. Handle Age Gate
    age_btn = page.get_by_text("I AM 18 OR OLDER - ENTER")
    age_btn.wait_for(state="visible", timeout=30000)
    age_btn.click()

    # 3. Continue as Guest
    expect(page.get_by_text("Start Your Free Trial")).to_be_visible(timeout=30000)
    page.get_by_role("button", name="Continue as Guest").click()

    # 4. Verify Home
    # Use heading role to be specific
    expect(page.get_by_role("heading", name="Welcome, Guest!")).to_be_visible(timeout=30000)

    # Check Back button exists initially
    back_button = page.get_by_label("Go Back")
    expect(back_button).to_be_visible()

    # 5. Browser Back
    page.go_back()
    expect(page.get_by_text("Start Your Free Trial")).to_be_visible(timeout=30000)

    # 6. Browser Forward
    page.go_forward()
    expect(page.get_by_role("heading", name="Welcome, Guest!")).to_be_visible(timeout=30000)

    # 7. Verify Back button exists (The Fix)
    expect(back_button).to_be_visible()

    # Take screenshot
    page.screenshot(path="verification/back_button_fixed.png")
    print("Verification successful, screenshot taken.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_navigation_fix(page)
        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()
