import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { OrderSchemaType, ShippingStatus } from './dto/create-order.dto';
import { Stripe } from 'stripe';
import * as fs from 'fs-extra';
import { MailDataRequired, MailService } from '@sendgrid/mail';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
@Injectable()
export class OrderService {
  constructor(private readonly db: DatabaseService) {}

  async findOne(orderId: string) {
    return await this.db.order.findUnique({
      where: { id: orderId },
      include: { items: true, shippingLabel: true },
    });
  }
  async confirmOrder(token: string) {
    return await this.db.$transaction(async (trx) => {
      const session = await stripe.checkout.sessions.retrieve(token);
      const orderId = (session.metadata as any).orderId;
      const order = await trx.order.findUnique({
        where: { id: `${JSON.parse(orderId)}` },
        include: { items: true, additionalInfo: true },
      });
      // console.log(orderId, session);
      if (!order) {
        throw new Error('Order not found');
      }
      const updatedOrder = await trx.order.update({
        where: { id: `${JSON.parse(orderId)}` },
        data: { stripeSessionId: token },
        include: {
          items: { include: { product: true } },
          additionalInfo: true,
        },
      });
      const payload = {};
      updatedOrder.items.forEach((item) => {
        if (!payload[`${item.product.brandLabel}`]) {
          payload[`${item.product.brandLabel}`] = updatedOrder.items.filter(
            (i) => i.product.brandLabel === item.product.brandLabel,
          );
        }
      });
      await Promise.all(
        Object.keys(payload).map(async (item) => {
          let htmlTemplate = fs.readFileSync(
            process.cwd() + '/src/order/email-templates/order-template.html',
            'utf8',
          );
          console.log(payload);
          const data = {
            customerName: (updatedOrder.additionalInfo[0] as any)
              .shipping_fullName,
            email: (updatedOrder.additionalInfo[0] as any).shipping_email,
            phone: (updatedOrder.additionalInfo[0] as any).shipping_phone,
            shippingAddress: `${(updatedOrder.additionalInfo[0] as any).shipping_address}, ${(updatedOrder.additionalInfo[0] as any).shipping_city}, ${(updatedOrder.additionalInfo[0] as any).shipping_state}, ${(updatedOrder.additionalInfo[0] as any).shipping_zip}, ${(updatedOrder.additionalInfo[0] as any).shipping_country}`,
            billingAddress: (updatedOrder.additionalInfo[0] as any)
              .billing_address,
            products: payload[item].map((item) => ({
              productId: item.product.partNumber,
              productLabel: item.product.mfrLabel,
              quantity: item.quantity,
            })),
          };

          // Replace placeholders manually (simple way)
          htmlTemplate = htmlTemplate
            .replace('{{customerName}}', data.customerName)
            .replace('{{email}}', data.email)
            .replace('{{phone}}', data.phone)
            .replace('{{shippingAddress}}', data.shippingAddress)
            .replace('{{billingAddress}}', data.billingAddress)
            .replace('{{orderNumber}}', `${updatedOrder.orderNumber}`);

          // Generate product rows dynamically
          let productRows = '';
          data.products.forEach((p, i) => {
            productRows += `
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${i + 1}</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${p.productId}</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${p.productLabel}</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${p.quantity}</td>
            </tr>
          `;
          });

          // Insert product rows into the HTML
          htmlTemplate = htmlTemplate.replace(
            '<!-- Example products -->',
            productRows,
          );

          const sendgrid = new MailService();
          sendgrid.setApiKey(process.env.SENDGRID_API_KEY || '');
          const supplier = await this.db.supplier.findFirst({
            where: { brandLabel: item },
          });

          if (!supplier) throw new Error('Supplier not found');
          const msg = {
            to: supplier?.emailAddress, // Change to your recipient
            from: process.env.EMAIL_SERVICE_FROM, // Change to your verified sender
            subject: 'Order from the Cowboy Autopart Customer',
            cc: process.env.CC_EMAIL,
            text: `A user has order these products from the Cowboy Autopart `,
            html: `${htmlTemplate}`,
          } as MailDataRequired;

          try {
            const response = await sendgrid.send(msg);
            console.log('Email sent', response);
          } catch (error) {
            console.log(error?.response?.body?.errors);
          }
          console.log(htmlTemplate);
          return { htmlTemplate };
        }),
      );

      // Now htmlTemplate contains your final HTML
      // console.log(htmlTemplate);
    });
  }

  async findAll() {
    return await this.db.order.findMany({
      include: { items: true, shippingLabel: true },
    });
  }

