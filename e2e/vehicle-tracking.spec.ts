/**
 * E2E: Flujo completo de registro de vehículo y ruta.
 * register → login → add-vehicle (km: 50000) → add-route (250km)
 * → verificar vehicle-stats.kilometrajeTotal === 50250
 */
import { test, expect, Page } from "@playwright/test";

const timestamp = Date.now();
const TEST_USER = {
  username: `e2euser_${timestamp}`,
  email: `e2e_${timestamp}@test.com`,
  password: "TestPass123!",
};
const VEHICLE = {
  alias: `E2E${timestamp}`.slice(0, 20).toUpperCase(),
  marca: "Toyota",
  plates: `E2E${timestamp}`.slice(-7).toUpperCase(),
  kmInicial: 50000,
};
const ROUTE_KM = 250;

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function register(page: Page) {
  await page.goto("/register");
  await page.getByLabel(/usuario|username/i).fill(TEST_USER.username);
  await page.getByLabel(/email/i).fill(TEST_USER.email);
  await page.getByLabel(/contraseña|password/i).first().fill(TEST_USER.password);
  // Confirm password field if present
  const confirmField = page.getByLabel(/confirmar|confirm/i);
  if (await confirmField.isVisible()) {
    await confirmField.fill(TEST_USER.password);
  }
  await page.getByRole("button", { name: /registrar|register|crear/i }).click();
  // After registration, expect redirect to login or dashboard
  await page.waitForURL(/\/(dashboard|\?|$)/, { timeout: 10_000 });
}

async function login(page: Page) {
  await page.goto("/");
  await page.getByLabel(/email/i).fill(TEST_USER.email);
  await page.getByLabel(/contraseña|password/i).fill(TEST_USER.password);
  await page.getByRole("button", { name: /iniciar|login|entrar/i }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 10_000 });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test.describe("Vehicle tracking flow", () => {
  test("register, add vehicle, add route, verify kilometrajeTotal", async ({
    page,
  }) => {
    // 1. Register
    await register(page);

    // If registration logs us in directly, we might already be on dashboard.
    // Otherwise, login.
    if (!page.url().includes("/dashboard")) {
      await login(page);
    }

    // 2. Add vehicle
    await page.goto("/add-vehicle");
    await page.getByLabel(/alias|nombre/i).fill(VEHICLE.alias);
    await page.getByLabel(/marca/i).fill(VEHICLE.marca);
    await page.getByLabel(/placas/i).fill(VEHICLE.plates);
    await page.getByLabel(/kilometraje inicial/i).fill(String(VEHICLE.kmInicial));
    await page.getByRole("button", { name: /registrar vehículo|guardar/i }).click();

    // Should redirect to dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 10_000 });
    await expect(page.getByText(VEHICLE.alias)).toBeVisible({ timeout: 8_000 });

    // 3. Add route
    await page.goto("/add-route");

    // Select vehicle
    const vehicleSelect = page.getByLabel(/vehículo/i);
    await vehicleSelect.selectOption({ label: VEHICLE.alias });

    // Fill distance
    await page.getByLabel(/distancia/i).fill(String(ROUTE_KM));

    // Fill date (today)
    const today = new Date().toISOString().split("T")[0];
    await page.getByLabel(/fecha/i).fill(today);

    await page.getByRole("button", { name: /registrar|guardar ruta/i }).click();

    // Should redirect to dashboard or routes history
    await page.waitForURL(/\/(dashboard|routes-history)/, { timeout: 10_000 });

    // 4. Verify vehicle-stats
    await page.goto(`/vehicle-stats/${VEHICLE.alias}`);

    const expectedTotal = VEHICLE.kmInicial + ROUTE_KM; // 50250

    // The page should show 50250 as kilometrajeTotal
    await expect(
      page.getByText(new RegExp(expectedTotal.toLocaleString()))
    ).toBeVisible({ timeout: 8_000 });
  });
});
