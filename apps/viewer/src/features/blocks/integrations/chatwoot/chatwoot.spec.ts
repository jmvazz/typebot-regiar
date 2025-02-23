import test, { expect } from '@playwright/test'
import { createId } from '@paralleldrive/cuid2'
import { createTypebots } from 'utils/playwright/databaseActions'
import { parseDefaultGroupWithBlock } from 'utils/playwright/databaseHelpers'
import { defaultChatwootOptions, IntegrationBlockType } from 'models'

const typebotId = createId()

const chatwootTestWebsiteToken = 'tueXiiqEmrWUCZ4NUyoR7nhE'

test('should work as expected', async ({ page }) => {
  await createTypebots([
    {
      id: typebotId,
      ...parseDefaultGroupWithBlock(
        {
          type: IntegrationBlockType.CHATWOOT,
          options: {
            ...defaultChatwootOptions,
            websiteToken: chatwootTestWebsiteToken,
          },
        },
        { withGoButton: true }
      ),
    },
  ])
  await page.goto(`/${typebotId}-public`)
  await page.getByRole('button', { name: 'Go' }).click()
  await expect(page.locator('#chatwoot_live_chat_widget')).toBeVisible()
})