  async create(body: OrderSchemaType) {
    return await this.db.$transaction(async (trx) => {
      const order = await trx.order.create({
        data: {
          items: {
            createMany: {
              data: body.orderProducts.map((item) => ({
                price: item.price,
                quantity: item.quantity,
                productId: item.productId,
              })),
            },
          },
          shippingLabel: {
            create: {
              trackingNumber: 'N/A',
              labelUrl: 'N/A',
            },
          },
          additionalInfo: { create: body.additionalInfo },
        },
        include: { items: true },
      });
      const items = await Promise.all(
        order.items.map(async (item) => {
          const product = await trx.product.findUnique({
            where: { id: item.productId },
          });

          const price = await stripe.prices.create({
            unit_amount: item.price * 100,
            currency: 'usd',
            metadata: {
              orderId: order.id,
              quantity: item.quantity,
              productId: item.productId,
            },
            product_data: {
              name: product?.mfrLabel || 'N/A',
            },
          });

          return price;
        }),
      );

      // Stripe expects expires_at as a Unix timestamp (seconds, not milliseconds)
      // Stripe requires expires_at to be a Unix timestamp (seconds) and no more than 5 years in the future.
      // Here, we set it to 5 minutes from now, which is well within the allowed range.
      const expires_at = Math.floor((Date.now() + 30 * 60 * 1000) / 1000);
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: items.map((item) => ({
          price: item.id,
          quantity: Number(item.metadata.quantity),
        })),
        metadata: {
          orderId: JSON.stringify(order.id),
        },
        mode: 'payment',
        expires_at: Number(expires_at),
        // cancel_url: '',
        success_url: `${process.env.STRIPE_SUCCESS_URL}`,
        // return_url: '',
      });
      return { url: session.url };
    });
  }

  async getOrderByTrackingNumber(trackingNumber: string) {
    return await this.db.order.findFirst({
      where: { shippingLabel: { trackingNumber } },
      include: { items: true, shippingLabel: true },
    });
  }

  async getOrderByOrderNumber(orderNumber: string) {
    return await this.db.order.findFirst({
      where: { orderNumber: Number(orderNumber) },
      include: { items: true, shippingLabel: true, additionalInfo: true },
    });
  }

  async getOrdersByEmail(email: string) {
    return await this.db.order.findMany({
      where: { additionalInfo: { some: { shipping_email: email } } },
      include: { items: true, shippingLabel: true, additionalInfo: true },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async update(orderId: string, body: any) {
    let payload = {};
    if (body.status)
      payload = { shippingStatus: body.status as ShippingStatus };
    if (body.trackingNumber) {
      payload = {
        ...payload,
        shippingLabel: {
          update: {
            trackingNumber: body.trackingNumber,
          },
        },
      };
    }
    if (body.shippingCost)
      payload = { ...payload, shippingCost: Number(body.shippingCost) };

    const updatedOrder = await this.db.order.update({
      where: { id: orderId },
      data: payload,

      include: { items: true, shippingLabel: true, additionalInfo: true },
    });

    return updatedOrder;
  }

  async getOrdersByDates(startDate: Date, endDate: Date) {
    return await this.db.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: { items: true, shippingLabel: true, additionalInfo: true },
    });
  }

  async getOrderByStatus(status: string) {
    return await this.db.order.findMany({
      where: {
        shippingStatus: status as ShippingStatus,
      },
      include: { items: true, shippingLabel: true, additionalInfo: true },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getKpis() {
    const DELIVERED = await this.db.order.count({
      where: {
        shippingStatus: ShippingStatus.DELIVERED,
      },
    });
    const PENDING = await this.db.order.count({
      where: {
        shippingStatus: ShippingStatus.PENDING,
      },
    });
    const SHIPPED = await this.db.order.count({
      where: {
        shippingStatus: ShippingStatus.SHIPPED,
      },
    });
    const RETURNED = await this.db.order.count({
      where: {
        shippingStatus: ShippingStatus.RETURNED,
      },
    });
    const TotalOrders = await this.db.order.findMany({
      where: {
        shippingStatus: ShippingStatus.DELIVERED,
      },
      include: {
        items: true,
        shippingLabel: true,
        additionalInfo: true,
      },
    });
    let TotalEarning = 0;
    TotalOrders.forEach((order) => {
      let total = 0;
      order.items.forEach((item) => {
        total += item.price * item.quantity;
      });
      TotalEarning += total;
    });

    return {
      DELIVERED,
      PENDING,
      SHIPPED,
      RETURNED,
      'TOTAL EARNING': TotalEarning,
    };
  }
  async delete(orderId: string) {
    return await this.db.order.delete({
      where: { id: orderId },
      include: { items: true, _count: { select: { items: true } } },
    });
  }
}
