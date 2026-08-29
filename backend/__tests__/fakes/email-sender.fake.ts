import type {
  EmailSenderPort,
  OrderEmailContext,
} from '@modules/orders/domain/ports/email-sender.port';

export class FakeEmailSender implements EmailSenderPort {
  readonly sent: OrderEmailContext[] = [];

  async sendOrderConfirmation(context: OrderEmailContext): Promise<void> {
    this.sent.push(context);
  }

  get lastSent(): OrderEmailContext | undefined {
    return this.sent.at(-1);
  }

  reset(): void {
    this.sent.length = 0;
  }
}
