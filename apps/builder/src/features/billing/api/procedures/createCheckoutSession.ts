import prisma from '@/lib/prisma'
import { authenticatedProcedure } from '@/utils/server/trpc'
import { TRPCError } from '@trpc/server'
import { Plan, WorkspaceRole } from 'db'
import Stripe from 'stripe'
import { z } from 'zod'
import { parseSubscriptionItems } from '../utils/parseSubscriptionItems'

export const createCheckoutSession = authenticatedProcedure
  .meta({
    openapi: {
      method: 'POST',
      path: '/billing/subscription/checkout',
      protect: true,
      summary: 'Create checkout session to create a new subscription',
      tags: ['Billing'],
    },
  })
  .input(
    z.object({
      workspaceId: z.string(),
      prefilledEmail: z.string().optional(),
      currency: z.enum(['usd', 'eur']),
      plan: z.enum([Plan.STARTER, Plan.PRO]),
      returnUrl: z.string(),
      additionalChats: z.number(),
      additionalStorage: z.number(),
    })
  )
  .output(
    z.object({
      checkoutUrl: z.string(),
    })
  )
  .mutation(
    async ({
      input: {
        workspaceId,
        prefilledEmail,
        currency,
        plan,
        returnUrl,
        additionalChats,
        additionalStorage,
      },
      ctx: { user },
    }) => {
      if (
        !process.env.STRIPE_SECRET_KEY ||
        !process.env.STRIPE_ADDITIONAL_CHATS_PRICE_ID ||
        !process.env.STRIPE_ADDITIONAL_STORAGE_PRICE_ID
      )
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Stripe environment variables are missing',
        })
      const workspace = await prisma.workspace.findFirst({
        where: {
          id: workspaceId,
          members: { some: { userId: user.id, role: WorkspaceRole.ADMIN } },
        },
      })
      if (!workspace)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Workspace not found',
        })
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2022-11-15',
      })

      const session = await stripe.checkout.sessions.create({
        success_url: `${returnUrl}?stripe=${plan}&success=true`,
        cancel_url: `${returnUrl}?stripe=cancel`,
        allow_promotion_codes: true,
        customer_email: prefilledEmail,
        mode: 'subscription',
        metadata: { workspaceId, plan, additionalChats, additionalStorage },
        currency,
        tax_id_collection: {
          enabled: true,
        },
        billing_address_collection: 'required',
        automatic_tax: { enabled: true },
        line_items: parseSubscriptionItems(
          plan,
          additionalChats,
          additionalStorage
        ),
      })

      if (!session.url)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Stripe checkout session creation failed',
        })

      return {
        checkoutUrl: session.url,
      }
    }
  )
