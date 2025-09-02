import { test, expect } from '@playwright/test';

test.describe('3ple Digit - E2E Smoke Test', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
  });

  test('complete investment workflow: add asset → valuation → snapshot', async ({ page }) => {
    // Step 1: Login as admin
    await test.step('Login as admin user', async () => {
      // Check if we're on login page or need to navigate there
      const loginButton = page.locator('text=Prihlásiť sa').or(page.locator('text=Login'));
      
      if (await loginButton.isVisible()) {
        await loginButton.click();
      } else {
        // Navigate to login if not already there
        await page.goto('/login');
      }

      // Fill login form
      await page.fill('input[type="email"]', 'admin@3pledigit.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');

      // Wait for successful login and redirect to dashboard
      await expect(page).toHaveURL('/');
      await expect(page.locator('text=Dashboard').or(page.locator('text=Prehľad'))).toBeVisible();
    });

    // Step 2: Navigate to Assets page and add new asset
    await test.step('Add new real estate asset', async () => {
      // Navigate to Assets page
      await page.click('text=Aktíva');
      await expect(page).toHaveURL('/assets');
      
      // Click "Add Asset" button
      await page.click('text=Pridať aktívum');
      
      // Fill asset form
      await page.fill('input[name="name"]', 'E2E Test Property');
      await page.selectOption('select[name="type"]', 'real_estate');
      await page.fill('input[name="acquiredPrice"]', '500000');
      await page.fill('input[name="currentValue"]', '500000');
      await page.fill('textarea[name="note"]', 'E2E test asset for smoke testing');
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Verify asset was created
      await expect(page.locator('text=E2E Test Property')).toBeVisible();
    });

    // Step 3: Add asset valuation event
    await test.step('Add asset valuation event', async () => {
      // Find and click on the asset we just created
      const assetRow = page.locator('tr').filter({ hasText: 'E2E Test Property' });
      await assetRow.click();
      
      // Click "Add Event" or similar button
      await page.click('text=Pridať udalosť').or(page.click('text=Add Event'));
      
      // Fill event form
      await page.selectOption('select[name="kind"]', 'VALUATION');
      await page.fill('input[name="amount"]', '550000');
      await page.fill('textarea[name="note"]', 'Market valuation increase');
      
      // Submit event
      await page.click('button[type="submit"]');
      
      // Verify current value updated
      await expect(page.locator('text=550,000')).toBeVisible();
    });

    // Step 4: Navigate to Snapshots and create new snapshot
    await test.step('Create new snapshot', async () => {
      // Navigate to Snapshots page
      await page.click('text=Snapshots');
      await expect(page).toHaveURL('/snapshots');
      
      // Click "Create Snapshot" button
      await page.click('text=Vytvoriť snapshot').or(page.click('text=Create Snapshot'));
      
      // Fill snapshot form
      await page.fill('input[name="performanceFeeRate"]', '2.5');
      
      // Submit snapshot
      await page.click('button[type="submit"]');
      
      // Verify snapshot was created and shows correct NAV
      await expect(page.locator('text=550,000').or(page.locator('text=€550,000'))).toBeVisible();
    });

    // Step 5: Verify NAV calculation on dashboard
    await test.step('Verify NAV on dashboard', async () => {
      // Navigate back to dashboard
      await page.click('text=Dashboard').or(page.click('text=Prehľad'));
      await expect(page).toHaveURL('/');
      
      // Verify NAV card shows correct value
      await expect(page.locator('.nav-card').or(page.locator('[data-testid="nav-card"]'))).toContainText('550');
    });

    // Step 6: Check Reports page
    await test.step('Verify reports show asset data', async () => {
      // Navigate to Reports page
      await page.click('text=Reporty').or(page.click('text=Reports'));
      await expect(page).toHaveURL('/reports');
      
      // Verify portfolio report shows our asset
      await expect(page.locator('text=E2E Test Property')).toBeVisible();
      await expect(page.locator('text=real_estate')).toBeVisible();
    });

    // Step 7: Cleanup - mark asset as sold (optional)
    await test.step('Mark asset as sold (cleanup)', async () => {
      // Navigate back to Assets
      await page.click('text=Aktíva');
      
      // Find our asset and mark as sold
      const assetRow = page.locator('tr').filter({ hasText: 'E2E Test Property' });
      await assetRow.click();
      
      // Click "Mark as Sold" button if available
      const markSoldButton = page.locator('text=Označiť ako predané').or(page.locator('text=Mark as Sold'));
      
      if (await markSoldButton.isVisible()) {
        await markSoldButton.click();
        
        // Fill sale form
        await page.fill('input[name="salePrice"]', '580000');
        await page.fill('textarea[name="note"]', 'E2E test sale');
        
        // Submit sale
        await page.click('button[type="submit"]');
        
        // Verify asset is marked as sold
        await expect(page.locator('text=SOLD')).toBeVisible();
      }
    });
  });

  test('investor management workflow', async ({ page }) => {
    // Step 1: Login (reuse login logic)
    await test.step('Login as admin user', async () => {
      const loginButton = page.locator('text=Prihlásiť sa').or(page.locator('text=Login'));
      
      if (await loginButton.isVisible()) {
        await loginButton.click();
      } else {
        await page.goto('/login');
      }

      await page.fill('input[type="email"]', 'admin@3pledigit.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL('/');
    });

    // Step 2: Add new investor
    await test.step('Add new investor', async () => {
      await page.click('text=Investori');
      await expect(page).toHaveURL('/investors');
      
      await page.click('text=Pridať investora');
      
      await page.fill('input[name="name"]', 'E2E Test Investor');
      await page.fill('input[name="email"]', 'e2e-investor@test.com');
      
      await page.click('button[type="submit"]');
      
      await expect(page.locator('text=E2E Test Investor')).toBeVisible();
    });

    // Step 3: Add investor deposit
    await test.step('Add investor deposit', async () => {
      const investorRow = page.locator('tr').filter({ hasText: 'E2E Test Investor' });
      await investorRow.click();
      
      await page.click('text=Pridať cashflow');
      
      await page.selectOption('select[name="type"]', 'DEPOSIT');
      await page.fill('input[name="amount"]', '100000');
      await page.fill('textarea[name="note"]', 'Initial investment');
      
      await page.click('button[type="submit"]');
      
      await expect(page.locator('text=100,000')).toBeVisible();
    });

    // Step 4: Create snapshot to calculate ownership
    await test.step('Create snapshot for ownership calculation', async () => {
      await page.click('text=Snapshots');
      await page.click('text=Vytvoriť snapshot');
      
      await page.click('button[type="submit"]');
      
      // Verify investor appears in snapshot with ownership percentage
      await expect(page.locator('text=E2E Test Investor')).toBeVisible();
    });
  });

  test('navigation and UI responsiveness', async ({ page }) => {
    // Test basic navigation and UI elements
    await test.step('Test navigation menu', async () => {
      // Login first
      await page.goto('/login');
      await page.fill('input[type="email"]', 'admin@3pledigit.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      
      // Test all main navigation links
      const navLinks = [
        { text: 'Dashboard', url: '/' },
        { text: 'Investori', url: '/investors' },
        { text: 'Aktíva', url: '/assets' },
        { text: 'Banka', url: '/bank' },
        { text: 'Záväzky', url: '/liabilities' },
        { text: 'Snapshots', url: '/snapshots' },
        { text: 'Dokumenty', url: '/documents' },
        { text: 'Reporty', url: '/reports' },
      ];

      for (const link of navLinks) {
        await page.click(`text=${link.text}`);
        await expect(page).toHaveURL(link.url);
        
        // Verify page loads without errors
        await expect(page.locator('body')).not.toContainText('Error');
        await expect(page.locator('body')).not.toContainText('404');
      }
    });

    // Test responsive design (mobile view)
    await test.step('Test mobile responsiveness', async () => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
      
      await page.goto('/');
      
      // Verify mobile navigation works
      const mobileMenuButton = page.locator('button').filter({ hasText: '☰' }).or(page.locator('[data-testid="mobile-menu"]'));
      
      if (await mobileMenuButton.isVisible()) {
        await mobileMenuButton.click();
        await expect(page.locator('text=Investori')).toBeVisible();
      }
      
      // Reset to desktop view
      await page.setViewportSize({ width: 1280, height: 720 });
    });
  });

  test('error handling and validation', async ({ page }) => {
    await test.step('Test form validation', async () => {
      // Login
      await page.goto('/login');
      await page.fill('input[type="email"]', 'admin@3pledigit.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      
      // Test asset form validation
      await page.click('text=Aktíva');
      await page.click('text=Pridať aktívum');
      
      // Try to submit empty form
      await page.click('button[type="submit"]');
      
      // Verify validation errors appear
      await expect(page.locator('text=required').or(page.locator('text=povinné'))).toBeVisible();
    });

    await test.step('Test API error handling', async () => {
      // Try to access protected route without proper auth (simulate expired token)
      await page.evaluate(() => {
        localStorage.removeItem('auth-token');
        sessionStorage.clear();
      });
      
      await page.goto('/assets');
      
      // Should redirect to login or show error
      await expect(page).toHaveURL('/login');
    });
  });
});
