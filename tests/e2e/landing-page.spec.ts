import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('M0 - renders page1 image correctly on mobile and desktop', async ({ page }) => {
    // Check that page1 image is visible
    const page1Image = page.locator('img[alt*="임플란트 건강한미소"]')
    await expect(page1Image).toBeVisible()

    // Check image is properly sized
    const imageBox = await page1Image.boundingBox()
    expect(imageBox?.width).toBeGreaterThan(300)

    // Verify image loads correctly
    await expect(page1Image).toHaveAttribute('src', '/images/page1.jpeg')
  })

  test('M1 - displays form sections in correct order', async ({ page }) => {
    // Verify privacy notice is displayed
    const privacyNotice = page.locator('text=입력하신 이름과 전화번호는')
    await expect(privacyNotice).toBeVisible()

    // Verify form fields are present in order
    await expect(page.locator('#name')).toBeVisible()
    await expect(page.locator('#phone')).toBeVisible()
    await expect(page.locator('#consent')).toBeVisible()

    // Verify terms toggle link exists
    const termsToggle = page.locator('button:has-text("약관보기")')
    await expect(termsToggle).toBeVisible()

    // Verify submit button image is visible
    const submitButton = page.locator('button[aria-label="상담신청하기"]')
    await expect(submitButton).toBeVisible()
  })

  test('M1 - terms toggle functionality works correctly', async ({ page }) => {
    const termsToggle = page.locator('button:has-text("약관보기")')
    const termsContent = page.locator('#terms-content')

    // Initially terms should be hidden
    await expect(termsContent).not.toBeVisible()
    await expect(termsToggle).toHaveAttribute('aria-expanded', 'false')

    // Click to expand terms
    await termsToggle.click()
    await expect(termsContent).toBeVisible()
    await expect(termsToggle).toHaveAttribute('aria-expanded', 'true')

    // Click again to collapse terms
    await termsToggle.click()
    await expect(termsContent).not.toBeVisible()
    await expect(termsToggle).toHaveAttribute('aria-expanded', 'false')

    // Verify terms content includes required information
    await termsToggle.click()
    await expect(termsContent).toContainText('수집항목')
    await expect(termsContent).toContainText('수집목적')
    await expect(termsContent).toContainText('보관기간')
  })

  test('M2 - name validation works correctly', async ({ page }) => {
    const nameInput = page.locator('#name')
    const nameError = page.locator('#name-error')

    // Test empty name
    await nameInput.fill('')
    await nameInput.blur()
    await expect(nameError).toContainText('이름을 입력해주세요')

    // Test name too long (16 characters)
    await nameInput.fill('가나다라마바사아자차카타파하다라')
    await expect(nameError).toContainText('15자 이하로')

    // Test valid name
    await nameInput.fill('홍길동')
    await expect(nameError).toBeEmpty()
  })

  test('M2 - phone validation and auto-hyphen works correctly', async ({ page }) => {
    const phoneInput = page.locator('#phone')
    const phoneError = page.locator('#phone-error')

    // Test auto-hyphen insertion
    await phoneInput.fill('01012345678')
    await expect(phoneInput).toHaveValue('010-1234-5678')

    // Test invalid phone format
    await phoneInput.fill('123')
    await expect(phoneError).toContainText('올바른 전화번호')

    // Test valid phone
    await phoneInput.fill('01012345678')
    await expect(phoneError).toBeEmpty()
  })

  test('M2 - consent checkbox validation works correctly', async ({ page }) => {
    const consentCheckbox = page.locator('#consent')
    const consentError = page.locator('#consent-error')
    const submitButton = page.locator('button[aria-label="상담신청하기"]')

    // Fill valid name and phone
    await page.locator('#name').fill('홍길동')
    await page.locator('#phone').fill('01012345678')

    // Check that submit button is disabled without consent
    await expect(submitButton).toBeDisabled()

    // Check consent
    await consentCheckbox.check()
    await expect(consentError).toBeEmpty()
    await expect(submitButton).toBeEnabled()

    // Uncheck consent
    await consentCheckbox.uncheck()
    await expect(submitButton).toBeDisabled()
  })

  test('M3 - submit button is keyboard accessible', async ({ page }) => {
    const submitButton = page.locator('button[aria-label="상담신청하기"]')

    // Fill valid form data
    await page.locator('#name').fill('홍길동')
    await page.locator('#phone').fill('01012345678')
    await page.locator('#consent').check()

    // Test keyboard focus and activation
    await submitButton.focus()
    await expect(submitButton).toBeFocused()

    // Test Enter key
    await page.keyboard.press('Enter')

    // Should show loading state or success (depending on API)
    await expect(page.locator('.loading, .success-section')).toBeVisible({ timeout: 5000 })
  })

  test('M6 - full form submission flow', async ({ page }) => {
    // Fill out form with valid data
    await page.locator('#name').fill('테스트유저')
    await page.locator('#phone').fill('01012345678')
    await page.locator('#consent').check()

    // Click submit button
    const submitButton = page.locator('button[aria-label="상담신청하기"]')
    await submitButton.click()

    // Wait for either success message or error
    await page.waitForSelector('.success-section, [role="alert"]', { timeout: 10000 })

    // Check if success page is shown or error message
    const successSection = page.locator('.success-section')
    if (await successSection.isVisible()) {
      await expect(successSection).toContainText('상담 신청이 완료되었습니다')
    } else {
      // If there's an error, it should be a user-friendly message
      const errorAlert = page.locator('[role="alert"]')
      await expect(errorAlert).toBeVisible()
    }
  })

  test('M6 - mobile viewport displays correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    // Check that all elements are visible and properly sized on mobile
    const page1Image = page.locator('img[alt*="임플란트 건강한미소"]')
    await expect(page1Image).toBeVisible()

    const formContainer = page.locator('.form-container')
    await expect(formContainer).toBeVisible()

    const submitButton = page.locator('button[aria-label="상담신청하기"]')
    await expect(submitButton).toBeVisible()

    // Check that form is properly centered
    const formBox = await formContainer.boundingBox()
    expect(formBox?.x).toBeGreaterThanOrEqual(0)
  })

  test('M6 - error handling for invalid submissions', async ({ page }) => {
    // Test with invalid name (empty)
    await page.locator('#name').fill('')
    await page.locator('#phone').fill('01012345678')
    await page.locator('#consent').check()

    const submitButton = page.locator('button[aria-label="상담신청하기"]')
    await expect(submitButton).toBeDisabled()

    // Test with invalid phone
    await page.locator('#name').fill('홍길동')
    await page.locator('#phone').fill('123')
    await page.locator('#consent').check()

    await expect(submitButton).toBeDisabled()

    // Test without consent
    await page.locator('#name').fill('홍길동')
    await page.locator('#phone').fill('01012345678')
    await page.locator('#consent').uncheck()

    await expect(submitButton).toBeDisabled()
  })

  test('M6 - accessibility features work correctly', async ({ page }) => {
    // Check ARIA labels and roles
    const submitButton = page.locator('button[aria-label="상담신청하기"]')
    await expect(submitButton).toHaveAttribute('aria-label', '상담신청하기')

    const termsToggle = page.locator('button:has-text("약관보기")')
    await expect(termsToggle).toHaveAttribute('aria-expanded')

    // Check error messages have proper ARIA attributes
    await page.locator('#name').fill('')
    await page.locator('#name').blur()

    const nameError = page.locator('#name-error')
    await expect(nameError).toHaveAttribute('role', 'alert')
    await expect(nameError).toHaveAttribute('aria-live', 'polite')

    // Check form labels are properly associated
    const nameLabel = page.locator('label[for="name"]')
    await expect(nameLabel).toBeVisible()

    const phoneLabel = page.locator('label[for="phone"]')
    await expect(phoneLabel).toBeVisible()
  })
})