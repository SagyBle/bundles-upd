export class InactiveStonePurchaseHandler {
  /**
   * Notify customer service about a purchase of an inactive stone.
   */
  static notifyCustomerService(stoneId: string, customerEmail?: string) {
    const message =
      `⚠️ Inactive stone purchased.\nStone ID: ${stoneId}` +
      (customerEmail ? `\nCustomer: ${customerEmail}` : "");

    // Replace with actual integration (email, Slack, etc.)
    console.log("[Customer Service Notification]", message);
  }
}
